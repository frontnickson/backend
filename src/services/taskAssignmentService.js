const User = require('../models/User');
const Profession = require('../models/Profession');
const ProfessionTask = require('../models/ProfessionTask');
const Task = require('../models/Task');
const Board = require('../models/Board');

class TaskAssignmentService {
  /**
   * Назначить задачи премиум пользователям
   */
  static async assignTasksToPremiumUsers() {
    try {
      console.log('🔄 Начинаем назначение задач премиум пользователям...');
      
      // Находим всех премиум пользователей, которые должны получить задачи
      const premiumUsers = await User.find({
        'subscription.type': { $ne: 'free' },
        'subscription.status': 'active',
        'selectedProfession.isActive': true,
        'taskSettings.dailyTaskLimit': { $gt: 0 }
      }).populate('selectedProfession.professionId');

      console.log(`📊 Найдено ${premiumUsers.length} премиум пользователей`);

      let totalAssigned = 0;

      for (const user of premiumUsers) {
        try {
          // Проверяем, должен ли пользователь получить задачи сегодня
          if (!user.shouldReceiveTasks()) {
            console.log(`⏭️  Пользователь ${user.username} уже получил задачи сегодня`);
            continue;
          }

          // Назначаем задачи пользователю
          const assignedCount = await this.assignTasksToUser(user);
          totalAssigned += assignedCount;
          
          console.log(`✅ Пользователю ${user.username} назначено ${assignedCount} задач`);
        } catch (error) {
          console.error(`❌ Ошибка назначения задач пользователю ${user.username}:`, error);
        }
      }

      console.log(`🎉 Назначение завершено. Всего назначено: ${totalAssigned} задач`);
      return { success: true, assignedTasks: totalAssigned };
    } catch (error) {
      console.error('❌ Ошибка в assignTasksToPremiumUsers:', error);
      throw error;
    }
  }

  /**
   * Назначить задачи конкретному пользователю
   */
  static async assignTasksToUser(user) {
    try {
      const professionId = user.selectedProfession.professionId._id;
      const dailyLimit = user.taskSettings.dailyTaskLimit;
      
      // Находим задачи для профессии пользователя
      const filter = {
        professionId,
        isActive: true,
        isPublic: true
      };

      // Фильтруем по сложности, если указана
      if (user.taskSettings.taskDifficulty !== 'all') {
        filter.difficulty = user.taskSettings.taskDifficulty;
      }

      // Фильтруем по категориям, если указаны
      if (user.taskSettings.taskCategories.length > 0) {
        filter.category = { $in: user.taskSettings.taskCategories };
      }

      // Исключаем уже назначенные задачи
      const existingTasks = await Task.find({
        boardId: { $exists: true },
        'customFields.professionTaskId': { $exists: true }
      }).select('customFields.professionTaskId');

      const assignedProfessionTaskIds = existingTasks
        .map(task => task.customFields?.professionTaskId)
        .filter(Boolean);

      if (assignedProfessionTaskIds.length > 0) {
        filter._id = { $nin: assignedProfessionTaskIds };
      }

      // Получаем задачи для назначения
      const availableTasks = await ProfessionTask.find(filter)
        .sort({ level: 1, order: 1 })
        .limit(dailyLimit);

      if (availableTasks.length === 0) {
        console.log(`⚠️  Нет доступных задач для пользователя ${user.username}`);
        return 0;
      }

      // Находим или создаем доску пользователя для задач профессии
      let userBoard = await Board.findOne({
        ownerId: user._id,
        'customFields.type': 'profession_tasks'
      });

      if (!userBoard) {
        userBoard = await this.createProfessionTasksBoard(user, professionId);
      }

      // Находим колонку "К выполнению" или создаем её
      let todoColumn = userBoard.columns.find(col => col.name === 'К выполнению');
      if (!todoColumn) {
        todoColumn = {
          id: 'todo',
          name: 'К выполнению',
          order: 0,
          color: '#3498db'
        };
        userBoard.columns.push(todoColumn);
        await userBoard.save();
      }

      let assignedCount = 0;

      // Создаем задачи в доске пользователя
      for (const professionTask of availableTasks) {
        try {
          const task = new Task({
            boardId: userBoard._id,
            columnId: todoColumn.id,
            title: professionTask.title,
            description: professionTask.description,
            status: 'planning',
            priority: this.mapDifficultyToPriority(professionTask.difficulty),
            type: 'task',
            assigneeId: user._id,
            reporterId: user._id,
            dueDate: Date.now() + (professionTask.deadline * 24 * 60 * 60 * 1000),
            estimatedHours: professionTask.estimatedTime,
            tags: professionTask.tags.map(tag => ({
              id: require('crypto').randomUUID(),
              name: tag,
              color: this.getTagColor(tag),
              createdBy: user._id
            })),
            customFields: {
              professionTaskId: professionTask._id,
              professionSlug: user.selectedProfession.professionSlug,
              taskCategory: professionTask.category,
              taskDifficulty: professionTask.difficulty,
              isAutoAssigned: true,
              assignedAt: new Date()
            },
            createdBy: user._id,
            updatedBy: user._id,
            order: await this.getNextOrder(userBoard._id, todoColumn.id)
          });

          await task.save();
          assignedCount++;

          console.log(`📝 Создана задача: ${professionTask.title}`);
        } catch (error) {
          console.error(`❌ Ошибка создания задачи ${professionTask.title}:`, error);
        }
      }

      // Обновляем настройки пользователя
      user.taskSettings.lastTaskAssignment = new Date();
      await user.save();

      return assignedCount;
    } catch (error) {
      console.error('❌ Ошибка в assignTasksToUser:', error);
      throw error;
    }
  }

  /**
   * Создать доску для задач профессии
   */
  static async createProfessionTasksBoard(user, professionId) {
    const profession = await Profession.findById(professionId);
    
    const board = new Board({
      name: `Задачи: ${profession.name}`,
      description: `Автоматически назначенные задачи для изучения профессии "${profession.name}"`,
      ownerId: user._id,
      isPublic: false,
      columns: [
        { id: 'todo', name: 'К выполнению', order: 0, color: '#3498db' },
        { id: 'in_progress', name: 'В работе', order: 1, color: '#f39c12' },
        { id: 'review', name: 'На проверке', order: 2, color: '#9b59b6' },
        { id: 'completed', name: 'Завершено', order: 3, color: '#27ae60' }
      ],
      customFields: {
        type: 'profession_tasks',
        professionId: professionId,
        professionSlug: profession.slug
      },
      createdBy: user._id,
      updatedBy: user._id
    });

    await board.save();
    console.log(`📋 Создана доска для задач профессии: ${board.name}`);
    return board;
  }

  /**
   * Получить следующий порядковый номер для задачи
   */
  static async getNextOrder(boardId, columnId) {
    const lastTask = await Task.findOne({ boardId, columnId })
      .sort({ order: -1 })
      .select('order');
    
    return lastTask ? lastTask.order + 1 : 0;
  }

  /**
   * Преобразовать сложность в приоритет
   */
  static mapDifficultyToPriority(difficulty) {
    const mapping = {
      'beginner': 'low',
      'intermediate': 'medium',
      'advanced': 'high',
      'expert': 'urgent'
    };
    return mapping[difficulty] || 'medium';
  }

  /**
   * Получить цвет для тега
   */
  static getTagColor(tag) {
    const colors = [
      '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
      '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#f1c40f'
    ];
    const hash = tag.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  /**
   * Проверить завершение задач и назначить новые
   */
  static async checkCompletedTasks() {
    try {
      console.log('🔄 Проверяем завершенные задачи...');
      
      // Находим все завершенные задачи профессии
      const completedTasks = await Task.find({
        status: 'completed',
        'customFields.professionTaskId': { $exists: true },
        'customFields.isAutoAssigned': true
      }).populate('boardId');

      for (const task of completedTasks) {
        try {
          const user = await User.findById(task.assigneeId);
          if (user) {
            // Обновляем статистику пользователя
            await user.completeTask();
            
            // Удаляем задачу из доски (или перемещаем в архив)
            task.isArchived = true;
            await task.save();
            
            console.log(`✅ Задача "${task.title}" завершена пользователем ${user.username}`);
          }
        } catch (error) {
          console.error(`❌ Ошибка обработки завершенной задачи ${task._id}:`, error);
        }
      }

      // Назначаем новые задачи пользователям, которые завершили задачи
      await this.assignTasksToPremiumUsers();
      
    } catch (error) {
      console.error('❌ Ошибка в checkCompletedTasks:', error);
      throw error;
    }
  }
}

module.exports = TaskAssignmentService;
