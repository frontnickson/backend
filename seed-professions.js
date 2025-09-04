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
const Profession = require('./src/models/Profession');
const ProfessionTask = require('./src/models/ProfessionTask');
const { graphicDesignerTasks } = require('./tasks-data');

// Создаем профессию графического дизайнера
const createGraphicDesignerProfession = async () => {
  try {
    // Проверяем, существует ли уже профессия
    const existingProfession = await Profession.findOne({ slug: 'graphic-designer' });
    if (existingProfession) {
      console.log('📝 Профессия "Графический дизайнер" уже существует');
      return existingProfession;
    }

    const profession = new Profession({
      name: 'Графический дизайнер',
      slug: 'graphic-designer',
      description: 'Создание визуального контента для брендов, рекламы, социальных сетей и печатной продукции. Работа с типографикой, цветом, композицией и современными дизайн-трендами.',
      shortDescription: 'Создание визуального контента для брендов и рекламы',
      category: 'design',
      level: 'all',
      icon: '🎨',
      color: '#FF6B6B',
      requiredSkills: [
        'Adobe Photoshop',
        'Adobe Illustrator', 
        'Adobe InDesign',
        'Figma',
        'Типографика',
        'Цветоведение',
        'Композиция',
        'Брендинг'
      ],
      recommendedSkills: [
        'Adobe After Effects',
        'Sketch',
        'Principle',
        'HTML/CSS',
        'Фотография',
        'Иллюстрация'
      ],
      tools: [
        'Adobe Creative Suite',
        'Figma',
        'Sketch',
        'Canva Pro',
        'Unsplash',
        'Freepik'
      ],
      statistics: {
        totalTasks: 100,
        averageTaskTime: 4,
        difficulty: 6,
        popularity: 95
      },
      isActive: true,
      isPublic: true,
      isFeatured: true,
      createdBy: new mongoose.Types.ObjectId(),
      updatedBy: new mongoose.Types.ObjectId()
    });

    await profession.save();
    console.log('✅ Профессия "Графический дизайнер" создана');
    return profession;
  } catch (error) {
    console.error('❌ Ошибка создания профессии:', error);
    throw error;
  }
};

// Создаем задачи для графического дизайнера
const createGraphicDesignerTasks = async (professionId) => {
  const tasks = graphicDesignerTasks.map(task => ({
    ...task,
    professionId,
    createdBy: new mongoose.Types.ObjectId(),
    updatedBy: new mongoose.Types.ObjectId()
  }));

  try {
    // Удаляем существующие задачи для этой профессии
    await ProfessionTask.deleteMany({ professionId });
    console.log('🗑️ Удалены существующие задачи');

    // Создаем новые задачи
    for (let i = 0; i < tasks.length; i++) {
      const task = new ProfessionTask(tasks[i]);
      await task.save();
      console.log(`✅ Задача ${i + 1}/${tasks.length} создана: ${task.title}`);
    }

    console.log(`🎉 Создано ${tasks.length} задач для профессии "Графический дизайнер"`);
  } catch (error) {
    console.error('❌ Ошибка создания задач:', error);
    throw error;
  }
};

// Основная функция
const seedProfessions = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Начинаем заполнение базы данных...');
    
    // Создаем профессию
    const profession = await createGraphicDesignerProfession();
    
    // Создаем задачи
    await createGraphicDesignerTasks(profession._id);
    
    console.log('🎉 Заполнение базы данных завершено!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка заполнения базы данных:', error);
    process.exit(1);
  }
};

// Запускаем скрипт
seedProfessions();
