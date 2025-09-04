const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testConnection() {
  try {
    console.log('🔌 Подключаемся к MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/toolrole_db');
    console.log('✅ Подключено к MongoDB');
    
    console.log('👥 Ищем пользователей...');
    const users = await User.find({});
    console.log('📊 Найдено пользователей:', users.length);
    
    if (users.length > 0) {
      console.log('📧 Первый пользователь:');
      console.log('  Email:', users[0].email);
      console.log('  Username:', users[0].username);
      console.log('  Active:', users[0].isActive);
    }
    
    console.log('🔍 Ищем premium@test.com...');
    const premiumUser = await User.findOne({ email: 'premium@test.com' });
    if (premiumUser) {
      console.log('✅ Пользователь найден:');
      console.log('  Email:', premiumUser.email);
      console.log('  Username:', premiumUser.username);
      console.log('  Active:', premiumUser.isActive);
    } else {
      console.log('❌ Пользователь premium@test.com не найден');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

testConnection();
