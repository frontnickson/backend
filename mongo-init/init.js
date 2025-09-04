// Инициализация базы данных toolrole_db
db = db.getSiblingDB('toolrole_db');

// Создаем коллекцию users
db.createCollection('users');

// Создаем индексы для коллекции users
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "isOnline": 1 });
db.users.createIndex({ "lastSeen": 1 });

// Создаем коллекцию boards
db.createCollection('boards');

// Создаем коллекцию tasks
db.createCollection('tasks');

// Создаем коллекцию teams
db.createCollection('teams');

// Создаем коллекцию notifications
db.createCollection('notifications');

print('✅ База данных toolrole_db инициализирована');
print('✅ Коллекции созданы');
print('✅ Индексы созданы');
