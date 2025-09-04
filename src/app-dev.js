const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Загружаем переменные окружения
require('dotenv').config();

const app = express();
const server = createServer(app);

// Создаем Socket.io сервер
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

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

// CORS настройки
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development',
    version: '1.0.0',
    message: 'Backend running in development mode without databases'
  });
});

// API info endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Toolrole API v1 (Development Mode)',
    version: '1.0.0',
    status: 'Running without databases',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// Mock endpoints for development
app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Mock login successful',
    token: 'mock-jwt-token',
    user: {
      id: 'mock-user-id',
      email: req.body.email || 'user@example.com',
      name: 'Mock User'
    }
  });
});

app.post('/api/v1/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Mock registration successful',
    token: 'mock-jwt-token',
    user: {
      id: 'mock-user-id',
      email: req.body.email || 'user@example.com',
      name: req.body.name || 'Mock User'
    }
  });
});

// Socket.io подключения
io.on('connection', (socket) => {
  console.log(`🔌 Socket подключен: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Socket отключен: ${socket.id}`);
  });
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
});

// Запуск сервера
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT} (Development Mode)`);
  console.log(`🌍 Окружение: development`);
  console.log(`📚 API доступен по адресу: http://localhost:${PORT}/api/v1`);
  console.log(`🔌 Socket.io доступен на: http://localhost:${PORT}`);
  console.log(`💡 Работает без баз данных - только mock endpoints`);
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
