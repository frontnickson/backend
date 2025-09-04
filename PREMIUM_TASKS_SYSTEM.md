# 🎯 СИСТЕМА ПРЕМИУМ ЗАДАЧ

Полноценная система автоматического назначения задач для премиум пользователей с выбором профессий.

## 🚀 Возможности

### Для пользователей:
- **Выбор профессии** - пользователь может выбрать профессию для изучения
- **Автоматические задачи** - 3-10 задач в день в зависимости от подписки
- **Настройка сложности** - выбор уровня сложности задач
- **Фильтрация по категориям** - выбор интересующих категорий
- **Статистика выполнения** - отслеживание прогресса и серий

### Для системы:
- **Планировщик задач** - автоматическое назначение в 9:00 каждый день
- **Проверка завершенных** - проверка каждый час
- **Интеграция с досками** - задачи создаются в колонках Kanban
- **Гибкие настройки** - разные лимиты для разных подписок

## 📋 Типы подписок

| Тип | Лимит задач/день | Функции |
|-----|------------------|---------|
| **Free** | 0 | Базовые функции |
| **Premium** | 3 | Неограниченные задачи, премиум задачи |
| **Pro** | 5 | + Приоритетная поддержка, аналитика |
| **Enterprise** | 10 | + Кастомные профессии |

## 🛠️ Установка и запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Создайте файл `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/toolrole
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 3. Запуск MongoDB
```bash
# Через Docker
docker-compose up -d mongodb

# Или локально
mongod
```

### 4. Заполнение базы данных
```bash
# Создание профессий и задач
node seed-professions.js

# Создание тестовых пользователей
node create-test-premium-user.js
```

### 5. Запуск сервера
```bash
npm run dev
```

## 🧪 Тестирование

### Тестовые пользователи

| Email | Пароль | Подписка | Лимит задач |
|-------|--------|----------|-------------|
| `premium@test.com` | `premium123` | Premium | 3/день |
| `pro@test.com` | `pro123` | Pro | 5/день |
| `enterprise@test.com` | `enterprise123` | Enterprise | 10/день |
| `free@test.com` | `free123` | Free | 0/день |

### API Endpoints

#### Подписки
- `GET /api/v1/subscriptions/my-subscription` - Получить подписку
- `POST /api/v1/subscriptions/upgrade` - Обновить подписку
- `POST /api/v1/subscriptions/select-profession` - Выбрать профессию
- `PUT /api/v1/subscriptions/task-settings` - Настроить задачи
- `GET /api/v1/subscriptions/task-stats` - Статистика задач

#### Профессии
- `GET /api/v1/professions` - Список профессий
- `GET /api/v1/professions/:slug` - Профессия по slug
- `GET /api/v1/professions/:slug/tasks` - Задачи профессии

#### Админ панель
- `POST /api/v1/admin/assign-tasks-now` - Назначить задачи сейчас
- `POST /api/v1/admin/check-completed-tasks-now` - Проверить завершенные
- `GET /api/v1/admin/scheduler-status` - Статус планировщиков
- `GET /api/v1/admin/premium-users-stats` - Статистика премиум пользователей

### Демонстрация системы
```bash
# Показать всю систему
node test-premium-system.js
```

## 🔄 Логика работы

### 1. Выбор профессии
```javascript
POST /api/v1/subscriptions/select-profession
{
  "professionSlug": "graphic-designer"
}
```

### 2. Настройка задач
```javascript
PUT /api/v1/subscriptions/task-settings
{
  "dailyTaskLimit": 3,
  "taskDifficulty": "beginner",
  "taskCategories": ["social_media", "print_design"]
}
```

### 3. Автоматическое назначение
- **Время**: каждый день в 9:00
- **Условия**: премиум подписка + выбранная профессия + лимит > 0
- **Результат**: задачи создаются в колонке "К выполнению"

### 4. Проверка завершенных
- **Время**: каждый час
- **Действие**: обновление статистики + назначение новых задач

## 📊 Структура данных

### Модель User (новые поля)
```javascript
subscription: {
  type: 'premium', // free, premium, pro, enterprise
  status: 'active', // active, inactive, cancelled, expired
  startDate: Date,
  endDate: Date,
  features: ['unlimited_tasks', 'premium_tasks']
},
selectedProfession: {
  professionId: ObjectId,
  professionSlug: String,
  isActive: Boolean
},
taskSettings: {
  dailyTaskLimit: Number, // 0-10
  taskDifficulty: String, // beginner, intermediate, advanced, expert, all
  taskCategories: [String],
  completedTasksCount: Number,
  streakDays: Number
}
```

### Модель Task (новые поля)
```javascript
customFields: {
  professionTaskId: ObjectId,
  professionSlug: String,
  taskCategory: String,
  taskDifficulty: String,
  isAutoAssigned: Boolean,
  assignedAt: Date
}
```

## 🎨 Примеры задач

### Социальные сети
- **Самокат**: 4 креатива Instagram Stories (1080x1080)
- **TechFlow**: обложка Telegram-канала
- **IT-сообщество**: пост ВКонтакте ко Дню программиста

### Печатная продукция
- **Архитектурное бюро**: визитки (90x50мм)
- **Медицинская клиника**: буклет 6 страниц

### Веб-дизайн
- **CodeMaster**: лендинг для курсов программирования

### Брендинг
- **Кофейня**: логотип с элементами кофе

## 🔧 Настройка планировщика

### Изменение времени назначения
В файле `src/services/schedulerService.js`:
```javascript
// Назначение задач каждый день в 9:00
cron.schedule('0 9 * * *', ...)

// Назначение задач каждый день в 10:30
cron.schedule('30 10 * * *', ...)
```

### Отключение планировщика
В файле `src/app.js`:
```javascript
// Закомментируйте эту строку
// schedulerService.start();
```

## 🚨 Важные моменты

1. **MongoDB обязательна** - система не работает без базы данных
2. **Планировщик запускается автоматически** при старте сервера
3. **Задачи назначаются только премиум пользователям** с выбранной профессией
4. **Доски создаются автоматически** при первом назначении задач
5. **Статистика обновляется** при завершении задач

## 📈 Мониторинг

### Логи планировщика
```
🕘 9:00 - Начинаем назначение задач премиум пользователям
✅ Пользователю premium_user назначено 3 задач
🎉 Назначение завершено: 9 задач назначено
```

### Статистика через API
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/admin/premium-users-stats
```

## 🎯 Готово к использованию!

Система полностью функциональна и готова к интеграции с фронтендом. Все API endpoints работают, планировщик запущен, тестовые пользователи созданы.

**Следующие шаги:**
1. Интегрировать с фронтендом
2. Добавить UI для выбора профессий
3. Создать дашборд для отслеживания прогресса
4. Добавить уведомления о новых задачах
