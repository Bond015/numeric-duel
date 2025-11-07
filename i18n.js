// System localization for Numeric Duel
// Main language: English, secondary: Russian

const i18n = {
    defaultLang: 'ru',
    currentLang: localStorage.getItem('gameLanguage') || 'ru',

    translations: {
        ru: {
            // Menu screen
            gameTitle: 'Числовая дуэль',
            gameName: 'Числовая дуэль',
            gameSubtitle: 'До последнего солдата!',
            nicknamePlaceholder: 'Введите ваш никнейм',
            startGameBtn: 'Начать игру (vs AI)',
            multiplayerBtn: 'Мультиплеер',
            leaderboardBtn: 'Лидерборд',
            rulesBtn: 'Правила',
            wins: 'Побед:',
            losses: 'Поражений:',
            topPlayers: '🏆 ТОП ИГРОКОВ',
            chatTitle: '💬 Глобальный чат',
            chatWelcome: 'Добро пожаловать в «Числовую дуэль»! Общайтесь с другими игроками.',
            chatPlaceholder: 'Введите сообщение...',
            chatSendBtn: 'Отправить',

            // Dialogs
            infoTitle: 'Сообщение',
            warningTitle: 'Внимание',
            errorTitle: 'Ошибка',
            confirmTitle: 'Подтвердите действие',
            okBtn: 'Хорошо',
            cancelBtn: 'Отмена',
            yesBtn: 'Да',
            noBtn: 'Нет',
            systemMessagePlaceholder: 'Системное сообщение',
            nicknameTooShort: '⚠️ Никнейм слишком короткий',
            checkingNickname: '⏳ Проверяем ник...',
            nicknameCheckFailed: '⚠️ Не удалось проверить ник. Попробуйте позже.',
            nicknameTaken: '⚠️ Ник уже занят!',
            nicknameAvailable: '✅ Ник свободен',
            alreadySearching: 'Вы уже ищете противника...',
            searchingOpponent: '🔍 Поиск соперника...',
            opponentDisconnected: 'Соперник отключился',
            notConnected: 'Нет подключения к серверу',
            connectedToRoom: 'Комната найдена! Подготовьтесь к бою',
            opponentFound: '✅ Противник найден! Начинаем бой...',
            defaultPlayerName: 'Игрок',
            yourTroopsLabel: 'Ваши войска',
            enemyLabel: 'Враг',
            readyCountdown: 'Готов ({seconds}с)',

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
            battleLogInitial: 'Подготовка к бою...',
            surrenderBtn: '🏳️ Сдаться',
            surrenderConfirm: 'Вы уверены, что хотите сдаться?',

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
            enterNickname: 'Пожалуйста, введите никнейм!',
            disconnected: '❌ Отключено от сервера',
            roomCreated: 'Комната создана! Ожидание второго игрока...',
            playersInRoom: 'Игроков:',
            roomLabel: 'Комната:',
            playersLabel: 'Игроки:',

            // Rules
            rulesTitle: 'Правила игры',
            goal: 'Цель',
            goalDesc: 'Уничтожить все войска врага!',
            unitTypes: 'Типы войск',
            combatMechanic: 'Механика боя',
            flanksDesc: 'Фланги',
            victoryCondition: 'Победа',

            warriorStrong: '⚔️ Воины — сильны против 🐴 Конницы',
            archerStrong: '🏹 Лучники — сильны против ⚔️ Воинов',
            cavalryStrong: '🐴 Конница — сильна против 🏹 Лучников',

            numberMechanic: 'Число = количество бросков кубика (0 до 1)',
            rollsSum: 'Сумма всех бросков = урон',
            advantageFull: '<strong>Преимущество:</strong> урон × 1.5',
            equalFull: '<strong>Равенство:</strong> урон × 1.0',
            weaknessFull: '<strong>Слабость:</strong> урон × 0.5',
            afterCombat: 'После боя вычтите урон из числа',
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
            gameTitle: 'Numeric Duel',
            gameName: 'Numeric Duel',
            gameSubtitle: 'To the last soldier!',
            nicknamePlaceholder: 'Enter your nickname',
            startGameBtn: 'Start Game (vs AI)',
            multiplayerBtn: 'Multiplayer',
            leaderboardBtn: 'Leaderboard',
            rulesBtn: 'Rules',
            wins: 'Wins:',
            losses: 'Losses:',
            topPlayers: '🏆 TOP PLAYERS',
            chatTitle: '💬 Global Chat',
            chatWelcome: 'Welcome to Numeric Duel! Chat with other players.',
            chatPlaceholder: 'Type a message...',
            chatSendBtn: 'Send',

            // Dialogs
            infoTitle: 'Notice',
            warningTitle: 'Warning',
            errorTitle: 'Error',
            confirmTitle: 'Confirm Action',
            okBtn: 'OK',
            cancelBtn: 'Cancel',
            yesBtn: 'Yes',
            noBtn: 'No',
            systemMessagePlaceholder: 'System message',
            nicknameTooShort: '⚠️ Nickname is too short',
            checkingNickname: '⏳ Checking nickname...',
            nicknameCheckFailed: '⚠️ Could not verify nickname. Try again later.',
            nicknameTaken: '⚠️ Nickname is taken!',
            nicknameAvailable: '✅ Available',
            alreadySearching: 'Already searching for opponent...',
            searchingOpponent: '🔍 Searching for opponent...',
            opponentDisconnected: 'Opponent disconnected',
            notConnected: 'Not connected to server',
            connectedToRoom: 'Connected to room! Get ready to fight',
            opponentFound: '✅ Opponent found! Starting game...',
            defaultPlayerName: 'Player',
            yourTroopsLabel: 'Your Troops',
            enemyLabel: 'Enemy',
            readyCountdown: 'Ready ({seconds}s)',

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
            battleLogInitial: 'Preparing for battle...',
            surrenderBtn: '🏳️ Surrender',
            surrenderConfirm: 'Are you sure you want to surrender?',

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
            enterNickname: 'Please enter your nickname first!',
            disconnected: '❌ Disconnected from server',
            roomCreated: 'Room created! Waiting for second player...',
            playersInRoom: 'Players:',
            roomLabel: 'Room:',
            playersLabel: 'Players:',

            // Rules
            rulesTitle: 'Game Rules',
            goal: 'Goal',
            goalDesc: 'Destroy all enemy troops!',
            unitTypes: 'Unit Types',
            combatMechanic: 'Combat Mechanics',
            flanksDesc: 'Flanks',
            victoryCondition: 'Victory',

            warriorStrong: '⚔️ Warriors — strong against 🐴 Cavalry',
            archerStrong: '🏹 Archers — strong against ⚔️ Warriors',
            cavalryStrong: '🐴 Cavalry — strong against 🏹 Archers',

            numberMechanic: 'Number = dice rolls (0 to 1)',
            rollsSum: 'Sum of all rolls = damage',
            advantageFull: '<strong>Advantage:</strong> damage × 1.5',
            equalFull: '<strong>Equal:</strong> damage × 1.0',
            weaknessFull: '<strong>Weakness:</strong> damage × 0.5',
            afterCombat: 'After combat, subtract damage from the number',
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
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('lang', this.currentLang || this.defaultLang);
        }
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

            const chatTitle = document.getElementById('chat-title');
            if (chatTitle) chatTitle.textContent = this.t('chatTitle');

            const chatWelcome = document.getElementById('chat-welcome');
            if (chatWelcome) chatWelcome.textContent = this.t('chatWelcome');

            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.placeholder = this.t('chatPlaceholder');

            const chatSend = document.getElementById('chat-send');
            if (chatSend) chatSend.textContent = this.t('chatSendBtn');
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

            // Don't update nicknames here - they are set dynamically by game.js
            // const yourTroops = flankScreen.querySelector('#your-flanks h3');
            // if (yourTroops) yourTroops.textContent = this.t('yourTroops');

            // const enemyTroops = flankScreen.querySelector('#enemy-flanks h3');
            // if (enemyTroops) enemyTroops.textContent = this.t('enemyTroops');

            const flankLabels = flankScreen.querySelectorAll('.flank-label');
            flankLabels.forEach((label, idx) => {
                const labels = [this.t('left'), this.t('center'), this.t('right')];
                if (labels[idx]) label.textContent = labels[idx];
            });

            const flankReadyBtn = document.getElementById('flank-ready-btn');
            if (flankReadyBtn) flankReadyBtn.textContent = this.t('startBattleBtn');

            const surrenderBtn = document.getElementById('surrender-btn');
            if (surrenderBtn) surrenderBtn.textContent = this.t('surrenderBtn');

            const battleLogInitial = document.getElementById('battle-log-initial');
            if (battleLogInitial) battleLogInitial.textContent = this.t('battleLogInitial');
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

            const headerSpans = leaderboardScreen.querySelectorAll('.leaderboard-header span');
            if (headerSpans.length >= 5) {
                headerSpans[0].textContent = this.t('rankHeader');
                headerSpans[1].textContent = this.t('nicknameHeader');
                headerSpans[2].textContent = this.t('ratingHeader');
                headerSpans[3].textContent = this.t('winsHeader');
                headerSpans[4].textContent = this.t('lossesHeader');
            }

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

            const roomLabel = document.getElementById('room-label');
            if (roomLabel) roomLabel.textContent = this.t('roomLabel');

            const playersLabel = document.getElementById('players-label');
            if (playersLabel) playersLabel.textContent = this.t('playersLabel');
        }

        // Rules modal
        const rulesModal = document.getElementById('rules-modal');
        if (rulesModal) {
            const title = rulesModal.querySelector('h2');
            if (title) title.textContent = this.t('rulesTitle');

            const ruleHeadings = rulesModal.querySelectorAll('.rules-content h3');
            if (ruleHeadings[0]) ruleHeadings[0].textContent = this.t('goal');
            if (ruleHeadings[1]) ruleHeadings[1].textContent = this.t('unitTypes');
            if (ruleHeadings[2]) ruleHeadings[2].textContent = this.t('combatMechanic');
            if (ruleHeadings[3]) ruleHeadings[3].textContent = this.t('flanksDesc');
            if (ruleHeadings[4]) ruleHeadings[4].textContent = this.t('victoryCondition');

            const paragraphs = rulesModal.querySelectorAll('.rules-content p');
            if (paragraphs[0]) paragraphs[0].textContent = this.t('goalDesc');

            const warriorItem = document.getElementById('rule-warrior');
            if (warriorItem) warriorItem.innerHTML = this.t('warriorStrong');

            const archerItem = document.getElementById('rule-archer');
            if (archerItem) archerItem.innerHTML = this.t('archerStrong');

            const cavalryItem = document.getElementById('rule-cavalry');
            if (cavalryItem) cavalryItem.innerHTML = this.t('cavalryStrong');

            const numberRule = document.getElementById('rule-number');
            if (numberRule) numberRule.textContent = this.t('numberMechanic');

            const damageRule = document.getElementById('rule-damage');
            if (damageRule) damageRule.textContent = this.t('rollsSum');

            const advantageRule = document.getElementById('rule-advantage');
            if (advantageRule) advantageRule.innerHTML = this.t('advantageFull');

            const equalRule = document.getElementById('rule-equal');
            if (equalRule) equalRule.innerHTML = this.t('equalFull');

            const weaknessRule = document.getElementById('rule-weakness');
            if (weaknessRule) weaknessRule.innerHTML = this.t('weaknessFull');

            const afterRule = document.getElementById('rule-after');
            if (afterRule) afterRule.textContent = this.t('afterCombat');

            const zeroRule = document.getElementById('rule-zero');
            if (zeroRule) zeroRule.textContent = this.t('zeroDestroyed');

            const flanksRule = document.getElementById('rule-flanks');
            if (flanksRule) flanksRule.textContent = this.t('flanksDescFull');

            const victoryRule = document.getElementById('rule-victory');
            if (victoryRule) victoryRule.textContent = this.t('victoryDesc');
        }

        const systemDialogTitle = document.getElementById('system-modal-title');
        if (systemDialogTitle) systemDialogTitle.textContent = this.t('infoTitle');

        const systemDialogMessage = document.getElementById('system-modal-message');
        if (systemDialogMessage) systemDialogMessage.textContent = this.t('systemMessagePlaceholder');

        const systemConfirm = document.getElementById('system-modal-confirm');
        if (systemConfirm) systemConfirm.textContent = this.t('okBtn');

        const systemCancel = document.getElementById('system-modal-cancel');
        if (systemCancel) systemCancel.textContent = this.t('cancelBtn');
    }
};

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}

