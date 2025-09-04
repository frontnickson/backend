const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Логируем ошибку
  console.error('❌ Ошибка:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose ошибки валидации
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message: `Ошибка валидации: ${message}`,
      statusCode: 400,
      type: 'VALIDATION_ERROR'
    };
  }

  // Mongoose ошибки дублирования ключа
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = {
      message: `Поле '${field}' со значением '${value}' уже существует`,
      statusCode: 400,
      type: 'DUPLICATE_KEY_ERROR'
    };
  }

  // Mongoose ошибки приведения типов
  if (err.name === 'CastError') {
    error = {
      message: `Некорректный формат данных для поля '${err.path}'`,
      statusCode: 400,
      type: 'CAST_ERROR'
    };
  }

  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Недействительный токен',
      statusCode: 401,
      type: 'JWT_ERROR'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Токен истек',
      statusCode: 401,
      type: 'JWT_EXPIRED'
    };
  }

  // Multer ошибки загрузки файлов
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'Файл слишком большой',
      statusCode: 400,
      type: 'FILE_SIZE_ERROR'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Слишком много файлов',
      statusCode: 400,
      type: 'FILE_COUNT_ERROR'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Неподдерживаемый тип файла',
      statusCode: 400,
      type: 'FILE_TYPE_ERROR'
    };
  }

  // Rate limiting ошибки
  if (err.status === 429) {
    error = {
      message: 'Слишком много запросов. Попробуйте позже.',
      statusCode: 429,
      type: 'RATE_LIMIT_ERROR'
    };
  }

  // Ошибки авторизации
  if (err.status === 403) {
    error = {
      message: 'Доступ запрещен',
      statusCode: 403,
      type: 'FORBIDDEN'
    };
  }

  // Ошибки аутентификации
  if (err.status === 401) {
    error = {
      message: 'Не авторизован',
      statusCode: 401,
      type: 'UNAUTHORIZED'
    };
  }

  // Ошибки "не найдено"
  if (err.status === 404) {
    error = {
      message: 'Ресурс не найден',
      statusCode: 404,
      type: 'NOT_FOUND'
    };
  }

  // Формируем ответ об ошибке
  const errorResponse = {
    success: false,
    error: {
      message: error.message || 'Внутренняя ошибка сервера',
      type: error.type || 'INTERNAL_ERROR',
      statusCode: error.statusCode || 500,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    }
  };

  // В development режиме добавляем stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Отправляем ответ
  res.status(error.statusCode || 500).json(errorResponse);
};

module.exports = errorHandler;
