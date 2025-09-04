const mongoose = require('mongoose');
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
const Board = require('./src/models/Board');
const Task = require('./src/models/Task');
const Profession = require('./src/models/Profession');
const ProfessionTask = require('./src/models/ProfessionTask');

// Настройка премиум пользователя
const setupPremiumUser = async () => {
  try {
    console.log('🔧 Настраиваем премиум пользователя...');
    
    // Находим пользователя
    const user = await User.findOne({ email: 'premium2@test.com' });
    if (!user) {
      console.log('❌ Пользователь premium2@test.com не найден');
      return;
    }
    
    console.log('👤 Пользователь найден:', user.email);
    
    // Обновляем подписку до Premium
    user.subscription = {
      type: 'premium',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      autoRenew: true,
      features: ['unlimited_tasks', 'premium_tasks']
    };
    
    // Обновляем настройки задач
    user.taskSettings = {
      dailyTaskLimit: 3,
      taskDifficulty: 'beginner',
      taskCategories: ['social_media', 'print_design', 'web_design'],
      completedTasksCount: 0,
      streakDays: 0
    };
    
    // Находим профессию "Графический дизайнер"
    const profession = await Profession.findOne({ slug: 'graphic-designer' });
    if (!profession) {
      console.log('❌ Профессия "Графический дизайнер" не найдена');
      return;
    }
    
    // Выбираем профессию для пользователя
    user.selectedProfession = {
      professionId: profession._id,
      professionSlug: profession.slug,
      professionName: profession.name,
      isActive: true,
      selectedAt: new Date()
    };
    
    await user.save();
    console.log('✅ Подписка обновлена до Premium, профессия выбрана');
    
    // Создаем доску "Графический дизайнер"
    const existingBoard = await Board.findOne({ 
      ownerId: user._id, 
      title: 'Графический дизайнер' 
    });
    
    if (existingBoard) {
      console.log('📋 Доска "Графический дизайнер" уже существует, удаляем...');
      await Board.deleteOne({ _id: existingBoard._id });
      await Task.deleteMany({ boardId: existingBoard._id });
    }
    
    // Создаем новую доску
    // Создаем доску сначала без members и columns
    const board = new Board({
      title: 'Графический дизайнер',
      description: 'Доска для задач по графическому дизайну',
      icon: '🎨',
      color: '#8B5CF6',
      ownerId: user._id,
      members: [],
      columns: [],
      settings: {
        allowMembersToInvite: true,
        allowMembersToCreateTasks: true,
        allowMembersToEditTasks: true,
        allowMembersToDeleteTasks: false,
        allowMembersToManageColumns: false,
        allowMembersToManageBoard: false
      },
      isActive: true,
      isPublic: false
    });
    
    await board.save();
    
    // Добавляем владельца как участника
    board.members.push({
      id: user._id,
      userId: user._id,
      boardId: board._id,
      role: 'owner',
      permissions: [{
        id: 'read_board',
        name: 'Чтение доски',
        description: 'Просмотр доски и задач',
        resource: 'board',
        action: 'read'
      }, {
        id: 'write_board',
        name: 'Редактирование доски',
        description: 'Редактирование доски и задач',
        resource: 'board',
        action: 'update'
      }, {
        id: 'admin_board',
        name: 'Управление доской',
        description: 'Полное управление доской',
        resource: 'board',
        action: 'manage'
      }],
      joinedAt: Date.now()
    });
    
    // Добавляем колонки
    board.columns.push({
      id: 'new_tasks',
      boardId: board._id,
      title: 'Новые задачи',
      description: 'Задачи, которые нужно выполнить',
      color: '#3B82F6',
      order: 0,
      isStandard: true
    }, {
      id: 'in_progress',
      boardId: board._id,
      title: 'В работе',
      description: 'Задачи в процессе выполнения',
      color: '#F59E0B',
      order: 1,
      isStandard: true
    }, {
      id: 'review',
      boardId: board._id,
      title: 'Проверка',
      description: 'Задачи, готовые к проверке и тестированию',
      color: '#8B5CF6',
      order: 2,
      isStandard: true
    }, {
      id: 'completed',
      boardId: board._id,
      title: 'Выполнено',
      description: 'Завершенные задачи',
      color: '#10B981',
      order: 3,
      isStandard: true
    });
    
    await board.save();
    
    console.log('✅ Доска "Графический дизайнер" создана');
    
    // Создаем задачи для доски
    const professionTasks = await ProfessionTask.find({ 
      professionId: profession._id 
    }).limit(5);
    
    if (professionTasks.length > 0) {
      console.log(`📝 Создаем ${professionTasks.length} задач для доски...`);
      
      for (let i = 0; i < professionTasks.length; i++) {
        const profTask = professionTasks[i];
        const task = new Task({
          title: profTask.title,
          description: profTask.description,
          boardId: board._id,
          columnId: board.columns[0].id, // Используем id колонки
          assigneeId: user._id,
          reporterId: user._id,
          priority: profTask.priority || 'medium',
          type: 'task',
          status: 'planning',
          order: i,
          dueDate: Date.now() + (i + 1) * 24 * 60 * 60 * 1000, // +1, +2, +3 дня
          estimatedHours: profTask.estimatedTime ? profTask.estimatedTime / 60 : 1,
          tags: profTask.tags ? profTask.tags.map(tag => ({
            id: tag.toLowerCase().replace(/\s+/g, '_'),
            name: tag,
            color: '#8B5CF6',
            createdBy: user._id
          })) : [{
            id: 'graphic_design',
            name: 'Графический дизайн',
            color: '#8B5CF6',
            createdBy: user._id
          }],
          isActive: true,
          createdBy: user._id,
          updatedBy: user._id,
          metadata: {
            professionTaskId: profTask._id,
            professionId: profession._id,
            professionSlug: profession.slug
          }
        });
        
        await task.save();
        console.log(`✅ Задача ${i + 1} создана: ${task.title}`);
      }
    }
    
    console.log('\n🎉 Настройка премиум пользователя завершена!');
    console.log('📧 Email: premium2@test.com');
    console.log('🔑 Пароль: premium12345');
    console.log('💎 Подписка: Premium (3 задачи в день)');
    console.log('🎨 Профессия: Графический дизайнер');
    console.log('📋 Доска: Создана с задачами');
    
  } catch (error) {
    console.error('❌ Ошибка настройки пользователя:', error);
    throw error;
  }
};

// Основная функция
const main = async () => {
  try {
    await connectDB();
    await setupPremiumUser();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
};

// Запускаем скрипт
main();
