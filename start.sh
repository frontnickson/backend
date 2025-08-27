#!/bin/bash

echo "🚀 Запуск Toolrole Backend..."

# Проверяем, установлен ли Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 18+ и попробуйте снова."
    exit 1
fi

# Проверяем версию Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js 18+. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"

# Проверяем, установлен ли npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен."
    exit 1
fi

echo "✅ npm версия: $(npm -v)"

# Проверяем, существует ли .env файл
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден. Создаю из примера..."
    cp env.example .env
    echo "✅ Файл .env создан. Отредактируйте его с вашими настройками."
    echo "📝 Особое внимание уделите настройкам MongoDB и Redis."
fi

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей."
    exit 1
fi

echo "✅ Зависимости установлены."

# Проверяем, запущена ли MongoDB
echo "🔍 Проверка MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB не установлена локально."
    echo "💡 Рекомендуется использовать Docker: docker-compose up -d mongodb"
else
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB запущена локально."
    else
        echo "⚠️  MongoDB не запущена. Запустите: mongod"
        echo "💡 Или используйте Docker: docker-compose up -d mongodb"
    fi
fi

# Проверяем, запущен ли Redis
echo "🔍 Проверка Redis..."
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis не установлен локально."
    echo "💡 Рекомендуется использовать Docker: docker-compose up -d redis"
else
    if pgrep -x "redis-server" > /dev/null; then
        echo "✅ Redis запущен локально."
    else
        echo "⚠️  Redis не запущен. Запустите: redis-server"
        echo "💡 Или используйте Docker: docker-compose up -d redis"
    fi
fi

echo ""
echo "🎯 Варианты запуска:"
echo "1. 🐳 Docker (рекомендуется): docker-compose up"
echo "2. 🚀 Локально: npm run dev"
echo "3. 🏭 Продакшн: npm start"
echo ""

# Спрашиваем пользователя о предпочтительном способе
read -p "Выберите способ запуска (1/2/3) или нажмите Enter для локального запуска: " choice

case $choice in
    1)
        echo "🐳 Запуск через Docker..."
        if command -v docker-compose &> /dev/null; then
            docker-compose up
        else
            echo "❌ docker-compose не установлен."
            echo "💡 Установите Docker Desktop или docker-compose."
            exit 1
        fi
        ;;
    2|"")
        echo "🚀 Локальный запуск в development режиме..."
        npm run dev
        ;;
    3)
        echo "🏭 Запуск в production режиме..."
        npm start
        ;;
    *)
        echo "❌ Неверный выбор. Запускаю локально..."
        npm run dev
        ;;
esac
