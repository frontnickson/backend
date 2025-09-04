const mongoose = require('mongoose');

const professionTaskSchema = new mongoose.Schema({
  // Основная информация
  title: {
    type: String,
    required: [true, 'Название задачи обязательно'],
    trim: true,
    maxlength: [200, 'Название задачи не может превышать 200 символов']
  },
  description: {
    type: String,
    required: [true, 'Описание задачи обязательно'],
    trim: true,
    maxlength: [2000, 'Описание задачи не может превышать 2000 символов']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Краткое описание не может превышать 300 символов']
  },
  
  // Связь с профессией
  professionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profession',
    required: [true, 'ID профессии обязателен']
  },
  
  // Категория и тип задачи
  category: {
    type: String,
    required: [true, 'Категория задачи обязательна'],
    enum: [
      'social_media', 'print_design', 'web_design', 'branding', 
      'ui_ux', 'illustration', 'photography', 'video', 'animation',
      'packaging', 'presentation', 'other'
    ],
    default: 'other'
  },
  type: {
    type: String,
    required: [true, 'Тип задачи обязателен'],
    enum: ['practical', 'theoretical', 'portfolio', 'test', 'project'],
    default: 'practical'
  },
  
  // Уровень сложности
  difficulty: {
    type: String,
    required: [true, 'Уровень сложности обязателен'],
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  level: {
    type: Number,
    required: [true, 'Числовой уровень сложности обязателен'],
    min: 1,
    max: 10,
    default: 1
  },
  
  // Временные параметры
  estimatedTime: {
    type: Number,
    required: [true, 'Оценочное время выполнения обязательно'],
    min: 0.5, // минимум 30 минут
    max: 168 // максимум 1 неделя
  },
  timeUnit: {
    type: String,
    required: [true, 'Единица измерения времени обязательна'],
    enum: ['minutes', 'hours', 'days'],
    default: 'hours'
  },
  deadline: {
    type: Number, // количество дней на выполнение
    min: 1,
    max: 30,
    default: 7
  },
  
  // Материалы и ресурсы
  materials: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Название материала не может превышать 100 символов']
    },
    type: {
      type: String,
      required: true,
      enum: ['image', 'font', 'template', 'reference', 'software', 'other'],
      default: 'other'
    },
    url: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Описание материала не может превышать 200 символов']
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  
  // Требования и критерии
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Требование не может превышать 200 символов']
  }],
  deliverables: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Название результата не может превышать 100 символов']
    },
    format: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Формат не может превышать 50 символов']
    },
    specifications: {
      type: String,
      trim: true,
      maxlength: [200, 'Спецификации не могут превышать 200 символов']
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  
  // Технические требования
  technicalRequirements: {
    software: [{
      type: String,
      trim: true,
      maxlength: [100, 'Название ПО не может превышать 100 символов']
    }],
    fileFormats: [{
      type: String,
      trim: true,
      maxlength: [20, 'Формат файла не может превышать 20 символов']
    }],
    dimensions: {
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['px', 'mm', 'cm', 'in'],
        default: 'px'
      }
    },
    resolution: {
      type: Number,
      min: 72,
      max: 600
    },
    colorMode: {
      type: String,
      enum: ['RGB', 'CMYK', 'Grayscale', 'Indexed'],
      default: 'RGB'
    }
  },
  
  // Клиент и контекст
  client: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Название клиента не может превышать 100 символов']
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [50, 'Отрасль не может превышать 50 символов']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Описание клиента не может превышать 500 символов']
    }
  },
  
  // Теги и метки
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Тег не может превышать 50 символов']
  }],
  
  // Примеры и референсы
  examples: [{
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Название примера не может превышать 100 символов']
    },
    url: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Описание примера не может превышать 200 символов']
    }
  }],
  
  // Критерии оценки
  evaluationCriteria: [{
    criterion: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Критерий не может превышать 200 символов']
    },
    weight: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Описание критерия не может превышать 300 символов']
    }
  }],
  
  // Статистика
  statistics: {
    attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    completions: {
      type: Number,
      default: 0,
      min: 0
    },
    averageTime: {
      type: Number,
      default: 0,
      min: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    difficulty: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    }
  },
  
  // Настройки
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // Порядок и группировка
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  group: {
    type: String,
    trim: true,
    maxlength: [100, 'Название группы не может превышать 100 символов']
  },
  
  // Системные поля
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальные поля
professionTaskSchema.virtual('estimatedTimeDisplay').get(function() {
  const time = this.estimatedTime;
  const unit = this.timeUnit;
  
  if (unit === 'minutes') {
    if (time < 60) return `${time} мин`;
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return minutes > 0 ? `${hours}ч ${minutes}мин` : `${hours}ч`;
  } else if (unit === 'hours') {
    if (time < 24) return `${time}ч`;
    const days = Math.floor(time / 24);
    const hours = time % 24;
    return hours > 0 ? `${days}д ${hours}ч` : `${days}д`;
  } else {
    return `${time}д`;
  }
});

professionTaskSchema.virtual('completionRate').get(function() {
  if (this.statistics.attempts === 0) return 0;
  return Math.round((this.statistics.completions / this.statistics.attempts) * 100);
});

// Индексы для оптимизации запросов
professionTaskSchema.index({ professionId: 1 });
professionTaskSchema.index({ category: 1 });
professionTaskSchema.index({ type: 1 });
professionTaskSchema.index({ difficulty: 1 });
professionTaskSchema.index({ level: 1 });
professionTaskSchema.index({ isActive: 1 });
professionTaskSchema.index({ isPublic: 1 });
professionTaskSchema.index({ isFeatured: 1 });
professionTaskSchema.index({ order: 1 });
professionTaskSchema.index({ 'statistics.averageRating': -1 });
professionTaskSchema.index({ 'tags': 1 });

// Статические методы
professionTaskSchema.statics.findByProfession = function(professionId) {
  return this.find({ professionId, isActive: true, isPublic: true });
};

professionTaskSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true, isPublic: true });
};

professionTaskSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty, isActive: true, isPublic: true });
};

professionTaskSchema.statics.findByLevel = function(level) {
  return this.find({ level, isActive: true, isPublic: true });
};

professionTaskSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true, isPublic: true });
};

professionTaskSchema.statics.findByTimeRange = function(minHours, maxHours) {
  return this.find({
    estimatedTime: { $gte: minHours, $lte: maxHours },
    timeUnit: 'hours',
    isActive: true,
    isPublic: true
  });
};

// Методы экземпляра
professionTaskSchema.methods.incrementAttempts = function() {
  this.statistics.attempts += 1;
  return this.save();
};

professionTaskSchema.methods.incrementCompletions = function() {
  this.statistics.completions += 1;
  return this.save();
};

professionTaskSchema.methods.updateAverageTime = function(actualTime) {
  const totalTime = this.statistics.averageTime * this.statistics.completions + actualTime;
  this.statistics.averageTime = totalTime / (this.statistics.completions + 1);
  return this.save();
};

professionTaskSchema.methods.updateRating = function(rating) {
  const totalRating = this.statistics.averageRating * this.statistics.completions + rating;
  this.statistics.averageRating = totalRating / (this.statistics.completions + 1);
  return this.save();
};

module.exports = mongoose.model('ProfessionTask', professionTaskSchema);
