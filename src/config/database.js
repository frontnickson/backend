const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    
    console.log(`✅ MongoDB подключена: ${conn.connection.host}`);
    
    // Обработка событий подключения
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose подключен к MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Ошибка подключения Mongoose:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose отключен от MongoDB');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB соединение закрыто через app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Ошибка при закрытии MongoDB соединения:', err);
        process.exit(1);
      }
    });
    
    process.on('SIGTERM', async () => {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB соединение закрыто через app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Ошибка при закрытии MongoDB соединения:', err);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
