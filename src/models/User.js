const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

const userSchema = new mongoose.Schema({
  // Основные данные
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Некорректный формат email']
  },
  username: {
    type: String,
    required: [true, 'Имя пользователя обязательно'],
    unique: true,
    trim: true,
    minlength: [3, 'Имя пользователя должно содержать минимум 3 символа'],
    maxlength: [30, 'Имя пользователя не может превышать 30 символов'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания']
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: [8, 'Пароль должен содержать минимум 8 символов'],
    select: false // Не возвращаем пароль по умолчанию
  },
  
  // Личные данные
  firstName: {
    type: String,
    required: [true, 'Имя обязательно'],
    trim: true,
    maxlength: [50, 'Имя не может превышать 50 символов']
  },
  lastName: {
    type: String,
    required: [true, 'Фамилия обязательна'],
    trim: true,
    maxlength: [50, 'Фамилия не может превышать 50 символов']
  },
  middleName: {
    type: String,
    trim: true,
    maxlength: [50, 'Отчество не может превышать 50 символов']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say'
  },
  birthDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (value) {
          const age = Math.floor((new Date() - value) / (365.25 * 24 * 60 * 60 * 1000));
          return age >= 13 && age <= 120;
        }
        return true;
      },
      message: 'Возраст должен быть от 13 до 120 лет'
    }
  },
  
  // Профиль
  fullName: {
    type: String,
    trim: true,
    maxlength: [100, 'Полное имя не может превышать 100 символов']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Биография не может превышать 500 символов']
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Некорректный формат номера телефона']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [100, 'Название страны не может превышать 100 символов']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'Название города не может превышать 100 символов']
  },
  timezone: {
    type: String,
    trim: true,
    default: 'UTC'
  },
  
  // Настройки
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  language: {
    type: String,
    enum: ['en', 'ru'],
    default: 'ru'
  },
  
  // Статус
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isSuperuser: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Роль и права
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator', 'superuser'],
    default: 'user'
  },
  
  // Социальные связи
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  
  // Уведомления
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  unreadNotificationsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Настройки уведомлений
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  desktopNotifications: {
    type: Boolean,
    default: true
  },
  
  // Приватность
  profileVisibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  showOnlineStatus: {
    type: Boolean,
    default: true
  },
  allowFriendRequests: {
    type: Boolean,
    default: true
  },
  
  // Дополнительные поля
  interests: [{
    type: String,
    trim: true,
    maxlength: [50, 'Интерес не может превышать 50 символов']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Навык не может превышать 50 символов']
  }],
  education: {
    type: String,
    trim: true,
    maxlength: [200, 'Образование не может превышать 200 символов']
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, 'Профессия не может превышать 100 символов']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Название компании не может превышать 100 символов']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Некорректный формат URL']
  },
  
  // Социальные сети
  socialLinks: {
    twitter: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    }
  },
  
  // Верификация
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Статистика
  loginCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // createdAt, updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальные поля
userSchema.virtual('age').get(function() {
  if (this.birthDate) {
    return Math.floor((new Date() - this.birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  }
  return null;
});

userSchema.virtual('fullDisplayName').get(function() {
  if (this.middleName) {
    return `${this.lastName} ${this.firstName} ${this.middleName}`;
  }
  return `${this.lastName} ${this.firstName}`;
});

// Индексы для оптимизации запросов
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ lastSeen: 1 });
userSchema.index({ 'friends': 1 });
userSchema.index({ 'teams': 1 });

// Middleware для хеширования пароля
userSchema.pre('save', async function(next) {
  // Хешируем пароль только если он изменился
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Методы экземпляра
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.friendRequests;
  delete user.notifications;
  delete user.unreadNotificationsCount;
  delete user.emailNotifications;
  delete user.pushNotifications;
  delete user.desktopNotifications;
  delete user.profileVisibility;
  delete user.showOnlineStatus;
  delete user.allowFriendRequests;
  return user;
};

userSchema.methods.toFriendProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.email;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.friendRequests;
  delete user.notifications;
  delete user.unreadNotificationsCount;
  delete user.emailNotifications;
  delete user.pushNotifications;
  delete user.desktopNotifications;
  delete user.profileVisibility;
  delete user.showOnlineStatus;
  delete user.allowFriendRequests;
  delete user.phoneNumber;
  delete user.country;
  delete user.city;
  delete user.timezone;
  delete user.interests;
  delete user.skills;
  delete user.education;
  delete user.occupation;
  delete user.company;
  delete user.website;
  delete user.socialLinks;
  return user;
};

// Статические методы
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findOnlineUsers = function() {
  return this.find({ isOnline: true });
};

module.exports = mongoose.model('User', userSchema);
