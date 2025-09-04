const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Board = require('../models/Board');

console.log('📋 boards.js: Роуты досок загружены');

// GET /api/v1/boards/ - получение всех досок пользователя
router.get('/', async (req, res) => {
  try {
    console.log('📋 GET /boards: Получен запрос на получение досок пользователя');
    
    // TODO: В будущем здесь будет аутентификация пользователя
    // Пока загружаем все доски для отладки
    const userBoards = await Board.find({ isArchived: false }).sort({ createdAt: -1 });
    
    console.log('📋 GET /boards: Найдено досок в MongoDB:', userBoards.length);
    
    // Загружаем задачи для каждой доски
    const Task = require('../models/Task');
    const boardsWithTasks = await Promise.all(userBoards.map(async (board) => {
      console.log(`📋 GET /boards: Загружаем задачи для доски ${board.title} (${board._id})`);
      const tasks = await Task.find({ boardId: board._id });
      console.log(`📋 GET /boards: Найдено задач для доски ${board.title}: ${tasks.length}`);
      
      // Группируем задачи по колонкам
      const tasksByColumn = {};
      tasks.forEach(task => {
        const columnId = task.columnId || 'new_tasks';
        if (!tasksByColumn[columnId]) {
          tasksByColumn[columnId] = [];
        }
        tasksByColumn[columnId].push({
          ...task.toObject(),
          id: task._id.toString()
        });
      });
      
      console.log(`📋 GET /boards: Задачи по колонкам для доски ${board.title}:`, Object.keys(tasksByColumn).map(colId => `${colId}: ${tasksByColumn[colId].length}`));
      
      // Добавляем задачи в колонки
      const columnsWithTasks = board.columns.map(column => ({
        ...column.toObject(),
        tasks: tasksByColumn[column.id] || []
      }));
      
      return {
        ...board.toObject(),
        id: board._id.toString(),
        columns: columnsWithTasks
      };
    }));
    
    res.json({
      success: true,
      data: boardsWithTasks,
      message: 'Доски пользователя получены'
    });
  } catch (error) {
    console.error('❌ Ошибка получения досок:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения досок',
      message: error.message
    });
  }
});

// GET /api/v1/boards/:id - получение доски по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 GET /boards/:id: Получен запрос на получение доски:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный ID доски'
      });
    }
    
    const board = await Board.findById(id);
    
    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Доска не найдена'
      });
    }
    
    console.log('📋 GET /boards/:id: Доска найдена, колонок в базе:', board.columns.length);
    
    // Преобразуем _id в id для фронтенда
    const boardWithId = {
      ...board.toObject(),
      id: board._id.toString()
    };
    
    console.log('📋 GET /boards/:id: Колонок в ответе:', boardWithId.columns.length);
    
    res.json({
      success: true,
      data: boardWithId,
      message: 'Доска получена'
    });
  } catch (error) {
    console.error('❌ Ошибка получения доски:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения доски',
      message: error.message
    });
  }
});

// POST /api/v1/boards/ - создание новой доски
router.post('/', async (req, res) => {
  try {
    console.log('📋 POST /boards: Получен запрос на создание доски');
    console.log('📋 POST /boards: Body:', req.body);
    
    // Создаем ID для новой доски
    const boardId = new mongoose.Types.ObjectId();
    
    // Обрабатываем колонки и устанавливаем правильный boardId
    const processedColumns = (req.body.columns || []).map((column, index) => ({
      ...column,
      id: column.id || `col_${Date.now()}_${index}`,
      boardId: boardId,
      tasks: column.tasks || []
    }));
    
    // Создаем новую доску с полной структурой
    const newBoardData = {
      _id: boardId,
      id: boardId.toString(), // Добавляем строковое представление для фронтенда
      title: req.body.title || 'Новая доска',
      description: req.body.description || '',
      icon: req.body.icon || '📋',
      color: req.body.color || '#3B82F6',
      ownerId: req.body.ownerId || new mongoose.Types.ObjectId(),
      teamId: req.body.teamId || null,
      members: req.body.members || [],
      settings: req.body.settings || {
        allowMemberInvites: true,
        allowPublicView: false,
        allowComments: true,
        allowAttachments: true,
        allowTaskCreation: true,
        allowTaskEditing: true,
        defaultColumnTemplate: ['planning', 'in_progress', 'review', 'completed', 'overdue'],
        allowColumnCustomization: true,
        maxColumns: 10,
        allowSubtaskCreation: true,
        allowTaskAssignment: true,
        allowDueDateSetting: true,
        allowPrioritySetting: true,
        allowTagging: true,
        autoArchiveCompleted: false,
        archiveAfterDays: 30,
        autoAssignTasks: false,
        autoNotifyAssignees: true,
        emailNotifications: true,
        pushNotifications: true,
        desktopNotifications: true,
        showTaskDetails: 'all',
        showMemberActivity: true,
        showTaskHistory: true
      },
      statistics: req.body.statistics || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        totalMembers: 1,
        activeMembers: 1,
        lastActivity: Date.now(),
        completionRate: 0,
        averageTaskDuration: 0,
        totalComments: 0,
        totalAttachments: 0
      },
      columns: processedColumns,
      isArchived: req.body.isArchived || false,
      isPublic: req.body.isPublic || false,
      isTemplate: req.body.isTemplate || false,
      isFavorite: req.body.isFavorite || false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Сохраняем доску в MongoDB
    console.log('📋 POST /boards: Сохраняем доску с колонками:', processedColumns.length);
    console.log('📋 POST /boards: Данные колонок:', JSON.stringify(processedColumns, null, 2));
    const newBoard = new Board(newBoardData);
    
    let savedBoard;
    try {
      savedBoard = await newBoard.save();
      console.log('📋 POST /boards: Доска сохранена, колонок в сохраненной доске:', savedBoard.columns.length);
    } catch (saveError) {
      console.error('📋 POST /boards: Ошибка сохранения доски:', saveError);
      throw saveError;
    }
    
    console.log('📋 POST /boards: Доска сохранена в MongoDB:', savedBoard.title, 'ID:', savedBoard._id);
    
    // Преобразуем _id в id для фронтенда
    const boardWithId = {
      ...savedBoard.toObject(),
      id: savedBoard._id.toString()
    };
    
    res.json({
      success: true,
      data: boardWithId,
      message: 'Доска успешно создана'
    });
  } catch (error) {
    console.error('❌ Ошибка создания доски:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания доски',
      message: error.message
    });
  }
});

// DELETE /api/v1/boards/:id - удаление доски
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ DELETE /boards/:id: Получен запрос на удаление доски');
    console.log('🗑️ DELETE /boards/:id: Board ID:', req.params.id);
    console.log('🗑️ DELETE /boards/:id: Full URL:', req.originalUrl);
    console.log('🗑️ DELETE /boards/:id: Method:', req.method);
    
    const boardId = req.params.id;
    
    // Проверяем, что ID валидный ObjectId
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      console.log('🗑️ DELETE /boards/:id: Невалидный ID доски:', boardId);
      return res.status(400).json({
        success: false,
        error: 'Невалидный ID доски',
        message: 'ID доски имеет неправильный формат'
      });
    }
    
    // Проверяем, существует ли доска
    const board = await Board.findById(boardId);
    if (!board) {
      console.log('🗑️ DELETE /boards/:id: Доска не найдена');
      return res.status(404).json({
        success: false,
        error: 'Доска не найдена',
        message: 'Доска с указанным ID не существует'
      });
    }
    
    // Удаляем доску из MongoDB
    await Board.findByIdAndDelete(boardId);
    
    console.log('🗑️ DELETE /boards/:id: Доска успешно удалена:', board.title);
    
    res.json({
      success: true,
      message: 'Доска успешно удалена'
    });
  } catch (error) {
    console.error('❌ Ошибка удаления доски:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления доски',
      message: error.message
    });
  }
});

// GET /api/v1/boards/:boardId/tasks - получение задач доски
router.get('/:boardId/tasks', async (req, res) => {
  try {
    const { boardId } = req.params;
    console.log('📋 GET /boards/:boardId/tasks: Получен запрос на получение задач доски:', boardId);
    
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный ID доски'
      });
    }
    
    // Находим доску
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Доска не найдена'
      });
    }
    
    // Получаем все задачи для этой доски
    const Task = require('../models/Task');
    const tasks = await Task.find({ boardId: boardId });
    
    console.log('📋 GET /boards/:boardId/tasks: Найдено задач:', tasks.length);
    
    // Преобразуем _id в id для фронтенда
    const tasksWithId = tasks.map(task => ({
      ...task.toObject(),
      id: task._id.toString()
    }));
    
    res.json({
      success: true,
      data: tasksWithId,
      message: 'Задачи доски получены'
    });
  } catch (error) {
    console.error('❌ Ошибка получения задач доски:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения задач доски',
      message: error.message
    });
  }
});

// POST /api/v1/boards/:boardId/columns - создание новой колонки
router.post('/:boardId/columns', async (req, res) => {
  try {
    const { boardId } = req.params;
    console.log('📋 POST /boards/:boardId/columns: Получен запрос на создание колонки для доски:', boardId);
    console.log('📋 POST /boards/:boardId/columns: Body:', req.body);
    
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный ID доски'
      });
    }
    
    // Находим доску
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Доска не найдена'
      });
    }
    
    // Создаем ID для новой колонки
    const columnId = `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Подготавливаем данные колонки
    const columnData = {
      id: columnId,
      boardId: boardId,
      title: req.body.title,
      description: req.body.description || '',
      icon: req.body.icon || '📋',
      color: req.body.color || '#6B7280',
      order: board.columns.length,
      isLocked: false,
      isCollapsed: false,
      isStandard: false,
      tasks: [],
      settings: {
        allowTaskCreation: true,
        allowTaskEditing: true,
        allowTaskMoving: true,
        allowTaskDeletion: true,
        allowSubtaskCreation: true,
        allowCommentCreation: true,
        allowAttachmentUpload: true,
        autoSortTasks: false,
        sortBy: 'order',
        sortDirection: 'asc'
      },
      statistics: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        averageTaskDuration: 0,
        totalComments: 0,
        totalAttachments: 0,
        lastTaskUpdate: Date.now()
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Добавляем колонку в доску
    board.columns.push(columnData);
    await board.save();
    
    console.log('📋 POST /boards/:boardId/columns: Колонка создана с ID:', columnId);
    
    // Преобразуем _id в id для фронтенда
    const boardWithId = {
      ...board.toObject(),
      id: board._id.toString()
    };
    
    res.status(201).json({
      success: true,
      data: boardWithId,
      message: 'Колонка успешно создана'
    });
  } catch (error) {
    console.error('❌ Ошибка создания колонки:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания колонки',
      message: error.message
    });
  }
});

// PUT /api/v1/boards/:boardId/columns/:columnId - обновление колонки
router.put('/:boardId/columns/:columnId', async (req, res) => {
  try {
    const { boardId, columnId } = req.params;
    console.log('📋 PUT /boards/:boardId/columns/:columnId: Получен запрос на обновление колонки:', columnId);
    
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный ID доски'
      });
    }
    
    // Находим доску
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Доска не найдена'
      });
    }
    
    // Находим колонку
    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({
        success: false,
        error: 'Колонка не найдена'
      });
    }
    
    // Обновляем данные колонки
    Object.assign(column, {
      ...req.body,
      updatedAt: Date.now()
    });
    
    await board.save();
    
    console.log('📋 PUT /boards/:boardId/columns/:columnId: Колонка обновлена:', columnId);
    
    // Преобразуем _id в id для фронтенда
    const boardWithId = {
      ...board.toObject(),
      id: board._id.toString()
    };
    
    res.json({
      success: true,
      data: boardWithId,
      message: 'Колонка успешно обновлена'
    });
  } catch (error) {
    console.error('❌ Ошибка обновления колонки:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления колонки',
      message: error.message
    });
  }
});

// DELETE /api/v1/boards/:boardId/columns/:columnId - удаление колонки
router.delete('/:boardId/columns/:columnId', async (req, res) => {
  try {
    const { boardId, columnId } = req.params;
    console.log('📋 DELETE /boards/:boardId/columns/:columnId: Получен запрос на удаление колонки:', columnId);
    
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный ID доски'
      });
    }
    
    // Находим доску
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Доска не найдена'
      });
    }
    
    // Находим колонку
    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({
        success: false,
        error: 'Колонка не найдена'
      });
    }
    
    // Проверяем, не является ли колонка стандартной
    if (column.isStandard) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя удалить стандартную колонку'
      });
    }
    
    // Удаляем колонку
    board.columns.pull(columnId);
    await board.save();
    
    console.log('📋 DELETE /boards/:boardId/columns/:columnId: Колонка удалена:', columnId);
    
    // Преобразуем _id в id для фронтенда
    const boardWithId = {
      ...board.toObject(),
      id: board._id.toString()
    };
    
    res.json({
      success: true,
      data: boardWithId,
      message: 'Колонка успешно удалена'
    });
  } catch (error) {
    console.error('❌ Ошибка удаления колонки:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления колонки',
      message: error.message
    });
  }
});

module.exports = router;
