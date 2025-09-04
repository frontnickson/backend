const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testPassword() {
  try {
    console.log('🔌 Подключаемся к MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/toolrole_db');
    console.log('✅ Подключено к MongoDB');
    
    console.log('👤 Ищем пользователя premium@test.com...');
    const user = await User.findOne({ email: 'premium@test.com' }).select('+password');
    
    if (!user) {
      console.log('❌ Пользователь не найден');
      process.exit(1);
    }
    
    console.log('✅ Пользователь найден:');
    console.log('  Email:', user.email);
    console.log('  Username:', user.username);
    console.log('  Password hash:', user.password);
    
    console.log('🔑 Проверяем пароль "premium123"...');
    const isValid = await user.comparePassword('premium123');
    console.log('🔑 Результат:', isValid ? '✅ Пароль верный' : '❌ Пароль неверный');
    
    console.log('🔑 Проверяем пароль "premium"...');
    const isValid2 = await user.comparePassword('premium');
    console.log('🔑 Результат:', isValid2 ? '✅ Пароль верный' : '❌ Пароль неверный');
    
    console.log('🔑 Проверяем пароль "123"...');
    const isValid3 = await user.comparePassword('123');
    console.log('🔑 Результат:', isValid3 ? '✅ Пароль верный' : '❌ Пароль неверный');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

testPassword();
