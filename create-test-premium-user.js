const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Подключаемся к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27018/toolrole_db?authSource=admin');
    console.log('✅ MongoDB подключено');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Импортируем модели
const User = require('./src/models/User');
const Profession = require('./src/models/Profession');

// Создаем тестового пользователя с премиум подпиской
const createTestPremiumUser = async () => {
  try {
    // Проверяем, существует ли уже тестовый пользователь
    const existingUser = await User.findOne({ email: 'premium@test.com' });
    if (existingUser) {
      console.log('📝 Тестовый премиум пользователь уже существует');
      return existingUser;
    }

    // Создаем пользователя (пароль будет захеширован автоматически в middleware)
    const user = new User({
      email: 'premium@test.com',
      username: 'premium_user',
      password: 'premium123',
      firstName: 'Премиум',
      lastName: 'Пользователь',
      isVerified: true,
      isActive: true,
      subscription: {
        type: 'premium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
        autoRenew: true,
        features: ['unlimited_tasks', 'premium_tasks']
      },
      taskSettings: {
        dailyTaskLimit: 3,
        taskDifficulty: 'beginner',
        taskCategories: ['social_media', 'print_design', 'web_design'],
        completedTasksCount: 0,
        streakDays: 0
      }
    });

    await user.save();
    console.log('✅ Тестовый премиум пользователь создан');
    console.log('📧 Email: premium@test.com');
    console.log('🔑 Пароль: premium123');
    console.log('💎 Подписка: Premium (30 дней)');
    console.log('📊 Лимит задач: 3 в день');

    return user;
  } catch (error) {
    console.error('❌ Ошибка создания тестового пользователя:', error);
    throw error;
  }
};

// Выбираем профессию для пользователя
const selectProfessionForUser = async (user) => {
  try {
    // Находим профессию "Графический дизайнер"
    const profession = await Profession.findOne({ slug: 'graphic-designer' });
    
    if (!profession) {
      console.log('⚠️  Профессия "Графический дизайнер" не найдена. Сначала запустите seed-professions.js');
      return;
    }

    // Выбираем профессию для пользователя
    await user.selectProfession(profession._id, profession.slug);
    
    console.log(`✅ Профессия "${profession.name}" выбрана для пользователя`);
    console.log('🎨 Пользователь готов получать задачи по графическому дизайну');
  } catch (error) {
    console.error('❌ Ошибка выбора профессии:', error);
    throw error;
  }
};

// Создаем дополнительных тестовых пользователей
const createAdditionalTestUsers = async () => {
  const testUsers = [
    {
      email: 'pro@test.com',
      username: 'pro_user',
      password: 'pro123',
      firstName: 'Про',
      lastName: 'Пользователь',
      subscriptionType: 'pro',
      dailyLimit: 5
    },
    {
      email: 'enterprise@test.com',
      username: 'enterprise_user',
      password: 'enterprise123',
      firstName: 'Энтерпрайз',
      lastName: 'Пользователь',
      subscriptionType: 'enterprise',
      dailyLimit: 10
    },
    {
      email: 'free@test.com',
      username: 'free_user',
      password: 'free123',
      firstName: 'Бесплатный',
      lastName: 'Пользователь',
      subscriptionType: 'free',
      dailyLimit: 0
    }
  ];

  for (const userData of testUsers) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`📝 Пользователь ${userData.email} уже существует`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isVerified: true,
        isActive: true,
        subscription: {
          type: userData.subscriptionType,
          status: userData.subscriptionType === 'free' ? 'active' : 'active',
          startDate: new Date(),
          endDate: userData.subscriptionType === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          autoRenew: userData.subscriptionType !== 'free',
          features: userData.subscriptionType === 'free' ? [] : 
                   userData.subscriptionType === 'pro' ? ['unlimited_tasks', 'premium_tasks', 'priority_support', 'advanced_analytics'] :
                   ['unlimited_tasks', 'premium_tasks', 'priority_support', 'advanced_analytics', 'custom_professions']
        },
        taskSettings: {
          dailyTaskLimit: userData.dailyLimit,
          taskDifficulty: 'beginner',
          taskCategories: ['social_media', 'print_design', 'web_design'],
          completedTasksCount: 0,
          streakDays: 0
        }
      });

      await user.save();
      console.log(`✅ Пользователь ${userData.email} создан (${userData.subscriptionType})`);
    } catch (error) {
      console.error(`❌ Ошибка создания пользователя ${userData.email}:`, error);
    }
  }
};

// Основная функция
const main = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Создаем тестовых пользователей...');
    
    // Создаем основного премиум пользователя
    const premiumUser = await createTestPremiumUser();
    
    // Выбираем профессию для него
    await selectProfessionForUser(premiumUser);
    
    // Создаем дополнительных пользователей
    await createAdditionalTestUsers();
    
    console.log('\n🎉 Все тестовые пользователи созданы!');
    console.log('\n📋 ДАННЫЕ ДЛЯ ТЕСТИРОВАНИЯ:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ ПРЕМИУМ ПОЛЬЗОВАТЕЛЬ (3 задачи в день)                 │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: premium@test.com                                │');
    console.log('│ Пароль: premium123                                     │');
    console.log('│ Профессия: Графический дизайнер                        │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ ПРО ПОЛЬЗОВАТЕЛЬ (5 задач в день)                      │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: pro@test.com                                    │');
    console.log('│ Пароль: pro123                                         │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ ЭНТЕРПРАЙЗ ПОЛЬЗОВАТЕЛЬ (10 задач в день)              │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: enterprise@test.com                             │');
    console.log('│ Пароль: enterprise123                                  │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ БЕСПЛАТНЫЙ ПОЛЬЗОВАТЕЛЬ (без задач)                    │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: free@test.com                                   │');
    console.log('│ Пароль: free123                                        │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка создания тестовых пользователей:', error);
    process.exit(1);
  }
};

// Запускаем скрипт
main();
