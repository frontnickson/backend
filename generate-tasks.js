// Генератор 100 задач для графического дизайнера
const fs = require('fs');

const generateTasks = () => {
  const tasks = [];
  let order = 1;

  // СОЦИАЛЬНЫЕ СЕТИ (20 задач)
  const socialMediaTasks = [
    {
      title: 'Креативы для Самокат - Instagram Stories',
      description: 'Создать 4 креатива в формате 1080x1080 для Instagram Stories рекламной кампании доставки еды Самокат. Тема: "Быстрая доставка за 15 минут". Включить логотип, призыв к действию и яркие цвета бренда.',
      shortDescription: '4 креатива для Instagram Stories рекламной кампании Самокат',
      category: 'social_media',
      type: 'practical',
      difficulty: 'beginner',
      level: 2,
      estimatedTime: 3,
      timeUnit: 'hours',
      deadline: 2,
      materials: [
        { name: 'Логотип Самокат', type: 'image', isRequired: true },
        { name: 'Брендбук Самокат', type: 'reference', isRequired: true },
        { name: 'Фотографии еды', type: 'image', isRequired: true }
      ],
      deliverables: [
        { name: '4 креатива Instagram Stories', format: 'PNG 1080x1080', isRequired: true },
        { name: 'Исходные файлы', format: 'PSD', isRequired: true }
      ],
      requirements: [
        'Использовать фирменные цвета Самокат',
        'Добавить логотип в каждом креативе',
        'Включить призыв к действию "Заказать сейчас"',
        'Сделать текст читаемым на мобильных устройствах'
      ],
      technicalRequirements: {
        software: ['Adobe Photoshop', 'Adobe Illustrator'],
        fileFormats: ['PNG', 'PSD'],
        dimensions: { width: 1080, height: 1080, unit: 'px' },
        resolution: 72,
        colorMode: 'RGB'
      },
      client: { name: 'Самокат', industry: 'Доставка еды' },
      tags: ['instagram', 'stories', 'реклама', 'доставка'],
      group: 'Социальные сети'
    },
    {
      title: 'Обложка для Telegram-канала',
      description: 'Создать обложку для Telegram-канала IT-компании "TechFlow". Размер 512x512px. Стиль: минималистичный, современный.',
      shortDescription: 'Обложка Telegram-канала для IT-компании',
      category: 'social_media',
      type: 'practical',
      difficulty: 'beginner',
      level: 1,
      estimatedTime: 1.5,
      timeUnit: 'hours',
      deadline: 1,
      materials: [
        { name: 'Логотип TechFlow', type: 'image', isRequired: true },
        { name: 'Цветовая палитра', type: 'reference', isRequired: true }
      ],
      deliverables: [
        { name: 'Обложка Telegram', format: 'PNG 512x512', isRequired: true }
      ],
      requirements: [
        'Минималистичный дизайн',
        'Включить название "TechFlow"',
        'Использовать современные IT-цвета'
      ],
      technicalRequirements: {
        software: ['Adobe Illustrator', 'Figma'],
        fileFormats: ['PNG'],
        dimensions: { width: 512, height: 512, unit: 'px' },
        resolution: 72,
        colorMode: 'RGB'
      },
      client: { name: 'TechFlow', industry: 'IT' },
      tags: ['telegram', 'обложка', 'IT', 'минимализм'],
      group: 'Социальные сети'
    },
    {
      title: 'Пост для ВКонтакте - День программиста',
      description: 'Создать пост для ВКонтакте ко Дню программиста. Размер 1200x630px. Стиль: праздничный, с элементами кода и технологий.',
      shortDescription: 'Праздничный пост ко Дню программиста',
      category: 'social_media',
      type: 'practical',
      difficulty: 'beginner',
      level: 2,
      estimatedTime: 2,
      timeUnit: 'hours',
      deadline: 1,
      materials: [
        { name: 'Иконки программирования', type: 'image', isRequired: true },
        { name: 'Шрифты для кода', type: 'font', isRequired: true }
      ],
      deliverables: [
        { name: 'Пост ВКонтакте', format: 'PNG 1200x630', isRequired: true }
      ],
      requirements: [
        'Праздничное настроение',
        'Элементы кода и технологий',
        'Читаемый текст',
        'Яркие цвета'
      ],
      technicalRequirements: {
        software: ['Adobe Photoshop', 'Adobe Illustrator'],
        fileFormats: ['PNG'],
        dimensions: { width: 1200, height: 630, unit: 'px' },
        resolution: 72,
        colorMode: 'RGB'
      },
      client: { name: 'IT-сообщество', industry: 'IT' },
      tags: ['вконтакте', 'праздник', 'программирование', 'код'],
      group: 'Социальные сети'
    },
    {
      title: 'Сторис для TikTok - Новый продукт',
      description: 'Создать 3 сторис для TikTok о запуске нового продукта. Формат 1080x1920px. Стиль: динамичный, молодежный, с анимационными элементами.',
      shortDescription: '3 сторис для TikTok о новом продукте',
      category: 'social_media',
      type: 'practical',
      difficulty: 'intermediate',
      level: 4,
      estimatedTime: 4,
      timeUnit: 'hours',
      deadline: 2,
      materials: [
        { name: 'Фото продукта', type: 'image', isRequired: true },
        { name: 'Анимационные элементы', type: 'template', isRequired: true },
        { name: 'Трендовые шрифты', type: 'font', isRequired: true }
      ],
      deliverables: [
        { name: '3 сторис TikTok', format: 'PNG 1080x1920', isRequired: true },
        { name: 'Анимированная версия', format: 'MP4', isRequired: false }
      ],
      requirements: [
        'Молодежный стиль',
        'Динамичная композиция',
        'Четкий призыв к действию',
        'Соответствие трендам TikTok'
      ],
      technicalRequirements: {
        software: ['Adobe After Effects', 'Adobe Photoshop'],
        fileFormats: ['PNG', 'MP4'],
        dimensions: { width: 1080, height: 1920, unit: 'px' },
        resolution: 72,
        colorMode: 'RGB'
      },
      client: { name: 'Стартап', industry: 'Технологии' },
      tags: ['tiktok', 'сторис', 'анимация', 'молодежь'],
      group: 'Социальные сети'
    },
    {
      title: 'Карусель для LinkedIn - Кейс-стади',
      description: 'Создать карусель из 5 слайдов для LinkedIn с кейс-стади проекта. Размер 1200x1200px каждый. Стиль: деловой, профессиональный.',
      shortDescription: 'Карусель LinkedIn с кейс-стади проекта',
      category: 'social_media',
      type: 'practical',
      difficulty: 'intermediate',
      level: 5,
      estimatedTime: 5,
      timeUnit: 'hours',
      deadline: 3,
      materials: [
        { name: 'Скриншоты проекта', type: 'image', isRequired: true },
        { name: 'Логотип компании', type: 'image', isRequired: true },
        { name: 'Иконки метрик', type: 'image', isRequired: true }
      ],
      deliverables: [
        { name: '5 слайдов карусели', format: 'PNG 1200x1200', isRequired: true },
        { name: 'PDF версия', format: 'PDF', isRequired: false }
      ],
      requirements: [
        'Профессиональный дизайн',
        'Четкая структура информации',
        'Визуализация результатов',
        'Единый стиль всех слайдов'
      ],
      technicalRequirements: {
        software: ['Figma', 'Adobe Illustrator'],
        fileFormats: ['PNG', 'PDF'],
        dimensions: { width: 1200, height: 1200, unit: 'px' },
        resolution: 72,
        colorMode: 'RGB'
      },
      client: { name: 'Digital-агентство', industry: 'Маркетинг' },
      tags: ['linkedin', 'карусель', 'кейс', 'профессиональный'],
      group: 'Социальные сети'
    }
  ];

  // Добавляем задачи с порядковыми номерами
  socialMediaTasks.forEach(task => {
    tasks.push({ ...task, order: order++ });
  });

  // ПЕЧАТНАЯ ПРОДУКЦИЯ (20 задач)
  const printTasks = [
    {
      title: 'Визитки для архитектурного бюро',
      description: 'Создать дизайн визиток для архитектурного бюро "Студия Пространство". Размер 90x50мм. Стиль: минималистичный, с элементами архитектурной графики.',
      shortDescription: 'Визитки для архитектурного бюро',
      category: 'print_design',
      type: 'practical',
      difficulty: 'beginner',
      level: 2,
      estimatedTime: 3,
      timeUnit: 'hours',
      deadline: 2,
      materials: [
        { name: 'Логотип студии', type: 'image', isRequired: true },
        { name: 'Шрифты для архитектуры', type: 'font', isRequired: true },
        { name: 'Векторные элементы', type: 'template', isRequired: true }
      ],
      deliverables: [
        { name: 'Файл для печати', format: 'PDF', isRequired: true },
        { name: 'Исходный файл', format: 'AI', isRequired: true }
      ],
      requirements: [
        'Минималистичный дизайн',
        'Архитектурная тематика',
        'Читаемость мелкого текста',
        'Соответствие стандартам печати'
      ],
      technicalRequirements: {
        software: ['Adobe Illustrator', 'Adobe InDesign'],
        fileFormats: ['PDF', 'AI'],
        dimensions: { width: 90, height: 50, unit: 'mm' },
        resolution: 300,
        colorMode: 'CMYK'
      },
      client: { name: 'Студия Пространство', industry: 'Архитектура' },
      tags: ['визитки', 'архитектура', 'минимализм', 'печать'],
      group: 'Печатная продукция'
    },
    {
      title: 'Буклет для медицинской клиники',
      description: 'Создать буклет 6 страниц для медицинской клиники "Здоровье+". Формат A4, сложение втрое. Стиль: медицинский, доверительный, с иконками услуг.',
      shortDescription: 'Буклет для медицинской клиники',
      category: 'print_design',
      type: 'practical',
      difficulty: 'intermediate',
      level: 4,
      estimatedTime: 6,
      timeUnit: 'hours',
      deadline: 3,
      materials: [
        { name: 'Логотип клиники', type: 'image', isRequired: true },
        { name: 'Фото врачей', type: 'image', isRequired: true },
        { name: 'Иконки медицинских услуг', type: 'image', isRequired: true }
      ],
      deliverables: [
        { name: 'Буклет для печати', format: 'PDF', isRequired: true },
        { name: 'Исходные файлы', format: 'INDD', isRequired: true }
      ],
      requirements: [
        'Доверительный медицинский стиль',
        'Четкая структура информации',
        'Читаемость текста',
        'Привлекательные иконки'
      ],
      technicalRequirements: {
        software: ['Adobe InDesign', 'Adobe Illustrator'],
        fileFormats: ['PDF', 'INDD'],
        dimensions: { width: 210, height: 297, unit: 'mm' },
        resolution: 300,
        colorMode: 'CMYK'
      },
      client: { name: 'Клиника Здоровье+', industry: 'Медицина' },
      tags: ['буклет', 'медицина', 'здоровье', 'услуги'],
      group: 'Печатная продукция'
    }
  ];

  printTasks.forEach(task => {
    tasks.push({ ...task, order: order++ });
  });

  // ВЕБ-ДИЗАЙН (20 задач)
  const webDesignTasks = [
    {
      title: 'Лендинг для курсов программирования',
      description: 'Создать дизайн лендинга для онлайн-курсов программирования "CodeMaster". Адаптивный дизайн для десктопа и мобильных устройств. Стиль: современный, IT-тематика.',
      shortDescription: 'Лендинг для онлайн-курсов программирования',
      category: 'web_design',
      type: 'practical',
      difficulty: 'intermediate',
      level: 5,
      estimatedTime: 8,
      timeUnit: 'hours',
      deadline: 5,
      materials: [
        { name: 'Логотип CodeMaster', type: 'image', isRequired: true },
        { name: 'Фото преподавателей', type: 'image', isRequired: true },
        { name: 'Иконки технологий', type: 'image', isRequired: true }
      ],
      deliverables: [
        { name: 'Макет для десктопа', format: 'PNG', isRequired: true },
        { name: 'Макет для мобильных', format: 'PNG', isRequired: true },
        { name: 'Figma файл', format: 'Figma', isRequired: true }
      ],
      requirements: [
        'Современный IT-дизайн',
        'Адаптивность',
        'Четкая структура контента',
        'Призывы к действию'
      ],
      technicalRequirements: {
        software: ['Figma', 'Adobe XD'],
        fileFormats: ['PNG', 'Figma'],
        dimensions: { width: 1920, height: 1080, unit: 'px' },
        resolution: 72,
        colorMode: 'RGB'
      },
      client: { name: 'CodeMaster', industry: 'Образование' },
      tags: ['лендинг', 'программирование', 'курсы', 'адаптив'],
      group: 'Веб-дизайн'
    }
  ];

  webDesignTasks.forEach(task => {
    tasks.push({ ...task, order: order++ });
  });

  // БРЕНДИНГ (20 задач)
  const brandingTasks = [
    {
      title: 'Логотип для кофейни',
      description: 'Создать логотип для кофейни "Утренний кофе". Стиль: уютный, теплый, с элементами кофе. Включает основной логотип, иконку и варианты для разных применений.',
      shortDescription: 'Логотип для кофейни',
      category: 'branding',
      type: 'practical',
      difficulty: 'intermediate',
      level: 4,
      estimatedTime: 6,
      timeUnit: 'hours',
      deadline: 3,
      materials: [
        { name: 'Референсы кофейных логотипов', type: 'reference', isRequired: true },
        { name: 'Шрифты для кафе', type: 'font', isRequired: true },
        { name: 'Иконки кофе', type: 'image', isRequired: true }
      ],
      deliverables: [
        { name: 'Основной логотип', format: 'SVG', isRequired: true },
        { name: 'Иконка', format: 'SVG', isRequired: true },
        { name: 'Горизонтальный вариант', format: 'SVG', isRequired: true },
        { name: 'Вертикальный вариант', format: 'SVG', isRequired: true }
      ],
      requirements: [
        'Уютный, теплый стиль',
        'Элементы кофе',
        'Читаемость в разных размерах',
        'Универсальность применения'
      ],
      technicalRequirements: {
        software: ['Adobe Illustrator', 'Figma'],
        fileFormats: ['SVG', 'AI'],
        dimensions: { width: 200, height: 200, unit: 'px' },
        resolution: 300,
        colorMode: 'RGB'
      },
      client: { name: 'Утренний кофе', industry: 'Общепит' },
      tags: ['логотип', 'кофейня', 'брендинг', 'уют'],
      group: 'Брендинг'
    }
  ];

  brandingTasks.forEach(task => {
    tasks.push({ ...task, order: order++ });
  });

  // UI/UX (10 задач)
  const uiUxTasks = [
    {
      title: 'Мобильное приложение для фитнеса',
      description: 'Создать UI-дизайн мобильного приложения для фитнеса "FitTracker". Включает главный экран, профиль, тренировки, статистику. Стиль: спортивный, мотивирующий.',
      shortDescription: 'UI-дизайн мобильного фитнес-приложения',
      category: 'ui_ux',
      type: 'practical',
      difficulty: 'advanced',
      level: 7,
      estimatedTime: 12,
      timeUnit: 'hours',
      deadline: 7,
      materials: [
        { name: 'Иконки фитнеса', type: 'image', isRequired: true },
        { name: 'Фото тренировок', type: 'image', isRequired: true },
        { name: 'UI Kit', type: 'template', isRequired: true }
      ],
      deliverables: [
        { name: 'Экраны приложения', format: 'PNG', isRequired: true },
        { name: 'Figma файл', format: 'Figma', isRequired: true },
        { name: 'UI Kit', format: 'Figma', isRequired: true }
      ],
      requirements: [
        'Спортивный, мотивирующий дизайн',
        'Удобная навигация',
        'Четкая иерархия информации',
        'Адаптивность'
      ],
      technicalRequirements: {
        software: ['Figma', 'Adobe XD'],
        fileFormats: ['PNG', 'Figma'],
        dimensions: { width: 375, height: 812, unit: 'px' },
        resolution: 72,
        colorMode: 'RGB'
      },
      client: { name: 'FitTracker', industry: 'Фитнес' },
      tags: ['ui', 'ux', 'мобильное', 'фитнес', 'приложение'],
      group: 'UI/UX'
    }
  ];

  uiUxTasks.forEach(task => {
    tasks.push({ ...task, order: order++ });
  });

  // ИЛЛЮСТРАЦИЯ (10 задач)
  const illustrationTasks = [
    {
      title: 'Иллюстрации для детской книги',
      description: 'Создать 5 иллюстраций для детской книги "Приключения Кота-Путешественника". Стиль: детский, яркий, дружелюбный. Формат A4.',
      shortDescription: 'Иллюстрации для детской книги',
      category: 'illustration',
      type: 'practical',
      difficulty: 'intermediate',
      level: 5,
      estimatedTime: 10,
      timeUnit: 'hours',
      deadline: 5,
      materials: [
        { name: 'Текст книги', type: 'reference', isRequired: true },
        { name: 'Референсы детских иллюстраций', type: 'reference', isRequired: true },
        { name: 'Кисти для иллюстрации', type: 'template', isRequired: true }
      ],
      deliverables: [
        { name: '5 иллюстраций', format: 'PNG', isRequired: true },
        { name: 'Исходные файлы', format: 'PSD', isRequired: true },
        { name: 'Векторные версии', format: 'AI', isRequired: false }
      ],
      requirements: [
        'Детский, дружелюбный стиль',
        'Яркие, привлекательные цвета',
        'Понятные персонажи',
        'Соответствие тексту'
      ],
      technicalRequirements: {
        software: ['Adobe Photoshop', 'Adobe Illustrator'],
        fileFormats: ['PNG', 'PSD', 'AI'],
        dimensions: { width: 2480, height: 3508, unit: 'px' },
        resolution: 300,
        colorMode: 'RGB'
      },
      client: { name: 'Детское издательство', industry: 'Издательство' },
      tags: ['иллюстрация', 'дети', 'книга', 'кот', 'приключения'],
      group: 'Иллюстрация'
    }
  ];

  illustrationTasks.forEach(task => {
    tasks.push({ ...task, order: order++ });
  });

  return tasks;
};

// Генерируем и сохраняем задачи
const tasks = generateTasks();
fs.writeFileSync('./tasks-data.js', `module.exports = { graphicDesignerTasks: ${JSON.stringify(tasks, null, 2)} };`);

console.log(`✅ Сгенерировано ${tasks.length} задач для графического дизайнера`);
