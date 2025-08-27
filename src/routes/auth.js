const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegistration, validateLogin, validatePasswordChange } = require('../validation/authValidation');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Регистрация нового пользователя
 * @access  Public
 */
router.post('/register', validateRegistration, authController.register);

/**
 * @route   POST /api/v1/auth/login-email
 * @desc    Вход в систему по email и паролю
 * @access  Public
 */
router.post('/login-email', validateLogin, authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Выход из системы
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Обновление токена доступа
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Получение данных текущего пользователя
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Изменение пароля
 * @access  Private
 */
router.post('/change-password', authenticate, validatePasswordChange, authController.changePassword);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Запрос на сброс пароля
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Сброс пароля по токену
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;
