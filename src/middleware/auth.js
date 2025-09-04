const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { getRedisClient } = require('../config/redis');

console.log('🔐 Middleware auth.js загружен');
console.log('🔐 Middleware auth.js: jwt:', typeof jwt);
console.log('🔐 Middleware auth.js: config:', typeof config);
console.log('🔐 Middleware auth.js: User:', typeof User);
console.log('🔐 Middleware auth.js: getRedisClient:', typeof getRedisClient);

/**
 * Middleware для проверки JWT токена
 */
const authenticate = async (req, res, next) => {
  console.log('🔐 Middleware authenticate: ========== ФУНКЦИЯ ВЫЗВАНА! ==========');
  console.log('🔐 Middleware authenticate: время вызова:', new Date().toISOString());
  console.log('🔐 Middleware authenticate: метод запроса:', req.method);
  console.log('🔐 Middleware authenticate: URL:', req.url);
  
  try {
    console.log('🔐 Middleware authenticate: ========== НАЧАЛО ПРОВЕРКИ ==========');
    console.log('🔐 Middleware authenticate: заголовки:', JSON.stringify(req.headers, null, 2));
    console.log('🔐 Middleware authenticate: cookies:', JSON.stringify(req.cookies, null, 2));
    let token;

    // Проверяем токен в заголовке Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 Middleware authenticate: токен найден в заголовке');
    }
    // Проверяем токен в cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('🔐 Middleware authenticate: токен найден в cookies');
    }

    if (!token) {
      console.log('🔐 Middleware authenticate: токен не найден');
      return res.status(401).json({
        success: false,
        error: {
          message: 'Токен доступа не предоставлен',
          type: 'NO_TOKEN',
          statusCode: 401
        }
      });
    }

    try {
      console.log('🔐 Middleware authenticate: проверяем JWT токен');
      console.log('🔐 Middleware authenticate: токен для проверки:', token);
      console.log('🔐 Middleware authenticate: JWT секрет:', config.jwt.secret);
      console.log('🔐 Middleware authenticate: config.jwt:', JSON.stringify(config.jwt, null, 2));
      
      // Проверяем токен
      const decoded = jwt.verify(token, config.jwt.secret);
      console.log('🔐 Middleware authenticate: JWT токен валиден:', decoded);
      
      // Проверяем, не отозван ли токен в Redis
      console.log('🔐 Middleware authenticate: ========== НАЧАЛО ПРОВЕРКИ REDIS ==========');
      console.log('🔐 Middleware authenticate: токен для проверки Redis:', token.substring(0, 50) + '...');
      console.log('🔐 Middleware authenticate: длина токена:', token.length);
      
      try {
        console.log('🔐 Middleware authenticate: пытаемся получить Redis клиент...');
        const redisClient = getRedisClient();
        console.log('🔐 Middleware authenticate: Redis клиент получен:', typeof redisClient);
        console.log('🔐 Middleware authenticate: Redis клиент:', redisClient ? 'существует' : 'не существует');
        
        if (!redisClient) {
          console.log('🔐 Middleware authenticate: Redis клиент не получен, пропускаем проверку');
        } else {
          console.log('🔐 Middleware authenticate: пытаемся проверить токен в Redis...');
          const redisKey = `revoked_token:${token}`;
          console.log('🔐 Middleware authenticate: Redis ключ:', redisKey.substring(0, 50) + '...');
          
          const isTokenRevoked = await redisClient.get(redisKey);
          console.log('🔐 Middleware authenticate: результат Redis get():', isTokenRevoked);
          console.log('🔐 Middleware authenticate: тип результата Redis:', typeof isTokenRevoked);
          
          if (isTokenRevoked) {
            console.log('🔐 Middleware authenticate: 🚨 ТОКЕН ОТОЗВАН В REDIS!');
            return res.status(401).json({
              success: false,
              error: {
                message: 'Токен отозван',
                type: 'TOKEN_REVOKED',
                statusCode: 401
              }
            });
          }
          console.log('🔐 Middleware authenticate: ✅ токен НЕ отозван в Redis, продолжаем');
        }
      } catch (redisError) {
        console.error('❌ Ошибка Redis при проверке токена:', redisError);
        console.error('❌ Stack trace Redis ошибки:', redisError.stack);
        console.log('🔐 Middleware authenticate: продолжаем без проверки Redis из-за ошибки');
      }
      
      console.log('🔐 Middleware authenticate: ========== КОНЕЦ ПРОВЕРКИ REDIS ==========');

      // Получаем пользователя из базы данных
       console.log('🔐 Middleware authenticate: ищем пользователя в БД, ID:', decoded.userId);
      console.log('🔐 Middleware authenticate: mongoose connection state:', require('mongoose').connection.readyState);
      console.log('🔐 Middleware authenticate: User model:', typeof User);
      console.log('🔐 Middleware authenticate: User.findById:', typeof User.findById);
      
      const user = await User.findById(decoded.userId)
        .select('-password');
        // Временно отключаем populate для избежания ошибок с несуществующими моделями
        // .populate('friends', 'id username firstName lastName avatarUrl')
        // .populate('teams', 'id name description avatar')
        // .populate('notifications', 'id type message isRead createdAt');

      if (!user) {
        console.log('🔐 Middleware authenticate: пользователь не найден в БД');
        return res.status(401).json({
          success: false,
          error: {
            message: 'Пользователь не найден',
            type: 'USER_NOT_FOUND',
            statusCode: 401
          }
        });
      }
      
      console.log('🔐 Middleware authenticate: пользователь найден в БД:', user.username);

      console.log('🔐 Middleware authenticate: проверяем активность пользователя');
      if (!user.isActive) {
        console.log('🔐 Middleware authenticate: пользователь заблокирован');
        return res.status(401).json({
          success: false,
          error: {
            message: 'Аккаунт заблокирован',
            type: 'ACCOUNT_BLOCKED',
            statusCode: 401
          }
        });
      }

      console.log('🔐 Middleware authenticate: пользователь активен, добавляем в request');
      // Добавляем пользователя в request
      req.user = user;
      
      console.log('🔐 Middleware authenticate: обновляем время последнего посещения');
      // Обновляем время последнего посещения
      user.lastSeen = new Date();
      user.isOnline = true;
      await user.save();
      console.log('🔐 Middleware authenticate: время обновлено, вызываем next()');
      console.log('🔐 Middleware authenticate: ========== УСПЕШНО ЗАВЕРШЕНО ==========');

      next();
    } catch (jwtError) {
      console.log('🔐 Middleware authenticate: ========== JWT ОШИБКА ==========');
      console.log('🔐 Middleware authenticate: JWT ошибка:', jwtError.name, jwtError.message);
      console.log('🔐 Middleware authenticate: JWT stack:', jwtError.stack);
      
      if (jwtError.name === 'TokenExpiredError') {
        console.log('🔐 Middleware authenticate: токен истек');
        return res.status(401).json({
          success: false,
          error: {
            message: 'Токен истек',
            type: 'TOKEN_EXPIRED',
            statusCode: 401
          }
        });
      }
      
      console.log('🔐 Middleware authenticate: недействительный токен');
      return res.status(401).json({
        success: false,
        error: {
          message: 'Недействительный токен',
          type: 'INVALID_TOKEN',
          statusCode: 401
        }
      });
    }
  } catch (error) {
    console.log('🔐 Middleware authenticate: ========== ОБЩАЯ ОШИБКА ==========');
    console.error('❌ Ошибка аутентификации:', error);
    console.error('❌ Ошибка аутентификации stack:', error.stack);
    console.error('❌ Ошибка аутентификации name:', error.name);
    console.error('❌ Ошибка аутентификации message:', error.message);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка аутентификации',
        type: 'AUTH_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Middleware для проверки роли пользователя
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Пользователь не аутентифицирован',
          type: 'NOT_AUTHENTICATED',
          statusCode: 401
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Недостаточно прав для выполнения операции',
          type: 'INSUFFICIENT_PERMISSIONS',
          statusCode: 403
        }
      });
    }

    next();
  };
};

/**
 * Middleware для проверки владельца ресурса
 */
const checkOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Ресурс не найден',
            type: 'RESOURCE_NOT_FOUND',
            statusCode: 404
          }
        });
      }

      // Проверяем, является ли пользователь владельцем или имеет права администратора
      if (resource.ownerId?.toString() !== req.user.id.toString() && 
          req.user.role !== 'admin' && 
          req.user.role !== 'superuser') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Доступ запрещен. Вы не являетесь владельцем ресурса',
            type: 'ACCESS_DENIED',
            statusCode: 403
          }
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('❌ Ошибка проверки владельца:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Ошибка проверки прав доступа',
          type: 'OWNERSHIP_CHECK_ERROR',
          statusCode: 500
        }
      });
    }
  };
};

/**
 * Middleware для проверки участия в команде
 */
const checkTeamMembership = (teamIdField = 'teamId') => {
  return async (req, res, next) => {
    try {
      const teamId = req.params[teamIdField] || req.body[teamIdField];
      
      if (!teamId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'ID команды не указан',
            type: 'TEAM_ID_MISSING',
            statusCode: 400
          }
        });
      }

      // Проверяем, является ли пользователь участником команды
      const isMember = req.user.teams.some(team => 
        team.id.toString() === teamId.toString()
      );

      if (!isMember && req.user.role !== 'admin' && req.user.role !== 'superuser') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Вы не являетесь участником команды',
            type: 'NOT_TEAM_MEMBER',
            statusCode: 403
          }
        });
      }

      next();
    } catch (error) {
      console.error('❌ Ошибка проверки участия в команде:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Ошибка проверки участия в команде',
          type: 'TEAM_MEMBERSHIP_CHECK_ERROR',
          statusCode: 500
        }
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  checkOwnership,
  checkTeamMembership
};
