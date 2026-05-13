# 🚀 Railway Deployment Guide для LumaLab

## Что было подготовлено для деплоя:

✅ `railway.json` - конфигурация Railway  
✅ `Procfile` - инструкции для запуска приложения  
✅ `.railwayapp.json` - альтернативная конфигурация  
✅ `.gitignore` - исключение файлов из git  
✅ `deploy-railway.sh` / `deploy-railway.bat` - скрипты деплоя  

---

## 📋 Пошаговая инструкция:

### Шаг 1️⃣: Подготовка локального репозитория

**Для Windows (откройте PowerShell или Command Prompt):**
```bash
cd c:\Users\tarih\Downloads\lumalab_netlify_ready_logo_cases
deploy-railway.bat
```

**Для macOS/Linux:**
```bash
cd ~/Downloads/lumalab_netlify_ready_logo_cases
chmod +x deploy-railway.sh
./deploy-railway.sh
```

**Или вручную:**
```bash
git init
git add .
git commit -m "Initial commit: LumaLab static site ready for Railway"
```

---

### Шаг 2️⃣: Отправить код на GitHub

#### Вариант A: Если репозиторий уже есть на GitHub

```bash
git remote add origin https://github.com/ashlyanfy/Lumalab.git
git branch -M main
git push -u origin main
```

#### Вариант B: Создать новый репозиторий на GitHub

1. Зайдите на https://github.com/new
2. Создайте репозиторий `Lumalab`
3. Выполните команды (GitHub покажет правильно для вашего репозитория):
```bash
git remote add origin https://github.com/YOUR_USERNAME/Lumalab.git
git branch -M main
git push -u origin main
```

---

### Шаг 3️⃣: Настроить Railway (3 варианта)

#### ✨ Вариант 1: Railway + GitHub (РЕКОМЕНДУЕТСЯ) ⭐

1. Перейдите на https://railway.app
2. Нажмите **"Create a new project"**
3. Выберите **"Deploy from GitHub repo"**
4. Авторизуйте GitHub
5. Выберите репозиторий **`ashlyanfy/Lumalab`**
6. Railway автоматически:
   - Обнаружит `railway.json`
   - Настроит переменные окружения
   - Запустит деплой
7. Получите URL вашего приложения

---

#### 🔧 Вариант 2: Railway CLI

Установите Railway CLI:
```bash
npm install -g @railway/cli
```

Или скачайте с https://docs.railway.app/guides/cli

Затем:
```bash
railway login
cd ~/Downloads/lumalab_netlify_ready_logo_cases
railway init
railway up
```

---

#### 🐳 Вариант 3: Через Docker (опционально)

Если хотите использовать Docker, создайте `Dockerfile`:

```dockerfile
FROM python:3.11-alpine

WORKDIR /app
COPY . .

EXPOSE 8080

CMD ["python", "-m", "http.server", "8080"]
```

Затем в Railway выберите Deploy from Git и он обнаружит Dockerfile.

---

## 🔐 Важные моменты перед деплоем:

### 1. Проверить контакты в коде

**В файле `index.html` найдите и измените:**

```html
<!-- Найти (строка примерно ~150) -->
<a href="https://wa.me/77000000000">WhatsApp</a>

<!-- Изменить на ваш номер -->
<a href="https://wa.me/YOUR_PHONE_NUMBER">WhatsApp</a>
```

### 2. Email (если нужно изменить)

```html
<!-- hello@lumalab.ai на ваш email -->
<a href="mailto:your@email.com">your@email.com</a>
```

### 3. Sitemap.xml

Обновите домен в `sitemap.xml`:
```xml
<url>
  <loc>https://YOUR_DOMAIN.com/</loc>
</url>
```

### 4. PWA Manifest

Обновите `manifest.webmanifest`:
```json
{
  "name": "LumaLab",
  "start_url": "https://YOUR_DOMAIN.com/",
  "scope": "https://YOUR_DOMAIN.com/"
}
```

---

## 📊 Переменные окружения (если нужны)

В Railway Dashboard → Variables добавьте переменные:

```env
NODE_ENV=production
PORT=8080
```

---

## 🌐 Настройка домена

### Использовать Railway домен:
- Railway предоставит автоматический домен: `your-app.railway.app`
- Его можно использовать сразу

### Подключить собственный домен:
1. В Railway Dashboard → Project → Settings
2. Найдите "Domains"
3. Добавьте свой домен
4. Скопируйте значения для DNS A и CNAME
5. Добавьте в DNS вашего хостинга домена

---

## ✅ Проверка после деплоя

1. Откройте URL приложения из Railway Dashboard
2. Проверьте:
   - ✓ Все файлы загружаются корректно
   - ✓ Стили CSS применяются
   - ✓ JavaScript работает
   - ✓ Изображения отображаются
   - ✓ PWA работает (если нужно)
   - ✓ Service Worker активен

---

## 🐛 Помощь при ошибках

### Ошибка: "Port already in use"
Измените `Procfile`:
```
web: python -m http.server $PORT --bind 0.0.0.0
```

### Ошибка: "Build failed"
- Проверьте `railway.json`
- Убедитесь что все файлы на месте
- Посмотрите логи в Railway Dashboard

### Ошибка: "Static files not found"
Railway должен найти все файлы автоматически в корневой папке.

---

## 🔗 Полезные ссылки

- **Railway Docs:** https://docs.railway.app
- **Railway Pricing:** https://railway.app/pricing
- **GitHub:** https://github.com/ashlyanfy/Lumalab
- **Railway Status:** https://status.railway.app

---

## 💡 Советы

1. **Используйте git for все изменения** - так легче откатывать
2. **Коммитьте часто** - маленькие коммиты удобнее отслеживать
3. **Проверьте все перед пушем** - используйте `git diff`
4. **Мониторьте логи** - в Railway очень удобная система логов

---

## 🎯 Быстрый старт (TL;DR)

```bash
# 1. Перейти в папку проекта
cd c:\Users\tarih\Downloads\lumalab_netlify_ready_logo_cases

# 2. Git инициализация
git init
git add .
git commit -m "LumaLab ready for Railway"

# 3. Подключить GitHub (если еще не подключен)
git remote add origin https://github.com/ashlyanfy/Lumalab.git
git push -u origin main

# 4. Зайти на https://railway.app
# 5. "Deploy from GitHub" → выбрать Lumalab репо
# 6. Готово! 🚀
```

---

**Вопросы или проблемы?** Проверьте Railway Docs или напишите в их support чат.

**Успешного деплоя! 🎉**
