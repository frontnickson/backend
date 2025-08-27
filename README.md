# Toolrole Backend API

Backend для Todo App с системой досок Kanban, построенный на Node.js, Express.js, MongoDB и Redis.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- MongoDB 5+
- Redis 6+
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd backend
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
```bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

4. **Запустите базы данных**
```bash
# MongoDB
mongod

# Redis
redis-server
```

5. **Запустите приложение**
```bash
# Development режим
npm run dev

# Production режим
npm start
```

## 📁 Структура проекта

```
backend/
├── src/
│   ├── config/           # Конфигурация приложения
│   ├── controllers/      # Контроллеры для обработки запросов
│   ├── middleware/       # Middleware (аутентификация, валидация)
│   ├── models/          # Mongoose модели данных
│   ├── routes/          # API маршруты
│   ├── services/        # Бизнес-логика и внешние сервисы
│   ├── utils/           # Утилиты и хелперы
│   ├── validation/      # Схемы валидации Joi
│   └── app.js          # Основной файл приложения
├── package.json
├── .env                 # Переменные окружения
└── README.md
```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env` на основе `env.example`:

```env
# Server Configuration
NODE_ENV=development
PORT=8000
API_VERSION=v1

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/toolrole_db

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

## 📚 API Endpoints

### Аутентификация

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|---------|
| POST | `/api/v1/auth/register` | Регистрация нового пользователя | Public |
| POST | `/api/v1/auth/login-email` | Вход по email и паролю | Public |
| POST | `/api/v1/auth/logout` | Выход из системы | Private |
| POST | `/api/v1/auth/refresh` | Обновление токена | Public |
| GET | `/api/v1/auth/me` | Получение текущего пользователя | Private |
| POST | `/api/v1/auth/change-password` | Изменение пароля | Private |
| POST | `/api/v1/auth/forgot-password` | Запрос сброса пароля | Public |
| POST | `/api/v1/auth/reset-password` | Сброс пароля | Public |

### Пользователи

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|---------|
| GET | `/api/v1/users` | Получение списка пользователей | Private |
| GET | `/api/v1/users/:id` | Получение пользователя по ID | Private |
| PUT | `/api/v1/users/:id` | Обновление пользователя | Private |
| DELETE | `/api/v1/users/:id` | Удаление пользователя | Private |
| GET | `/api/v1/users/:id/profile` | Получение публичного профиля | Public |
| POST | `/api/v1/users/:id/friends` | Добавление в друзья | Private |
| DELETE | `/api/v1/users/:id/friends` | Удаление из друзей | Private |

### Доски

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|---------|
| GET | `/api/v1/boards` | Получение досок пользователя | Private |
| POST | `/api/v1/boards` | Создание новой доски | Private |
| GET | `/api/v1/boards/:id` | Получение доски по ID | Private |
| PUT | `/api/v1/boards/:id` | Обновление доски | Private |
| DELETE | `/api/v1/boards/:id` | Удаление доски | Private |
| PATCH | `/api/v1/boards/:id/toggle-favorite` | Переключение избранного | Private |
| GET | `/api/v1/boards/:id/statistics` | Статистика доски | Private |
| POST | `/api/v1/boards/:id/members` | Добавление участника | Private |
| DELETE | `/api/v1/boards/:id/members/:memberId` | Удаление участника | Private |

### Задачи

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|---------|
| GET | `/api/v1/tasks` | Получение задач пользователя | Private |
| POST | `/api/v1/tasks` | Создание новой задачи | Private |
| GET | `/api/v1/tasks/:id` | Получение задачи по ID | Private |
| PUT | `/api/v1/tasks/:id` | Обновление задачи | Private |
| DELETE | `/api/v1/tasks/:id` | Удаление задачи | Private |
| PATCH | `/api/v1/tasks/:id/status` | Изменение статуса | Private |
| PATCH | `/api/v1/tasks/:id/assign` | Назначение исполнителя | Private |
| POST | `/api/v1/tasks/:id/comments` | Добавление комментария | Private |
| POST | `/api/v1/tasks/:id/attachments` | Загрузка вложения | Private |

### Команды

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|---------|
| GET | `/api/v1/teams` | Получение команд пользователя | Private |
| POST | `/api/v1/teams` | Создание новой команды | Private |
| GET | `/api/v1/teams/:id` | Получение команды по ID | Private |
| PUT | `/api/v1/teams/:id` | Обновление команды | Private |
| DELETE | `/api/v1/teams/:id` | Удаление команды | Private |
| POST | `/api/v1/teams/:id/members` | Добавление участника | Private |
| DELETE | `/api/v1/teams/:id/members/:memberId` | Удаление участника | Private |

### Статистика

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|---------|
| GET | `/api/v1/statistics/user` | Статистика пользователя | Private |
| GET | `/api/v1/statistics/boards` | Статистика по доскам | Private |
| GET | `/api/v1/statistics/tasks` | Статистика по задачам | Private |
| GET | `/api/v1/statistics/teams` | Статистика по командам | Private |

## 🔐 Аутентификация

### JWT Токены

API использует JWT токены для аутентификации. Включите токен в заголовок `Authorization`:

```
Authorization: Bearer <your-jwt-token>
```

### Получение токена

1. **Регистрация** - `POST /api/v1/auth/register`
2. **Вход** - `POST /api/v1/auth/login-email`

### Обновление токена

Используйте refresh токен для получения нового access токена:

```bash
POST /api/v1/auth/refresh
{
  "refresh_token": "your-refresh-token"
}
```

## 📊 Модели данных

### Пользователь (User)

```javascript
{
  id: ObjectId,
  email: String,           // Уникальный email
  username: String,        // Уникальное имя пользователя
  firstName: String,       // Имя
  lastName: String,        // Фамилия
  middleName: String,      // Отчество
  gender: String,          // Пол
  birthDate: Date,         // Дата рождения
  bio: String,             // Биография
  avatarUrl: String,       // URL аватара
  theme: String,           // Тема (light/dark/auto)
  language: String,        // Язык (en/ru)
  isActive: Boolean,       // Активен ли аккаунт
  isVerified: Boolean,     // Подтвержден ли email
  role: String,            // Роль пользователя
  friends: [ObjectId],     // ID друзей
  teams: [ObjectId],       // ID команд
  createdAt: Date,
  updatedAt: Date
}
```

### Доска (Board)

```javascript
{
  id: ObjectId,
  title: String,           // Название доски
  description: String,     // Описание
  color: String,           // Цвет доски
  ownerId: ObjectId,       // ID владельца
  teamId: ObjectId,        // ID команды (опционально)
  members: [{              // Участники доски
    userId: ObjectId,
    role: String,          // owner/admin/member/viewer/guest
    permissions: Array,
    joinedAt: Number
  }],
  columns: [{              // Колонки доски
    id: String,
    title: String,
    order: Number,
    tasks: [ObjectId],
    settings: Object
  }],
  settings: Object,        // Настройки доски
  statistics: Object,      // Статистика
  isArchived: Boolean,
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Задача (Task)

```javascript
{
  id: ObjectId,
  boardId: ObjectId,       // ID доски
  columnId: String,        // ID колонки
  title: String,           // Название задачи
  description: String,     // Описание
  status: String,          // Статус задачи
  priority: String,        // Приоритет
  type: String,            // Тип задачи
  assigneeId: ObjectId,    // ID исполнителя
  reporterId: ObjectId,    // ID автора
  dueDate: Number,         // Срок выполнения (timestamp)
  tags: Array,             // Теги
  labels: Array,           // Метки
  attachments: Array,      // Вложения
  subtasks: Array,         // Подзадачи
  comments: [ObjectId],    // ID комментариев
  order: Number,           // Порядок в колонке
  createdAt: Date,
  updatedAt: Date
}
```

## 🛡️ Безопасность

### Middleware безопасности

- **Helmet** - Заголовки безопасности
- **CORS** - Настройки Cross-Origin Resource Sharing
- **Rate Limiting** - Ограничение количества запросов
- **Input Validation** - Валидация входных данных
- **JWT Authentication** - Аутентификация по токенам
- **MongoDB Sanitization** - Защита от NoSQL инъекций
- **XSS Protection** - Защита от XSS атак

### Права доступа

- **Owner** - Полный доступ к ресурсу
- **Admin** - Управление ресурсом
- **Member** - Создание и редактирование
- **Viewer** - Только просмотр
- **Guest** - Ограниченный доступ

## 🚀 Производительность

### Кэширование

- **Redis** для кэширования сессий и токенов
- **MongoDB** индексы для оптимизации запросов
- **Compression** для сжатия ответов

### Оптимизация

- **Pagination** для больших списков
- **Population** связанных данных
- **Aggregation** для сложных запросов
- **Connection pooling** для MongoDB

## 📡 Real-time обновления

### Socket.io

Приложение поддерживает real-time обновления через Socket.io:

- Обновления досок в реальном времени
- Уведомления о новых задачах
- Статус онлайн пользователей
- Совместное редактирование

### События

```javascript
// Подключение к доске
socket.emit('join-board', { boardId: 'board-id' });

// Слушание обновлений
socket.on('board-updated', (data) => {
  console.log('Доска обновлена:', data);
});

// Слушание новых задач
socket.on('task-created', (data) => {
  console.log('Новая задача:', data);
});
```

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# Тесты в режиме watch
npm run test:watch

# Покрытие кода
npm run test:coverage
```

### Структура тестов

```
tests/
├── unit/           # Unit тесты
├── integration/    # Integration тесты
├── e2e/           # End-to-end тесты
└── fixtures/      # Тестовые данные
```

## 📝 Логирование

### Уровни логирования

- **error** - Ошибки и исключения
- **warn** - Предупреждения
- **info** - Информационные сообщения
- **debug** - Отладочная информация

### Настройка логов

```javascript
// В .env файле
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## 🐳 Docker

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - redis
  
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

### Запуск с Docker

```bash
# Сборка и запуск
docker-compose up --build

# Только запуск
docker-compose up

# Остановка
docker-compose down
```

## 🔧 Разработка

### Скрипты npm

```bash
# Запуск в development режиме
npm run dev

# Запуск в production режиме
npm start

# Проверка кода
npm run lint

# Исправление ошибок линтера
npm run lint:fix

# Тестирование
npm test
```

### Hot Reload

Приложение автоматически перезагружается при изменении файлов в development режиме благодаря nodemon.

## 📚 Дополнительные ресурсы

### Документация

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Socket.io](https://socket.io/)
- [JWT](https://jwt.io/)
- [Redis](https://redis.io/)

### Полезные ссылки

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/core/data-modeling-introduction/)

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [Issues](https://github.com/your-repo/issues)
2. Создайте новый Issue с описанием проблемы
3. Обратитесь к команде разработки

---

**Toolrole Backend** - Мощный и масштабируемый backend для современных веб-приложений управления задачами.
# backend
