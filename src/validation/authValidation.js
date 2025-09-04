const Joi = require('joi');

// Схема валидации регистрации
const registrationSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен'
    }),
  
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Имя пользователя может содержать только буквы и цифры',
      'string.min': 'Имя пользователя должно содержать минимум 3 символа',
      'string.max': 'Имя пользователя не может превышать 30 символов',
      'any.required': 'Имя пользователя обязательно'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Пароль должен содержать минимум 6 символов',
      'any.required': 'Пароль обязателен'
    }),
  
  first_name: Joi.string()
    .max(50)
    .messages({
      'string.max': 'Имя не может превышать 50 символов'
    }),
  
  last_name: Joi.string()
    .max(50)
    .messages({
      'string.max': 'Фамилия не может превышать 50 символов'
    }),
  
  middle_name: Joi.string()
    .max(50)
    .messages({
      'string.max': 'Отчество не может превышать 50 символов'
    }),
  
  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer_not_to_say')
    .messages({
      'any.only': 'Пол должен быть одним из: male, female, other, prefer_not_to_say'
    }),
  
  birth_date: Joi.date()
    .max('now')
    .messages({
      'date.max': 'Дата рождения не может быть в будущем'
    }),
  
  full_name: Joi.string()
    .max(100)
    .messages({
      'string.max': 'Полное имя не может превышать 100 символов'
    }),
  
  bio: Joi.string()
    .max(500)
    .messages({
      'string.max': 'Биография не может превышать 500 символов'
    }),
  
  avatar_url: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Некорректный формат URL аватара'
    }),
  
  phone_number: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .messages({
      'string.pattern.base': 'Некорректный формат номера телефона'
    }),
  
  country: Joi.string()
    .max(100)
    .messages({
      'string.max': 'Название страны не может превышать 100 символов'
    }),
  
  city: Joi.string()
    .max(100)
    .messages({
      'string.max': 'Название города не может превышать 100 символов'
    }),
  
  timezone: Joi.string()
    .max(50)
    .messages({
      'string.max': 'Часовой пояс не может превышать 50 символов'
    }),
  
  theme: Joi.string()
    .valid('light', 'dark', 'auto')
    .messages({
      'any.only': 'Тема должна быть одной из: light, dark, auto'
    }),
  
  language: Joi.string()
    .valid('en', 'ru')
    .messages({
      'any.only': 'Язык должен быть одним из: en, ru'
    }),
  
  email_notifications: Joi.boolean(),
  push_notifications: Joi.boolean(),
  desktop_notifications: Joi.boolean(),
  
  profile_visibility: Joi.string()
    .valid('public', 'friends', 'private')
    .messages({
      'any.only': 'Видимость профиля должна быть одной из: public, friends, private'
    }),
  
  show_online_status: Joi.boolean(),
  allow_friend_requests: Joi.boolean(),
  
  interests: Joi.array()
    .items(Joi.string().max(50))
    .max(20)
    .messages({
      'array.max': 'Максимум 20 интересов',
      'string.max': 'Интерес не может превышать 50 символов'
    }),
  
  skills: Joi.array()
    .items(Joi.string().max(50))
    .max(20)
    .messages({
      'array.max': 'Максимум 20 навыков',
      'string.max': 'Навык не может превышать 50 символов'
    }),
  
  education: Joi.string()
    .max(200)
    .messages({
      'string.max': 'Образование не может превышать 200 символов'
    }),
  
  occupation: Joi.string()
    .max(100)
    .messages({
      'string.max': 'Профессия не может превышать 100 символов'
    }),
  
  company: Joi.string()
    .max(100)
    .messages({
      'string.max': 'Название компании не может превышать 100 символов'
    }),
  
  website: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Некорректный формат URL сайта'
    }),
  
  social_links: Joi.object({
    twitter: Joi.string().uri(),
    linkedin: Joi.string().uri(),
    github: Joi.string().uri(),
    instagram: Joi.string().uri()
  }).messages({
    'object.base': 'Социальные ссылки должны быть объектом'
  }),
  
  // Согласие с офертой
  offer_accepted: Joi.boolean()
    .required()
    .valid(true)
    .messages({
      'any.required': 'Согласие с офертой обязательно',
      'any.only': 'Необходимо согласиться с условиями использования'
    }),
  
  offer_accepted_at: Joi.date()
    .required()
    .messages({
      'any.required': 'Время согласия с офертой обязательно',
      'date.base': 'Некорректная дата согласия с офертой'
    })
});

// Схема валидации входа
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Пароль обязателен'
    })
});

// Схема валидации изменения пароля
const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Текущий пароль обязателен'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Новый пароль должен содержать минимум 8 символов',
      'string.pattern.base': 'Новый пароль должен содержать минимум одну строчную букву, одну заглавную букву, одну цифру и один специальный символ',
      'any.required': 'Новый пароль обязателен'
    })
});

// Схема валидации сброса пароля
const passwordResetSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Токен обязателен'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Новый пароль должен содержать минимум 6 символов',
      'any.required': 'Новый пароль обязателен'
    })
});

// Схема валидации запроса сброса пароля
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен'
    })
});

// Middleware для валидации регистрации
const validateRegistration = (req, res, next) => {
  console.log('🔍 validateRegistration: Получены данные:', req.body);
  
  const { error } = registrationSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    console.log('🔍 validateRegistration: Ошибка валидации:', error.details);
    
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    console.log('🔍 validateRegistration: Детали ошибок:', errorDetails);
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Ошибка валидации данных',
        type: 'VALIDATION_ERROR',
        statusCode: 400,
        details: errorDetails
      }
    });
  }
  
  console.log('🔍 validateRegistration: Валидация прошла успешно');
  next();
};

// Middleware для валидации входа
const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Ошибка валидации данных',
        type: 'VALIDATION_ERROR',
        statusCode: 400,
        details: errorDetails
      }
    });
  }
  
  next();
};

// Middleware для валидации изменения пароля
const validatePasswordChange = (req, res, next) => {
  const { error } = passwordChangeSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Ошибка валидации данных',
        type: 'VALIDATION_ERROR',
        statusCode: 400,
        details: errorDetails
      }
    });
  }
  
  next();
};

// Middleware для валидации сброса пароля
const validatePasswordReset = (req, res, next) => {
  const { error } = passwordResetSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Ошибка валидации данных',
        type: 'VALIDATION_ERROR',
        statusCode: 400,
        details: errorDetails
      }
    });
  }
  
  next();
};

// Middleware для валидации запроса сброса пароля
const validateForgotPassword = (req, res, next) => {
  const { error } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Ошибка валидации данных',
        type: 'VALIDATION_ERROR',
        statusCode: 400,
        details: errorDetails
      }
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validatePasswordReset,
  validateForgotPassword
};
