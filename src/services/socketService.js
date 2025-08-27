// TODO: Реализовать Socket.io обработчики
const socketHandlers = (io, socket) => {
  console.log(`🔌 Socket ${socket.id} подключен`);
  
  // Обработка подключения к доске
  socket.on('join-board', (data) => {
    console.log(`👥 Пользователь присоединился к доске: ${data.boardId}`);
    socket.join(`board-${data.boardId}`);
  });
  
  // Обработка отключения от доски
  socket.on('leave-board', (data) => {
    console.log(`👋 Пользователь покинул доску: ${data.boardId}`);
    socket.leave(`board-${data.boardId}`);
  });
  
  // Обработка создания задачи
  socket.on('task-created', (data) => {
    console.log(`✅ Новая задача создана: ${data.taskId}`);
    socket.to(`board-${data.boardId}`).emit('task-created', data);
  });
  
  // Обработка обновления задачи
  socket.on('task-updated', (data) => {
    console.log(`🔄 Задача обновлена: ${data.taskId}`);
    socket.to(`board-${data.boardId}`).emit('task-updated', data);
  });
  
  // Обработка удаления задачи
  socket.on('task-deleted', (data) => {
    console.log(`🗑️ Задача удалена: ${data.taskId}`);
    socket.to(`board-${data.boardId}`).emit('task-deleted', data);
  });
  
  // Обработка перемещения задачи
  socket.on('task-moved', (data) => {
    console.log(`📦 Задача перемещена: ${data.taskId}`);
    socket.to(`board-${data.boardId}`).emit('task-moved', data);
  });
  
  // Обработка комментариев
  socket.on('comment-added', (data) => {
    console.log(`💬 Добавлен комментарий к задаче: ${data.taskId}`);
    socket.to(`board-${data.boardId}`).emit('comment-added', data);
  });
  
  // Обработка вложений
  socket.on('attachment-uploaded', (data) => {
    console.log(`📎 Загружено вложение к задаче: ${data.taskId}`);
    socket.to(`board-${data.boardId}`).emit('attachment-uploaded', data);
  });
  
  // Обработка обновлений доски
  socket.on('board-updated', (data) => {
    console.log(`📋 Доска обновлена: ${data.boardId}`);
    socket.to(`board-${data.boardId}`).emit('board-updated', data);
  });
  
  // Обработка добавления участника
  socket.on('member-added', (data) => {
    console.log(`👤 Добавлен участник на доску: ${data.boardId}`);
    socket.to(`board-${data.boardId}`).emit('member-added', data);
  });
  
  // Обработка удаления участника
  socket.on('member-removed', (data) => {
    console.log(`👤 Удален участник с доски: ${data.boardId}`);
    socket.to(`board-${data.boardId}`).emit('member-removed', data);
  });
  
  // Обработка изменения роли участника
  socket.on('member-role-changed', (data) => {
    console.log(`🔐 Изменена роль участника на доске: ${data.boardId}`);
    socket.to(`board-${data.boardId}`).emit('member-role-changed', data);
  });
  
  // Обработка уведомлений
  socket.on('notification-sent', (data) => {
    console.log(`🔔 Отправлено уведомление пользователю: ${data.userId}`);
    socket.to(`user-${data.userId}`).emit('notification-received', data);
  });
  
  // Обработка статуса онлайн
  socket.on('user-online', (data) => {
    console.log(`🟢 Пользователь онлайн: ${data.userId}`);
    socket.broadcast.emit('user-status-changed', {
      userId: data.userId,
      status: 'online'
    });
  });
  
  // Обработка статуса оффлайн
  socket.on('user-offline', (data) => {
    console.log(`🔴 Пользователь оффлайн: ${data.userId}`);
    socket.broadcast.emit('user-status-changed', {
      userId: data.userId,
      status: 'offline'
    });
  });
  
  // Обработка печати
  socket.on('user-typing', (data) => {
    console.log(`⌨️ Пользователь печатает в задаче: ${data.taskId}`);
    socket.to(`board-${data.boardId}`).emit('user-typing', data);
  });
  
  // Обработка остановки печати
  socket.on('user-stopped-typing', (data) => {
    console.log(`⏹️ Пользователь перестал печатать в задаче: ${data.taskId}`);
    socket.to(`board-${data.boardId}`).emit('user-stopped-typing', data);
  });
  
  // Обработка ошибок
  socket.on('error', (error) => {
    console.error(`❌ Socket ошибка: ${error.message}`);
  });
};

module.exports = socketHandlers;
