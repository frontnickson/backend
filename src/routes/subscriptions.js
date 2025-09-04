const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profession = require('../models/Profession');
const { authenticate: auth } = require('../middleware/auth');

// Получить информацию о подписке пользователя
router.get('/my-subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('selectedProfession.professionId', 'name slug description icon color');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: {
        subscription: user.subscription,
        selectedProfession: user.selectedProfession,
        taskSettings: user.taskSettings,
        isPremium: user.isPremium,
        canReceiveTasks: user.canReceiveTasks
      }
    });
  } catch (error) {
    console.error('Ошибка получения подписки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении подписки',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Обновить подписку пользователя
router.post('/upgrade', auth, async (req, res) => {
  try {
    const { subscriptionType, durationMonths = 1 } = req.body;

    if (!['premium', 'pro', 'enterprise'].includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный тип подписки'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    await user.upgradeSubscription(subscriptionType, durationMonths);

    res.json({
      success: true,
      message: `Подписка успешно обновлена до ${subscriptionType}`,
      data: {
        subscription: user.subscription,
        taskSettings: user.taskSettings
      }
    });
  } catch (error) {
    console.error('Ошибка обновления подписки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении подписки',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Выбрать профессию для обучения
router.post('/select-profession', auth, async (req, res) => {
  try {
    const { professionSlug } = req.body;

    if (!professionSlug) {
      return res.status(400).json({
        success: false,
        message: 'Не указана профессия'
      });
    }

    // Проверяем, что пользователь имеет премиум подписку
    const user = await User.findById(req.user.id);
    if (!user.isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Для выбора профессии требуется премиум подписка'
      });
    }

    // Находим профессию
    const profession = await Profession.findOne({ 
      slug: professionSlug, 
      isActive: true, 
      isPublic: true 
    });

    if (!profession) {
      return res.status(404).json({
        success: false,
        message: 'Профессия не найдена'
      });
    }

    await user.selectProfession(profession._id, profession.slug);

    res.json({
      success: true,
      message: `Профессия "${profession.name}" успешно выбрана`,
      data: {
        selectedProfession: user.selectedProfession,
        taskSettings: user.taskSettings
      }
    });
  } catch (error) {
    console.error('Ошибка выбора профессии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при выборе профессии',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Обновить настройки задач
router.put('/task-settings', auth, async (req, res) => {
  try {
    const { dailyTaskLimit, taskDifficulty, taskCategories } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Проверяем, что пользователь имеет премиум подписку
    if (!user.isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Для настройки задач требуется премиум подписка'
      });
    }

    // Обновляем настройки
    if (dailyTaskLimit !== undefined) {
      user.taskSettings.dailyTaskLimit = Math.min(dailyTaskLimit, 10); // Максимум 10 задач в день
    }
    if (taskDifficulty !== undefined) {
      user.taskSettings.taskDifficulty = taskDifficulty;
    }
    if (taskCategories !== undefined) {
      user.taskSettings.taskCategories = taskCategories;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Настройки задач обновлены',
      data: {
        taskSettings: user.taskSettings
      }
    });
  } catch (error) {
    console.error('Ошибка обновления настроек задач:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении настроек задач',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Получить статистику задач пользователя
router.get('/task-stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Здесь можно добавить дополнительную статистику из Task модели
    const stats = {
      completedTasks: user.taskSettings.completedTasksCount,
      streakDays: user.taskSettings.streakDays,
      dailyLimit: user.taskSettings.dailyTaskLimit,
      lastAssignment: user.taskSettings.lastTaskAssignment,
      canReceiveTasks: user.canReceiveTasks
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Ошибка получения статистики задач:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении статистики задач',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Отменить подписку
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    user.subscription.status = 'cancelled';
    user.taskSettings.dailyTaskLimit = 0; // Отключаем автоматические задачи
    await user.save();

    res.json({
      success: true,
      message: 'Подписка отменена',
      data: {
        subscription: user.subscription,
        taskSettings: user.taskSettings
      }
    });
  } catch (error) {
    console.error('Ошибка отмены подписки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при отмене подписки',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
