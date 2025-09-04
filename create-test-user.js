const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Конфигурация подключения к MongoDB
const MONGODB_URI = 'mongodb://admin:password123@mongodb:27017/toolrole_db?authSource=admin';

async function createTestUser() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Подключение к MongoDB установлено');

    // Проверяем, существует ли уже тестовый пользователь
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('ℹ️ Тестовый пользователь уже существует');
      console.log('Email:', existingUser.email);
      console.log('Username:', existingUser.username);
      return;
    }

    // Создаем тестового пользователя
    const testUser = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test123!@#',
      firstName: 'Тест',
      lastName: 'Пользователь',
      isActive: true,
      isOnline: false,
      loginCount: 0,
      theme: 'light',
      language: 'ru',
      emailNotifications: true,
      pushNotifications: true,
      desktopNotifications: true,
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowFriendRequests: true
    });

    // Сохраняем пользователя
    await testUser.save();
    console.log('✅ Тестовый пользователь создан успешно!');
    console.log('Email: test@example.com');
    console.log('Password: Test123!@#');
    console.log('Username: testuser');

  } catch (error) {
    console.error('❌ Ошибка при создании тестового пользователя:', error);
  } finally {
    // Закрываем соединение
    await mongoose.connection.close();
    console.log('🔌 Соединение с MongoDB закрыто');
  }
}

// Запускаем скрипт
createTestUser();
