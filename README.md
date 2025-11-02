# ⚔️ Numeric Duel - Browser Game / Числовая Дуэль

## 🌍 Multi-language
- **Primary**: English (default)
- **Secondary**: Russian (selectable in menu)

## 🎮 Concept

**Numeric Duel** - Strategic game with flank mechanics and unit type system.

### Gameplay:
- **Army Selection**: 10 random numbers from 20
- **Unit Types**: ⚔️ Warriors / 🏹 Archers / 🐴 Cavalry (rock-paper-scissors)
- **Flanks**: Left, Center, Right
- **Combat**: Dice determine damage, type advantages modify results
- **Victory**: Destroy all enemy troops!

## 🚀 Запуск

```bash
# С мультиплеером
cd server
npm install
npm start

# Фронтенд
# Просто откройте index.html в браузере
```

## 📁 Structure

```
/
├── index.html       → Main page
├── game.js          → Game logic
├── i18n.js          → Localization (EN/RU)
├── styles.css       → Styles
├── server/          → Socket.io server
└── README.md        → This file
```

## 🎯 Roadmap

- [x] MVP: Game vs AI
- [x] Multiplayer: Online matches
- [x] Rating system and leaderboard
- [x] Multi-language support (EN/RU)
- [ ] Polish: Sounds, achievements
- [ ] Publishing: Itch.io, Kongregate etc.

## 📚 Documentation

- `README_NEW_GAMEPLAY.md` - Gameplay mechanics
- `DEPLOYMENT.md` - Publishing guide
- `PUBLISHING_GUIDE.md` - Detailed publishing guide

## 📝 Лицензия

MIT License
