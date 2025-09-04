const User = require('../models/User');

/**
 * Получение профиля пользователя
 * GET /api/v1/users/profile
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
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
      message: 'Профиль пользователя получен успешно',
      data: user
    });
  } catch (error) {
    console.error('❌ Ошибка получения профиля:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при получении профиля пользователя',
        type: 'GET_PROFILE_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Обновление профиля пользователя
 * PUT /api/v1/users/profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Разрешенные поля для обновления
    const allowedFields = [
      'firstName', 'lastName', 'middleName', 'bio', 
      'phoneNumber', 'country', 'city', 'occupation', 
      'profession', 'company', 'website', 'education', 
      'interests', 'skills', 'avatarUrl', 'gender', 'birthDate', 'timezone'
    ];

    // Фильтруем только разрешенные поля
    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Обновляем пользователя
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredData },
      { new: true, runValidators: true }
    ).select('-password');

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
      message: 'Профиль обновлен успешно',
      data: user
    });
  } catch (error) {
    console.error('❌ Ошибка обновления профиля:', error);
    
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
        message: 'Ошибка при обновлении профиля',
        type: 'UPDATE_PROFILE_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Обновление настроек пользователя
 * PUT /api/v1/users/settings
 */
const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settingsData = req.body;

    // Разрешенные поля для настроек
    const allowedSettings = [
      'theme', 'language', 'emailNotifications', 
      'pushNotifications', 'desktopNotifications',
      'profileVisibility', 'showOnlineStatus', 'allowFriendRequests'
    ];

    // Фильтруем только разрешенные поля
    const filteredSettings = {};
    allowedSettings.forEach(field => {
      if (settingsData[field] !== undefined) {
        filteredSettings[field] = settingsData[field];
      }
    });

    // Обновляем настройки
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredSettings },
      { new: true, runValidators: true }
    ).select('-password');

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
      message: 'Настройки обновлены успешно',
      data: user
    });
  } catch (error) {
    console.error('❌ Ошибка обновления настроек:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Ошибка валидации настроек',
          type: 'VALIDATION_ERROR',
          statusCode: 400,
          details: Object.values(error.errors).map(err => err.message)
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при обновлении настроек',
        type: 'UPDATE_SETTINGS_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Загрузка аватара пользователя
 * POST /api/v1/users/avatar
 */
const uploadUserAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // В реальном приложении здесь была бы загрузка файла
    // Пока что просто возвращаем URL
    const avatarUrl = req.body.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

    // Обновляем аватар пользователя
    const user = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true, runValidators: true }
    ).select('-password');

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
      message: 'Аватар обновлен успешно',
      data: {
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('❌ Ошибка загрузки аватара:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при загрузке аватара',
        type: 'UPLOAD_AVATAR_ERROR',
        statusCode: 500
      }
    });
  }
};

/**
 * Получение статистики пользователя
 * GET /api/v1/users/stats
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // В реальном приложении здесь были бы запросы к базе данных
    // для получения статистики по задачам, доскам и т.д.
    const stats = {
      totalTasks: 0,
      completedTasks: 0,
      totalBoards: 0,
      totalTeams: 0,
      lastActivity: new Date().toISOString(),
      profileCompletion: 0 // Процент заполнения профиля
    };

    // Вычисляем процент заполнения профиля
    const user = await User.findById(userId).select('-password');
    if (user) {
      const fields = [
        'firstName', 'lastName', 'bio', 'avatarUrl', 'phoneNumber',
        'country', 'city', 'occupation', 'profession', 'company',
        'education', 'interests', 'skills'
      ];
      
      const filledFields = fields.filter(field => {
        const value = user[field];
        return value && (typeof value !== 'string' || value.trim() !== '') && 
               (typeof value !== 'object' || (Array.isArray(value) && value.length > 0));
      }).length;
      
      stats.profileCompletion = Math.round((filledFields / fields.length) * 100);
    }

    res.status(200).json({
      success: true,
      message: 'Статистика получена успешно',
      data: stats
    });
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Ошибка при получении статистики',
        type: 'GET_STATS_ERROR',
        statusCode: 500
      }
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  uploadUserAvatar,
  getUserStats
};
