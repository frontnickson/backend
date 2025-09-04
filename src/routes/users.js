const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/userController');

/**
 * @route   GET /api/v1/users/profile
 * @desc    Получение профиля текущего пользователя
 * @access  Private
 */
router.get('/profile', authenticate, userController.getUserProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Обновление профиля текущего пользователя
 * @access  Private
 */
router.put('/profile', authenticate, userController.updateUserProfile);

/**
 * @route   PUT /api/v1/users/settings
 * @desc    Обновление настроек пользователя
 * @access  Private
 */
router.put('/settings', authenticate, userController.updateUserSettings);

/**
 * @route   POST /api/v1/users/avatar
 * @desc    Загрузка аватара пользователя
 * @access  Private
 */
router.post('/avatar', authenticate, userController.uploadUserAvatar);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Получение статистики пользователя
 * @access  Private
 */
router.get('/stats', authenticate, userController.getUserStats);

module.exports = router;
