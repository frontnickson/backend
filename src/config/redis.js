const redis = require('redis');
const config = require('./index');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: config.redis.url,
      password: config.redis.password,
      ...config.redis.options
    });
    
    // Обработка событий подключения
    redisClient.on('connect', () => {
      console.log('✅ Redis подключен');
    });
    
    redisClient.on('ready', () => {
      console.log('🚀 Redis готов к работе');
    });
    
    redisClient.on('error', (err) => {
      console.error('❌ Ошибка Redis:', err);
    });
    
    redisClient.on('end', () => {
      console.log('🔌 Redis соединение закрыто');
    });
    
    redisClient.on('reconnecting', () => {
      console.log('🔄 Переподключение к Redis...');
    });
    
    await redisClient.connect();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await redisClient.quit();
        console.log('✅ Redis соединение закрыто через app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Ошибка при закрытии Redis соединения:', err);
        process.exit(1);
      }
    });
    
    process.on('SIGTERM', async () => {
      try {
        await redisClient.quit();
        console.log('✅ Redis соединение закрыто через app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Ошибка при закрытии Redis соединения:', err);
        process.exit(1);
      }
    });
    
    console.log('✅ Redis клиент инициализирован и готов к использованию');
    
  } catch (error) {
    console.error('❌ Ошибка подключения к Redis:', error.message);
    // Redis не критичен для работы приложения, поэтому не завершаем процесс
  }
};

// Получить Redis клиент
const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis клиент не инициализирован');
  }
  return redisClient;
};

// Проверить подключение к Redis
const isRedisConnected = () => {
  return redisClient && redisClient.isReady;
};

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisConnected
};
