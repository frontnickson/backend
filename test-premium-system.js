// Тестовый скрипт для демонстрации системы премиум задач
const mongoose = require('mongoose');
require('dotenv').config();

// Подключаемся к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/toolrole');
    console.log('✅ MongoDB подключено');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Импортируем модели
const User = require('./src/models/User');
const Profession = require('./src/models/Profession');
const ProfessionTask = require('./src/models/ProfessionTask');
const Task = require('./src/models/Task');
const Board = require('./src/models/Board');

// Демонстрация системы
const demonstrateSystem = async () => {
  try {
    console.log('🎯 ДЕМОНСТРАЦИЯ СИСТЕМЫ ПРЕМИУМ ЗАДАЧ\n');

    // 1. Показываем премиум пользователей
    console.log('👥 ПРЕМИУМ ПОЛЬЗОВАТЕЛИ:');
    const premiumUsers = await User.find({
      'subscription.type': { $ne: 'free' },
      'subscription.status': 'active'
    }).populate('selectedProfession.professionId');

    premiumUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.firstName} ${user.lastName} (${user.username})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   💎 Подписка: ${user.subscription.type.toUpperCase()}`);
      console.log(`   📊 Лимит задач: ${user.taskSettings.dailyTaskLimit}/день`);
      console.log(`   🎨 Профессия: ${user.selectedProfession.professionId?.name || 'Не выбрана'}`);
      console.log(`   ✅ Выполнено задач: ${user.taskSettings.completedTasksCount}`);
      console.log(`   🔥 Серия дней: ${user.taskSettings.streakDays}`);
      console.log(`   🎯 Может получать задачи: ${user.canReceiveTasks ? 'Да' : 'Нет'}`);
    });

    // 2. Показываем доступные профессии
    console.log('\n🎨 ДОСТУПНЫЕ ПРОФЕССИИ:');
    const professions = await Profession.find({ isActive: true, isPublic: true });
    professions.forEach((profession, index) => {
      console.log(`${index + 1}. ${profession.name} (${profession.slug})`);
      console.log(`   📝 ${profession.description}`);
      console.log(`   🏷️  Категория: ${profession.category}`);
      console.log(`   📊 Всего задач: ${profession.statistics.totalTasks}`);
    });

    // 3. Показываем задачи для графического дизайнера
    console.log('\n📋 ЗАДАЧИ ДЛЯ ГРАФИЧЕСКОГО ДИЗАЙНЕРА:');
    const designerProfession = await Profession.findOne({ slug: 'graphic-designer' });
    if (designerProfession) {
      const tasks = await ProfessionTask.find({
        professionId: designerProfession._id,
        isActive: true,
        isPublic: true
      }).limit(5);

      tasks.forEach((task, index) => {
        console.log(`\n${index + 1}. ${task.title}`);
        console.log(`   📝 ${task.shortDescription}`);
        console.log(`   ⏱️  Время: ${task.estimatedTime} ${task.timeUnit}`);
        console.log(`   📈 Сложность: ${task.difficulty} (${task.level}/10)`);
        console.log(`   🏢 Клиент: ${task.client.name} (${task.client.industry})`);
        console.log(`   🏷️  Категория: ${task.category}`);
        console.log(`   🏷️  Теги: ${task.tags.join(', ')}`);
      });
    }

    // 4. Показываем доски пользователей
    console.log('\n📋 ДОСКИ ПОЛЬЗОВАТЕЛЕЙ:');
    const userBoards = await Board.find({
      'customFields.type': 'profession_tasks'
    }).populate('ownerId', 'username firstName lastName');

    userBoards.forEach((board, index) => {
      console.log(`\n${index + 1}. ${board.name}`);
      console.log(`   👤 Владелец: ${board.ownerId.firstName} ${board.ownerId.lastName} (${board.ownerId.username})`);
      console.log(`   📊 Колонок: ${board.columns.length}`);
      console.log(`   🎨 Профессия: ${board.customFields.professionSlug}`);
      console.log(`   📅 Создана: ${new Date(board.createdAt).toLocaleDateString()}`);
    });

    // 5. Показываем задачи в досках
    console.log('\n📝 ЗАДАЧИ В ДОСКАХ:');
    const boardTasks = await Task.find({
      'customFields.professionTaskId': { $exists: true },
      'customFields.isAutoAssigned': true
    }).populate('boardId', 'name').populate('assigneeId', 'username firstName lastName');

    boardTasks.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title}`);
      console.log(`   📋 Доска: ${task.boardId.name}`);
      console.log(`   👤 Исполнитель: ${task.assigneeId.firstName} ${task.assigneeId.lastName} (${task.assigneeId.username})`);
      console.log(`   📊 Статус: ${task.status}`);
      console.log(`   📈 Приоритет: ${task.priority}`);
      console.log(`   ⏰ Дедлайн: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Не установлен'}`);
      console.log(`   🏷️  Категория: ${task.customFields.taskCategory}`);
      console.log(`   📈 Сложность: ${task.customFields.taskDifficulty}`);
    });

    // 6. Статистика системы
    console.log('\n📊 СТАТИСТИКА СИСТЕМЫ:');
    const totalUsers = await User.countDocuments();
    const premiumUsersCount = await User.countDocuments({
      'subscription.type': { $ne: 'free' },
      'subscription.status': 'active'
    });
    const usersWithProfession = await User.countDocuments({
      'selectedProfession.isActive': true
    });
    const totalTasks = await Task.countDocuments({
      'customFields.professionTaskId': { $exists: true }
    });
    const completedTasks = await Task.countDocuments({
      'customFields.professionTaskId': { $exists: true },
      status: 'completed'
    });

    console.log(`👥 Всего пользователей: ${totalUsers}`);
    console.log(`💎 Премиум пользователей: ${premiumUsersCount}`);
    console.log(`🎨 С выбранной профессией: ${usersWithProfession}`);
    console.log(`📝 Всего назначенных задач: ${totalTasks}`);
    console.log(`✅ Завершенных задач: ${completedTasks}`);
    console.log(`📊 Процент выполнения: ${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`);

    console.log('\n🎉 ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА!');
    console.log('\n💡 СИСТЕМА ГОТОВА К РАБОТЕ:');
    console.log('   • Премиум пользователи получают задачи автоматически');
    console.log('   • Задачи назначаются в 9:00 каждый день');
    console.log('   • Завершенные задачи проверяются каждый час');
    console.log('   • Пользователи могут выбирать профессии и настраивать задачи');
    console.log('   • Система отслеживает статистику и серии выполнения');

  } catch (error) {
    console.error('❌ Ошибка демонстрации системы:', error);
    throw error;
  }
};

// Основная функция
const main = async () => {
  try {
    await connectDB();
    await demonstrateSystem();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
};

// Запускаем скрипт
main();
