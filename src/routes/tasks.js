const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Task = require('../models/Task');
const Board = require('../models/Board');

console.log('📝 tasks.js: Роуты задач загружены');

// GET /api/v1/tasks/ - получение всех задач пользователя
router.get('/', async (req, res) => {
  try {
    console.log('📝 GET /tasks: Получен запрос на получение задач пользователя');
    
    // TODO: В будущем здесь будет аутентификация пользователя
    // Пока загружаем все задачи для отладки
    const userTasks = await Task.find().sort({ createdAt: -1 });
    
    console.log('📝 GET /tasks: Найдено задач в MongoDB:', userTasks.length);
    
    // Преобразуем _id в id для фронтенда
    const tasksWithId = userTasks.map(task => ({
      ...task.toObject(),
      id: task._id.toString()
    }));
    
    res.json({
      success: true,
      data: tasksWithId,
      message: 'Задачи пользователя получены'
    });
  } catch (error) {
    console.error('❌ Ошибка получения задач:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения задач',
      message: error.message
    });
  }
});

// GET /api/v1/tasks/:id - получение задачи по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 GET /tasks/:id: Получен запрос на получение задачи:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный ID задачи'
      });
    }
    
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Задача не найдена'
      });
    }
    
    // Преобразуем _id в id для фронтенда
    const taskWithId = {
      ...task.toObject(),
      id: task._id.toString()
    };
    
    res.json({
      success: true,
      data: taskWithId,
      message: 'Задача получена'
    });
  } catch (error) {
    console.error('❌ Ошибка получения задачи:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения задачи',
      message: error.message
    });
  }
});

// POST /api/v1/tasks/ - создание новой задачи
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /tasks: Получен запрос на создание задачи');
    console.log('📝 POST /tasks: Body:', req.body);
    
    // Создаем ID для новой задачи
    const taskId = new mongoose.Types.ObjectId();
    
    // Подготавливаем данные задачи
    const taskData = {
      _id: taskId,
      id: taskId.toString(),
      order: req.body.order || 0,
      createdBy: req.body.createdBy ? new mongoose.Types.ObjectId(req.body.createdBy) : (req.body.reporterId ? new mongoose.Types.ObjectId(req.body.reporterId) : new mongoose.Types.ObjectId()),
      updatedBy: req.body.updatedBy ? new mongoose.Types.ObjectId(req.body.updatedBy) : (req.body.reporterId ? new mongoose.Types.ObjectId(req.body.reporterId) : new mongoose.Types.ObjectId()),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...req.body
    };
    
    console.log('📝 POST /tasks: Подготовленные данные задачи:');
    console.log('📝 POST /tasks: createdBy:', taskData.createdBy);
    console.log('📝 POST /tasks: updatedBy:', taskData.updatedBy);
    console.log('📝 POST /tasks: order:', taskData.order);
    
    // Создаем задачу
    const newTask = new Task(taskData);
    await newTask.save();
    
    console.log('📝 POST /tasks: Задача создана с ID:', taskId);
    
    // Обновляем статистику доски
    if (req.body.boardId) {
      await Board.findByIdAndUpdate(
        req.body.boardId,
        { $inc: { 'statistics.totalTasks': 1 } }
      );
    }
    
    // Преобразуем _id в id для фронтенда
    const taskWithId = {
      ...newTask.toObject(),
      id: newTask._id.toString()
    };
    
    res.status(201).json({
      success: true,
      data: taskWithId,
      message: 'Задача успешно создана'
    });
  } catch (error) {
    console.error('❌ Ошибка создания задачи:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания задачи',
      message: error.message
    });
  }
});

// PUT /api/v1/tasks/:id - обновление задачи
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 PUT /tasks/:id: Получен запрос на обновление задачи:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный ID задачи'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Задача не найдена'
      });
    }
    
    console.log('📝 PUT /tasks/:id: Задача обновлена:', id);
    
    // Преобразуем _id в id для фронтенда
    const taskWithId = {
      ...updatedTask.toObject(),
      id: updatedTask._id.toString()
    };
    
    res.json({
      success: true,
      data: taskWithId,
      message: 'Задача успешно обновлена'
    });
  } catch (error) {
    console.error('❌ Ошибка обновления задачи:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления задачи',
      message: error.message
    });
  }
});

// DELETE /api/v1/tasks/:id - удаление задачи
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 DELETE /tasks/:id: Получен запрос на удаление задачи:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный ID задачи'
      });
    }
    
    const deletedTask = await Task.findByIdAndDelete(id);
    
    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        error: 'Задача не найдена'
      });
    }
    
    console.log('📝 DELETE /tasks/:id: Задача удалена:', id);
    
    // Обновляем статистику доски
    if (deletedTask.boardId) {
      await Board.findByIdAndUpdate(
        deletedTask.boardId,
        { $inc: { 'statistics.totalTasks': -1 } }
      );
    }
    
    res.json({
      success: true,
      message: 'Задача успешно удалена'
    });
  } catch (error) {
    console.error('❌ Ошибка удаления задачи:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления задачи',
      message: error.message
    });
  }
});

module.exports = router;
