const { Pool } = require('pg');

// Подключение к PostgreSQL
// Railway автоматически создает переменные окружения для PostgreSQL
// Используем DATABASE_URL если доступен, иначе используем отдельные переменные
let poolConfig;

if (process.env.DATABASE_URL) {
    // Используем полную строку подключения
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    };
    console.log('📊 Используем DATABASE_URL для подключения к PostgreSQL');
} else if (process.env.PGHOST) {
    // Используем отдельные переменные окружения
    poolConfig = {
        host: process.env.PGHOST,
        port: process.env.PGPORT || 5432,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: process.env.PGHOST !== 'localhost' ? { rejectUnauthorized: false } : false
    };
    console.log('📊 Используем отдельные переменные окружения для подключения к PostgreSQL');
} else {
    // Если нет переменных окружения, выдаем понятную ошибку
    console.error('❌ ОШИБКА: Не найдены переменные окружения для PostgreSQL!');
    console.error('❌ Ожидаются: DATABASE_URL или PGHOST, PGDATABASE, PGUSER, PGPASSWORD');
    console.error('❌ Проверьте настройки Railway:');
    console.error('   1. Убедитесь, что сервис Postgres активен');
    console.error('   2. Убедитесь, что сервис numeric-duel связан с Postgres');
    console.error('   3. Проверьте переменные окружения в настройках сервиса numeric-duel');
    // Создаем пустой pool, чтобы не крашить приложение сразу
    poolConfig = {
        connectionString: 'postgresql://localhost/nonexistent',
        ssl: false
    };
}

const pool = new Pool(poolConfig);

// Обработка ошибок подключения
pool.on('error', (err) => {
    console.error('❌ Неожиданная ошибка на клиенте PostgreSQL:', err);
});

// Инициализация базы данных - создание таблицы если её нет
async function initDatabase() {
    try {
        // Проверяем наличие переменных окружения перед попыткой подключения
        if (!process.env.DATABASE_URL && !process.env.PGHOST) {
            throw new Error('Переменные окружения для PostgreSQL не найдены. Проверьте настройки Railway.');
        }
        
        const query = `
            CREATE TABLE IF NOT EXISTS leaderboard (
                player_id VARCHAR(255) PRIMARY KEY,
                nickname VARCHAR(255) NOT NULL,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                rating INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_rating ON leaderboard(rating DESC);
            CREATE INDEX IF NOT EXISTS idx_updated_at ON leaderboard(updated_at DESC);
        `;
        
        await pool.query(query);
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        console.error('❌ Проверьте:');
        console.error('   1. Сервис Postgres активен в Railway');
        console.error('   2. Переменные окружения установлены (DATABASE_URL или PGHOST, PGDATABASE, etc.)');
        console.error('   3. Сервис numeric-duel имеет доступ к переменным окружения Postgres');
        throw error;
    }
}

// Загрузка всех игроков из базы данных
async function loadLeaderboard() {
    try {
        const result = await pool.query('SELECT * FROM leaderboard ORDER BY rating DESC, wins DESC');
        const players = result.rows.map(row => ({
            playerId: row.player_id,
            nickname: row.nickname,
            wins: row.wins,
            losses: row.losses,
            rating: row.rating
        }));
        
        console.log(`✅ Loaded ${players.length} players from database`);
        return new Map(players.map(p => [p.playerId, p]));
    } catch (error) {
        console.error('❌ Error loading leaderboard from database:', error);
        return new Map(); // Возвращаем пустую Map в случае ошибки
    }
}

// Сохранение или обновление игрока в базе данных
async function savePlayer(player) {
    try {
        const query = `
            INSERT INTO leaderboard (player_id, nickname, wins, losses, rating, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT (player_id)
            DO UPDATE SET
                nickname = EXCLUDED.nickname,
                wins = EXCLUDED.wins,
                losses = EXCLUDED.losses,
                rating = EXCLUDED.rating,
                updated_at = CURRENT_TIMESTAMP
        `;
        
        await pool.query(query, [
            player.playerId,
            player.nickname,
            player.wins,
            player.losses,
            player.rating
        ]);
        
        console.log(`💾 Saved player ${player.nickname} (${player.playerId}) to database`);
    } catch (error) {
        console.error('❌ Error saving player to database:', error);
        throw error;
    }
}

// Получение топ игроков
async function getTopPlayers(limit = 10) {
    try {
        const query = `
            SELECT 
                player_id,
                nickname,
                wins,
                losses,
                rating,
                CASE 
                    WHEN (wins + losses) > 0 
                    THEN CAST(wins AS FLOAT) / (wins + losses)
                    ELSE 0 
                END AS win_rate
            FROM leaderboard
            ORDER BY 
                rating DESC,
                win_rate DESC,
                wins DESC
            LIMIT $1
        `;
        
        const result = await pool.query(query, [limit]);
        
        return result.rows.map(row => ({
            playerId: row.player_id,
            nickname: row.nickname,
            wins: row.wins,
            losses: row.losses,
            rating: row.rating
        }));
    } catch (error) {
        console.error('❌ Error getting top players from database:', error);
        return [];
    }
}

// Получение всех игроков (для полного лидерборда)
async function getAllPlayers() {
    try {
        const query = `
            SELECT 
                player_id,
                nickname,
                wins,
                losses,
                rating,
                CASE 
                    WHEN (wins + losses) > 0 
                    THEN CAST(wins AS FLOAT) / (wins + losses)
                    ELSE 0 
                END AS win_rate
            FROM leaderboard
            ORDER BY 
                rating DESC,
                win_rate DESC,
                wins DESC
        `;
        
        const result = await pool.query(query);
        
        return result.rows.map(row => ({
            playerId: row.player_id,
            nickname: row.nickname,
            wins: row.wins,
            losses: row.losses,
            rating: row.rating
        }));
    } catch (error) {
        console.error('❌ Error getting all players from database:', error);
        return [];
    }
}

// Получение игрока по playerId
async function getPlayer(playerId) {
    try {
        const result = await pool.query('SELECT * FROM leaderboard WHERE player_id = $1', [playerId]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        const row = result.rows[0];
        return {
            playerId: row.player_id,
            nickname: row.nickname,
            wins: row.wins,
            losses: row.losses,
            rating: row.rating
        };
    } catch (error) {
        console.error('❌ Error getting player from database:', error);
        return null;
    }
}

// Закрытие соединения (для graceful shutdown)
async function closeConnection() {
    try {
        await pool.end();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
}

module.exports = {
    initDatabase,
    loadLeaderboard,
    savePlayer,
    getTopPlayers,
    getAllPlayers,
    getPlayer,
    closeConnection,
    pool // Экспортируем pool для прямых запросов, если нужно
};
