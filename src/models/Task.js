const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  // Основная информация
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: [true, 'ID доски обязателен']
  },
  columnId: {
    type: String,
    required: [true, 'ID колонки обязателен']
  },
  
  // Заголовок и описание
  title: {
    type: String,
    required: [true, 'Название задачи обязательно'],
    trim: true,
    maxlength: [200, 'Название задачи не может превышать 200 символов']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Описание задачи не может превышать 2000 символов']
  },
  
  // Статус и приоритет
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'review', 'testing', 'completed', 'cancelled', 'blocked', 'on_hold'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent', 'critical'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['task', 'bug', 'feature', 'story', 'epic', 'subtask'],
    default: 'task'
  },
  
  // Участники
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Автор задачи обязателен']
  },
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Временные параметры
  dueDate: {
    type: Number // timestamp
  },
  startDate: {
    type: Number // timestamp
  },
  completedAt: {
    type: Number // timestamp
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  timeSpent: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Метаданные
  tags: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Название тега не может превышать 50 символов']
    },
    color: {
      type: String,
      default: '#6B7280',
      match: [/^#[0-9A-F]{6}$/i, 'Некорректный формат цвета']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Описание тега не может превышать 200 символов']
    },
    createdAt: {
      type: Number,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  labels: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Название метки не может превышать 50 символов']
    },
    color: {
      type: String,
      default: '#6B7280',
      match: [/^#[0-9A-F]{6}$/i, 'Некорректный формат цвета']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Описание метки не может превышать 200 символов']
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Number,
      default: Date.now
    }
  }],
  
  // Вложения
  attachments: [{
    id: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Number,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastDownloadedAt: {
      type: Number
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Подзадачи
  subtasks: [{
    id: {
      type: String,
      required: true
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Название подзадачи обязательно'],
      trim: true,
      maxlength: [200, 'Название подзадачи не может превышать 200 символов']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Описание подзадачи не может превышать 1000 символов']
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Number
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: {
      type: Number
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent', 'critical'],
      default: 'medium'
    },
    order: {
      type: Number,
      required: true,
      min: 0
    },
    estimatedHours: {
      type: Number,
      min: 0
    },
    actualHours: {
      type: Number,
      min: 0,
      default: 0
    },
    tags: [{
      type: String,
      trim: true
    }],
    attachments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attachment'
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    createdAt: {
      type: Number,
      default: Date.now
    },
    updatedAt: {
      type: Number,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  // Комментарии
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  // Активность и история
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  
  // Статистика
  statistics: {
    totalComments: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAttachments: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSubtasks: {
      type: Number,
      default: 0,
      min: 0
    },
    completedSubtasks: {
      type: Number,
      default: 0,
      min: 0
    },
    totalLikes: {
      type: Number,
      default: 0,
      min: 0
    },
    totalViews: {
      type: Number,
      default: 0,
      min: 0
    },
    lastCommentAt: {
      type: Number
    },
    lastActivityAt: {
      type: Number,
      default: Date.now
    },
    timeInStatus: {
      planning: { type: Number, default: 0 },
      in_progress: { type: Number, default: 0 },
      review: { type: Number, default: 0 },
      testing: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 },
      blocked: { type: Number, default: 0 },
      on_hold: { type: Number, default: 0 }
    }
  },
  
  // Настройки
  isArchived: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  allowAttachments: {
    type: Boolean,
    default: true
  },
  
  // Системные поля
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Порядок и группировка
  order: {
    type: Number,
    required: true,
    min: 0
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  epicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  sprintId: {
    type: String
  },
  
  // Дополнительные поля
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальные поля
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return Date.now() > this.dueDate && this.status !== 'completed';
});

taskSchema.virtual('progress').get(function() {
  if (this.statistics.totalSubtasks === 0) return 0;
  return Math.round((this.statistics.completedSubtasks / this.statistics.totalSubtasks) * 100);
});

taskSchema.virtual('timeRemaining').get(function() {
  if (!this.dueDate) return null;
  const remaining = this.dueDate - Date.now();
  return remaining > 0 ? remaining : 0;
});

// Индексы для оптимизации запросов
taskSchema.index({ boardId: 1 });
taskSchema.index({ columnId: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ reporterId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ isArchived: 1 });
taskSchema.index({ isPinned: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ updatedAt: -1 });
taskSchema.index({ 'tags.name': 1 });
taskSchema.index({ 'labels.name': 1 });

// Middleware для обновления статистики
taskSchema.pre('save', function(next) {
  this.statistics.lastActivityAt = Date.now();
  
  // Обновляем статистику подзадач
  this.statistics.totalSubtasks = this.subtasks.length;
  this.statistics.completedSubtasks = this.subtasks.filter(st => st.isCompleted).length;
  
  // Обновляем статистику комментариев и вложений
  this.statistics.totalComments = this.comments.length;
  this.statistics.totalAttachments = this.attachments.length;
  
  next();
});

// Методы экземпляра
taskSchema.methods.addSubtask = function(subtaskData) {
  const subtask = {
    id: new mongoose.Types.ObjectId().toString(),
    taskId: this._id,
    boardId: this.boardId,
    title: subtaskData.title,
    description: subtaskData.description,
    assigneeId: subtaskData.assigneeId,
    dueDate: subtaskData.dueDate,
    priority: subtaskData.priority || 'medium',
    order: this.subtasks.length,
    createdBy: subtaskData.createdBy,
    ...subtaskData
  };
  
  this.subtasks.push(subtask);
  this.statistics.totalSubtasks = this.subtasks.length;
  
  return this;
};

taskSchema.methods.completeSubtask = function(subtaskId, completedBy) {
  const subtask = this.subtasks.find(st => st.id === subtaskId);
  if (!subtask) {
    throw new Error('Подзадача не найдена');
  }
  
  subtask.isCompleted = true;
  subtask.completedAt = Date.now();
  subtask.completedBy = completedBy;
  
  this.statistics.completedSubtasks = this.subtasks.filter(st => st.isCompleted).length;
  
  return this;
};

taskSchema.methods.addComment = function(commentId) {
  if (!this.comments.includes(commentId)) {
    this.comments.push(commentId);
    this.statistics.totalComments = this.comments.length;
    this.statistics.lastCommentAt = Date.now();
  }
  
  return this;
};

taskSchema.methods.removeComment = function(commentId) {
  const commentIndex = this.comments.indexOf(commentId);
  if (commentIndex > -1) {
    this.comments.splice(commentIndex, 1);
    this.statistics.totalComments = this.comments.length;
  }
  
  return this;
};

taskSchema.methods.addAttachment = function(attachmentData) {
  const attachment = {
    id: new mongoose.Types.ObjectId().toString(),
    ...attachmentData
  };
  
  this.attachments.push(attachment);
  this.statistics.totalAttachments = this.attachments.length;
  
  return this;
};

taskSchema.methods.removeAttachment = function(attachmentId) {
  const attachmentIndex = this.attachments.findIndex(att => att.id === attachmentId);
  if (attachmentIndex > -1) {
    this.attachments.splice(attachmentIndex, 1);
    this.statistics.totalAttachments = this.attachments.length;
  }
  
  return this;
};

taskSchema.methods.updateStatus = function(newStatus, updatedBy) {
  const oldStatus = this.status;
  this.status = newStatus;
  this.updatedBy = updatedBy;
  
  // Обновляем время в статусе
  const now = Date.now();
  if (this.statistics.timeInStatus[oldStatus] !== undefined) {
    this.statistics.timeInStatus[oldStatus] += now - this.statistics.lastActivityAt;
  }
  
  // Если задача завершена, устанавливаем время завершения
  if (newStatus === 'completed' && !this.completedAt) {
    this.completedAt = now;
  }
  
  this.statistics.lastActivityAt = now;
  
  return this;
};

taskSchema.methods.assignTo = function(userId, assignedBy) {
  this.assigneeId = userId;
  this.updatedBy = assignedBy;
  this.statistics.lastActivityAt = Date.now();
  
  return this;
};

taskSchema.methods.addWatcher = function(userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
  }
  
  return this;
};

taskSchema.methods.removeWatcher = function(userId) {
  const watcherIndex = this.watchers.indexOf(userId);
  if (watcherIndex > -1) {
    this.watchers.splice(watcherIndex, 1);
  }
  
  return this;
};

taskSchema.methods.addCollaborator = function(userId) {
  if (!this.collaborators.includes(userId)) {
    this.collaborators.push(userId);
  }
  
  return this;
};

taskSchema.methods.removeCollaborator = function(userId) {
  const collaboratorIndex = this.collaborators.indexOf(userId);
  if (collaboratorIndex > -1) {
    this.collaborators.splice(collaboratorIndex, 1);
  }
  
  return this;
};

// Статические методы
taskSchema.statics.findByBoard = function(boardId) {
  return this.find({ boardId });
};

taskSchema.statics.findByColumn = function(columnId) {
  return this.find({ columnId });
};

taskSchema.statics.findByAssignee = function(assigneeId) {
  return this.find({ assigneeId });
};

taskSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

taskSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: Date.now() },
    status: { $ne: 'completed' }
  });
};

taskSchema.statics.findByPriority = function(priority) {
  return this.find({ priority });
};

module.exports = mongoose.model('Task', taskSchema);
