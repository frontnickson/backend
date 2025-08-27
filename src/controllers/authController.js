const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');
const User = require('../models/User');
const { getRedisClient } = require('../config/redis');

// Генерация JWT токена
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

// Генерация refresh токена
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

// Сохранение токена в Redis
const saveTokenToRedis = async (token, userId, expiresIn) => {
  try {
    const redisClient = getRedisClient();
    const key = `user_token:${userId}`;
    await redisClient.setEx(key, expiresIn, token);
  } catch (error) {
    console.error('❌ Ошибка сохранения токена в Redis:', error);
  }
};

// Отзыв токена
const revokeToken = async (token) => {
  try {
    const redisClient = getRedisClient();
    const key = `revoked_token:${token}`;
    // Сохраняем отозванный токен на 24 часа
    await redisClient.setEx(key, 86400, 'revoked');
  } catch (error) {
    console.error('❌ Ошибка отзыва токена:', error);
  }
};

/**
 * Регистрация нового пользователя
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      first_name,
      last_name,
      middle_name,
      gender,
      birth_date,
      full_name,
      bio,
      avatar_url,
      phone_number,
      country,
      city,
      timezone,
      theme,
      language,
      email_notifications,
      push_notifications,
      desktop_notifications,
      profile_visibility,
      show_online_status,
      allow_friend_requests,
      interests,
      skills,
      education,
      occupation,
      company,
      website,
      social_links
    } = req.body;

    // Проверяем, существует ли пользователь с таким email или username
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: existingUser.email === email.toLowerCase() 
            ? 'Пользователь с таким email уже существует' 
            : 'Пользователь с таким именем уже существует',
          type: 'USER_EXISTS',
          statusCode: 400
        }
      });
    }

    // Создаем нового пользователя
    const userData = {
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      firstName: first_name || username,
      lastName: last_name || '',
      middleName: middle_name,
      gender,
      birthDate: birth_date,
      fullName: full_name,
      bio,
      avatarUrl: avatar_url,
      phoneNumber: phone_number,
      country,
      city,
      timezone,
      theme: theme || 'light',
      language: language || 'ru',
      emailNotifications: email_notifications !== undefined ? email_notifications : true,
      pushNotifications: push_notifications !== undefined ? push_notifications : true,
      desktopNotifications: desktop_notifications !== undefined ? desktop_notifications : true,
      profileVisibility: profile_visibility || 'public',
      showOnlineStatus: show_online_status !== undefined ? show_online_status : true,
      allowFriendRequests: allow_friend_requests !== undefined ? allow_friend_requests : true,
      interests: interests || [],
      skills: skills || [],
      education,
      occupation,
      company,
      website,
      socialLinks: social_links || {}
    };

    const user = new User(userData);
    await user.save();

    // Генерируем токены
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Сохраняем токен в Redis
    const tokenExpiresIn = parseInt(config.jwt.expiresIn.replace('d', '')) * 24 * 60 * 60; // в секундах
    await saveTokenToRedis(accessToken, user._id, tokenExpiresIn);

    // Обновляем счетчик входов
    user.loginCount += 1;
    user.lastLogin = new Date();
    user.isOnline = true;
    await user.save();

    // Формируем ответ
    const userResponse = user.toPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: {
        user: userResponse,
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: tokenExpiresIn,
        refresh_token: refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Ошибка валидации данных',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          details: Object.values(error.errors).map(err => err.message)
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при регистрации пользователя',
        type: 'REGISTRATION_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Вход в систему
 * POST /api/v1/auth/login-email
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email и пароль обязательны',
          type: 'MISSING_CREDENTIALS',
          statusCode: 400
        }
      });
    }

    // Ищем пользователя по email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Неверный email или пароль',
          type: 'INVALID_CREDENTIALS',
          statusCode: 401
        }
      });
    }

    // Проверяем пароль
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Неверный email или пароль',
          type: 'INVALID_CREDENTIALS',
          statusCode: 401
        }
      });
    }

    // Проверяем, активен ли аккаунт
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Аккаунт заблокирован',
          type: 'ACCOUNT_BLOCKED',
          statusCode: 401
        }
      });
    }

    // Генерируем токены
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Сохраняем токен в Redis
    const tokenExpiresIn = parseInt(config.jwt.expiresIn.replace('d', '')) * 24 * 60 * 60; // в секундах
    await saveTokenToRedis(accessToken, user._id, tokenExpiresIn);

    // Обновляем счетчик входов и статус
    user.loginCount += 1;
    user.lastLogin = new Date();
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Формируем ответ
    const userResponse = user.toPublicProfile();

    res.status(200).json({
      success: true,
      message: 'Вход выполнен успешно',
      data: {
        user: userResponse,
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: tokenExpiresIn,
        refresh_token: refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при входе в систему',
        type: 'LOGIN_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Выход из системы
 * POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Отзываем токен
      await revokeToken(token);
      
      // Удаляем токен из Redis
      try {
        const redisClient = getRedisClient();
        const key = `user_token:${req.user.id}`;
        await redisClient.del(key);
      } catch (error) {
        console.error('❌ Ошибка удаления токена из Redis:', error);
      }
    }

    // Обновляем статус пользователя
    if (req.user) {
      req.user.isOnline = false;
      req.user.lastSeen = new Date();
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Выход выполнен успешно',
      data: null
    });

  } catch (error) {
    console.error('❌ Ошибка выхода:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при выходе из системы',
        type: 'LOGOUT_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Обновление токена
 * POST /api/v1/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Refresh токен обязателен',
          type: 'MISSING_REFRESH_TOKEN',
          statusCode: 400
        }
      });
    }

    // Проверяем refresh токен
    const decoded = jwt.verify(refresh_token, config.jwt.refreshSecret);
    
    // Получаем пользователя
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Пользователь не найден или неактивен',
          type: 'USER_NOT_FOUND',
          statusCode: 401
        }
      });
    }

    // Генерируем новые токены
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Сохраняем новый токен в Redis
    const tokenExpiresIn = parseInt(config.jwt.expiresIn.replace('d', '')) * 24 * 60 * 60;
    await saveTokenToRedis(newAccessToken, user._id, tokenExpiresIn);

    // Отзываем старый refresh токен
    await revokeToken(refresh_token);

    res.status(200).json({
      success: true,
      message: 'Токен обновлен успешно',
      data: {
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: tokenExpiresIn,
        refresh_token: newRefreshToken
      }
    });

  } catch (error) {
    console.error('❌ Ошибка обновления токена:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Недействительный refresh токен',
          type: 'INVALID_REFRESH_TOKEN',
          statusCode: 401
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh токен истек',
          type: 'REFRESH_TOKEN_EXPIRED',
          statusCode: 401
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при обновлении токена',
        type: 'REFRESH_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Получение текущего пользователя
 * GET /api/v1/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('friends', 'id username firstName lastName avatarUrl')
      .populate('teams', 'id name description avatar')
      .populate('notifications', 'id type message isRead createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Пользователь не найден',
          type: 'USER_NOT_FOUND',
          statusCode: 404
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Данные пользователя получены успешно',
      data: user
    });

  } catch (error) {
    console.error('❌ Ошибка получения пользователя:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при получении данных пользователя',
        type: 'GET_USER_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Изменение пароля
 * POST /api/v1/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Текущий и новый пароль обязательны',
          type: 'MISSING_PASSWORDS',
          statusCode: 400
        }
      });
    }

    // Получаем пользователя с паролем
    const user = await User.findById(req.user.id).select('+password');

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Неверный текущий пароль',
          type: 'INVALID_CURRENT_PASSWORD',
          statusCode: 400
        }
      });
    }

    // Обновляем пароль
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Пароль изменен успешно',
      data: null
    });

  } catch (error) {
    console.error('❌ Ошибка изменения пароля:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Ошибка валидации нового пароля',
          type: 'PASSWORD_VALIDATION_ERROR',
          statusCode: 400,
          details: Object.values(error.errors).map(err => err.message)
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при изменении пароля',
        type: 'CHANGE_PASSWORD_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Запрос на сброс пароля
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email обязателен',
          type: 'MISSING_EMAIL',
          statusCode: 400
        }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Для безопасности не раскрываем, существует ли пользователь
      return res.status(200).json({
        success: true,
        message: 'Если пользователь с таким email существует, инструкции по сбросу пароля отправлены на email',
        data: null
      });
    }

    // Генерируем токен для сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 час

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // TODO: Отправить email с инструкциями по сбросу пароля
    console.log(`🔑 Токен для сброса пароля: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Инструкции по сбросу пароля отправлены на email',
      data: null
    });

  } catch (error) {
    console.error('❌ Ошибка запроса сброса пароля:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при запросе сброса пароля',
        type: 'FORGOT_PASSWORD_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Сброс пароля
 * POST /api/v1/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Токен и новый пароль обязательны',
          type: 'MISSING_TOKEN_OR_PASSWORD',
          statusCode: 400
        }
      });
    }

    // Ищем пользователя по токену
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Токен недействителен или истек',
          type: 'INVALID_OR_EXPIRED_TOKEN',
          statusCode: 400
        }
      });
    }

    // Обновляем пароль
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Пароль успешно сброшен',
      data: null
    });

  } catch (error) {
    console.error('❌ Ошибка сброса пароля:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Ошибка валидации нового пароля',
          type: 'PASSWORD_VALIDATION_ERROR',
          statusCode: 400,
          details: Object.values(error.errors).map(err => err.message)
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при сбросе пароля',
        type: 'RESET_PASSWORD_ERROR',
        statusCode: 500
      }
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword
};
