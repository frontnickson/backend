const mongoose = require('mongoose');

const professionSchema = new mongoose.Schema({
  // Основная информация
  name: {
    type: String,
    required: [true, 'Название профессии обязательно'],
    trim: true,
    unique: true,
    maxlength: [100, 'Название профессии не может превышать 100 символов']
  },
  slug: {
    type: String,
    required: [true, 'Slug профессии обязателен'],
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug может содержать только строчные буквы, цифры и дефисы']
  },
  description: {
    type: String,
    required: [true, 'Описание профессии обязательно'],
    trim: true,
    maxlength: [1000, 'Описание профессии не может превышать 1000 символов']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Краткое описание не может превышать 200 символов']
  },
  
  // Категория и уровень
  category: {
    type: String,
    required: [true, 'Категория профессии обязательна'],
    enum: ['design', 'development', 'marketing', 'management', 'sales', 'support', 'other'],
    default: 'other'
  },
  level: {
    type: String,
    required: [true, 'Уровень профессии обязателен'],
    enum: ['junior', 'middle', 'senior', 'lead', 'all'],
    default: 'all'
  },
  
  // Метаданные
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#6B7280',
    match: [/^#[0-9A-F]{6}$/i, 'Некорректный формат цвета']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  
  // Навыки и требования
  requiredSkills: [{
    type: String,
    trim: true,
    maxlength: [100, 'Название навыка не может превышать 100 символов']
  }],
  recommendedSkills: [{
    type: String,
    trim: true,
    maxlength: [100, 'Название навыка не может превышать 100 символов']
  }],
  tools: [{
    type: String,
    trim: true,
    maxlength: [100, 'Название инструмента не может превышать 100 символов']
  }],
  
  // Статистика
  statistics: {
    totalTasks: {
      type: Number,
      default: 0,
      min: 0
    },
    averageTaskTime: {
      type: Number,
      default: 0,
      min: 0
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    popularity: {
      type: Number,
      default: 0,
      min: 0
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
  
  // Связанные данные
  relatedProfessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profession'
  }],
  
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
professionSchema.virtual('displayName').get(function() {
  return this.name;
});

// Индексы для оптимизации запросов
professionSchema.index({ name: 1 });
professionSchema.index({ slug: 1 });
professionSchema.index({ category: 1 });
professionSchema.index({ level: 1 });
professionSchema.index({ isActive: 1 });
professionSchema.index({ isPublic: 1 });
professionSchema.index({ isFeatured: 1 });
professionSchema.index({ 'statistics.popularity': -1 });

// Статические методы
professionSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true, isPublic: true });
};

professionSchema.statics.findByLevel = function(level) {
  return this.find({ level, isActive: true, isPublic: true });
};

professionSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true, isPublic: true });
};

professionSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true, isPublic: true })
    .sort({ 'statistics.popularity': -1 })
    .limit(limit);
};

module.exports = mongoose.model('Profession', professionSchema);
