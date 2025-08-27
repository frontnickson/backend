const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { getRedisClient } = require('../config/redis');

/**
 * Middleware для проверки JWT токена
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Проверяем токен в заголовке Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Проверяем токен в cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
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
      // Проверяем токен
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Проверяем, не отозван ли токен в Redis
      const redisClient = getRedisClient();
      const isTokenRevoked = await redisClient.get(`revoked_token:${token}`);
      
      if (isTokenRevoked) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Токен отозван',
            type: 'TOKEN_REVOKED',
            statusCode: 401
          }
        });
      }

      // Получаем пользователя из базы данных
      const user = await User.findById(decoded.userId)
        .select('-password')
        .populate('friends', 'id username firstName lastName avatarUrl')
        .populate('teams', 'id name description avatar')
        .populate('notifications', 'id type message isRead createdAt');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Пользователь не найден',
            type: 'USER_NOT_FOUND',
            statusCode: 401
          }
        });
      }

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

      // Добавляем пользователя в request
      req.user = user;
      
      // Обновляем время последнего посещения
      user.lastSeen = new Date();
      user.isOnline = true;
      await user.save();

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Токен истек',
            type: 'TOKEN_EXPIRED',
            statusCode: 401
          }
        });
      }
      
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
    console.error('❌ Ошибка аутентификации:', error);
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
