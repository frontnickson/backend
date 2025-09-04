const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate: auth } = require('../middleware/auth');
const schedulerService = require('../services/schedulerService');
const TaskAssignmentService = require('../services/taskAssignmentService');

// Проверка прав администратора
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superuser') {
    return res.status(403).json({
      success: false,
      message: 'Недостаточно прав для выполнения операции'
    });
  }
  next();
};

// Запустить назначение задач немедленно
router.post('/assign-tasks-now', auth, requireAdmin, async (req, res) => {
  try {
    console.log('🚀 Админ запустил назначение задач немедленно');
    const result = await schedulerService.runTaskAssignmentNow();
    
    res.json({
      success: true,
      message: 'Назначение задач запущено',
      data: result
    });
  } catch (error) {
    console.error('Ошибка назначения задач:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при назначении задач',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Проверить завершенные задачи немедленно
router.post('/check-completed-tasks-now', auth, requireAdmin, async (req, res) => {
  try {
    console.log('🚀 Админ запустил проверку завершенных задач немедленно');
    await schedulerService.runCompletedTasksCheckNow();
    
    res.json({
      success: true,
      message: 'Проверка завершенных задач запущена'
    });
  } catch (error) {
    console.error('Ошибка проверки завершенных задач:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при проверке завершенных задач',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Получить статус планировщиков
router.get('/scheduler-status', auth, requireAdmin, (req, res) => {
  try {
    const status = schedulerService.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Ошибка получения статуса планировщиков:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении статуса планировщиков',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Получить статистику премиум пользователей
router.get('/premium-users-stats', auth, requireAdmin, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: {
          'subscription.type': { $ne: 'free' },
          'subscription.status': 'active'
        }
      },
      {
        $group: {
          _id: '$subscription.type',
          count: { $sum: 1 },
          avgCompletedTasks: { $avg: '$taskSettings.completedTasksCount' },
          avgStreakDays: { $avg: '$taskSettings.streakDays' }
        }
      }
    ]);

    const totalPremiumUsers = await User.countDocuments({
      'subscription.type': { $ne: 'free' },
      'subscription.status': 'active'
    });

    const usersWithSelectedProfession = await User.countDocuments({
      'subscription.type': { $ne: 'free' },
      'subscription.status': 'active',
      'selectedProfession.isActive': true
    });

    res.json({
      success: true,
      data: {
        totalPremiumUsers,
        usersWithSelectedProfession,
        subscriptionStats: stats
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики премиум пользователей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении статистики',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Назначить задачи конкретному пользователю
router.post('/assign-tasks-to-user/:userId', auth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const assignedCount = await TaskAssignmentService.assignTasksToUser(user);
    
    res.json({
      success: true,
      message: `Пользователю ${user.username} назначено ${assignedCount} задач`,
      data: { assignedCount }
    });
  } catch (error) {
    console.error('Ошибка назначения задач пользователю:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при назначении задач пользователю',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Получить список премиум пользователей
router.get('/premium-users', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({
      'subscription.type': { $ne: 'free' },
      'subscription.status': 'active'
    })
    .select('username email firstName lastName subscription selectedProfession taskSettings')
    .populate('selectedProfession.professionId', 'name slug')
    .sort({ 'subscription.startDate': -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await User.countDocuments({
      'subscription.type': { $ne: 'free' },
      'subscription.status': 'active'
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка получения списка премиум пользователей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении списка премиум пользователей',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
