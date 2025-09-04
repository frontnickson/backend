const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  // Основная информация
  title: {
    type: String,
    required: [true, 'Название доски обязательно'],
    trim: true,
    maxlength: [100, 'Название доски не может превышать 100 символов']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Описание доски не может превышать 500 символов']
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    required: [true, 'Цвет доски обязателен'],
    default: '#3B82F6',
    match: [/^#[0-9A-F]{6}$/i, 'Некорректный формат цвета']
  },
  
  // Владелец и команда
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Владелец доски обязателен']
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  
  // Участники
  members: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer', 'guest'],
      default: 'member'
    },
    joinedAt: {
      type: Number, // timestamp
      default: Date.now
    },
    permissions: [{
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      resource: {
        type: String,
        enum: ['board', 'column', 'task', 'comment', 'member', 'attachment'],
        required: true
      },
      action: {
        type: String,
        enum: ['create', 'read', 'update', 'delete', 'manage', 'archive'],
        required: true
      },
      conditions: [{
        field: String,
        operator: {
          type: String,
          enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than']
        },
        value: mongoose.Schema.Types.Mixed
      }]
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    lastSeen: {
      type: Number // timestamp
    }
  }],
  
  // Колонки
  columns: [{
    id: {
      type: String,
      required: true
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Название колонки обязательно'],
      trim: true,
      maxlength: [100, 'Название колонки не может превышать 100 символов']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Описание колонки не может превышать 200 символов']
    },
    icon: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      default: '#6B7280',
      match: [/^#[0-9A-F]{6}$/i, 'Некорректный формат цвета']
    },
    order: {
      type: Number,
      required: true,
      min: 0
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    isCollapsed: {
      type: Boolean,
      default: false
    },
    isStandard: {
      type: Boolean,
      default: false
    },
    taskLimit: {
      type: Number,
      min: 0
    },
    wipLimit: {
      type: Number,
      min: 0
    },
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    settings: {
      allowTaskCreation: {
        type: Boolean,
        default: true
      },
      allowTaskEditing: {
        type: Boolean,
        default: true
      },
      allowTaskMoving: {
        type: Boolean,
        default: true
      },
      allowTaskDeletion: {
        type: Boolean,
        default: true
      },
      allowSubtaskCreation: {
        type: Boolean,
        default: true
      },
      allowCommentCreation: {
        type: Boolean,
        default: true
      },
      allowAttachmentUpload: {
        type: Boolean,
        default: true
      },
      autoSortTasks: {
        type: Boolean,
        default: false
      },
      sortBy: {
        type: String,
        enum: ['order', 'priority', 'dueDate', 'createdAt', 'updatedAt'],
        default: 'order'
      },
      sortDirection: {
        type: String,
        enum: ['asc', 'desc'],
        default: 'asc'
      }
    },
    statistics: {
      totalTasks: {
        type: Number,
        default: 0,
        min: 0
      },
      completedTasks: {
        type: Number,
        default: 0,
        min: 0
      },
      inProgressTasks: {
        type: Number,
        default: 0,
        min: 0
      },
      overdueTasks: {
        type: Number,
        default: 0,
        min: 0
      },
      averageTaskDuration: {
        type: Number,
        default: 0,
        min: 0
      },
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
      lastTaskUpdate: {
        type: Number,
        default: Date.now
      }
    },
    createdAt: {
      type: Number,
      default: Date.now
    },
    updatedAt: {
      type: Number,
      default: Date.now
    }
  }],
  
  // Настройки доски
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    allowPublicView: {
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
    allowTaskCreation: {
      type: Boolean,
      default: true
    },
    allowTaskEditing: {
      type: Boolean,
      default: true
    },
    allowSubtaskCreation: {
      type: Boolean,
      default: true
    },
    allowTaskAssignment: {
      type: Boolean,
      default: true
    },
    allowDueDateSetting: {
      type: Boolean,
      default: true
    },
    allowPrioritySetting: {
      type: Boolean,
      default: true
    },
    allowTagging: {
      type: Boolean,
      default: true
    },
    autoArchiveCompleted: {
      type: Boolean,
      default: false
    },
    archiveAfterDays: {
      type: Number,
      default: 30,
      min: 1
    },
    autoAssignTasks: {
      type: Boolean,
      default: false
    },
    autoNotifyAssignees: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    desktopNotifications: {
      type: Boolean,
      default: true
    },
    showTaskDetails: {
      type: String,
      enum: ['all', 'members', 'assignees'],
      default: 'all'
    },
    showMemberActivity: {
      type: Boolean,
      default: true
    },
    showTaskHistory: {
      type: Boolean,
      default: true
    }
  },
  
  // Статистика доски
  statistics: {
    totalTasks: {
      type: Number,
      default: 0,
      min: 0
    },
    completedTasks: {
      type: Number,
      default: 0,
      min: 0
    },
    inProgressTasks: {
      type: Number,
      default: 0,
      min: 0
    },
    overdueTasks: {
      type: Number,
      default: 0,
      min: 0
    },
    totalMembers: {
      type: Number,
      default: 1, // Владелец
      min: 1
    },
    activeMembers: {
      type: Number,
      default: 1,
      min: 1
    },
    lastActivity: {
      type: Number,
      default: Date.now
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageTaskDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    totalComments: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAttachments: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Статус доски
  isArchived: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoardTemplate'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  
  // Метаданные
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Тег не может превышать 50 символов']
  }],
  category: {
    type: String,
    enum: ['software_development', 'project_management', 'marketing', 'sales', 'support', 'hr', 'finance', 'operations', 'custom'],
    default: 'custom'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальные поля
boardSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

boardSchema.virtual('taskCount').get(function() {
  return this.columns.reduce((total, column) => total + column.tasks.length, 0);
});

boardSchema.virtual('isCompleted').get(function() {
  return this.statistics.totalTasks > 0 && 
         this.statistics.completedTasks === this.statistics.totalTasks;
});

// Индексы для оптимизации запросов
boardSchema.index({ ownerId: 1 });
boardSchema.index({ teamId: 1 });
boardSchema.index({ isArchived: 1 });
boardSchema.index({ isPublic: 1 });
boardSchema.index({ isTemplate: 1 });
boardSchema.index({ 'members.userId': 1 });
boardSchema.index({ 'members.role': 1 });
boardSchema.index({ createdAt: -1 });
boardSchema.index({ updatedAt: -1 });

// Middleware для обновления статистики
boardSchema.pre('save', function(next) {
  this.statistics.updatedAt = Date.now();
  next();
});

// Методы экземпляра
boardSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('Пользователь уже является участником доски');
  }
  
  this.members.push({
    id: new mongoose.Types.ObjectId(),
    userId,
    boardId: this._id,
    role,
    joinedAt: Date.now(),
    permissions: this.getDefaultPermissions(role),
    isActive: true
  });
  
  this.statistics.totalMembers = this.members.length;
  this.statistics.activeMembers = this.members.filter(m => m.isActive).length;
  
  return this;
};

boardSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (memberIndex === -1) {
    throw new Error('Пользователь не является участником доски');
  }
  
  if (this.members[memberIndex].role === 'owner') {
    throw new Error('Нельзя удалить владельца доски');
  }
  
  this.members.splice(memberIndex, 1);
  this.statistics.totalMembers = this.members.length;
  this.statistics.activeMembers = this.members.filter(m => m.isActive).length;
  
  return this;
};

boardSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => 
    m.userId.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('Пользователь не является участником доски');
  }
  
  if (member.role === 'owner') {
    throw new Error('Нельзя изменить роль владельца доски');
  }
  
  member.role = newRole;
  member.permissions = this.getDefaultPermissions(newRole);
  
  return this;
};

boardSchema.methods.getDefaultPermissions = function(role) {
  const permissions = {
    owner: [
      { id: 'board_manage', name: 'Управление доской', resource: 'board', action: 'manage' },
      { id: 'column_manage', name: 'Управление колонками', resource: 'column', action: 'manage' },
      { id: 'task_manage', name: 'Управление задачами', resource: 'task', action: 'manage' },
      { id: 'member_manage', name: 'Управление участниками', resource: 'member', action: 'manage' }
    ],
    admin: [
      { id: 'board_update', name: 'Редактирование доски', resource: 'board', action: 'update' },
      { id: 'column_manage', name: 'Управление колонками', resource: 'column', action: 'manage' },
      { id: 'task_manage', name: 'Управление задачами', resource: 'task', action: 'manage' },
      { id: 'member_update', name: 'Редактирование участников', resource: 'member', action: 'update' }
    ],
    member: [
      { id: 'board_read', name: 'Просмотр доски', resource: 'board', action: 'read' },
      { id: 'column_read', name: 'Просмотр колонок', resource: 'column', action: 'read' },
      { id: 'task_create', name: 'Создание задач', resource: 'task', action: 'create' },
      { id: 'task_update', name: 'Редактирование задач', resource: 'task', action: 'update' },
      { id: 'comment_create', name: 'Создание комментариев', resource: 'comment', action: 'create' }
    ],
    viewer: [
      { id: 'board_read', name: 'Просмотр доски', resource: 'board', action: 'read' },
      { id: 'column_read', name: 'Просмотр колонок', resource: 'column', action: 'read' },
      { id: 'task_read', name: 'Просмотр задач', resource: 'task', action: 'read' },
      { id: 'comment_read', name: 'Просмотр комментариев', resource: 'comment', action: 'read' }
    ],
    guest: [
      { id: 'board_read', name: 'Просмотр доски', resource: 'board', action: 'read' }
    ]
  };
  
  return permissions[role] || permissions.viewer;
};

boardSchema.methods.hasPermission = function(userId, resource, action) {
  const member = this.members.find(m => 
    m.userId.toString() === userId.toString()
  );
  
  if (!member || !member.isActive) {
    return false;
  }
  
  if (member.role === 'owner') {
    return true; // Владелец имеет все права
  }
  
  return member.permissions.some(permission => 
    permission.resource === resource && permission.action === action
  );
};

boardSchema.methods.updateStatistics = function() {
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let overdueTasks = 0;
  let totalComments = 0;
  let totalAttachments = 0;
  
  this.columns.forEach(column => {
    totalTasks += column.tasks.length;
    totalComments += column.statistics.totalComments;
    totalAttachments += column.statistics.totalAttachments;
    
    // Обновляем статистику колонки
    column.statistics.totalTasks = column.tasks.length;
  });
  
  this.statistics.totalTasks = totalTasks;
  this.statistics.totalComments = totalComments;
  this.statistics.totalAttachments = totalAttachments;
  this.statistics.lastActivity = Date.now();
  
  if (totalTasks > 0) {
    this.statistics.completionRate = Math.round((completedTasks / totalTasks) * 100);
  }
  
  return this;
};

// Статические методы
boardSchema.statics.findByOwner = function(ownerId) {
  return this.find({ ownerId });
};

boardSchema.statics.findByTeam = function(teamId) {
  return this.find({ teamId });
};

boardSchema.statics.findPublicBoards = function() {
  return this.find({ isPublic: true, isArchived: false });
};

boardSchema.statics.findTemplates = function() {
  return this.find({ isTemplate: true });
};

module.exports = mongoose.model('Board', boardSchema);
