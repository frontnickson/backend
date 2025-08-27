const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Загружаем переменные окружения
require('dotenv').config();

// Импортируем конфигурации
const config = require('./config');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');

// Импортируем middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Импортируем маршруты
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const boardRoutes = require('./routes/boards');
const taskRoutes = require('./routes/tasks');
const teamRoutes = require('./routes/teams');
const statisticsRoutes = require('./routes/statistics');
const notificationRoutes = require('./routes/notifications');

// Импортируем Socket.io обработчики
const socketHandlers = require('./services/socketService');

const app = express();
const server = createServer(app);

// Создаем Socket.io сервер
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Подключаемся к базам данных асинхронно
(async () => {
  try {
    console.log('🔄 Инициализация подключений к базам данных...');
    
    // Подключаемся к MongoDB
    await connectDB();
    console.log('✅ MongoDB подключение инициализировано');
    
    // Подключаемся к Redis
    await connectRedis();
    console.log('✅ Redis подключение инициализировано');
    
    console.log('🎉 Все подключения к базам данных инициализированы');
  } catch (error) {
    console.error('❌ Ошибка инициализации подключений:', error);
    // Не завершаем процесс, так как базы данных не критичны для работы
  }
})();

// Базовые middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.security.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down
const speedLimiter = slowDown({
  windowMs: config.security.rateLimit.windowMs,
  delayAfter: 50,
  delayMs: () => config.security.slowDown.delayMs,
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// CORS настройки
app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем все origins в режиме разработки
    if (!origin || config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    // В продакшене проверяем разрешенные origins
    if (config.cors.origin.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API маршруты
console.log('🔐 app.js: загружаем маршруты auth');
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
console.log('🔐 app.js: маршруты auth загружены');

app.use(`/api/${config.apiVersion}/users`, userRoutes);
app.use(`/api/${config.apiVersion}/boards`, boardRoutes);
app.use(`/api/${config.apiVersion}/tasks`, taskRoutes);
app.use(`/api/${config.apiVersion}/teams`, teamRoutes);
app.use(`/api/${config.apiVersion}/statistics`, statisticsRoutes);
app.use(`/api/${config.apiVersion}/notifications`, notificationRoutes);

// Тестовый маршрут прямо в app.js
app.get('/api/test', (req, res) => {
  console.log('🔐 Тестовый маршрут в app.js вызван!');
  res.json({ message: 'Тестовый маршрут в app.js работает!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: require('../package.json').version
  });
});

// API info endpoint
app.get(`/api/${config.apiVersion}`, (req, res) => {
  res.json({
    message: 'Toolrole API v1',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    endpoints: {
      auth: `/api/${config.apiVersion}/auth`,
      users: `/api/${config.apiVersion}/users`,
      boards: `/api/${config.apiVersion}/boards`,
      tasks: `/api/${config.apiVersion}/tasks`,
      teams: `/api/${config.apiVersion}/teams`,
      statistics: `/api/${config.apiVersion}/statistics`,
      notifications: `/api/${config.apiVersion}/notifications`
    }
  });
});

// Socket.io подключения
io.on('connection', (socket) => {
  console.log(`🔌 Socket подключен: ${socket.id}`);
  
  // Обрабатываем события
  socketHandlers(io, socket);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Socket отключен: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Запуск сервера
const PORT = config.port || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌍 Окружение: ${config.nodeEnv}`);
  console.log(`📚 API доступен по адресу: http://localhost:${PORT}/api/${config.apiVersion}`);
  console.log(`🔌 Socket.io доступен на: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM, закрываем сервер...');
  server.close(() => {
    console.log('✅ Сервер закрыт');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Получен SIGINT, закрываем сервер...');
  server.close(() => {
    console.log('✅ Сервер закрыт');
    process.exit(0);
  });
});

module.exports = app;
