# Numeric Duel / Числовая Дуэль - Game Description

## English Description

### Short Description (for Itch.io, etc.)
**Numeric Duel** - A strategic turn-based game where numbers become troops! Choose your army, position them on three flanks, and fight to the last soldier. With rock-paper-scissors mechanics, random dice rolls, and multiplayer support.

### Full Description

**Numeric Duel** is a unique strategic browser game that combines number-based army selection, tactical flank positioning, and rock-paper-scissors combat mechanics.

#### Core Concept
Each number represents a military unit with a specific troop type (Warriors, Archers, or Cavalry). Numbers 1-20 cycle through these three types in a predictable pattern, creating strategic depth in army composition.

#### Gameplay
1. **Army Selection**: Choose 10 random numbers from 20 - your entire army
2. **Flank Positioning**: Place troops on Left, Center, and Right flanks before each battle
3. **Combat System**: 
   - Each number's value determines dice rolls (0 to 1 per point)
   - Type advantages modify damage: +50% damage with advantage, -50% with weakness
   - Equal types fight with standard damage
4. **Victory**: Destroy all enemy units across all three flanks

#### Features
- **Single Player**: Battle against balanced AI
- **Multiplayer**: Real-time online matches with friends or random opponents
- **Rating System**: Track wins, losses, and rating points (+2 for win, -2 for loss)
- **Leaderboard**: Compete for the top spots
- **Nickname System**: Personalize your profile
- **Multi-language**: English and Russian support

#### Strategic Depth
The true strategy lies in:
- Choosing which numbers to select (balanced vs. high power)
- Positioning troops on flanks (matching or countering enemy types)
- Managing your remaining forces across multiple battles
- Understanding the cyclic type distribution for optimal army building

#### Technical Details
- **Engine**: Pure JavaScript with Socket.io multiplayer
- **Platform**: Browser-based (works on modern browsers)
- **Graphics**: HTML5/CSS3 with smooth animations
- **Network**: Real-time multiplayer via WebSockets

---

## Русское Описание

### Краткое Описание (для Itch.io, VK Play, и т.д.)
**Числовая Дуэль** - Стратегическая пошаговая игра, где числа превращаются в войска! Выбери армию, размести её на трёх флангах и сражайся до последнего солдата. Механика камень-ножницы-бумага, случайные броски кубиков и поддержка мультиплеера.

### Полное Описание

**Числовая Дуэль** - уникальная стратегическая браузерная игра, которая объединяет выбор армии на основе чисел, тактическое позиционирование на флангах и боевую механику камень-ножницы-бумага.

#### Основная Концепция
Каждое число представляет военный отряд с определённым типом войск (Воины, Лучники или Конница). Числа от 1 до 20 циклически повторяют эти три типа в предсказуемой последовательности, создавая стратегическую глубину в формировании армии.

#### Геймплей
1. **Выбор Армии**: Выберите 10 случайных чисел из 20 - вся ваша армия
2. **Позиционирование Флангов**: Разместите войска на Левом, Центре и Правом флангах перед каждой битвой
3. **Боевая Система**:
   - Значение числа определяет броски кубика (0 до 1 за каждое очко)
   - Преимущества типов изменяют урон: +50% урона с преимуществом, -50% со слабостью
   - Равные типы сражаются стандартным уроном
4. **Победа**: Уничтожьте все вражеские отряды на всех трёх флангах

#### Особенности
- **Одиночная Игра**: Битвы со сбалансированным ИИ
- **Мультиплеер**: Онлайн матчи в реальном времени с друзьями или случайными соперниками
- **Система Рейтинга**: Отслеживайте победы, поражения и рейтинговые очки (+2 за победу, -2 за поражение)
- **Лидерборд**: Соревнуйтесь за топовые позиции
- **Система Никнеймов**: Персонализируйте свой профиль
- **Мультиязычность**: Поддержка английского и русского

#### Стратегическая Глубина
Настоящая стратегия заключается в:
- Выборе чисел для армии (баланс против высокой мощи)
- Позиционировании войск на флангах (совпадение или контрирование типов врага)
- Управлении оставшимися силами в нескольких битвах
- Понимании циклического распределения типов для оптимального формирования армии

#### Технические Детали
- **Движок**: Чистый JavaScript с Socket.io для мультиплеера
- **Платформа**: Браузерная (работает на современных браузерах)
- **Графика**: HTML5/CSS3 с плавными анимациями
- **Сеть**: Мультиплеер в реальном времени через WebSockets

---

## Tags / Теги

### English
- strategy
- tactics
- multiplayer
- turn-based
- numbers
- combat
- browser-game
- pvp

### Russian
- стратегия
- тактика
- мультиплеер
- пошаговая
- числа
- бой
- браузерная-игра
- пвп

---

## Screenshot Suggestions / Предложения для Скриншотов

1. **Main Menu** - showing language selector, stats, mini-leaderboard
2. **Flank Setup** - showing three flanks with units positioned
3. **Battle Animation** - showing damage numbers and type advantages
4. **Victory Screen** - with rating increase
5. **Leaderboard** - showing top players

1. **Главное Меню** - селектор языков, статистика, мини-лидерборд
2. **Настройка Флангов** - три фланга с размещёнными юнитами
3. **Анимация Боя** - числа урона и преимущества типов
4. **Экран Победы** - с увеличением рейтинга
5. **Лидерборд** - топ игроков

