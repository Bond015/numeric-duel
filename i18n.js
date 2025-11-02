// System localization for Numeric Duel
// Main language: English, secondary: Russian

const i18n = {
    currentLang: localStorage.getItem('gameLanguage') || 'en',
    
    translations: {
        ru: {
            // Menu screen
            gameTitle: '⚔️ ЧИСЛОВАЯ ДУЭЛЬ',
            gameSubtitle: 'До последнего солдата!',
            nicknamePlaceholder: 'Введите ваш никнейм',
            startGameBtn: 'Начать игру (vs AI)',
            multiplayerBtn: 'Мультиплеер',
            leaderboardBtn: 'Лидерборд',
            rulesBtn: 'Правила',
            wins: 'Побед:',
            losses: 'Поражений:',
            topPlayers: '🏆 ТОП ИГРОКОВ',
            
            // Selection screen
            selectTroops: 'Выберите войска',
            selectTroopsHint: 'Выберите числа для вашей армии. Каждое число - отряд с типом войск',
            yourArmy: 'Ваша армия:',
            deselectHint: 'Кликните по числу еще раз, чтобы убрать его',
            toBattle: 'В бой!',
            
            // Flank setup
            turn: 'Ход',
            setupFlanks: 'Расставьте войска на фланги',
            yourTroops: 'Ваши войска',
            enemyTroops: 'Враг',
            left: 'Левый',
            center: 'Центр',
            right: 'Правый',
            startBattleBtn: 'Начать бой!',
            preparingBattle: 'Подготовка к бою...',
            
            // Result screen
            victory: 'Победа!',
            defeat: 'Поражение!',
            victoryMsg: 'Вы победили в этой дуэли',
            defeatMsg: 'Вы проиграли в этой дуэли',
            playAgainBtn: 'Играть снова',
            mainMenuBtn: 'Главное меню',
            
            // Leaderboard
            leaderboardTitle: '🏆 ЛИДЕРБОРД',
            rankHeader: '#',
            nicknameHeader: 'Никнейм',
            ratingHeader: 'Рейтинг',
            winsHeader: 'Побед',
            lossesHeader: 'Поражений',
            backBtn: 'Назад',
            
            // Multiplayer
            multiplayerTitle: '🌐 МУЛЬТИПЛЕЕР',
            findMatchBtn: 'Найти игру',
            lobbyHint: 'Нажмите "Найти игру" для быстрого матча',
            connected: '✅ Подключено к серверу',
            disconnected: '❌ Отключено от сервера',
            roomCreated: 'Комната создана! Ожидание второго игрока...',
            playersInRoom: 'Игроков:',
            
            // Rules
            rulesTitle: 'Правила игры',
            goal: 'Цель игры',
            goalDesc: 'Уничтожить все войска врага!',
            unitTypes: 'Типы войск',
            combatMechanic: 'Механика боя',
            flanksDesc: 'Фланги',
            victoryCondition: 'Победа',
            
            warriorStrong: '⚔️ Войны - сильны против 🐴 Конницы',
            archerStrong: '🏹 Лучники - сильны против ⚔️ Войнов',
            cavalryStrong: '🐴 Конница - сильна против 🏹 Лучников',
            
            numberMechanic: 'Число = количество бросков кубика (0 до 1)',
            rollsSum: 'Все броски складываются = урон',
            advantage: 'Преимущество:',
            advantageDesc: 'урон × 1.5',
            equal: 'Одинаково:',
            equalDesc: 'урон × 1.0',
            weakness: 'Слабость:',
            weaknessDesc: 'урон × 0.5',
            afterCombat: 'После боя вычитаем урон от числа',
            zeroDestroyed: 'Число = 0? Отряд уничтожен!',
            
            flanksDescFull: 'Ваш левый фланг бьет по левому врага, центр по центру, правый по правому врага.',
            victoryDesc: 'Побеждает тот, кто уничтожил все отряды врага!',
            
            // Unit types
            warrior: 'Войны',
            archer: 'Лучники',
            cavalry: 'Конница',
            unknown: 'Неизвестно',
            
            // Damage logs
            destroyed: 'уничтожен',
            damaged: 'получил урон',
            defeated: 'победил',
            tie: 'ничья'
        },
        
        en: {
            // Menu screen
            gameTitle: '⚔️ NUMERIC DUEL',
            gameSubtitle: 'To the last soldier!',
            nicknamePlaceholder: 'Enter your nickname',
            startGameBtn: 'Start Game (vs AI)',
            multiplayerBtn: 'Multiplayer',
            leaderboardBtn: 'Leaderboard',
            rulesBtn: 'Rules',
            wins: 'Wins:',
            losses: 'Losses:',
            topPlayers: '🏆 TOP PLAYERS',
            
            // Selection screen
            selectTroops: 'Select Troops',
            selectTroopsHint: 'Choose numbers for your army. Each number is a unit with a troop type',
            yourArmy: 'Your Army:',
            deselectHint: 'Click the number again to deselect',
            toBattle: 'To Battle!',
            
            // Flank setup
            turn: 'Turn',
            setupFlanks: 'Place troops on flanks',
            yourTroops: 'Your Troops',
            enemyTroops: 'Enemy',
            left: 'Left',
            center: 'Center',
            right: 'Right',
            startBattleBtn: 'Start Battle!',
            preparingBattle: 'Preparing for battle...',
            
            // Result screen
            victory: 'Victory!',
            defeat: 'Defeat!',
            victoryMsg: 'You won this duel',
            defeatMsg: 'You lost this duel',
            playAgainBtn: 'Play Again',
            mainMenuBtn: 'Main Menu',
            
            // Leaderboard
            leaderboardTitle: '🏆 LEADERBOARD',
            rankHeader: '#',
            nicknameHeader: 'Nickname',
            ratingHeader: 'Rating',
            winsHeader: 'Wins',
            lossesHeader: 'Losses',
            backBtn: 'Back',
            
            // Multiplayer
            multiplayerTitle: '🌐 MULTIPLAYER',
            findMatchBtn: 'Find Match',
            lobbyHint: 'Click "Find Match" for quick match',
            connected: '✅ Connected to server',
            disconnected: '❌ Disconnected from server',
            roomCreated: 'Room created! Waiting for second player...',
            playersInRoom: 'Players:',
            
            // Rules
            rulesTitle: 'Game Rules',
            goal: 'Goal',
            goalDesc: 'Destroy all enemy troops!',
            unitTypes: 'Unit Types',
            combatMechanic: 'Combat Mechanics',
            flanksDesc: 'Flanks',
            victoryCondition: 'Victory',
            
            warriorStrong: '⚔️ Warriors - strong against 🐴 Cavalry',
            archerStrong: '🏹 Archers - strong against ⚔️ Warriors',
            cavalryStrong: '🐴 Cavalry - strong against 🏹 Archers',
            
            numberMechanic: 'Number = dice rolls (0 to 1)',
            rollsSum: 'All rolls sum = damage',
            advantage: 'Advantage:',
            advantageDesc: 'damage × 1.5',
            equal: 'Equal:',
            equalDesc: 'damage × 1.0',
            weakness: 'Weakness:',
            weaknessDesc: 'damage × 0.5',
            afterCombat: 'After combat, subtract damage from number',
            zeroDestroyed: 'Number = 0? Unit destroyed!',
            
            flanksDescFull: 'Your left flank hits enemy left, center hits center, right hits enemy right.',
            victoryDesc: 'The one who destroyed all enemy units wins!',
            
            // Unit types
            warrior: 'Warriors',
            archer: 'Archers',
            cavalry: 'Cavalry',
            unknown: 'Unknown',
            
            // Damage logs
            destroyed: 'destroyed',
            damaged: 'damaged',
            defeated: 'defeated',
            tie: 'tie'
        }
    },
    
    // Get translation
    t(key) {
        const lang = this.translations[this.currentLang];
        return lang && lang[key] ? lang[key] : key;
    },
    
    // Set language
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('gameLanguage', lang);
            this.updateAllTexts();
        }
    },
    
    // Update all texts in UI
    updateAllTexts() {
        // Menu screen
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) {
            const title = menuScreen.querySelector('.game-title');
            if (title) title.textContent = this.t('gameTitle');
            
            const subtitle = menuScreen.querySelector('.game-subtitle');
            if (subtitle) subtitle.textContent = this.t('gameSubtitle');
            
            const nicknameInput = document.getElementById('nickname-input');
            if (nicknameInput) nicknameInput.placeholder = this.t('nicknamePlaceholder');
            
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.textContent = this.t('startGameBtn');
            
            const multiplayerBtn = document.getElementById('multiplayer-btn');
            if (multiplayerBtn) multiplayerBtn.textContent = this.t('multiplayerBtn');
            
            const leaderboardBtn = document.getElementById('leaderboard-btn');
            if (leaderboardBtn) leaderboardBtn.textContent = this.t('leaderboardBtn');
            
            const rulesBtn = document.getElementById('rules-btn');
            if (rulesBtn) rulesBtn.textContent = this.t('rulesBtn');
            
            // Stats
            const winsLabel = menuScreen.querySelector('.stat-label');
            if (winsLabel) winsLabel.textContent = this.t('wins');
            
            const topPlayersTitle = menuScreen.querySelector('.mini-leaderboard h3');
            if (topPlayersTitle) topPlayersTitle.textContent = this.t('topPlayers');
        }
        
        // Selection screen
        const selectionScreen = document.getElementById('selection-screen');
        if (selectionScreen) {
            const title = selectionScreen.querySelector('h2');
            if (title) title.textContent = this.t('selectTroops');
            
            const hint = selectionScreen.querySelector('.hint');
            if (hint) hint.textContent = this.t('selectTroopsHint');
            
            const yourArmy = selectionScreen.querySelector('.selected-display h3');
            if (yourArmy) yourArmy.textContent = this.t('yourArmy');
            
            const deselectHint = selectionScreen.querySelector('.hint-small');
            if (deselectHint) deselectHint.textContent = this.t('deselectHint');
            
            const readyBtn = document.getElementById('ready-btn');
            if (readyBtn) readyBtn.textContent = this.t('toBattle');
        }
        
        // Flank setup screen
        const flankScreen = document.getElementById('flank-setup-screen');
        if (flankScreen) {
            const hint = flankScreen.querySelector('.hint');
            if (hint) hint.textContent = this.t('setupFlanks');
            
            const yourTroops = flankScreen.querySelector('#your-flanks h3');
            if (yourTroops) yourTroops.textContent = this.t('yourTroops');
            
            const enemyTroops = flankScreen.querySelector('#enemy-flanks h3');
            if (enemyTroops) enemyTroops.textContent = this.t('enemyTroops');
            
            const flankLabels = flankScreen.querySelectorAll('.flank-label');
            flankLabels.forEach((label, idx) => {
                const labels = [this.t('left'), this.t('center'), this.t('right')];
                if (labels[idx]) label.textContent = labels[idx];
            });
            
            const flankReadyBtn = document.getElementById('flank-ready-btn');
            if (flankReadyBtn) flankReadyBtn.textContent = this.t('startBattleBtn');
            
            const battleLog = document.getElementById('battle-log');
            if (battleLog && battleLog.querySelector('.log-entry')) {
                battleLog.querySelector('.log-entry').textContent = this.t('preparingBattle');
            }
        }
        
        // Result screen
        const resultScreen = document.getElementById('result-screen');
        if (resultScreen) {
            const playAgainBtn = document.getElementById('play-again-btn');
            if (playAgainBtn) playAgainBtn.textContent = this.t('playAgainBtn');
            
            const menuBtn = document.getElementById('menu-btn');
            if (menuBtn) menuBtn.textContent = this.t('mainMenuBtn');
        }
        
        // Leaderboard screen
        const leaderboardScreen = document.getElementById('leaderboard-screen');
        if (leaderboardScreen) {
            const title = leaderboardScreen.querySelector('.game-title');
            if (title) title.textContent = this.t('leaderboardTitle');
            
            const backBtn = document.getElementById('leaderboard-back-btn');
            if (backBtn) backBtn.textContent = this.t('backBtn');
        }
        
        // Multiplayer screen
        const multiplayerScreen = document.getElementById('multiplayer-screen');
        if (multiplayerScreen) {
            const title = multiplayerScreen.querySelector('.game-title');
            if (title) title.textContent = this.t('multiplayerTitle');
            
            const lobbyStatus = document.getElementById('lobby-status');
            if (lobbyStatus) {
                const p = lobbyStatus.querySelector('p');
                if (p) p.textContent = this.t('lobbyHint');
            }
            
            const findMatchBtn = document.getElementById('find-match-btn');
            if (findMatchBtn) findMatchBtn.textContent = this.t('findMatchBtn');
            
            const backBtn = document.getElementById('back-to-menu-btn');
            if (backBtn) backBtn.textContent = this.t('backBtn');
        }
        
        // Rules modal
        const rulesModal = document.getElementById('rules-modal');
        if (rulesModal) {
            const title = rulesModal.querySelector('h2');
            if (title) title.textContent = this.t('rulesTitle');
            
            const goalTitle = rulesModal.querySelector('h3');
            if (goalTitle) goalTitle.textContent = this.t('goal');
            
            const goalDesc = rulesModal.querySelector('.rules-content p');
            if (goalDesc) goalDesc.textContent = this.t('goalDesc');
        }
    }
};

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}

