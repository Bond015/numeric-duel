const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Типы войск
const UNIT_TYPES = {
    WARRIOR: 'warrior',
    ARCHER: 'archer',
    CAVALRY: 'cavalry'
};

const TYPE_ADVANTAGES = {
    [UNIT_TYPES.WARRIOR]: UNIT_TYPES.CAVALRY,
    [UNIT_TYPES.ARCHER]: UNIT_TYPES.WARRIOR,
    [UNIT_TYPES.CAVALRY]: UNIT_TYPES.ARCHER
};

const TYPE_DISTRIBUTION = Array(20).fill(0).map((_, i) => {
    const pattern = [UNIT_TYPES.WARRIOR, UNIT_TYPES.ARCHER, UNIT_TYPES.CAVALRY];
    return pattern[i % 3];
});

// Игровые комнаты
const rooms = new Map();

// Счетчик уникальных ID для юнитов
let globalUnitIdCounter = 0;

// Глобальный лидерборд (в памяти, для демо)
const globalLeaderboard = new Map();

// Функции игры
function getUnitType(num) {
    const index = (num - 1) % 20;
    return TYPE_DISTRIBUTION[index] || UNIT_TYPES.WARRIOR;
}

function calculateDamage(unit, enemyUnit) {
    // Бросаем кубик N раз (N = значение числа)
    const rolls = Array.from({ length: unit.value }, () => Math.random());
    const baseDamage = rolls.reduce((sum, roll) => sum + roll, 0);
    
    // Модификатор типа (используем сохраненный тип из unit)
    const yourType = unit.type || getUnitType(unit.value);
    const enemyType = enemyUnit.type || getUnitType(enemyUnit.value);
    
    let modifier = 1.0;
    if (TYPE_ADVANTAGES[yourType] === enemyType) {
        modifier = 1.5; // Преимущество
    } else if (TYPE_ADVANTAGES[enemyType] === yourType) {
        modifier = 0.5; // Недостаток
    }
    
    const finalDamage = Math.floor(baseDamage * modifier);
    // Если урон больше 0, но Math.floor сделал его 0 - ставим минимум 1
    if (baseDamage * modifier > 0 && finalDamage === 0) {
        return 1;
    }
    return finalDamage;
}

function fightFlanks(yourFlanks, enemyFlanks) {
    const results = [];
    
    // Левый vs Левый, Центр vs Центр, Правый vs Правый
    for (let i = 0; i < 3; i++) {
        const yourUnit = yourFlanks[i];
        const enemyUnit = enemyFlanks[i];
        
        if (!yourUnit && !enemyUnit) continue;
        
        if (yourUnit && enemyUnit) {
            // Оба есть - бой
            const yourDamage = calculateDamage(yourUnit, enemyUnit);
            const enemyDamage = calculateDamage(enemyUnit, yourUnit);
            
            const yourRemainder = Math.max(0, yourUnit.value - enemyDamage);
            const enemyRemainder = Math.max(0, enemyUnit.value - yourDamage);
            
            
            results.push({
                flankIndex: i,
                yourFlankIndex: i,
                enemyFlankIndex: i,
                yourDamage: yourDamage,
                enemyDamage: enemyDamage,
                yourValue: yourUnit.value,
                enemyValue: enemyUnit.value,
                finalYourDamage: yourDamage,
                finalEnemyDamage: enemyDamage,
                yourRemainder: yourRemainder,
                enemyRemainder: enemyRemainder,
                yourUnit: { id: yourUnit.id, value: yourRemainder, type: yourUnit.type },
                enemyUnit: { id: enemyUnit.id, value: enemyRemainder, type: enemyUnit.type }
            });
        } else if (yourUnit) {
            // Только ваш - остается
            results.push({
                flankIndex: i,
                yourFlankIndex: i,
                enemyFlankIndex: i,
                yourDamage: 0,
                enemyDamage: 0,
                yourValue: yourUnit.value,
                enemyValue: 0,
                finalYourDamage: 0,
                finalEnemyDamage: 0,
                yourRemainder: yourUnit.value,
                enemyRemainder: 0,
                yourUnit: { id: yourUnit.id, value: yourUnit.value, type: yourUnit.type },
                enemyUnit: null
            });
        } else if (enemyUnit) {
            // Только вражеский - остается
            results.push({
                flankIndex: i,
                yourFlankIndex: i,
                enemyFlankIndex: i,
                yourDamage: 0,
                enemyDamage: 0,
                yourValue: 0,
                enemyValue: enemyUnit.value,
                finalYourDamage: 0,
                finalEnemyDamage: 0,
                yourRemainder: 0,
                enemyRemainder: enemyUnit.value,
                yourUnit: null,
                enemyUnit: { id: enemyUnit.id, value: enemyUnit.value, type: enemyUnit.type }
            });
        }
    }
    
    return results;
}

// Обработка подключений
io.on('connection', (socket) => {
    console.log(`Пользователь подключился: ${socket.id}`);
    
    // Проверка занятости никнейма (теперь проверяем только другим playerId)
    socket.on('check-nickname', (data) => {
        let isTaken = false;
        for (let [playerId, player] of globalLeaderboard.entries()) {
            if (player.nickname === data.nickname && playerId !== data.playerId) {
                isTaken = true;
                break;
            }
        }
        socket.emit('nickname-check-result', { nickname: data.nickname, isTaken: isTaken });
    });

    // Создание комнаты
    socket.on('create-room', (data) => {
        const roomId = generateRoomId();
        rooms.set(roomId, {
            players: [{
                id: socket.id,
                playerId: data.playerId || socket.id,
                name: data.name || 'Player 1',
                numbers: [],
                flanks: [null, null, null],
                ready: false
            }],
            turnNumber: 1,
            gameState: 'waiting',
            availableNumbers: []
        });
        
        socket.join(roomId);
        socket.emit('room-created', { roomId, playerIndex: 0 });
        console.log(`Комната создана: ${roomId}`);
    });

    // Присоединение к комнате
    socket.on('join-room', (data) => {
        const roomId = data.roomId;
        const room = rooms.get(roomId);
        
        if (!room) {
            socket.emit('error', 'Комната не найдена');
            return;
        }
        
        if (room.players.length >= 2) {
            socket.emit('error', 'Комната заполнена');
            return;
        }
        
        room.players.push({
            id: socket.id,
            playerId: data.playerId || socket.id,
            name: data.name || 'Player 2',
            numbers: [],
            flanks: [null, null, null],
            ready: false
        });
        
        socket.join(roomId);
        socket.emit('joined-room', { roomId, playerIndex: 1 });
        
        // Уведомить всех в комнате
        io.to(roomId).emit('room-updated', {
            players: room.players.length,
            gameState: room.gameState
        });
        
        console.log(`Пользователь ${socket.id} присоединился к комнате ${roomId}`);
        
        // Если 2 игрока - начинаем игру
        if (room.players.length === 2) {
            startGame(roomId, room);
        }
    });

    // Быстрый матч (поиск и подключение к свободной комнате)
    socket.on('find-match', (data) => {
        // Ищем комнату с одним игроком
        let foundRoom = null;
        for (let [roomId, room] of rooms.entries()) {
            if (room.players.length === 1 && room.gameState === 'waiting') {
                foundRoom = room;
                foundRoom.players.push({
                    id: socket.id,
                    playerId: data.playerId || socket.id,
                    name: data.name || 'Player 2',
                    numbers: [],
                    flanks: [null, null, null],
                    ready: false
                });
                
                socket.join(roomId);
                socket.emit('match-found', { roomId, playerIndex: 1 });
                
                // Уведомить всех в комнате
                io.to(roomId).emit('room-updated', {
                    players: foundRoom.players.length,
                    gameState: foundRoom.gameState
                });
                
                console.log(`Игрок ${socket.id} подключился к матчу ${roomId}`);
                
                // Начинаем игру
                startGame(roomId, foundRoom);
                return;
            }
        }
        
        // Не нашли - создаем новую комнату
        const roomId = generateRoomId();
        rooms.set(roomId, {
            players: [{
                id: socket.id,
                playerId: data.playerId || socket.id,
                name: data.name || 'Player 1',
                numbers: [],
                flanks: [null, null, null],
                ready: false
            }],
            turnNumber: 1,
            gameState: 'waiting',
            availableNumbers: []
        });
        
        socket.join(roomId);
        socket.emit('match-found', { roomId, playerIndex: 0 });
        console.log(`Создана новая комната для матча: ${roomId}`);
    });

    // Отправка выбранных чисел
    socket.on('submit-numbers', (data) => {
        const room = rooms.get(data.roomId);
        if (!room) return;
        
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.numbers = data.numbers;
            player.ready = true;
        }
        
        // Проверка готовности всех игроков
        const allReady = room.players.every(p => p.ready);
        
        if (allReady && room.players.length === 2) {
            // Все готовы - переходим к расстановке флангов
            room.gameState = 'placing-flanks';
            io.to(data.roomId).emit('start-placing', {
                turnNumber: room.turnNumber
            });
        }
    });

    // Отправка расставленных флангов
    socket.on('submit-flanks', (data) => {
        const room = rooms.get(data.roomId);
        if (!room) return;
        
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            // Преобразуем переданные фланги в ссылки на реальные объекты из player.numbers
            player.flanks = data.flanks.map(flankUnit => {
                if (!flankUnit) return null;
                // Находим реальный юнит в numbers по ID
                const realUnit = player.numbers.find(u => u.id === flankUnit.id);
                return realUnit || flankUnit;
            });
            player.flanksReady = true;
        }
        
        // Проверка готовности всех игроков
        const allReady = room.players.every(p => p.flanksReady);
        
        if (allReady && room.players.length === 2) {
            // Все готовы - сначала показываем расстановку флангов, потом бой!
            showBattlePreparation(data.roomId, room);
        }
    });

    // Отключение
    socket.on('disconnect', () => {
        console.log(`Пользователь отключился: ${socket.id}`);
        
        rooms.forEach((room, roomId) => {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                
                if (room.players.length === 0) {
                    rooms.delete(roomId);
                } else {
                    io.to(roomId).emit('player-disconnected');
                }
            }
        });
    });

    // Запрос глобального лидерборда
    socket.on('get-global-leaderboard', () => {
        const topPlayers = getTopPlayers(10);
        socket.emit('global-leaderboard', topPlayers);
    });
    
    // Глобальный чат
    socket.on('chat-message', (data) => {
        // Broadcast to all connected clients
        io.emit('chat-message', data);
    });
});

function startGame(roomId, room) {
    // Генерируем сбалансированные армии для обоих игроков
    const armies = generateBalancedArmies();
    room.availableNumbers = armies.player1; // Для совместимости, не используется
    
    // Генерируем армии для обоих игроков
    const player1Numbers = armies.player1;
    const player2Numbers = armies.player2;
    
    room.players[0].numbers = player1Numbers.map(num => ({
        id: globalUnitIdCounter++,
        value: num,
        type: getUnitType(num),
        placed: false
    }));
    
    room.players[1].numbers = player2Numbers.map(num => ({
        id: globalUnitIdCounter++,
        value: num,
        type: getUnitType(num),
        placed: false
    }));
    
    room.gameState = 'placing';
    // Сразу начинаем расстановку флангов без выбора чисел
    // Отправляем каждому игроку его армию
    room.players.forEach((player, index) => {
        const enemyPlayer = room.players[1 - index]; // Противоположный игрок
        io.to(player.id).emit('start-placing', {
            turnNumber: room.turnNumber,
            yourArmy: player.numbers,
            yourNickname: player.name,
            enemyNickname: enemyPlayer.name
        });
    });
}

function showBattlePreparation(roomId, room) {
    const player1 = room.players[0];
    const player2 = room.players[1];
    
    // Отправляем каждому игроку его фланги и фланги врага
    io.to(player1.id).emit('battle-preparation', {
        yourFlanks: player1.flanks,
        enemyFlanks: player2.flanks
    });
    
    io.to(player2.id).emit('battle-preparation', {
        yourFlanks: player2.flanks,
        enemyFlanks: player1.flanks
    });
    
    // Через 2 секунды начинаем бой
    setTimeout(() => {
        performBattle(roomId, room);
    }, 2000);
}

function performBattle(roomId, room) {
    const player1 = room.players[0];
    const player2 = room.players[1];
    
    // Бой
    const results = fightFlanks(player1.flanks, player2.flanks);
    
    // Обновляем армии после боя
    results.forEach(result => {
        if (result.yourUnit && result.yourRemainder > 0) {
            // Обновляем отряд игрока 1
            const unit = player1.numbers.find(u => u.id === result.yourUnit.id);
            if (unit) {
                unit.value = result.yourRemainder;
            }
        } else if (result.yourUnit) {
            // Уничтожен
            player1.numbers = player1.numbers.filter(u => u.id !== result.yourUnit.id);
        }
        
        if (result.enemyUnit && result.enemyRemainder > 0) {
            // Обновляем отряд игрока 2
            const unit = player2.numbers.find(u => u.id === result.enemyUnit.id);
            if (unit) {
                unit.value = result.enemyRemainder;
            }
        } else if (result.enemyUnit) {
            // Уничтожен
            player2.numbers = player2.numbers.filter(u => u.id !== result.enemyUnit.id);
        }
    });
    
    // Отправляем результаты
    
    io.to(roomId).emit('battle-results', {
        results: results,
        player1Numbers: player1.numbers,
        player2Numbers: player2.numbers
    });
    
    // Проверка победы
    if (player1.numbers.length === 0) {
        room.gameState = 'finished';
        updateGlobalLeaderboard(player2.playerId, player2.name, true);
        updateGlobalLeaderboard(player1.playerId, player1.name, false);
        io.to(roomId).emit('game-over', { winner: player2.id, winnerName: player2.name });
        return;
    }
    
    if (player2.numbers.length === 0) {
        room.gameState = 'finished';
        updateGlobalLeaderboard(player1.playerId, player1.name, true);
        updateGlobalLeaderboard(player2.playerId, player2.name, false);
        io.to(roomId).emit('game-over', { winner: player1.id, winnerName: player1.name });
        return;
    }
    
    // Следующий ход
    room.turnNumber++;
    
    // Сбрасываем фланги и флаги готовности
    player1.flanks = [null, null, null];
    player2.flanks = [null, null, null];
    player1.flanksReady = false;
    player2.flanksReady = false;
    
    // Продолжаем игру (ждем пока анимация на клиенте закончится)
    setTimeout(() => {
        room.players.forEach((player, index) => {
            const enemyPlayer = room.players[1 - index]; // Противоположный игрок
            io.to(player.id).emit('start-placing', {
                turnNumber: room.turnNumber,
                yourArmy: player.numbers,
                yourNickname: player.name,
                enemyNickname: enemyPlayer.name
            });
        });
    }, 10000);
}

function generateRandomNumbers(count, max) {
    const numbers = [];
    const used = new Set();
    
    while (numbers.length < count) {
        const num = Math.floor(Math.random() * max) + 1;
        if (!used.has(num)) {
            numbers.push(num);
            used.add(num);
        }
    }
    
    return numbers.sort((a, b) => a - b);
}

// Генерация сбалансированной армии для мультиплеера
function generateBalancedArmies() {
    // Генерируем первую армию случайным образом
    const player1Numbers = generateRandomNumbers(10, 20);
    const player1Power = player1Numbers.reduce((sum, num) => sum + num, 0);
    
    // Генерируем случайные числа
    const allNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
    const shuffled = [...allNumbers].sort(() => Math.random() - 0.5);
    
    // Подбираем комбинацию чисел с близкой суммарной силой
    let bestCombination = [];
    let bestDiff = Infinity;
    
    // Пробуем несколько случайных комбинаций
    for (let attempt = 0; attempt < 100; attempt++) {
        const combo = generateComboAttempt(shuffled, 10);
        const comboPower = combo.reduce((sum, num) => sum + num, 0);
        const diff = Math.abs(comboPower - player1Power);
        
        if (diff < bestDiff) {
            bestDiff = diff;
            bestCombination = combo;
            
            // Если разница очень мала, можно остановиться
            if (diff <= 2) break;
        }
    }
    
    return {
        player1: player1Numbers,
        player2: bestCombination.sort((a, b) => a - b)
    };
}

// Генерация одной попытки комбинации
function generateComboAttempt(numbers, size) {
    const combo = [];
    const used = new Set();
    
    for (let i = 0; i < size; i++) {
        let attempts = 0;
        while (attempts < 50) {
            const idx = Math.floor(Math.random() * numbers.length);
            const num = numbers[idx];
            if (!used.has(num)) {
                combo.push(num);
                used.add(num);
                break;
            }
            attempts++;
        }
    }
    
    return combo;
}

function generateRoomId() {
    return Math.random().toString(36).substr(2, 9);
}

// Обновление глобального лидерборда
function updateGlobalLeaderboard(playerId, nickname, won) {
    if (!playerId || !nickname) return;
    
    const player = globalLeaderboard.get(playerId) || { playerId, nickname, wins: 0, losses: 0, rating: 0 };
    
    if (won) {
        player.wins++;
        player.rating = Math.max(0, player.rating + 2);
    } else {
        player.losses++;
        player.rating = Math.max(0, player.rating - 2);
    }
    
    // Обновляем никнейм на случай изменения
    player.nickname = nickname;
    
    globalLeaderboard.set(playerId, player);
}

// Получить топ игроков
function getTopPlayers(limit = 10) {
    const players = Array.from(globalLeaderboard.values());
    
    players.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        const aWR = (a.wins + a.losses) > 0 ? a.wins / (a.wins + a.losses) : 0;
        const bWR = (b.wins + b.losses) > 0 ? b.wins / (b.wins + b.losses) : 0;
        if (bWR !== aWR) return bWR - aWR;
        return b.wins - a.wins;
    });
    
    return players.slice(0, limit);
}

// Запуск сервера
server.listen(PORT, () => {
    console.log(`🎮 Числовая Дуэль - Сервер запущен на порту ${PORT}`);
    console.log(`🌐 Откройте http://localhost:${PORT} в браузере`);
});

// Обработка ошибок
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});
