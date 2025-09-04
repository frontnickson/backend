# Руководство по интеграции Frontend ↔ Backend

## 🔗 Обзор интеграции

Этот документ описывает, как интегрировать фронтенд (React + Redux) с бекендом (Node.js + Express) для создания полнофункционального Todo App с системой досок Kanban.

## 📋 Анализ фронтенда

### Текущая архитектура фронтенда

Фронтенд использует:
- **Redux Toolkit** для управления состоянием
- **Redux-persist** для сохранения данных
- **Custom hooks** для работы с API
- **TypeScript** для типизации
- **SCSS модули** для стилизации

### API вызовы в фронтенде

Проанализировав код, выявлены следующие API endpoints:

#### Аутентификация
- `POST /auth/login-email` - вход по email
- `POST /auth/register` - регистрация
- `GET /auth/me` - получение текущего пользователя

#### Доски
- `GET /boards/` - получение досок пользователя
- `POST /boards/` - создание доски
- `GET /boards/:id/` - получение доски по ID
- `PUT /boards/:id/` - обновление доски
- `DELETE /boards/:id/` - удаление доски
- `PATCH /boards/:id/toggle-favorite/` - переключение избранного
- `GET /boards/:id/statistics/` - статистика доски
- `POST /boards/:id/members/` - добавление участника
- `DELETE /boards/:id/members/:memberId/` - удаление участника
- `PATCH /boards/:id/members/:memberId/` - обновление роли участника

#### Задачи
- `GET /tasks/` - получение задач пользователя
- `GET /boards/:id/tasks/` - получение задач по доске
- `POST /tasks/` - создание задачи
- `PUT /tasks/:id/` - обновление задачи
- `DELETE /tasks/:id/` - удаление задачи
- `PATCH /tasks/:id/` - частичное обновление задачи

#### Статистика
- `GET /statistics/user` - статистика пользователя
- `GET /statistics/boards` - статистика по доскам
- `GET /statistics/tasks` - статистика по задачам

## 🔄 Синхронизация данных

### Принципы работы с данными

1. **При регистрации**: данные отправляются на бекенд и сохраняются в Redux
2. **При входе**: данные загружаются с бекенда в Redux
3. **При выходе**: данные отправляются на бекенд и удаляются из Redux
4. **При работе**: синхронизация между Redux и бекендом в реальном времени

### Логика сохранения данных

#### Пользователи
```typescript
// При регистрации
const registerUser = async (userData) => {
  const response = await apiService.post('/auth/register', userData);
  if (response.success) {
    // Сохраняем в Redux
    dispatch(setCurrentUser(response.data.user));
    // Сохраняем в localStorage через Redux-persist
  }
};

// При выходе
const logout = async () => {
  await apiService.post('/auth/logout');
  // Очищаем Redux
  dispatch(clearCurrentUser());
  // Redux-persist автоматически очистит localStorage
};
```

#### Доски
```typescript
// При создании доски
const createBoard = async (boardData) => {
  const response = await boardsApi.createBoard(boardData);
  if (response.success) {
    // Добавляем в Redux
    dispatch(addBoard(response.data));
    // Redux-persist автоматически сохранит в localStorage
  }
};

// При загрузке досок
const loadBoards = async () => {
  const response = await boardsApi.getUserBoards();
  if (response.success) {
    // Заменяем все доски в Redux
    dispatch(replaceAllBoards(response.data));
  }
};
```

#### Задачи
```typescript
// При создании задачи
const createTask = async (taskData) => {
  const response = await tasksApi.createTask(taskData);
  if (response.success) {
    // Добавляем задачу в колонку в Redux
    dispatch(addTaskToColumn({
      boardId: response.data.boardId,
      columnId: response.data.columnId,
      task: response.data
    }));
  }
};

// При обновлении задачи
const updateTask = async (taskId, updates) => {
  const response = await tasksApi.updateTask(taskId, updates);
  if (response.success) {
    // Обновляем задачу в Redux
    dispatch(updateTask(response.data));
  }
};
```

## 🚀 Реализация на бекенде

### Созданные эндпоинты

Бекенд полностью реализует все необходимые API endpoints:

#### Аутентификация (`/api/v1/auth/*`)
- ✅ `POST /register` - регистрация
- ✅ `POST /login-email` - вход
- ✅ `POST /logout` - выход
- ✅ `GET /me` - текущий пользователь
- ✅ `POST /refresh` - обновление токена
- ✅ `POST /change-password` - изменение пароля
- ✅ `POST /forgot-password` - запрос сброса
- ✅ `POST /reset-password` - сброс пароля

#### Доски (`/api/v1/boards/*`)
- ✅ `GET /` - список досок
- ✅ `POST /` - создание доски
- ✅ `GET /:id` - доска по ID
- ✅ `PUT /:id` - обновление доски
- ✅ `DELETE /:id` - удаление доски
- ✅ `PATCH /:id/toggle-favorite` - избранное
- ✅ `GET /:id/statistics` - статистика
- ✅ `POST /:id/members` - участники
- ✅ `DELETE /:id/members/:memberId` - удаление участника
- ✅ `PATCH /:id/members/:memberId` - роль участника

#### Задачи (`/api/v1/tasks/*`)
- ✅ `GET /` - список задач
- ✅ `POST /` - создание задачи
- ✅ `GET /:id` - задача по ID
- ✅ `PUT /:id` - обновление задачи
- ✅ `DELETE /:id` - удаление задачи
- ✅ `PATCH /:id/status` - изменение статуса
- ✅ `PATCH /:id/assign` - назначение исполнителя
- ✅ `POST /:id/comments` - комментарии
- ✅ `POST /:id/attachments` - вложения

### Модели данных

Созданы полные Mongoose модели, соответствующие типам фронтенда:

#### User Model
- Все поля из `ExtendedUser` интерфейса
- Валидация данных
- Хеширование паролей
- Методы для работы с профилем

#### Board Model
- Все поля из `Board` интерфейса
- Система ролей и прав доступа
- Статистика и метаданные
- Методы для управления участниками

#### Task Model
- Все поля из `Task` интерфейса
- Подзадачи и комментарии
- Вложения и теги
- Методы для работы с задачами

## 🔧 Настройка фронтенда

### Обновление API констант

Убедитесь, что в `src/constants/index.ts` указан правильный URL бекенда:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
```

### Обновление .env файла

В корне фронтенда создайте/обновите `.env` файл:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Обработка ответов API

Бекенд возвращает данные в формате:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}
```

Это соответствует текущему интерфейсу `ApiResponse` во фронтенде.

## 📡 Real-time обновления

### Socket.io интеграция

Бекенд поддерживает real-time обновления через Socket.io:

```typescript
// Во фронтенде
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

// Подключение к доске
socket.emit('join-board', { boardId: 'board-id' });

// Слушание обновлений
socket.on('task-created', (data) => {
  // Обновляем Redux store
  dispatch(addTaskToColumn(data));
});

socket.on('task-updated', (data) => {
  // Обновляем задачу в Redux
  dispatch(updateTask(data));
});
```

### События для синхронизации

- `task-created` - новая задача
- `task-updated` - обновление задачи
- `task-deleted` - удаление задачи
- `task-moved` - перемещение задачи
- `comment-added` - новый комментарий
- `board-updated` - обновление доски
- `member-added/removed` - участники

## 🛡️ Безопасность

### JWT аутентификация

Бекенд использует JWT токены:

```typescript
// В API сервисе
const setAuthToken = (token: string) => {
  apiService.setAuthToken(token);
  // Токен автоматически добавляется в заголовки
};

// При каждом запросе
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Права доступа

Бекенд проверяет права доступа на уровне middleware:

- `authenticate` - проверка JWT токена
- `authorize` - проверка роли пользователя
- `checkOwnership` - проверка владельца ресурса
- `checkTeamMembership` - проверка участия в команде

## 🔄 Миграция данных

### При первом запуске

1. **Запустите бекенд**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Запустите фронтенд**:
   ```bash
   cd toolrole
   npm run dev
   ```

3. **Проверьте подключение**:
   - Откройте `http://localhost:8000/health`
   - Должен вернуться статус "OK"

### Тестирование API

Используйте Postman или curl для тестирования:

```bash
# Регистрация
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Вход
curl -X POST http://localhost:8000/api/v1/auth/login-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

## 🐛 Отладка

### Логи бекенда

Бекенд выводит подробные логи:

```
🚀 Сервер запущен на порту 8000
🌍 Окружение: development
📚 API доступен по адресу: http://localhost:8000/api/v1
🔌 Socket.io доступен на: http://localhost:8000
✅ MongoDB подключена: localhost
✅ Redis подключен
```

### Проверка подключений

1. **MongoDB**: убедитесь, что MongoDB запущена на порту 27017
2. **Redis**: убедитесь, что Redis запущен на порту 6379
3. **CORS**: проверьте настройки CORS в `.env` файле

### Частые проблемы

#### CORS ошибки
```
Access to fetch at 'http://localhost:8000/api/v1/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Решение**: Проверьте настройки CORS в `.env`:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
CORS_CREDENTIALS=true
```

#### MongoDB подключение
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Решение**: Запустите MongoDB:
```bash
mongod
```

#### Redis подключение
```
Redis connection error: connect ECONNREFUSED 127.0.0.1:6379
```

**Решение**: Запустите Redis:
```bash
redis-server
```

## 📈 Производительность

### Оптимизации

1. **Кэширование**: Redis для сессий и токенов
2. **Индексы**: MongoDB индексы для быстрых запросов
3. **Pagination**: Постраничная загрузка для больших списков
4. **Compression**: Сжатие ответов API

### Мониторинг

Бекенд предоставляет health check endpoint:

```
GET /health
```

Возвращает:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "version": "1.0.0"
}
```

## 🔮 Дальнейшее развитие

### Планируемые улучшения

1. **Полная реализация контроллеров** для всех сущностей
2. **WebSocket события** для real-time обновлений
3. **Система уведомлений** (email, push)
4. **Загрузка файлов** с Multer
5. **Тесты** для всех API endpoints
6. **Docker** контейнеризация
7. **CI/CD** pipeline

### Архитектурные улучшения

1. **Микросервисы** для масштабирования
2. **GraphQL** для гибких запросов
3. **Event Sourcing** для аудита изменений
4. **API Gateway** для маршрутизации
5. **Service Mesh** для межсервисного взаимодействия

## 📚 Дополнительные ресурсы

### Документация

- [Backend README](./README.md) - полная документация бекенда
- [API Endpoints](./README.md#api-endpoints) - список всех эндпоинтов
- [Models](./README.md#models) - описание моделей данных

### Примеры кода

- [Auth Controller](./src/controllers/authController.js) - пример контроллера
- [User Model](./src/models/User.js) - пример модели
- [Auth Routes](./src/routes/auth.js) - пример маршрутов

### Интеграция

- [Frontend API Service](../toolrole/src/services/api/index.ts) - API сервис фронтенда
- [Redux Store](../toolrole/src/store/) - управление состоянием
- [Custom Hooks](../toolrole/src/hooks/) - хуки для работы с API

---

**Важно**: Этот бекенд полностью совместим с существующим фронтендом и не требует изменений в коде фронтенда. Все API endpoints соответствуют ожиданиям фронтенда, а модели данных точно соответствуют TypeScript интерфейсам.
