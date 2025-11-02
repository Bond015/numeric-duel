# 🚀 Быстрый деплой игры

## Шаг 1: Создай GitHub репозиторий

1. Открой https://github.com/new
2. Название репозитория: `numeric-duel` (или любое другое)
3. Сделай его **PUBLIC** или PRIVATE (по твоему выбору)
4. **НЕ** добавляй README, .gitignore или лицензию (уже есть)
5. Нажми "Create repository"

## Шаг 2: Запушь код

В терминале выполни команды (замени `YOUR_USERNAME` на свой GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/numeric-duel.git
git branch -M main
git push -u origin main
```

Если спросит пароль - используй **Personal Access Token** (не обычный пароль!).

## Шаг 3: Деплой фронтенда на Netlify

1. Зайди на https://app.netlify.com
2. Войди через GitHub
3. "Add new site" → "Import an existing project"
4. Выбери репозиторий `numeric-duel`
5. Настройки:
   - Build command: оставь пустым
   - Publish directory: `.` (точка)
6. Нажми "Deploy site"
7. Готово! Получишь URL типа `https://numeric-duel.netlify.app`

## Шаг 4: Деплой сервера на Railway

1. Зайди на https://railway.app
2. Войди через GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Выбери репозиторий `numeric-duel`
5. Настройки:
   - Root Directory: `server`
   - Build Command: `npm install` (автоматически)
   - Start Command: `node app.js`
6. Railway даст тебе URL типа `https://numeric-duel-production.up.railway.app`

## Шаг 5: Обнови game.js

После получения URL сервера, нужно обновить `game.js`:

Найди строку (примерно строка 909):
```javascript
socket = io();
```

Замени на:
```javascript
socket = io('https://твой-railway-url.railway.app');
```

Затем снова запушь на GitHub:
```bash
git add game.js
git commit -m "Update server URL for production"
git push
```

Netlify автоматически перезадеплоит фронтенд!

## Готово! 🎉

Теперь твоя игра работает онлайн:
- Фронтенд: Netlify URL
- Мультиплеер: работает через Railway

## Тестирование

1. Открой фронтенд URL в двух вкладках
2. В обеих нажми "Multiplayer" → "Find Match"
3. Должно найти соперника и начать игру!

