# 🚀 Быстрая шпаргалка Railway Deployment

## 1️⃣ Инициализация Git (если еще не сделано)

```bash
git init
git add .
git commit -m "Initial commit: LumaLab for Railway"
```

## 2️⃣ Подключение к GitHub

```bash
# Если репозиторий уже создан на GitHub:
git remote add origin https://github.com/ashlyanfy/Lumalab.git
git branch -M main
git push -u origin main

# Или если нужно обновить существующий репозиторий:
git push origin main
```

## 3️⃣ Запуск скрипта деплоя

**Windows:**
```bash
deploy-railway.bat
```

**macOS/Linux:**
```bash
./deploy-railway.sh
```

## 4️⃣ Railway CLI (альтернатива веб-интерфейсу)

```bash
# Установка
npm install -g @railway/cli

# Логин
railway login

# Инициализация проекта
railway init

# Деплой
railway up

# Просмотр статуса
railway status

# Просмотр логов
railway logs

# Откатить деплой
railway rollback
```

## 5️⃣ Git команды для обновления

```bash
# Проверить статус
git status

# Добавить все файлы
git add .

# Коммит
git commit -m "ваше сообщение"

# Отправить на GitHub
git push origin main

# Получить последние изменения
git pull origin main
```

## 6️⃣ Быстрый деплой (одна команда после инита)

```bash
git add . && git commit -m "Update" && git push origin main
```

## 🌐 Ссылки

- https://railway.app - главный сайт
- https://docs.railway.app - документация
- https://github.com/ashlyanfy/Lumalab - ваш репозиторий

## ✅ Чек-лист перед деплоем

- [ ] `index.html` - обновлен WhatsApp номер
- [ ] `index.html` - обновлен email (если нужно)
- [ ] `sitemap.xml` - обновлен домен
- [ ] `manifest.webmanifest` - обновлены URLs
- [ ] `railway.json` - есть в проекте
- [ ] `Procfile` - есть в проекте
- [ ] `.gitignore` - есть в проекте
- [ ] `git init` - репозиторий инициализирован
- [ ] `git commit` - все закоммичено
- [ ] `git push` - запушено на GitHub

## 🆘 Помощь

- **Нет Git?** https://git-scm.com/download
- **Нет Node.js?** https://nodejs.org
- **Проблема с Railway?** https://railway.app/support
