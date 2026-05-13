#!/bin/bash

# LumaLab Railway Deployment Script
# Скрипт для отправки кода на GitHub и настройки Railway

set -e

echo "🚀 LumaLab Railway Deployment Script"
echo "=================================="
echo ""

# Проверка git
if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен. Установите Git и попробуйте снова."
    exit 1
fi

# Инициализация git репозитория
if [ ! -d .git ]; then
    echo "📦 Инициализация Git репозитория..."
    git init
    git add .
    git commit -m "Initial commit: LumaLab static site ready for Railway"
    echo "✅ Git репозиторий инициализирован"
else
    echo "✅ Git репозиторий уже существует"
    git add .
    git commit -m "Update: Railway configuration and deployment setup" || echo "⚠️ Нет изменений для коммита"
fi

echo ""
echo "📝 Инструкции для деплоя на Railway:"
echo "======================================"
echo ""
echo "1️⃣  Перейдите на https://railway.app"
echo "2️⃣  Войдите или зарегистрируйтесь"
echo ""
echo "3️⃣  Вариант A - Через GitHub (рекомендуется):"
echo "   - Нажмите 'Create a new project'"
echo "   - Выберите 'Deploy from GitHub repo'"
echo "   - Подключите GitHub и выберите репозиторий 'Lumalab'"
echo "   - Railway автоматически обнаружит railway.json и настроит деплой"
echo ""
echo "4️⃣  Вариант B - Через Railway CLI:"
echo "   - Установите Railway CLI: npm i -g @railway/cli"
echo "   - Выполните: railway login"
echo "   - Выполните: railway init"
echo "   - Выполните: railway up"
echo ""
echo "5️⃣  После деплоя:"
echo "   - Railway выдаст вам URL вашего приложения"
echo "   - Обновите DNS или используйте Railway domain"
echo ""
echo "📝 Перед финальным деплоем проверьте:"
echo "   ✓ Номер WhatsApp в index.html (строка ~150)"
echo "   ✓ Email hello@lumalab.ai если нужен другой"
echo "   ✓ sitemap.xml с правильным доменом"
echo "   ✓ Переменные окружения в Railway (если нужны)"
echo ""
echo "🔗 Важные ссылки:"
echo "   - Railway Docs: https://docs.railway.app"
echo "   - GitHub репозиторий: https://github.com/ashlyanfy/Lumalab"
echo ""
echo "✅ Подготовка завершена!"
