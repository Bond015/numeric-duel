// Типы войск
const UNIT_TYPES = {
    WARRIOR: 'warrior',    // Войны
    ARCHER: 'archer',      // Лучники
    CAVALRY: 'cavalry'     // Конница
};

// Матрица преимуществ (каждый тип сильнее против другого)
const TYPE_ADVANTAGES = {
    [UNIT_TYPES.WARRIOR]: UNIT_TYPES.CAVALRY,    // Войны сильнее Конницы
    [UNIT_TYPES.ARCHER]: UNIT_TYPES.WARRIOR,     // Лучники сильнее Войнов
    [UNIT_TYPES.CAVALRY]: UNIT_TYPES.ARCHER      // Конница сильнее Лучников
};

// Распределение типов (зациклено каждые 20 чисел)
const TYPE_DISTRIBUTION = Array(20).fill(0).map((_, i) => {
    const pattern = [UNIT_TYPES.WARRIOR, UNIT_TYPES.ARCHER, UNIT_TYPES.CAVALRY];
    return pattern[i % 3];
});

const MIN_NICKNAME_LENGTH = 3;

// Socket.io подключение
let socket = null;
let socketListenersSetup = false;

// Таймер готовности для мультиплеера
let readyTimer = null;

// Yandex SDK state
let yaGamesSDK = null;
let sdkInitInProgress = false;
let sdkReady = false;
let gameInitialized = false;
let gameLogicReady = false;
let gameReadyReported = false;

const adState = {
    lastFullscreenTime: 0,
    fullscreenCooldownMs: 0,
    showingFullscreen: false,
    bannerVisible: false,
    rewardClaimedForMatch: false,
    rewardInProgress: false
};

const MATCH_END_REWARD = 50;

const INTERACTIVE_SELECTOR = 'input, textarea, [contenteditable="true"], .allow-selection';

function isInteractiveTarget(target) {
    if (!target) return false;
    if (typeof target.closest === 'function') {
        return Boolean(target.closest(INTERACTIVE_SELECTOR));
    }
    return false;
}

function preventDefaultIfNonInteractive(event) {
    if (!isInteractiveTarget(event.target)) {
        event.preventDefault();
    }
}

document.addEventListener('contextmenu', preventDefaultIfNonInteractive);
document.addEventListener('selectstart', preventDefaultIfNonInteractive);
document.addEventListener('dragstart', preventDefaultIfNonInteractive);

// UI helpers for system dialogs
const systemDialog = {
    initialized: false,
    modal: null,
    title: null,
    message: null,
    confirmBtn: null,
    cancelBtn: null
};

function getText(key, fallback) {
    if (typeof i18n !== 'undefined' && typeof i18n.t === 'function') {
        const value = i18n.t(key);
        if (value && value !== key) {
            return value;
        }
    }
    return fallback;
}

function ensureSystemDialog() {
    if (systemDialog.initialized) return;
    systemDialog.modal = document.getElementById('system-modal');
    systemDialog.title = document.getElementById('system-modal-title');
    systemDialog.message = document.getElementById('system-modal-message');
    systemDialog.confirmBtn = document.getElementById('system-modal-confirm');
    systemDialog.cancelBtn = document.getElementById('system-modal-cancel');
    systemDialog.initialized = Boolean(
        systemDialog.modal &&
        systemDialog.title &&
        systemDialog.message &&
        systemDialog.confirmBtn &&
        systemDialog.cancelBtn
    );
}

function getDefaultDialogTitle(type) {
    switch (type) {
        case 'error':
            return getText('errorTitle', 'Ошибка');
        case 'warning':
            return getText('warningTitle', 'Внимание');
        case 'confirm':
            return getText('confirmTitle', 'Подтвердите действие');
        default:
            return getText('infoTitle', 'Сообщение');
    }
}

function showSystemDialog(options = {}) {
    ensureSystemDialog();

    const {
        title,
        message,
        confirmText,
        cancelText,
        type,
        dismissible = true
    } = options;

    if (!systemDialog.initialized) {
        if (cancelText) {
            const result = window.confirm ? window.confirm(message) : false;
            return Promise.resolve(result);
        }
        window.alert && window.alert(message);
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        const { modal, title: titleEl, message: messageEl, confirmBtn, cancelBtn } = systemDialog;

        titleEl.textContent = title || getDefaultDialogTitle(type);
        messageEl.textContent = message !== undefined && message !== null ? String(message) : '';

        const confirmLabel = confirmText || (cancelText ? getText('yesBtn', 'Да') : getText('okBtn', 'OK'));
        confirmBtn.textContent = confirmLabel;

        let cleanupCalled = false;
        const cleanup = (result) => {
            if (cleanupCalled) return;
            cleanupCalled = true;
            modal.classList.remove('active');
            document.removeEventListener('keydown', escHandler);
            modal.removeEventListener('click', outsideHandler);
            confirmBtn.removeEventListener('click', confirmHandler);
            if (cancelText) {
                cancelBtn.removeEventListener('click', cancelHandler);
            }
            resolve(result);
        };

        const escHandler = (event) => {
            if (event.key === 'Escape') {
                if (cancelText) {
                    cleanup(false);
                } else if (dismissible) {
                    cleanup(true);
                }
            }
        };

        const outsideHandler = (event) => {
            if (event.target === modal && dismissible) {
                if (cancelText) {
                    cleanup(false);
                } else {
                    cleanup(true);
                }
            }
        };

        document.addEventListener('keydown', escHandler);
        modal.addEventListener('click', outsideHandler);

        const confirmHandler = () => cleanup(true);
        confirmBtn.addEventListener('click', confirmHandler);

        let cancelHandler = null;
        if (cancelText) {
            cancelBtn.style.display = 'inline-flex';
            cancelBtn.textContent = cancelText || getText('noBtn', 'Нет');
            cancelHandler = () => cleanup(false);
            cancelBtn.addEventListener('click', cancelHandler);
        } else {
            cancelBtn.style.display = 'none';
        }

        modal.classList.add('active');
        setTimeout(() => {
            if (typeof confirmBtn.focus === 'function') {
                confirmBtn.focus({ preventScroll: true });
            }
        }, 0);
    });
}

function showInfoDialog(message, title) {
    return showSystemDialog({
        message,
        title: title || getDefaultDialogTitle('info'),
        confirmText: getText('okBtn', 'OK'),
        type: 'info'
    });
}

function showErrorDialog(message) {
    return showSystemDialog({
        message,
        title: getDefaultDialogTitle('error'),
        confirmText: getText('okBtn', 'OK'),
        type: 'error'
    });
}

function showConfirmDialog(message, title) {
    return showSystemDialog({
        message,
        title: title || getDefaultDialogTitle('confirm'),
        confirmText: getText('yesBtn', 'Да'),
        cancelText: getText('noBtn', 'Нет'),
        type: 'confirm'
    });
}

function initializeAds(ysdk) {
    if (!ysdk || !ysdk.adv) return;
    updateBannerVisibility(gameState.screen || 'menu');
}

function updateBannerVisibility(screenName) {
    if (!yaGamesSDK || !yaGamesSDK.adv) return;
    const adv = yaGamesSDK.adv;
    const shouldShow = screenName === 'menu';

    if (shouldShow && typeof adv.showBannerAdv === 'function') {
        if (typeof adv.getBannerAdvStatus === 'function') {
            adv.getBannerAdvStatus()
                .then(({ stickyAdvIsShowing, reason }) => {
                    if (stickyAdvIsShowing) {
                        adState.bannerVisible = true;
                        return;
                    }
                    if (reason) {
                        console.warn('Sticky banner not shown:', reason);
                        return;
                    }
                    const result = adv.showBannerAdv();
                    if (result && typeof result.then === 'function') {
                        result.then(() => adState.bannerVisible = true)
                            .catch(err => console.warn('Failed to show banner:', err));
                    } else {
                        adState.bannerVisible = true;
                    }
                })
                .catch(err => console.warn('Failed to get banner status:', err));
        } else {
            try {
                const result = adv.showBannerAdv();
                if (result && typeof result.then === 'function') {
                    result.then(() => adState.bannerVisible = true)
                        .catch(err => console.warn('Failed to show banner:', err));
                } else {
                    adState.bannerVisible = true;
                }
            } catch (err) {
                console.warn('Failed to show banner:', err);
            }
        }
    } else if (!shouldShow && adState.bannerVisible && typeof adv.hideBannerAdv === 'function') {
        const result = adv.hideBannerAdv();
        if (result && typeof result.then === 'function') {
            result.then(() => adState.bannerVisible = false)
                .catch(err => console.warn('Failed to hide banner:', err));
        } else {
            adState.bannerVisible = false;
        }
    }
}

function showFullscreenAd(trigger = 'match-end') {
    if (!yaGamesSDK || !yaGamesSDK.adv || typeof yaGamesSDK.adv.showFullscreenAdv !== 'function') return;
    if (adState.showingFullscreen) return;

    const now = Date.now();
    if (now - adState.lastFullscreenTime < adState.fullscreenCooldownMs) return;

    adState.showingFullscreen = true;
    try {
        yaGamesSDK.adv.showFullscreenAdv({
            callbacks: {
                onOpen: () => console.log('[Ads] Fullscreen ad opened:', trigger),
                onClose: (wasShown) => {
                    adState.showingFullscreen = false;
                    if (wasShown) {
                        adState.lastFullscreenTime = Date.now();
                    }
                },
                onError: (error) => {
                    adState.showingFullscreen = false;
                    console.warn('[Ads] Fullscreen ad error:', error);
                }
            }
        });
    } catch (error) {
        adState.showingFullscreen = false;
        console.warn('[Ads] Failed to request fullscreen ad:', error);
    }
}

function showRewardedVideoAd() {
    if (!yaGamesSDK || !yaGamesSDK.adv || typeof yaGamesSDK.adv.showRewardedVideo !== 'function') {
        showInfoDialog(getText('rewardUnavailable', 'Реклама сейчас недоступна. Попробуйте позже.'));
        return;
    }
    if (adState.rewardInProgress || adState.rewardClaimedForMatch) return;

    adState.rewardInProgress = true;
    updateRewardButtonState();

    try {
        yaGamesSDK.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => console.log('[Ads] Rewarded video opened'),
                onRewarded: () => {
                    if (!adState.rewardClaimedForMatch) {
                        adState.rewardClaimedForMatch = true;
                        grantRewardTokens(MATCH_END_REWARD);
                    }
                },
                onClose: () => {
                    adState.rewardInProgress = false;
                    updateRewardButtonState();
                },
                onError: (error) => {
                    adState.rewardInProgress = false;
                    console.warn('[Ads] Rewarded video error:', error);
                    showErrorDialog(getText('rewardError', 'Не удалось показать рекламу. Попробуйте позже.'));
                    updateRewardButtonState();
                }
            }
        });
    } catch (error) {
        adState.rewardInProgress = false;
        console.warn('[Ads] Failed to request rewarded video:', error);
        showErrorDialog(getText('rewardError', 'Не удалось показать рекламу. Попробуйте позже.'));
        updateRewardButtonState();
    }
}

function grantRewardTokens(amount) {
    if (!amount || amount <= 0) return;
    gameState.rewardTokens = (gameState.rewardTokens || 0) + amount;
    localStorage.setItem('gameRewardTokens', gameState.rewardTokens);
    updateRewardUI();
    const template = getText('rewardReceived', `Вы получили бонус: +${amount}!`);
    const message = template.replace('{amount}', amount);
    showInfoDialog(message, getDefaultDialogTitle('info'));
}

function updateRewardUI() {
    const counter = document.getElementById('reward-counter');
    if (counter) {
        const template = getText('rewardBalance', 'Бонусы: {amount}');
        counter.textContent = template.replace('{amount}', gameState.rewardTokens || 0);
        const canShow = yaGamesSDK && yaGamesSDK.adv && typeof yaGamesSDK.adv.showRewardedVideo === 'function';
        counter.style.display = canShow ? 'block' : 'none';
    }
    updateRewardButtonState();
}

function updateRewardButtonState() {
    const rewardBtn = document.getElementById('rewarded-ad-btn');
    if (!rewardBtn) return;

    const canShow = yaGamesSDK && yaGamesSDK.adv && typeof yaGamesSDK.adv.showRewardedVideo === 'function';
    if (!canShow) {
        rewardBtn.style.display = 'none';
        return;
    }

    rewardBtn.style.display = 'inline-flex';
    rewardBtn.disabled = adState.rewardInProgress || adState.rewardClaimedForMatch;
    const labelKey = adState.rewardClaimedForMatch ? 'rewardAlreadyTaken' : 'rewardedAdBtn';
    rewardBtn.textContent = getText(labelKey, adState.rewardClaimedForMatch ? 'Награда получена' : 'Получить награду');
}

function tryReportGameReady() {
    if (gameReadyReported) return;
    if (!gameLogicReady) return;

    if (!yaGamesSDK) {
        return;
    }

    try {
        if (yaGamesSDK.features) {
            if (yaGamesSDK.features.GameReadyAPI && typeof yaGamesSDK.features.GameReadyAPI.gameReady === 'function') {
                yaGamesSDK.features.GameReadyAPI.gameReady();
            }
            if (yaGamesSDK.features.LoadingAPI && typeof yaGamesSDK.features.LoadingAPI.ready === 'function') {
                yaGamesSDK.features.LoadingAPI.ready();
            }
        }
    } catch (error) {
        console.warn('⚠️ Yandex GameReady notification failed:', error);
    }

    gameReadyReported = true;
}

function autoDetectLanguage(ysdk) {
    if (!ysdk || typeof i18n === 'undefined') return;
    const detected = ysdk.environment && ysdk.environment.i18n && ysdk.environment.i18n.lang;
    const stored = localStorage.getItem('gameLanguage');
    if (!detected) {
        return;
    }

    const normalizeLang = (langCode) => {
        if (!langCode) return null;
        const lower = String(langCode).toLowerCase();
        if (i18n.translations[lower]) return lower;

        const short = lower.split(/[-_]/)[0];
        if (i18n.translations[short]) return short;

        switch (short) {
            case 'ru':
                return 'ru';
            case 'en':
                return 'en';
            default:
                return null;
        }
    };

    const normalized = normalizeLang(detected);
    if (!normalized) return;

    if (!stored || stored !== normalized) {
        i18n.setLanguage(normalized);
    }
}

function startApplication() {
    if (gameInitialized) return;
    gameInitialized = true;
    initGame();
    gameLogicReady = true;
    tryReportGameReady();
}

async function initYandexSDK() {
    if (sdkInitInProgress || typeof YaGames === 'undefined' || typeof YaGames.init !== 'function') {
        startApplication();
        return;
    }

    sdkInitInProgress = true;
    try {
        const ysdk = await YaGames.init();
        yaGamesSDK = ysdk;
        console.log('✅ Yandex SDK initialized');
        autoDetectLanguage(ysdk);
        initializeAds(ysdk);
        updateRewardUI();
        sdkReady = true;
        tryReportGameReady();
        startApplication();
    } catch (error) {
        console.warn('⚠️ Yandex SDK initialization failed:', error);
        startApplication();
    }
}

// Игровое состояние
let gameState = {
    screen: 'menu',
    availableNumbers: [],      // 10 рандомных чисел на выбор
    yourNumbers: [],           // Выбранные числа игрока
    enemyNumbers: [],          // Числа врага
    turnNumber: 1,             // Номер хода
    yourFlanks: [null, null, null],  // [left, center, right]
    enemyFlanks: [null, null, null],
    multiplayer: {
        isMultiplayer: false,
        roomId: null,
        playerIndex: null
    },
    nickname: localStorage.getItem('gameNickname') || '',
    playerId: localStorage.getItem('gamePlayerId') || generatePlayerId(),
    stats: {
        wins: parseInt(localStorage.getItem('gameWins') || '0'),
        losses: parseInt(localStorage.getItem('gameLosses') || '0')
    },
    rewardTokens: parseInt(localStorage.getItem('gameRewardTokens') || '0', 10) || 0
};

// Генерация уникального ID игрока
function generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Инициализация игры
function initGame() {
    ensureSystemDialog();
    loadStats();
    setupEventListeners();

    // Initialize localization
    if (typeof i18n !== 'undefined') {
        if (!i18n.currentLang) {
            i18n.currentLang = i18n.defaultLang || 'ru';
        }
        i18n.updateAllTexts();
    }
    updateRewardUI();

    // Initialize global chat connection
    initGlobalChat();
}

// Initialize global chat connection
function initGlobalChat() {
    // Use production server if available, otherwise localhost
    const serverUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://numeric-duel-production.up.railway.app';

    // Create socket for global chat (or reuse main socket if exists)
    if (!socket) {
        socket = io(serverUrl);
        setupSocketListeners();
    }
    // Chat message listener is already set up in setupSocketListeners()
}

// Загрузка статистики
function loadStats() {
    // Загружаем никнейм
    const nicknameInput = document.getElementById('nickname-input');
    if (nicknameInput && gameState.nickname) {
        nicknameInput.value = gameState.nickname;
    }

    // Запрашиваем глобальный лидерборд с сервера (обновит и мини и полный)
    requestGlobalLeaderboard();
}

// Сохранение статистики
function saveStats() {
    localStorage.setItem('gameWins', gameState.stats.wins);
    localStorage.setItem('gameLosses', gameState.stats.losses);
    localStorage.setItem('gamePlayerId', gameState.playerId);
    localStorage.setItem('gameRewardTokens', gameState.rewardTokens || 0);

    // Сохраняем никнейм
    const nicknameInput = document.getElementById('nickname-input');
    if (nicknameInput && nicknameInput.value.trim()) {
        gameState.nickname = nicknameInput.value.trim();
        localStorage.setItem('gameNickname', gameState.nickname);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('multiplayer-btn').addEventListener('click', initMultiplayer);
    document.getElementById('find-match-btn').addEventListener('click', findMatch);
    document.getElementById('back-to-menu-btn').addEventListener('click', backToMenu);
    document.getElementById('rules-btn').addEventListener('click', showRules);
    document.getElementById('leaderboard-btn').addEventListener('click', showLeaderboard);
    document.getElementById('leaderboard-back-btn').addEventListener('click', () => showScreen('menu'));
    document.getElementById('ready-btn').addEventListener('click', startBattle);
    document.getElementById('flank-ready-btn').addEventListener('click', startFlankBattle);
    document.getElementById('surrender-btn').addEventListener('click', surrender);
    document.getElementById('play-again-btn').addEventListener('click', resetGame);
    document.getElementById('menu-btn').addEventListener('click', backToMenu);
    const rewardBtn = document.getElementById('rewarded-ad-btn');
    if (rewardBtn) {
        rewardBtn.addEventListener('click', showRewardedVideoAd);
    }

    // Модальное окно правил
    const modal = document.getElementById('rules-modal');
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Language switcher buttons
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (typeof i18n !== 'undefined') {
                i18n.setLanguage(lang);
                // Update active button
                langButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateRewardUI();
            }
        });
    });

    // Set initial active language button
    if (typeof i18n !== 'undefined') {
        const currentLang = i18n.currentLang || i18n.defaultLang || 'ru';
        langButtons.forEach(btn => {
            if (btn.dataset.lang === currentLang) {
                btn.classList.add('active');
            }
        });
    }

    // Nickname validation
    const nicknameInput = document.getElementById('nickname-input');
    let nicknameCheckTimeout = null;
    if (nicknameInput) {
        nicknameInput.addEventListener('input', () => {
            clearTimeout(nicknameCheckTimeout);
            const nickname = nicknameInput.value.trim();

            if (nickname.length < MIN_NICKNAME_LENGTH) {
                const tooShortMsg = getText('nicknameTooShort', '⚠️ Никнейм слишком короткий');
                updateNicknameStatus(tooShortMsg, 'error');
                return;
            }

            updateNicknameStatus(getText('checkingNickname', '⏳ Проверяем ник...'), 'info');

            nicknameCheckTimeout = setTimeout(() => {
                checkNicknameAvailability(nickname);
            }, 500);
        });
    }

    // Chat functionality
    setupChatListeners();
}

// Показать правила
function showRules() {
    document.getElementById('rules-modal').classList.add('active');
}

// Счетчик ID для отрядов
let unitIdCounter = 0;

// Начать игру
function startGame() {
    // Генерируем 10 рандомных чисел из 20
    unitIdCounter = 0;
    gameState.availableNumbers = generateRandomNumbers(10, 20);

    // Автоматически выбираем все числа
    gameState.yourNumbers = gameState.availableNumbers.map((num, idx) => {
        const unitType = getUnitType(num);
        return { id: idx, value: num, type: unitType, placed: false };
    });
    gameState.turnNumber = 1;

    // Начинаем сразу с расстановки флангов
    startBattle();
}

// Генерация рандомных чисел
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

// Отображение доступных чисел
function displayAvailableNumbers() {
    const grid = document.getElementById('number-grid');
    grid.innerHTML = '';

    gameState.availableNumbers.forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        btn.dataset.number = num;

        const unitType = getUnitType(num);
        const icon = getUnitIcon(unitType);

        btn.innerHTML = `
            <span class="number-value">${num}</span>
            <span class="unit-icon">${icon}</span>
            <span class="unit-type">${getUnitTypeName(unitType)}</span>
        `;

        btn.addEventListener('click', () => selectNumber(num));
        grid.appendChild(btn);
    });
}

// Получить тип юнита по числу
function getUnitType(num) {
    const index = (num - 1) % 20;
    return TYPE_DISTRIBUTION[index] || UNIT_TYPES.WARRIOR;
}

// Получить иконку юнита
function getUnitIcon(type) {
    const icons = {
        [UNIT_TYPES.WARRIOR]: '⚔️',
        [UNIT_TYPES.ARCHER]: '🏹',
        [UNIT_TYPES.CAVALRY]: '🐴'
    };
    return icons[type] || '⚔️';
}

// Получить название типа (with localization)
function getUnitTypeName(type) {
    if (typeof i18n !== 'undefined') {
        const translations = {
            [UNIT_TYPES.WARRIOR]: i18n.t('warrior'),
            [UNIT_TYPES.ARCHER]: i18n.t('archer'),
            [UNIT_TYPES.CAVALRY]: i18n.t('cavalry')
        };
        return translations[type] || i18n.t('unknown');
    }
    // Fallback to Russian if i18n not loaded
    const names = {
        [UNIT_TYPES.WARRIOR]: 'Войны',
        [UNIT_TYPES.ARCHER]: 'Лучники',
        [UNIT_TYPES.CAVALRY]: 'Конница'
    };
    return names[type] || 'Неизвестно';
}

// Выбор числа (создаем объект отряда)
function selectNumber(num) {
    // Проверить, есть ли уже это число
    const index = gameState.yourNumbers.findIndex(u => u.value === num && !u.placed);
    if (index !== -1) {
        // Убрать из выбранных
        gameState.yourNumbers.splice(index, 1);
        // Посчитать сколько осталось выбранных с этим числом
        const count = gameState.yourNumbers.filter(u => u.value === num && !u.placed).length;
        document.querySelectorAll(`[data-number="${num}"]`).forEach(el => {
            const selectedCount = el.parentElement.querySelectorAll('.selected-number').length || 0;
            if (selectedCount <= count) {
                el.classList.remove('selected');
            }
        });
    } else {
        // Добавить новый отряд с сохранением типа
        const unitType = getUnitType(num);
        const unit = { id: unitIdCounter++, value: num, type: unitType, placed: false };
        gameState.yourNumbers.push(unit);
        document.querySelector(`#number-grid [data-number="${num}"]`).classList.add('selected');
    }

    updateSelectedDisplay();

    // Активировать кнопку "Готов"
    document.getElementById('ready-btn').disabled = gameState.yourNumbers.filter(u => !u.placed).length === 0;
}

// Обновить отображение выбранных чисел
function updateSelectedDisplay() {
    const container = document.getElementById('selected-numbers');
    container.innerHTML = '';

    gameState.yourNumbers.filter(u => !u.placed).forEach(unit => {
        const div = document.createElement('div');
        div.className = 'selected-number';
        div.dataset.number = unit.value;
        div.dataset.id = unit.id;

        // Используем сохраненный тип из unit.type
        const unitType = unit.type || getUnitType(unit.value);
        div.innerHTML = `
            <span class="number-value">${unit.value}</span>
            <span class="unit-icon">${getUnitIcon(unitType)}</span>
        `;

        container.appendChild(div);
    });
}

// Начать битву (настройка флангов)
function startBattle() {
    if (gameState.multiplayer.isMultiplayer && socket) {
        // В мультиплеере отправляем числа на сервер
        socket.emit('submit-numbers', {
            roomId: gameState.multiplayer.roomId,
            numbers: gameState.yourNumbers
        });
    } else {
        // Генерируем сбалансированный отряд врага (одиночная игра)
        gameState.enemyNumbers = generateBalancedEnemyArmy(gameState.yourNumbers);
        prepareForNextTurn();
    }
}

// Генерация сбалансированной армии врага
function generateBalancedEnemyArmy(yourArmy) {
    const yourPower = yourArmy.reduce((sum, u) => sum + u.value, 0);
    const armySize = yourArmy.length;

    // Генерируем случайные числа
    const allNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
    const shuffled = [...allNumbers].sort(() => Math.random() - 0.5);

    // Подбираем комбинацию чисел с близкой суммарной силой
    let bestCombination = [];
    let bestDiff = Infinity;

    // Пробуем несколько случайных комбинаций
    for (let attempt = 0; attempt < 100; attempt++) {
        const combo = generateComboAttempt(shuffled, armySize);
        const comboPower = combo.reduce((sum, num) => sum + num, 0);
        const diff = Math.abs(comboPower - yourPower);

        if (diff < bestDiff) {
            bestDiff = diff;
            bestCombination = combo;

            // Если разница очень мала, можно остановиться
            if (diff <= 2) break;
        }
    }

    // Создаем объекты отрядов врага
    return bestCombination.map(num => {
        const unitType = getUnitType(num);
        return { id: unitIdCounter++, value: num, type: unitType, placed: false };
    });
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

// Подготовка к следующему ходу
function prepareForNextTurn() {
    // Сброс флангов
    gameState.yourFlanks = [null, null, null];
    gameState.enemyFlanks = [null, null, null];

    // Сброс флага placed для всех отрядов (они будут доступны для размещения)
    gameState.yourNumbers.forEach(u => u.placed = false);
    gameState.enemyNumbers.forEach(u => u.placed = false);

    displayFlankSetup();
    showScreen('flank-setup');

    const turnMsg = typeof i18n !== 'undefined'
        ? `${i18n.t('turn')} ${gameState.turnNumber}!`
        : `Ход ${gameState.turnNumber}! Подготовьте фланги.`;
    updateBattleLog(turnMsg, 'info');
}

// Отображение экрана настройки флангов
function displayFlankSetup() {
    displayFlankOptions('your-flanks', gameState.yourNumbers, gameState.yourFlanks);
    displayFlankOptions('enemy-flanks', gameState.enemyNumbers, gameState.enemyFlanks);

    // Обновляем заголовок хода
    const turnTitle = typeof i18n !== 'undefined'
        ? `${i18n.t('turn')} ${gameState.turnNumber}`
        : `Ход ${gameState.turnNumber}`;
    document.getElementById('round-title').textContent = turnTitle;

    // Update nicknames for single player
    if (!gameState.multiplayer.isMultiplayer) {
        displayUsernames(gameState.nickname, null);
    }
}

// Отображение опций флангов
function displayFlankOptions(containerId, units, flanks) {
    const container = document.getElementById(containerId);

    // Очистка
    container.querySelectorAll('.flank-slot').forEach(slot => {
        const label = slot.querySelector('.flank-label');
        const existingContent = slot.querySelectorAll(':not(.flank-label)');
        existingContent.forEach(el => el.remove());
        slot.classList.remove('has-unit');
    });

    // Отображение доступных чисел
    const availableContainer = container.querySelector('.available-numbers');
    availableContainer.innerHTML = '';

    units.filter(u => !u.placed).forEach(unit => {
        const btn = document.createElement('div');
        btn.className = 'unit-option';
        btn.dataset.id = unit.id;
        btn.dataset.number = unit.value;

        // Для ваших отрядов показываем тип, для врага - только число
        const showType = containerId === 'your-flanks';
        const unitType = unit.type || getUnitType(unit.value);

        btn.innerHTML = `
            <span class="number-value">${unit.value}</span>
            ${showType ? `<span class="unit-icon">${getUnitIcon(unitType)}</span>` : ''}
        `;

        if (containerId === 'your-flanks') {
            btn.addEventListener('click', () => selectUnitForFlank(unit, containerId));
        }
        availableContainer.appendChild(btn);
    });

    // Отображение флангов
    const flankNames = ['left', 'center', 'right'];
    flankNames.forEach((name, index) => {
        const slot = container.querySelector(`.flank-slot.flank-${name}`);
        if (flanks[index]) {
            const unit = flanks[index];
            const unitType = unit.type || getUnitType(unit.value);
            const content = document.createElement('div');
            content.className = 'flank-unit';
            content.innerHTML = `
                <span class="number-value">${unit.value}</span>
                <span class="unit-icon">${getUnitIcon(unitType)}</span>
            `;
            slot.appendChild(content);
            slot.classList.add('has-unit');
        }
    });
}

// Выбор юнита для фланга
function selectUnitForFlank(unit, containerId) {
    const isPlayer = containerId === 'your-flanks';
    const flanks = isPlayer ? gameState.yourFlanks : gameState.enemyFlanks;
    const units = isPlayer ? gameState.yourNumbers : gameState.enemyNumbers;

    // Найти реальный юнит в массиве по ID
    const unitInArray = units.find(u => u.id === unit.id);
    if (!unitInArray) return;

    // Если юнит уже на фланге, убрать его
    const flankIndex = flanks.findIndex(f => f && f.id === unit.id);
    if (flankIndex !== -1) {
        // Вернуть юнит в доступные
        unitInArray.placed = false;
        flanks[flankIndex] = null;
        displayFlankSetup();
        return;
    }

    // Найти первый свободный фланг
    for (let i = 0; i < 3; i++) {
        if (flanks[i] === null) {
            // Пометить как размещенный и добавить на фланг
            unitInArray.placed = true;
            flanks[i] = unitInArray; // Используем оригинальный объект
            displayFlankSetup();
            return;
        }
    }
}

// Начать бой флангов
function startFlankBattle() {
    // Проверка что есть хотя бы один отряд на фланге
    const placedUnits = gameState.yourFlanks.filter(f => f !== null).length;
    if (placedUnits === 0) {
        updateBattleLog('Разместите хотя бы один отряд!', 'error');
        return;
    }

    if (gameState.multiplayer.isMultiplayer && socket) {
        // Останавливаем таймер при ручной готовности
        stopReadyTimer();

        // Визуальная обратная связь
        const readyBtn = document.getElementById('flank-ready-btn');
        readyBtn.style.background = 'var(--success-color)';
        readyBtn.textContent = '✓ Готово!';
        readyBtn.disabled = true;

        // В мультиплеере отправляем фланги на сервер
        // Преобразуем в простые объекты для передачи
        const flanksToSend = gameState.yourFlanks.map(f => f ? { id: f.id, value: f.value, type: f.type } : null);
        socket.emit('submit-flanks', {
            roomId: gameState.multiplayer.roomId,
            flanks: flanksToSend
        });
        updateBattleLog('Ожидание хода противника...', 'info');
    } else {
        // AI выбирает фланги
        placeEnemyFlanks();
        // Переходим к бою
        performFlankBattle();
    }
}

// Размещение флангов врага (AI)
function placeEnemyFlanks() {
    const available = gameState.enemyNumbers.filter(u => !u.placed);
    const flanks = [null, null, null];

    available.forEach(unit => {
        // Найти случайный свободный фланг
        for (let attempts = 0; attempts < 10; attempts++) {
            const index = Math.floor(Math.random() * 3);
            if (flanks[index] === null) {
                unit.placed = true;
                flanks[index] = unit;
                break;
            }
        }
    });

    gameState.enemyFlanks = flanks;
    displayFlankSetup();
}

// Выполнить бой флангов
function performFlankBattle() {
    const battleResults = [];
    const flankNames = ['Левый', 'Центр', 'Правый'];

    // Соответствие флангов (прямое):
    // Ваш левый (0) vs Вражеский левый (0)
    // Ваш центр (1) vs Вражеский центр (1)
    // Ваш правый (2) vs Вражеский правый (2)
    const flankPairs = [
        { your: 0, enemy: 0, name: 'Левый' },
        { your: 1, enemy: 1, name: 'Центр' },
        { your: 2, enemy: 2, name: 'Правый' }
    ];

    // Бой на каждом фланге
    for (const pair of flankPairs) {
        const yourUnit = gameState.yourFlanks[pair.your];
        const enemyUnit = gameState.enemyFlanks[pair.enemy];

        // Если оба есть - обычный бой
        if (yourUnit && enemyUnit) {
            const result = fightFlanks(yourUnit, enemyUnit, pair.name, pair.your, pair.enemy);
            battleResults.push(result);
        }
        // Если только ваш отряд - он не получает урон, но ничего не делает
        else if (yourUnit && !enemyUnit) {
            // Ваш отряд остается целым
            const unitInArray = gameState.yourNumbers.find(u => u.id === yourUnit.id);
            if (unitInArray) {
                unitInArray.placed = false;
            }
            updateBattleLog(`${pair.name} фланг: Ваш отряд не встретил сопротивления`, 'info');
        }
        // Если только вражеский отряд - он атакует пустое место
        else if (!yourUnit && enemyUnit) {
            // Вражеский отряд остается целым
            const unitInArray = gameState.enemyNumbers.find(u => u.id === enemyUnit.id);
            if (unitInArray) {
                unitInArray.placed = false;
            }
            updateBattleLog(`${pair.name} фланг: Вражеский отряд не встретил сопротивления`, 'info');
        }
    }

    // Отображение результатов с визуализацией (только реальные бои)
    if (battleResults.length > 0) {
        displayBattleResultsWithAnimation(battleResults);
    } else {
        // Нет боев, просто обновляем состояние и продолжаем
        setTimeout(() => {
            checkGameEnd();
        }, 1000);
    }
}

// Анимация результатов боя
async function displayBattleResultsWithAnimation(results, skipUpdate = false) {
    // Сначала показываем урон на флангах
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        await animateFlankDamage(result);
        await sleep(1200); // Увеличенная задержка
    }

    // Небольшая пауза перед обновлением чисел
    await sleep(300);

    // В мультиплеере не обновляем - уже обновлено на сервере
    if (!skipUpdate) {
        updateNumbersAfterBattle(results);
        // В одиночной игре проверяем конец игры
        setTimeout(() => {
            checkGameEnd();
        }, 2000);
    }
}

// Анимация урона на фланге
async function animateFlankDamage(result) {
    const flankNames = ['left', 'center', 'right'];

    // В мультиплеере нужно инвертировать индексы для player2
    const isPlayer2 = gameState.multiplayer.isMultiplayer && gameState.multiplayer.playerIndex === 1;
    const yourFlankName = flankNames[result.yourFlankIndex];
    const enemyFlankName = flankNames[result.enemyFlankIndex];

    // Для player2 инвертируем перспективу
    const actualYourFlankName = isPlayer2 ? enemyFlankName : yourFlankName;
    const actualEnemyFlankName = isPlayer2 ? yourFlankName : enemyFlankName;

    // Найти слоты флангов по правильным индексам
    const yourSlot = document.querySelector(`#your-flanks .flank-slot.flank-${actualYourFlankName}`);
    const enemySlot = document.querySelector(`#enemy-flanks .flank-slot.flank-${actualEnemyFlankName}`);

    // Для player2 инвертируем damage и remainder
    const yourDamage = isPlayer2 ? result.finalYourDamage : result.finalEnemyDamage;
    const enemyDamage = isPlayer2 ? result.finalEnemyDamage : result.finalYourDamage;
    const yourRemainder = isPlayer2 ? result.enemyRemainder : result.yourRemainder;
    const enemyRemainder = isPlayer2 ? result.yourRemainder : result.enemyRemainder;
    const yourValue = isPlayer2 ? result.enemyValue : result.yourValue;
    const enemyValue = isPlayer2 ? result.yourValue : result.enemyValue;

    // Показать урон на вашем фланге (враг атакует вас)
    if (yourSlot && yourDamage > 0) {
        await showDamage(yourSlot, yourDamage, false);

        // Анимация изменения числа
        if (yourRemainder > 0) {
            await animateNumberChange(yourSlot, yourValue, yourRemainder);
        } else {
            // Число уничтожено - анимация исчезновения
            await animateUnitDestroyed(yourSlot);
        }
    }

    // Показать урон на фланге врага (вы атакуете врага)
    if (enemySlot && enemyDamage > 0) {
        await showDamage(enemySlot, enemyDamage, true);

        // Анимация изменения числа
        if (enemyRemainder > 0) {
            await animateNumberChange(enemySlot, enemyValue, enemyRemainder);
        } else {
            // Число уничтожено - анимация исчезновения
            await animateUnitDestroyed(enemySlot);
        }
    }
}

// Показать эффект урона
async function showDamage(slot, damage, isEnemy) {
    const damageEl = document.createElement('div');
    damageEl.className = 'damage-number';
    damageEl.textContent = `-${damage}`;
    damageEl.style.cssText = `
        position: absolute;
        font-size: 2rem;
        font-weight: bold;
        color: ${isEnemy ? '#ef4444' : '#ef4444'};
        pointer-events: none;
        z-index: 1000;
        animation: damageFloat 1.5s ease-out forwards;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    `;

    slot.style.position = 'relative';
    slot.appendChild(damageEl);

    // Добавляем CSS анимацию если еще нет
    if (!document.getElementById('damage-animation-style')) {
        const style = document.createElement('style');
        style.id = 'damage-animation-style';
        style.textContent = `
            @keyframes damageFloat {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-50px) scale(1.5);
                }
            }
            @keyframes hitShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            .flank-slot.hit {
                animation: hitShake 0.4s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // Эффект сотрясения
    slot.classList.add('hit');
    setTimeout(() => {
        slot.classList.remove('hit');
    }, 400);

    // Удаляем элемент через 1.5 секунды
    setTimeout(() => damageEl.remove(), 1500);
}

// Задержка
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Анимация изменения числа
async function animateNumberChange(slot, oldValue, newValue) {
    const numberEl = slot.querySelector('.number-value');
    if (!numberEl) return;

    // Эффект "мигания" при изменении
    numberEl.style.transition = 'all 0.3s ease';
    numberEl.style.transform = 'scale(1.3)';
    numberEl.style.color = '#ef4444';

    await sleep(300);

    // Изменить значение
    numberEl.textContent = newValue;
    numberEl.style.transform = 'scale(1)';
    numberEl.style.color = '';

    await sleep(200);
}

// Анимация уничтожения юнита
async function animateUnitDestroyed(slot) {
    const unitEl = slot.querySelector('.flank-unit');
    if (!unitEl) return;

    // Анимация исчезновения
    unitEl.style.transition = 'all 0.5s ease';
    unitEl.style.opacity = '0';
    unitEl.style.transform = 'scale(0)';

    await sleep(500);

    // Удалить элемент
    unitEl.remove();
    slot.classList.remove('has-unit');
}

// Бой на фланге
function fightFlanks(yourUnit, enemyUnit, flankName, yourFlankIndex, enemyFlankIndex) {
    const yourValue = yourUnit.value;
    const enemyValue = enemyUnit.value;

    // Используем сохраненный тип, если есть
    const yourType = yourUnit.type || getUnitType(yourValue);
    const enemyType = enemyUnit.type || getUnitType(enemyValue);

    // Бросок кубиков (0 до 1, number раз)
    const yourDamage = rollDice(yourValue);
    const enemyDamage = rollDice(enemyValue);

    // Модификаторы типов
    const yourModifier = getTypeModifier(yourType, enemyType);
    const enemyModifier = getTypeModifier(enemyType, yourType);

    // Округляем урон, но минимум 1 если есть хотя бы что-то
    const finalYourDamage = yourDamage > 0 && Math.floor(yourDamage * yourModifier) === 0 ? 1 : Math.floor(yourDamage * yourModifier);
    const finalEnemyDamage = enemyDamage > 0 && Math.floor(enemyDamage * enemyModifier) === 0 ? 1 : Math.floor(enemyDamage * enemyModifier);

    // Вычисление остатков
    const yourRemainder = Math.max(0, yourValue - finalEnemyDamage);
    const enemyRemainder = Math.max(0, enemyValue - finalYourDamage);

    return {
        flankName,
        yourUnit,
        enemyUnit,
        yourValue,
        enemyValue,
        yourType,
        enemyType,
        yourDamage,
        enemyDamage,
        yourModifier,
        enemyModifier,
        finalYourDamage,
        finalEnemyDamage,
        yourRemainder,
        enemyRemainder,
        yourFlankIndex,
        enemyFlankIndex
    };
}

// Бросок кубиков
function rollDice(count) {
    let total = 0;
    for (let i = 0; i < count; i++) {
        total += Math.random(); // 0 до 1
    }
    return total;
}

// Получить модификатор урона по типу
function getTypeModifier(attackerType, defenderType) {
    if (TYPE_ADVANTAGES[attackerType] === defenderType) {
        return 1.5; // Преимущество
    } else if (TYPE_ADVANTAGES[defenderType] === attackerType) {
        return 0.5; // Слабость
    }
    return 1.0; // Одинаково
}

// Отображение результатов боя
function displayBattleResults(results) {
    results.forEach(result => {
        const log = `${result.flankName} фланг: ${result.yourValue}${getUnitIcon(result.yourType)} (${Math.floor(result.yourDamage * 100) / 100}) vs ${result.enemyValue}${getUnitIcon(result.enemyType)} (${Math.floor(result.enemyDamage * 100) / 100}) → ${result.yourRemainder > 0 ? 'Победа' : 'Поражение'}`;
        updateBattleLog(log, 'battle');
    });
}

// Обновить числа после боя
function updateNumbersAfterBattle(results) {
    // Обновить каждое отряда в зависимости от результата боя
    results.forEach(result => {
        // Обновить ваш отряд
        if (result.yourRemainder > 0) {
            // Отряд выжил, обновляем значение
            result.yourUnit.value = result.yourRemainder;
            result.yourUnit.placed = false;
        } else {
            // Отряд уничтожен (remainder <= 0) - удаляем из массива
            const index = gameState.yourNumbers.findIndex(u => u.id === result.yourUnit.id);
            if (index !== -1) {
                gameState.yourNumbers.splice(index, 1);
            }
        }

        // Обновить отряд врага
        if (result.enemyRemainder > 0) {
            // Отряд выжил, обновляем значение
            result.enemyUnit.value = result.enemyRemainder;
            result.enemyUnit.placed = false;
        } else {
            // Отряд уничтожен (remainder <= 0) - удаляем из массива
            const index = gameState.enemyNumbers.findIndex(u => u.id === result.enemyUnit.id);
            if (index !== -1) {
                gameState.enemyNumbers.splice(index, 1);
            }
        }
    });

    // Очистить фланги (не обновляем отображение - это сделает prepareForNextTurn)
    gameState.yourFlanks = [null, null, null];
    gameState.enemyFlanks = [null, null, null];
}

// Проверить конец игры
function checkGameEnd() {
    if (gameState.yourNumbers.length === 0) {
        // Поражение
        gameState.stats.losses++;
        saveStats();
        updateLeaderboard(false); // Поражение: -2 очка
        const defeatMsg = typeof i18n !== 'undefined' ? i18n.t('defeatMsg') : 'Вы потеряли все войска!';
        const defeatTitle = typeof i18n !== 'undefined' ? i18n.t('defeat') : 'Поражение';
        showResult('💔', defeatTitle, defeatMsg, 'loss');
        return;
    }

    if (gameState.enemyNumbers.length === 0) {
        // Победа
        gameState.stats.wins++;
        saveStats();
        updateLeaderboard(true); // Победа: +2 очка
        const victoryMsg = typeof i18n !== 'undefined' ? i18n.t('victoryMsg') : 'Вы разгромили врага!';
        const victoryTitle = typeof i18n !== 'undefined' ? i18n.t('victory') : 'Победа!';
        showResult('🏆', victoryTitle, victoryMsg, 'win');
        return;
    }

    // Следующий ход
    gameState.turnNumber++;

    // Подготовка к следующему ходу (без генерации новых отрядов!)
    prepareForNextTurn();
}

// Обновить лог битвы
function updateBattleLog(message, type = 'info') {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;

    while (log.children.length > 20) {
        log.removeChild(log.firstChild);
    }
}

// Показать результат
function showResult(icon, title, message, type) {
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');

    resultIcon.textContent = icon;
    resultTitle.textContent = title;
    resultMessage.textContent = message;

    // Добавляем класс для победы/поражения
    resultIcon.className = 'result-icon';
    if (type === 'win') {
        resultIcon.classList.add('victory');
    } else if (type === 'loss') {
        resultIcon.classList.add('defeat');
    }

    showScreen('result');
    handleMatchEndAds();
}

function handleMatchEndAds() {
    adState.rewardClaimedForMatch = false;
    adState.rewardInProgress = false;
    updateRewardUI();

    const triggerAd = () => showFullscreenAd('match-end');
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(triggerAd);
    } else {
        setTimeout(triggerAd, 300);
    }
}

// Сброс игры
function resetGame() {
    gameState.screen = 'menu';
    gameState.availableNumbers = [];
    gameState.yourNumbers = [];
    gameState.enemyNumbers = [];
    gameState.turnNumber = 1;
    gameState.yourFlanks = [null, null, null];
    gameState.enemyFlanks = [null, null, null];
    gameState.multiplayer.isMultiplayer = false;
    gameState.multiplayer.roomId = null;
    gameState.multiplayer.playerIndex = null;

    showScreen('menu');
}

// Вернуться в меню
function backToMenu() {
    stopReadyTimer(); // Останавливаем таймер при выходе
    showScreen('menu');
}

// Переключение экранов
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    document.getElementById(`${screenName}-screen`).classList.add('active');
    gameState.screen = screenName;
    updateBannerVisibility(screenName);
}

// Мультиплеер функции
function initMultiplayer() {
    // Check if nickname is entered
    const nickname = document.getElementById('nickname-input').value.trim();
    if (!nickname) {
        const errorMsg = typeof i18n !== 'undefined'
            ? i18n.t('enterNickname') || 'Please enter your nickname first!'
            : 'Пожалуйста, введите никнейм!';
        showInfoDialog(errorMsg, getDefaultDialogTitle('warning'));
        return;
    }

    // Save nickname and stats before starting multiplayer
    gameState.nickname = nickname;
    saveStats();

    if (!socket) {
        // Use production server if available, otherwise localhost
        const serverUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : 'https://numeric-duel-production.up.railway.app';
        socket = io(serverUrl);
        setupSocketListeners();
    }
    showScreen('multiplayer');
}

function setupSocketListeners() {
    // Prevent duplicate listeners
    if (socketListenersSetup) return;
    socketListenersSetup = true;

    socket.on('connect', () => {
        console.log('Connected to server');
        const lobbyStatus = document.getElementById('lobby-status');
        lobbyStatus.classList.remove('searching');
        const msg = typeof i18n !== 'undefined' ? i18n.t('connected') : 'Подключено к серверу';
        lobbyStatus.innerHTML = `<p>✅ ${msg}</p>`;
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        const lobbyStatus = document.getElementById('lobby-status');
        lobbyStatus.classList.remove('searching');
        const msg = typeof i18n !== 'undefined' ? i18n.t('disconnected') : 'Отключено от сервера';
        lobbyStatus.innerHTML = `<p>❌ ${msg}</p>`;
    });

    socket.on('room-created', (data) => {
        gameState.multiplayer.roomId = data.roomId;
        gameState.multiplayer.playerIndex = data.playerIndex;
        gameState.multiplayer.isMultiplayer = true;

        document.getElementById('room-id-display').textContent = data.roomId;
        document.getElementById('room-info').style.display = 'block';
        const lobbyStatus = document.getElementById('lobby-status');
        lobbyStatus.classList.remove('searching');
        const msg = typeof i18n !== 'undefined' ? i18n.t('roomCreated') : 'Комната создана! Ожидание второго игрока...';
        lobbyStatus.innerHTML = `<p>${msg}</p>`;
    });

    socket.on('joined-room', (data) => {
        gameState.multiplayer.roomId = data.roomId;
        gameState.multiplayer.playerIndex = data.playerIndex;
        gameState.multiplayer.isMultiplayer = true;

        document.getElementById('room-id-display').textContent = data.roomId;
        document.getElementById('room-info').style.display = 'block';
        const lobbyStatus = document.getElementById('lobby-status');
        lobbyStatus.classList.remove('searching');
        lobbyStatus.innerHTML = `<p>${getText('connectedToRoom', 'Комната найдена! Подготовьтесь к бою')}</p>`;
    });

    socket.on('match-found', (data) => {
        gameState.multiplayer.roomId = data.roomId;
        gameState.multiplayer.playerIndex = data.playerIndex;
        gameState.multiplayer.isMultiplayer = true;

        const lobbyStatus = document.getElementById('lobby-status');
        if (data.playerIndex === 0) {
            lobbyStatus.classList.add('searching');
            lobbyStatus.innerHTML = `<p>${getText('searchingOpponent', '🔍 Поиск соперника...')}</p>`;
        } else {
            lobbyStatus.classList.remove('searching');
            lobbyStatus.innerHTML = `<p>${getText('opponentFound', '✅ Противник найден! Начинаем бой...')}</p>`;
        }
    });

    socket.on('room-updated', (data) => {
        document.getElementById('players-count').textContent = data.players;
    });

    socket.on('numbers-ready', (data) => {
        gameState.availableNumbers = data.availableNumbers;
        gameState.yourNumbers = [];
        gameState.turnNumber = 1;

        displayAvailableNumbers();
        showScreen('selection');
    });

    socket.on('start-placing', (data) => {
        gameState.turnNumber = data.turnNumber;

        // Если пришла армия - обновляем
        if (data.yourArmy) {
            gameState.yourNumbers = data.yourArmy;
        }

        // Обновляем никнеймы
        if (data.yourNickname && data.enemyNickname) {
            displayUsernames(data.yourNickname, data.enemyNickname);
        } else {
            // Use defaults if not provided
        displayUsernames(gameState.nickname, null);
        }

        // Сбрасываем флаг placed для всех отрядов и фланги
        gameState.yourNumbers.forEach(u => u.placed = false);
        gameState.yourFlanks = [null, null, null];
        gameState.enemyFlanks = [null, null, null];

        const turnMsg = typeof i18n !== 'undefined'
            ? `${i18n.t('turn')} ${data.turnNumber}!`
            : `Ход ${data.turnNumber}! Расставьте войска на фланги.`;
        updateBattleLog(turnMsg, 'info');
        displayFlankSetup();
        showScreen('flank-setup');

        // Сбрасываем кнопку для нового хода
        const readyBtn = document.getElementById('flank-ready-btn');
        readyBtn.style.background = '';
        readyBtn.textContent = typeof i18n !== 'undefined' ? i18n.t('startBattleBtn') : 'Готов';
        readyBtn.disabled = false;

        // Запускаем таймер для автоготовности (40 секунд)
        startReadyTimer();
    });

    socket.on('battle-preparation', (data) => {
        // Показываем фланги перед боем
        gameState.yourFlanks = data.yourFlanks;
        gameState.enemyFlanks = data.enemyFlanks;

        // Обновляем отображение
        displayFlankSetup();

        // Показываем вражеские фланги перед боем
        const enemyContainer = document.getElementById('enemy-flanks');
        const enemyFlanks = enemyContainer.querySelectorAll('.flank-slot');
        enemyFlanks.forEach((slot, index) => {
            slot.classList.add('has-unit'); // Делаем видимыми
        });

        updateBattleLog('Фланги видны! Бой скоро начнется...', 'info');
    });

    socket.on('battle-results', (data) => {
        // Останавливаем таймер при получении результатов
        stopReadyTimer();

        // Проверяем что playerIndex установлен
        if (gameState.multiplayer.playerIndex === null) {
            console.error('playerIndex is null in battle-results!');
            return;
        }

        // Обработка результатов боя (аналогично одиночной игре)
        // Сохраняем обновленные армии для использования после анимации
        const updatedYourNumbers = gameState.multiplayer.playerIndex === 0 ? data.player1Numbers : data.player2Numbers;
        const updatedEnemyNumbers = gameState.multiplayer.playerIndex === 0 ? data.player2Numbers : data.player1Numbers;

        // СРАЗУ обновляем армии перед анимацией, чтобы они были корректны при получении start-placing
        gameState.yourNumbers = updatedYourNumbers;
        gameState.enemyNumbers = updatedEnemyNumbers;

        // Показываем результаты с анимацией
        displayBattleResultsWithAnimation(data.results, true).then(() => {
            // Сбрасываем фланги для следующего хода
            gameState.yourFlanks = [null, null, null];
            gameState.enemyFlanks = [null, null, null];
        });
    });

    socket.on('game-over', (data) => {
        // Clear multiplayer state
        gameState.multiplayer.isMultiplayer = false;
        gameState.multiplayer.roomId = null;
        gameState.multiplayer.playerIndex = null;

        if (data.winner === socket.id) {
            // Player won
            gameState.stats.wins++;
            saveStats();
            updateLeaderboard(true); // Victory: +2 points
            const victoryMsg = typeof i18n !== 'undefined' ? i18n.t('victoryMsg') : 'Вы разгромили врага!';
            const victoryTitle = typeof i18n !== 'undefined' ? i18n.t('victory') : 'Победа!';
            showResult('🏆', victoryTitle, victoryMsg, 'win');
        } else {
            // Player lost
            gameState.stats.losses++;
            saveStats();
            updateLeaderboard(false); // Defeat: -2 points
            const defeatMsg = typeof i18n !== 'undefined' ? i18n.t('defeatMsg') : 'Враг уничтожил вашу армию!';
            const defeatTitle = typeof i18n !== 'undefined' ? i18n.t('defeat') : 'Поражение';
            showResult('💔', defeatTitle, defeatMsg, 'loss');
        }
    });

    socket.on('error', (error) => {
        console.error('Ошибка:', error);
        showErrorDialog(error);
    });

    socket.on('player-disconnected', () => {
        const msg = getText('opponentDisconnected', 'Соперник отключился');
        showInfoDialog(msg);
        backToMenu();
    });

    // Получение глобального лидерборда
    socket.on('global-leaderboard', (data) => {
        updateGlobalLeaderboard(data);
    });

    // Setup chat message listener
    socket.on('chat-message', (data) => {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageEl = document.createElement('div');
        const isOwn = data.playerId === gameState.playerId;
        messageEl.className = `chat-message ${isOwn ? 'own' : 'player'}`;
        messageEl.innerHTML = `<span class="sender">${data.nickname}:</span>${data.message}`;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Keep only last 50 messages
        while (chatMessages.children.length > 50) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    });
}

function createRoom() {
    const defaultName = getText('defaultPlayerName', 'Игрок');
    socket.emit('create-room', { name: gameState.nickname || defaultName, playerId: gameState.playerId });
}

function joinRoom(roomId) {
    const defaultName = getText('defaultPlayerName', 'Игрок');
    socket.emit('join-room', { roomId: roomId, name: gameState.nickname || defaultName, playerId: gameState.playerId });
}

function findMatch() {
    // Check if already searching/in a room
    if (gameState.multiplayer.isMultiplayer && gameState.multiplayer.roomId) {
        // Already searching or in a match
        const alreadySearchingMsg = getText('alreadySearching', 'Вы уже ищете противника...');
        const lobbyStatus = document.getElementById('lobby-status');
        lobbyStatus.innerHTML = `<p>${alreadySearchingMsg}</p>`;
        return;
    }

    // Check if nickname is entered
    const nickname = document.getElementById('nickname-input').value.trim() || gameState.nickname;
    if (!nickname) {
        const errorMsg = typeof i18n !== 'undefined'
            ? i18n.t('enterNickname') || 'Please enter your nickname first!'
            : 'Пожалуйста, введите никнейм!';
        showErrorDialog(errorMsg);
        // Go back to menu to enter nickname
        showScreen('menu');
        return;
    }

    // Update nickname in gameState
    gameState.nickname = nickname;
    saveStats();

    const lobbyStatus = document.getElementById('lobby-status');
    const searchText = getText('searchingOpponent', '🔍 Поиск соперника...');
    lobbyStatus.innerHTML = `<p>${searchText}</p>`;
    lobbyStatus.classList.add('searching');
    socket.emit('find-match', { name: nickname, playerId: gameState.playerId });
}

// Таймер автоготовности
function startReadyTimer() {
    stopReadyTimer(); // Останавливаем предыдущий если есть

    let secondsLeft = 40;
    const timerDisplay = document.getElementById('flank-ready-btn');
    const originalText = timerDisplay.textContent;

    updateTimerDisplay();

    readyTimer = setInterval(() => {
        secondsLeft--;
        updateTimerDisplay();

        if (secondsLeft <= 0) {
            stopReadyTimer();
            // Автоматическая расстановка и готовность
            autoPlaceFlanks();
        }
    }, 1000);

    function updateTimerDisplay() {
        if (secondsLeft > 0) {
            const template = getText('readyCountdown', 'Готов ({seconds}с)');
            timerDisplay.textContent = template.replace('{seconds}', secondsLeft);
        } else {
            timerDisplay.textContent = originalText;
        }
    }
}

function stopReadyTimer() {
    if (readyTimer) {
        clearInterval(readyTimer);
        readyTimer = null;
    }
}

function autoPlaceFlanks() {
    // Автоматически расставляем оставшиеся юниты
    const available = gameState.yourNumbers.filter(u => !u.placed);

    available.forEach(unit => {
        // Найти первый свободный фланг
        for (let i = 0; i < 3; i++) {
            if (gameState.yourFlanks[i] === null) {
                unit.placed = true;
                gameState.yourFlanks[i] = unit;
                break;
            }
        }
    });

    // Обновляем отображение
    displayFlankSetup();

    // Автоматически отправляем готовность
    if (gameState.multiplayer.isMultiplayer && socket) {
        // Визуальная обратная связь
        const readyBtn = document.getElementById('flank-ready-btn');
        readyBtn.style.background = 'var(--success-color)';
        readyBtn.textContent = '✓ Готово (авто)';
        readyBtn.disabled = true;

        const flanksToSend = gameState.yourFlanks.map(f => f ? { id: f.id, value: f.value, type: f.type } : null);
        socket.emit('submit-flanks', {
            roomId: gameState.multiplayer.roomId,
            flanks: flanksToSend
        });
        updateBattleLog('Автоматическая готовность!', 'info');
    }
}

// Получить данные лидерборда
function getLeaderboardData() {
    const leaderboardData = [];

    // Ищем все ключи с никнеймами и статистикой
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('leaderboard_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                leaderboardData.push(data);
            } catch (e) {
                console.error('Error parsing leaderboard data:', e);
            }
        }
    }

    // Сортируем по рейтингу
    leaderboardData.sort((a, b) => {
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;

        if (bRating !== aRating) return bRating - aRating;

        // Если рейтинг одинаковый, сортируем по винрейту
        const aTotal = a.wins + a.losses;
        const bTotal = b.wins + b.losses;
        const aWR = aTotal > 0 ? a.wins / aTotal : 0;
        const bWR = bTotal > 0 ? b.wins / bTotal : 0;

        if (bWR !== aWR) return bWR - aWR;
        return b.wins - a.wins;
    });

    return leaderboardData;
}

// Загрузить мини-лидерборд
function loadMiniLeaderboard() {
    const leaderboardData = getLeaderboardData();
    const miniLeaderboardList = document.getElementById('mini-leaderboard-list');

    miniLeaderboardList.innerHTML = '';

    if (leaderboardData.length === 0) {
        miniLeaderboardList.innerHTML = '<div style="padding: 10px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">Пока нет игроков</div>';
    } else {
        // Показываем только топ 5
        const topPlayers = leaderboardData.slice(0, 5);
        topPlayers.forEach((player, index) => {
            const row = document.createElement('div');
            row.className = 'mini-leaderboard-row' + (index < 3 ? ' top3' : '');

            row.innerHTML = `
                <span class="mini-leaderboard-rank">${index + 1}</span>
                <span class="mini-leaderboard-name">${player.nickname || 'Безымянный'}</span>
                <span class="mini-leaderboard-rating">${player.rating || 0} ⭐</span>
            `;

            miniLeaderboardList.appendChild(row);
        });
    }
}

// Показать лидерборд
function showLeaderboard() {
    // Запрашиваем глобальный лидерборд с сервера
    requestFullLeaderboard();

    showScreen('leaderboard');
}

// Запрос полного лидерборда
function requestFullLeaderboard() {
    const serverUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://numeric-duel-production.up.railway.app';

    const tempSocket = io(serverUrl);
    tempSocket.on('connect', () => {
        tempSocket.emit('get-global-leaderboard');
    });

    tempSocket.on('global-leaderboard', (data) => {
        displayFullLeaderboard(data);
        tempSocket.disconnect();
    });
}

// Отображение полного лидерборда
function displayFullLeaderboard(leaderboardData) {
    const leaderboardList = document.getElementById('leaderboard-list');
    const playerPosition = document.getElementById('player-position');

    if (!leaderboardList) return;

    leaderboardList.innerHTML = '';

    if (!leaderboardData || leaderboardData.length === 0) {
        const noPlayersText = typeof i18n !== 'undefined' ? 'No players yet' : 'Пока нет игроков в лидерборде';
        leaderboardList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary);">${noPlayersText}</div>`;
        if (playerPosition) playerPosition.innerHTML = '';
        return;
    }

    // Находим позицию текущего игрока
    const currentNickname = gameState.nickname;
    let playerRank = -1;
    let playerData = null;

    leaderboardData.forEach((player, index) => {
        if (player.nickname === currentNickname) {
            playerRank = index + 1;
            playerData = player;
        }

        const noNameText = typeof i18n !== 'undefined' ? 'Anonymous' : 'Безымянный';
        const row = document.createElement('div');
        row.className = 'leaderboard-row' + (index < 3 ? ' top3' : '');

        row.innerHTML = `
            <span class="leaderboard-rank">${index + 1}</span>
            <span class="leaderboard-name">${player.nickname || noNameText}</span>
            <span class="leaderboard-rating" style="color: var(--warning-color); font-weight: bold;">${player.rating || 0}</span>
            <span class="leaderboard-wins">${player.wins}</span>
            <span class="leaderboard-losses">${player.losses}</span>
        `;

        leaderboardList.appendChild(row);
    });

    // Отображаем позицию игрока
    if (playerPosition) {
        if (playerRank > 0 && playerData) {
            const positionText = typeof i18n !== 'undefined'
                ? `Your position: #${playerRank} | ${playerData.nickname} | Rating: ${playerData.rating} ⭐ | Wins: ${playerData.wins} | Losses: ${playerData.losses}`
                : `Ваша позиция: #${playerRank} | ${playerData.nickname} | Рейтинг: ${playerData.rating} ⭐ | Побед: ${playerData.wins} | Поражений: ${playerData.losses}`;
            playerPosition.innerHTML = positionText;
        } else {
            const notInLBText = typeof i18n !== 'undefined'
                ? `You are not in the leaderboard yet. Play some matches to get ranked!`
                : `Вы пока не в лидерборде. Сыграйте несколько матчей для участия в рейтинге!`;
            playerPosition.innerHTML = notInLBText;
        }
    }
}

// Обновляем статистику в лидерборде при сохранении
function updateLeaderboard(won = null) {
    if (!gameState.nickname) return;

    const key = `leaderboard_${gameState.nickname.toLowerCase().replace(/\s+/g, '_')}`;
    const existing = localStorage.getItem(key);

    let stats;
    if (existing) {
        try {
            stats = JSON.parse(existing);
        } catch (e) {
            stats = { nickname: gameState.nickname, wins: 0, losses: 0, rating: 0 };
        }
    } else {
        stats = { nickname: gameState.nickname, wins: 0, losses: 0, rating: 0 };
    }

    // Обновляем статистику
    if (won === true) {
        stats.wins = gameState.stats.wins;
        stats.rating = Math.max(0, (stats.rating || 0) + 2);
    } else if (won === false) {
        stats.losses = gameState.stats.losses;
        stats.rating = Math.max(0, (stats.rating || 0) - 2);
    } else {
        stats.wins = Math.max(stats.wins, gameState.stats.wins);
        stats.losses = Math.max(stats.losses, gameState.stats.losses);
    }

    localStorage.setItem(key, JSON.stringify(stats));

    // Note: Mini leaderboard updates automatically via server data
}

// Запрос глобального лидерборда с сервера
function requestGlobalLeaderboard() {
    if (socket && socket.connected) {
        socket.emit('get-global-leaderboard');
    } else {
        // Подключаемся специально для получения лидерборда
        const serverUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : 'https://numeric-duel-production.up.railway.app';
        const tempSocket = io(serverUrl);
        tempSocket.on('connect', () => {
            tempSocket.emit('get-global-leaderboard');
        });
        tempSocket.on('global-leaderboard', (data) => {
            updateGlobalLeaderboard(data);
            tempSocket.disconnect();
        });
    }
}

// Обновление глобального лидерборда на клиенте
function updateGlobalLeaderboard(serverData) {
    if (!serverData || serverData.length === 0) {
        // Show empty state
        const miniLeaderboardList = document.getElementById('mini-leaderboard-list');
        const leaderboardList = document.getElementById('leaderboard-list');

        if (miniLeaderboardList) {
            const noPlayersText = typeof i18n !== 'undefined' ? 'No players yet' : 'Пока нет игроков';
            miniLeaderboardList.innerHTML = `<div style="padding: 10px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">${noPlayersText}</div>`;
        }
        return;
    }

    // Update mini leaderboard in menu
    const miniLeaderboardList = document.getElementById('mini-leaderboard-list');
    if (miniLeaderboardList) {
        const html = serverData.slice(0, 5).map((player, index) => {
            const noNameText = typeof i18n !== 'undefined' ? 'Anonymous' : 'Безымянный';
            return `
                <div class="mini-leaderboard-row ${index < 3 ? 'top3' : ''}">
                    <span class="mini-leaderboard-rank">${index + 1}</span>
                    <span class="mini-leaderboard-name">${player.nickname || noNameText}</span>
                    <span class="mini-leaderboard-rating">${player.rating || 0} ⭐</span>
                </div>
            `;
        }).join('');
        miniLeaderboardList.innerHTML = html;
    }

    // Also update full leaderboard if we're on that screen
    const leaderboardList = document.getElementById('leaderboard-list');
    if (leaderboardList && leaderboardList.innerHTML !== '') {
        displayFullLeaderboard(serverData);
    }
}

// Проверка доступности никнейма
function checkNicknameAvailability(nickname) {
    if (!nickname || nickname.length < MIN_NICKNAME_LENGTH) {
        updateNicknameStatus('', '');
        return;
    }

    const serverUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://numeric-duel-production.up.railway.app';

    const tempSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        forceNew: true,
        reconnectionAttempts: 0,
        timeout: 3000
    });

    let resolved = false;

    tempSocket.on('connect', () => {
        tempSocket.emit('check-nickname', { nickname: nickname, playerId: gameState.playerId });
    });

    tempSocket.on('nickname-check-result', (data) => {
        resolved = true;
        if (data.isTaken) {
            const takenText = getText('nicknameTaken', '⚠️ Ник уже занят!');
            updateNicknameStatus(takenText, 'error');
        } else {
            const availableText = getText('nicknameAvailable', '✅ Ник свободен');
            updateNicknameStatus(availableText, 'success');
        }
        tempSocket.disconnect();
    });

    const handleAvailabilityError = () => {
        if (resolved) return;
        resolved = true;
        const failMsg = getText('nicknameCheckFailed', '⚠️ Не удалось проверить ник. Попробуйте позже.');
        updateNicknameStatus(failMsg, 'error');
        tempSocket.disconnect();
    };

    tempSocket.on('connect_error', handleAvailabilityError);
    tempSocket.on('connect_timeout', handleAvailabilityError);
    tempSocket.on('error', handleAvailabilityError);

    setTimeout(handleAvailabilityError, 4000);
}

// Обновление статуса никнейма
function updateNicknameStatus(message, type) {
    const statusEl = document.getElementById('nickname-status');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = 'nickname-status ' + type;
}

// Setup chat listeners
function setupChatListeners() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    const chatContainer = document.querySelector('.chat-container');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggle && chatContainer) {
        chatToggle.addEventListener('click', () => {
            chatContainer.classList.toggle('collapsed');
            chatToggle.textContent = chatContainer.classList.contains('collapsed') ? '+' : '−';
        });
    }

    const sendMessage = () => {
        if (!chatInput || !chatMessages) return;
        const message = chatInput.value.trim();
        if (!message || !gameState.nickname) return;

        // Send message to server
        if (socket && socket.connected) {
            socket.emit('chat-message', {
                nickname: gameState.nickname,
                message: message,
                playerId: gameState.playerId
            });
        } else {
            // Show error if not connected
            const errorMsg = getText('notConnected', 'Нет подключения к серверу');
            showErrorDialog(errorMsg);
        }

        chatInput.value = '';
    };

    if (chatSend) {
        chatSend.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Display usernames in battle
function displayUsernames(yourNickname, enemyNickname) {
    const yourDisplay = document.getElementById('your-nickname-display');
    const enemyDisplay = document.getElementById('enemy-nickname-display');

    const defaultYourLabels = ['your troops', 'ваши войска'];
    const defaultEnemyLabels = ['enemy', 'враг'];

    const normalize = (value) => (value || '').trim().toLowerCase();

    if (yourDisplay) {
        const useDefault =
            !yourNickname ||
            (!gameState.multiplayer.isMultiplayer &&
                defaultYourLabels.includes(normalize(yourNickname)));
        yourDisplay.textContent = useDefault
            ? getText('yourTroopsLabel', 'Ваши войска')
            : yourNickname;
    }

    if (enemyDisplay) {
        const useDefault =
            !enemyNickname ||
            (!gameState.multiplayer.isMultiplayer &&
                defaultEnemyLabels.includes(normalize(enemyNickname)));
        enemyDisplay.textContent = useDefault
            ? getText('enemyLabel', 'Враг')
            : enemyNickname;
    }
}

// Surrender function
async function surrender() {
    const confirmMsg = typeof i18n !== 'undefined'
        ? i18n.t('surrenderConfirm')
        : 'Вы уверены, что хотите сдаться?';

    const confirmed = await showConfirmDialog(confirmMsg, getDefaultDialogTitle('confirm'));
    if (!confirmed) return;

    // In multiplayer
    if (gameState.multiplayer.isMultiplayer && socket && socket.connected) {
        socket.emit('surrender', { roomId: gameState.multiplayer.roomId });
        // Don't update stats here - server will handle it via game-over event
    } else {
        // Single player - just go to menu
        resetGame();
    }
}

// Запуск игры с учетом Yandex SDK
document.addEventListener('DOMContentLoaded', () => {
    const MAX_ATTEMPTS = 10;
    const RETRY_DELAY = 100;
    let attempts = 0;

    function ensureSdkAndStart() {
        if (typeof YaGames !== 'undefined' && typeof YaGames.init === 'function') {
            initYandexSDK();
            return;
        }

        if (attempts < MAX_ATTEMPTS) {
            attempts++;
            setTimeout(ensureSdkAndStart, RETRY_DELAY);
        } else {
            console.warn('⚠️ YaGames SDK not detected, launching game without SDK');
            startApplication();
        }
    }

    ensureSdkAndStart();
});
