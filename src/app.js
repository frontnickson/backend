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
console.log('🔐 app.js: Загружаем маршруты...');
const authRoutes = require('./routes/auth');
console.log('🔐 app.js: authRoutes загружен');
const userRoutes = require('./routes/users');
console.log('🔐 app.js: userRoutes загружен');
const boardRoutes = require('./routes/boards');
console.log('🔐 app.js: boardRoutes загружен');
const taskRoutes = require('./routes/tasks');
console.log('🔐 app.js: taskRoutes загружен');
const teamRoutes = require('./routes/teams');
console.log('🔐 app.js: teamRoutes загружен');
const statisticsRoutes = require('./routes/statistics');
console.log('🔐 app.js: statisticsRoutes загружен');
const notificationRoutes = require('./routes/notifications');
console.log('🔐 app.js: notificationRoutes загружен');
const professionRoutes = require('./routes/professions');
console.log('🔐 app.js: professionRoutes загружен');
const subscriptionRoutes = require('./routes/subscriptions');
console.log('🔐 app.js: subscriptionRoutes загружен');
const adminRoutes = require('./routes/admin');
console.log('🔐 app.js: adminRoutes загружен');

// Импортируем Socket.io обработчики
const socketHandlers = require('./services/socketService');

// Импортируем планировщик задач
const schedulerService = require('./services/schedulerService');

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
    console.log('✅ MongoDB подключено');
    
    // Подключаемся к Redis
    await connectRedis();
    console.log('✅ Redis подключено');
    
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
  // Исключаем OPTIONS запросы из rate limiting
  skip: (req) => req.method === 'OPTIONS',
});

// Slow down
const speedLimiter = slowDown({
  windowMs: config.security.rateLimit.windowMs,
  delayAfter: 50,
  delayMs: () => config.security.slowDown.delayMs,
  // Исключаем OPTIONS запросы из slow down
  skip: (req) => req.method === 'OPTIONS',
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// CORS настройки
app.use(cors({
  origin: function (origin, callback) {
    console.log('🌐 CORS: Запрос от origin:', origin);
    
    // Разрешаем все origins в режиме разработки
    if (!origin || config.nodeEnv === 'development') {
      console.log('🌐 CORS: Разрешаем (no origin или development)');
      return callback(null, true);
    }
    
    // Явно разрешаем фронтенд порты
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      console.log('🌐 CORS: Разрешаем (frontend origin):', origin);
      return callback(null, true);
    }
    
    // В продакшене проверяем разрешенные origins
    if (config.cors.origin.includes(origin)) {
      console.log('🌐 CORS: Разрешаем (production origin):', origin);
      return callback(null, true);
    }
    
    console.log('🌐 CORS: Блокируем origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Логирование всех входящих запросов
app.use((req, res, next) => {
  console.log('🌐 Входящий запрос:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type']
  });
  next();
});

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

try {
  console.log('🔐 app.js: загружаем маршруты users');
  app.use(`/api/${config.apiVersion}/users`, userRoutes);
  console.log('🔐 app.js: маршруты users загружены');
} catch (error) {
  console.error('❌ Ошибка загрузки маршрутов users:', error);
}

try {
  console.log('🔐 app.js: загружаем маршруты boards');
  app.use(`/api/${config.apiVersion}/boards`, boardRoutes);
  console.log('🔐 app.js: маршруты boards загружены');
} catch (error) {
  console.error('❌ Ошибка загрузки маршрутов boards:', error);
}

try {
  console.log('🔐 app.js: загружаем маршруты tasks');
  app.use(`/api/${config.apiVersion}/tasks`, taskRoutes);
  console.log('🔐 app.js: маршруты tasks загружены');
} catch (error) {
  console.error('❌ Ошибка загрузки маршрутов tasks:', error);
}

console.log('🔐 app.js: загружаем маршруты teams');
app.use(`/api/${config.apiVersion}/teams`, teamRoutes);
console.log('🔐 app.js: маршруты teams загружены');

console.log('🔐 app.js: загружаем маршруты statistics');
app.use(`/api/${config.apiVersion}/statistics`, statisticsRoutes);
console.log('🔐 app.js: маршруты statistics загружены');

console.log('🔐 app.js: загружаем маршруты notifications');
app.use(`/api/${config.apiVersion}/notifications`, notificationRoutes);
console.log('🔐 app.js: маршруты notifications загружены');

console.log('🔐 app.js: загружаем маршруты professions');
app.use(`/api/${config.apiVersion}/professions`, professionRoutes);
console.log('🔐 app.js: маршруты professions загружены');

console.log('🔐 app.js: загружаем маршруты subscriptions');
app.use(`/api/${config.apiVersion}/subscriptions`, subscriptionRoutes);
console.log('🔐 app.js: маршруты subscriptions загружены');

console.log('🔐 app.js: загружаем маршруты admin');
app.use(`/api/${config.apiVersion}/admin`, adminRoutes);
console.log('🔐 app.js: маршруты admin загружены');

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
      notifications: `/api/${config.apiVersion}/notifications`,
      professions: `/api/${config.apiVersion}/professions`,
      subscriptions: `/api/${config.apiVersion}/subscriptions`,
      admin: `/api/${config.apiVersion}/admin`
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
  
  // Запускаем планировщик задач
  schedulerService.start();
  console.log(`⏰ Планировщик задач запущен`);
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
