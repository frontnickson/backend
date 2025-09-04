const express = require('express');
const router = express.Router();
const Profession = require('../models/Profession');
const ProfessionTask = require('../models/ProfessionTask');
const { authenticate: auth } = require('../middleware/auth');

// Получить все профессии
router.get('/', async (req, res) => {
  try {
    const { category, level, featured, limit = 50, page = 1 } = req.query;
    
    const filter = { isActive: true, isPublic: true };
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (featured === 'true') filter.isFeatured = true;
    
    const skip = (page - 1) * limit;
    
    const professions = await Profession.find(filter)
      .populate('createdBy', 'username firstName lastName')
      .sort({ 'statistics.popularity': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Profession.countDocuments(filter);
    
    res.json({
      success: true,
      data: professions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении профессий:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении профессий',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Получить профессию по slug
router.get('/:slug', async (req, res) => {
  try {
    const profession = await Profession.findOne({ 
      slug: req.params.slug, 
      isActive: true, 
      isPublic: true 
    }).populate('createdBy', 'username firstName lastName');
    
    if (!profession) {
      return res.status(404).json({
        success: false,
        message: 'Профессия не найдена'
      });
    }
    
    res.json({
      success: true,
      data: profession
    });
  } catch (error) {
    console.error('Ошибка при получении профессии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении профессии',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Получить задачи профессии
router.get('/:slug/tasks', async (req, res) => {
  try {
    const { category, difficulty, level, type, limit = 50, page = 1 } = req.query;
    
    // Сначала найдем профессию
    const profession = await Profession.findOne({ 
      slug: req.params.slug, 
      isActive: true, 
      isPublic: true 
    });
    
    if (!profession) {
      return res.status(404).json({
        success: false,
        message: 'Профессия не найдена'
      });
    }
    
    const filter = { 
      professionId: profession._id, 
      isActive: true, 
      isPublic: true 
    };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (level) filter.level = parseInt(level);
    if (type) filter.type = type;
    
    const skip = (page - 1) * limit;
    
    const tasks = await ProfessionTask.find(filter)
      .populate('createdBy', 'username firstName lastName')
      .sort({ order: 1, level: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await ProfessionTask.countDocuments(filter);
    
    res.json({
      success: true,
      data: tasks,
      profession: {
        id: profession._id,
        name: profession.name,
        slug: profession.slug
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении задач профессии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении задач профессии',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Получить конкретную задачу
router.get('/:slug/tasks/:taskId', async (req, res) => {
  try {
    // Сначала найдем профессию
    const profession = await Profession.findOne({ 
      slug: req.params.slug, 
      isActive: true, 
      isPublic: true 
    });
    
    if (!profession) {
      return res.status(404).json({
        success: false,
        message: 'Профессия не найдена'
      });
    }
    
    const task = await ProfessionTask.findOne({
      _id: req.params.taskId,
      professionId: profession._id,
      isActive: true,
      isPublic: true
    }).populate('createdBy', 'username firstName lastName');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }
    
    res.json({
      success: true,
      data: task,
      profession: {
        id: profession._id,
        name: profession.name,
        slug: profession.slug
      }
    });
  } catch (error) {
    console.error('Ошибка при получении задачи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении задачи',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Получить категории профессий
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Profession.distinct('category', { isActive: true, isPublic: true });
    
    const categoryInfo = {
      design: { name: 'Дизайн', icon: '🎨', description: 'Графический дизайн, UI/UX, брендинг' },
      development: { name: 'Разработка', icon: '💻', description: 'Программирование, веб-разработка' },
      marketing: { name: 'Маркетинг', icon: '📈', description: 'SMM, контент-маркетинг, реклама' },
      management: { name: 'Менеджмент', icon: '👥', description: 'Управление проектами, командами' },
      sales: { name: 'Продажи', icon: '💰', description: 'Продажи, работа с клиентами' },
      support: { name: 'Поддержка', icon: '🛠️', description: 'Техническая поддержка, администрирование' },
      other: { name: 'Другое', icon: '🔧', description: 'Прочие профессии' }
    };
    
    const result = categories.map(category => ({
      value: category,
      ...categoryInfo[category] || { name: category, icon: '🔧', description: '' }
    }));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении категорий',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Получить уровни сложности задач
router.get('/tasks/difficulties', async (req, res) => {
  try {
    const difficulties = [
      { value: 'beginner', name: 'Начинающий', level: 1, description: 'Простые задачи для изучения основ' },
      { value: 'intermediate', name: 'Средний', level: 3, description: 'Задачи средней сложности' },
      { value: 'advanced', name: 'Продвинутый', level: 6, description: 'Сложные задачи для опытных специалистов' },
      { value: 'expert', name: 'Эксперт', level: 9, description: 'Профессиональные задачи высокого уровня' }
    ];
    
    res.json({
      success: true,
      data: difficulties
    });
  } catch (error) {
    console.error('Ошибка при получении уровней сложности:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении уровней сложности',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Получить категории задач
router.get('/tasks/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'social_media', name: 'Социальные сети', icon: '📱', description: 'Посты, сторис, обложки для соцсетей' },
      { value: 'print_design', name: 'Печатная продукция', icon: '📄', description: 'Визитки, буклеты, плакаты' },
      { value: 'web_design', name: 'Веб-дизайн', icon: '🌐', description: 'Лендинги, сайты, интерфейсы' },
      { value: 'branding', name: 'Брендинг', icon: '🏷️', description: 'Логотипы, фирменный стиль' },
      { value: 'ui_ux', name: 'UI/UX', icon: '🎯', description: 'Пользовательские интерфейсы' },
      { value: 'illustration', name: 'Иллюстрация', icon: '🎨', description: 'Иллюстрации, иконки, графические элементы' },
      { value: 'photography', name: 'Фотография', icon: '📸', description: 'Фотосъемка, обработка изображений' },
      { value: 'video', name: 'Видео', icon: '🎬', description: 'Видеоролики, анимации' },
      { value: 'animation', name: 'Анимация', icon: '✨', description: 'Анимированные элементы, GIF' },
      { value: 'packaging', name: 'Упаковка', icon: '📦', description: 'Дизайн упаковки товаров' },
      { value: 'presentation', name: 'Презентации', icon: '📊', description: 'Слайды, инфографика' },
      { value: 'other', name: 'Другое', icon: '🔧', description: 'Прочие задачи' }
    ];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Ошибка при получении категорий задач:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении категорий задач',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Создать новую профессию (только для админов)
router.post('/', auth, async (req, res) => {
  try {
    // Проверяем права администратора
    if (req.user.role !== 'admin' && req.user.role !== 'superuser') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для создания профессии'
      });
    }
    
    const professionData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };
    
    const profession = new Profession(professionData);
    await profession.save();
    
    res.status(201).json({
      success: true,
      data: profession,
      message: 'Профессия успешно создана'
    });
  } catch (error) {
    console.error('Ошибка при создании профессии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании профессии',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Создать новую задачу (только для админов)
router.post('/:slug/tasks', auth, async (req, res) => {
  try {
    // Проверяем права администратора
    if (req.user.role !== 'admin' && req.user.role !== 'superuser') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для создания задачи'
      });
    }
    
    // Находим профессию
    const profession = await Profession.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    });
    
    if (!profession) {
      return res.status(404).json({
        success: false,
        message: 'Профессия не найдена'
      });
    }
    
    const taskData = {
      ...req.body,
      professionId: profession._id,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };
    
    const task = new ProfessionTask(taskData);
    await task.save();
    
    res.status(201).json({
      success: true,
      data: task,
      message: 'Задача успешно создана'
    });
  } catch (error) {
    console.error('Ошибка при создании задачи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании задачи',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
