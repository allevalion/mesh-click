(function () {
    // Если игра уже запущена, повторный запуск не выполняется
    if (document.getElementById('mesh-click-game')) return;

    document.body.style.cssText = "overflow-y: hidden;"
    // Стили
    var styleElem = document.createElement('style');
    styleElem.innerHTML = `
.achievement-card {
margin-bottom: 50%;
right: 50%;
left: 45%;
max-width: 200px;
background: white;
border: 1px solid #81D4FA;
border-radius: 8px;
padding: 10px;
transition: transform 0.5s ease-out, opacity 0.5s ease-out;
}
#achievements-panel {
position: fixed;
top: 0;
left: -500px;
width: 300px;
height: 100vh;
background: white;
overflow-y: auto;
padding: 20px;
box-shadow: 2px 0 5px rgba(0,0,0,0.3);
transition: left 0.3s ease;
z-index: 10001;
}
#achievements-panel.open {
left: 0;
}
.modal-overlay {
position: fixed;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
background: rgba(0,0,0,0.8);
display: flex;
justify-content: center;
align-items: center;
z-index: 10004;
}
.modal {
background: #fff;
padding: 20px;
border-radius: 10px;
width: 300px;
text-align: center;
position: relative;
}
.modal h2 {
margin-top: 0;
}
.modal button {
margin-top: 10px;
}
.certificate {
background: white;
padding: 20px;
border: 4px double #0066cc;
border-radius: 10px;
text-align: center;
position: relative;
font-family: 'Georgia', serif;
}
`;
    document.head.appendChild(styleElem);

    // Создание оверлея игры
    var gameOverlay = document.createElement('div');
    gameOverlay.id = 'mesh-click-game';
    Object.assign(gameOverlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9998',
        userSelect: 'none'
    });

    // Счётчик уровня (вверху)
    var levelDisplay = document.createElement('div');
    levelDisplay.id = 'level-display';
    Object.assign(levelDisplay.style, {
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#000',
        fontSize: '28px'
    });
    levelDisplay.innerHTML = 'Уровень: 1';
    gameOverlay.appendChild(levelDisplay);

    // Отображение количества монет
    var coinDisplay = document.createElement('div');
    coinDisplay.id = 'coin-count';
    Object.assign(coinDisplay.style, {
        color: '#000',
        fontSize: '28px',
        marginBottom: '170px'
    });
    coinDisplay.innerHTML = 'Монеты: 0';
    gameOverlay.appendChild(coinDisplay);

    // Контейнер для монетки
    var coinContainer = document.createElement('div');
    coinContainer.style.position = 'relative';
    coinContainer.style.width = '300px';
    coinContainer.style.height = '300px';

    // Создание монетки (300x300)
    var coinButton = document.createElement('div');
    coinButton.id = 'coin-button';
    Object.assign(coinButton.style, {
        width: '300px',
        height: '300px',
        background: '#0066cc', // обновляется по уровню
        borderRadius: '50%',
        boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
        border: '10px solid rgb(0, 66, 133)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        top: '-30%',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.2s',
        transformOrigin: '50% 50%'
    });
    var coinRotation = 0;
    var coinScale = 1;
    coinButton.style.transform = 'rotate(0deg) scale(1)';

    // Добавление изображения для монетки (начальное: meshik.gif)
    var coinImg = document.createElement('img');
    coinImg.src = 'img/meshik.gif';
    Object.assign(coinImg.style, {
        width: '80%',
        height: '80%',
        borderRadius: '50%',
        pointerEvents: 'none'
    });
    coinButton.appendChild(coinImg);

    // Добавление SVG с круговым текстом
    var svgNS = "http://www.w3.org/2000/svg";
    var svgElem = document.createElementNS(svgNS, 'svg');
    svgElem.setAttribute('width', '300');
    svgElem.setAttribute('height', '300');
    svgElem.setAttribute('viewBox', '0 0 300 300');
    svgElem.style.position = 'absolute';
    svgElem.style.top = '0';
    svgElem.style.left = '0';
    svgElem.style.pointerEvents = 'none';

    var defs = document.createElementNS(svgNS, 'defs');
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('id', 'coinTextPath');
    path.setAttribute('d', 'M 150,150 m -130,0 a 130,130 0 1,1 260,0 a 130,130 0 1,1 -260,0');
    defs.appendChild(path);
    svgElem.appendChild(defs);

    var textElem = document.createElementNS(svgNS, 'text');
    textElem.setAttribute('fill', '#fff');
    textElem.setAttribute('font-size', '14');
    textElem.setAttribute('font-family', 'Arial, sans-serif');
    var textPath = document.createElementNS(svgNS, 'textPath');
    textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#coinTextPath');
    textPath.setAttribute('startOffset', '50%');
    textPath.style.textAnchor = 'middle';
    textPath.textContent = 'МЭШ.КЛИК • MESH.CLICK • МЭШ.КЛИК • MESH.CLICK • МЭШ.КЛИК • MESH.CLICK • МЭШ.КЛИК • MESH.CLICK • МЭШ.КЛИК • MESH.CLICK • ';
    textElem.appendChild(textPath);
    svgElem.appendChild(textElem);
    coinButton.appendChild(svgElem);

    coinContainer.appendChild(coinButton);
    gameOverlay.appendChild(coinContainer);


    // Функция регистрации достижения (проверка по id)
    function registerAchievement(achievement) {
        if (!gameState.achievements.some(function (a) { return a.id === achievement.id; })) {
            gameState.achievements.push(achievement);
            saveState();
            showAchievement(achievement);
            updateAchievementsPanel();
        }
    }

    // Создание панели улучшений
    var upgradesContainer = document.createElement('div');
    upgradesContainer.id = 'upgrades-container';
    Object.assign(upgradesContainer.style, {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '30px',
        gap: '20px',
        flexWrap: 'wrap'
    });

    var upgrades = [
        {
            id: 'autoclicker',
            name: 'Автокликер',
            description: 'Автоматически кликает каждую секунду.',
            baseCost: 100,
            costMultiplier: 1.5,
            count: 0,
            img: 'img/autoclicker.webp'
        },
        {
            id: 'multiplier',
            name: 'Множитель клика',
            description: 'Увеличивает количество монет за клик.',
            baseCost: 50,
            costMultiplier: 1.5,
            count: 0,
            img: 'img/multiplier.webp'
        },
        {
            id: 'zvezda',
            name: 'Звезда',
            description: 'Удесятеряет монеты за клик на 3 секунды.',
            baseCost: 10000,
            costMultiplier: 4,
            count: 0,
            img: 'img/star.webp'
        }
    ];

    upgrades.forEach(function (upgrade) {
        var card = document.createElement('div');
        card.className = 'upgrade-card';
        Object.assign(card.style, {
            background: '#fff',
            borderRadius: '10px',
            padding: '10px',
            width: '200px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            userSelect: 'none'
        });

        var img = document.createElement('img');
        img.src = upgrade.img;
        Object.assign(img.style, {
            width: '80px',
            height: '80px',
            objectFit: 'contain',
            marginBottom: '10px'
        });
        card.appendChild(img);


        // Настройка имени для улучшения
        var name = document.createElement('h4');
        name.textContent = upgrade.name;
        Object.assign(name.style, { margin: '5px 0', fontSize: '18px' });
        card.appendChild(name);

        // Настройка описания для улучшения
        var desc = document.createElement('p');
        desc.textContent = upgrade.description;
        Object.assign(desc.style, { margin: '5px 0', fontSize: '1.5em' });
        card.appendChild(desc);


        // Отображение стоимости улучшений
        var costDisplay = document.createElement('div');
        costDisplay.className = 'upgrade-cost';
        var cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
        costDisplay.textContent = 'Стоимость: ' + cost;
        costDisplay.style.margin = '10px 0';
        card.appendChild(costDisplay);


        // Кнопка покупки улучшений
        var buyButton = document.createElement('button');
        buyButton.textContent = 'Купить';
        Object.assign(buyButton.style, {
            padding: '10px 15px',
            fontSize: '1.5em',
            background: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
        });

        buyButton.addEventListener('click', function () {
            var cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
            if (gameState.coins >= cost) {
                gameState.coins -= cost;
                upgrade.count++;
                if (upgrade.id === 'autoclicker') {
                    gameState.autoClickers++;
                } else if (upgrade.id === 'multiplier') {
                    gameState.multiplier++;
                    gameState.clickValue = 1 + gameState.multiplier;
                } else if (upgrade.id === 'zvezda') {
                    registerAchievement({
                        id: 'star',
                        title: 'Звезда по имени Солнце',
                        description: 'Белый снег, серый лёд',
                        image: 'img/meshik7.gif'
                    });
                    let originalClickValue = gameState.clickValue;
                    gameState.clickValue *= 10;
                    setTimeout(function () {
                        gameState.clickValue = originalClickValue;
                        saveState();
                    }, 3000);
                }
                updateDisplay();
                updateUpgradesDisplay();
                saveState();
            }
        });
        card.appendChild(buyButton);

        upgradesContainer.appendChild(card);
    });
    gameOverlay.appendChild(upgradesContainer);

    // Добавляем оверлей игры в документ
    document.body.appendChild(gameOverlay);

    // Кнопка «Сброс прогресса» (обнуляет gameState и очищает localStorage)
    var resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    resetButton.innerHTML = 'Сброс прогресса';
    Object.assign(resetButton.style, {
        position: 'fixed',
        right: '10px',
        zIndex: '10000',
        padding: '10px 15px',
        fontSize: '1.2em',
        background: 'red',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        userSelect: 'none'
    });
    document.body.appendChild(resetButton);

    resetButton.addEventListener('click', function () {
        if (confirm("Вы уверены, что хотите сбросить прогресс?")) {
            // Обнуляем gameState
            gameState = {
                coins: 0,
                clickValue: 1,
                autoClickers: 0,
                multiplier: 0,
                lastLevel: 1,
                achievements: [],
                victory: false,
                bugEventsTriggered: []
            };
            // Сбрасываем счётчики в апгрейдах
            upgrades.forEach(function (upg) { upg.count = 0; });
            localStorage.clear();
            updateDisplay();
            updateUpgradesDisplay();
            updateAchievementsPanel();
            alert("Прогресс сброшен.");
        }
    });

    // Панель для просмотра достижений
    var achievementsPanel = document.createElement('div');
    achievementsPanel.id = 'achievements-panel';
    achievementsPanel.innerHTML = '<h3 style="margin:0 0 10px 0; text-align:center;">Достижения</h3>';
    document.body.appendChild(achievementsPanel);

    // Кнопка для переключения панели достижений (слева)
    var achievementsToggleButton = document.createElement('button');
    achievementsToggleButton.id = 'achievements-toggle-button';
    achievementsToggleButton.innerHTML = 'Показать достижения';
    Object.assign(achievementsToggleButton.style, {
        position: 'fixed',
        top: '10px',
        left: '400px',
        zIndex: '10002',
        padding: '10px 15px',
        fontSize: '1.5em',
        background: '#0066cc',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        userSelect: 'none'
    });
    document.body.appendChild(achievementsToggleButton);

    achievementsToggleButton.addEventListener('click', function () {
        if (achievementsPanel.classList.contains('open')) {
            achievementsPanel.classList.remove('open');
            achievementsToggleButton.innerHTML = 'Показать достижения';
        } else {
            achievementsPanel.classList.add('open');
            achievementsToggleButton.innerHTML = 'Скрыть достижения';
        }
    });

    // Кнопка "Связь с создателем"
    var contactButton = document.createElement('button');
    contactButton.id = 'contact-button';
    contactButton.innerHTML = 'Связь с создателем';
    Object.assign(contactButton.style, {
        position: 'fixed',
        bottom: '70px',
        right: '10px',
        zIndex: '10001',
        padding: '10px 15px',
        fontSize: '1.5em',
        background: '#0066cc',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        userSelect: 'none'
    });
    document.body.appendChild(contactButton);
    contactButton.addEventListener('click', function () {
        window.open('https://t.me/llukyanov', '_blank');
    });

    // Кнопка "Поделиться достижениями"
    var shareButton = document.createElement('button');
    shareButton.id = 'share-button';
    shareButton.innerHTML = 'Поделиться достижениями';
    Object.assign(shareButton.style, {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: '10001',
        padding: '10px 15px',
        fontSize: '1.1em',
        background: '#0066cc',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        userSelect: 'none'
    });
    document.body.appendChild(shareButton);

    shareButton.addEventListener('click', function () {
        showShareModal();
    });

    // Функция отображения модального окна для сертификата
    function showShareModal() {
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        var modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = '<h2>Поделиться достижениями</h2>' +
            '<input type="text" id="surname" placeholder="Фамилия" style="width: calc(100% - 20px); margin: 5px 0; padding: 8px; border: 1px solid #81D4FA; border-radius: 5px; background: #f9f9f9; font-size: 14px; outline: none; transition: border-color 0.3s ease, box-shadow 0.3s ease;" onfocus="this.style.borderColor=\'#0066cc\'; this.style.boxShadow=\'0 0 5px rgba(0, 102, 204, 0.5)\'; this.style.background=\'white\';" onblur="this.style.borderColor=\'#81D4FA\'; this.style.boxShadow=\'none\'; this.style.background=\'#f9f9f9\';">' +
            '<input type="text" id="name" placeholder="Имя" style="width: calc(100% - 20px); margin: 5px 0; padding: 8px; border: 1px solid #81D4FA; border-radius: 5px; background: #f9f9f9; font-size: 14px; outline: none; transition: border-color 0.3s ease, box-shadow 0.3s ease;" onfocus="this.style.borderColor=\'#0066cc\'; this.style.boxShadow=\'0 0 5px rgba(0, 102, 204, 0.5)\'; this.style.background=\'white\';" onblur="this.style.borderColor=\'#81D4FA\'; this.style.boxShadow=\'none\'; this.style.background=\'#f9f9f9\';">' +
            '<input type="text" id="class" placeholder="Класс" style="width: calc(100% - 20px); margin: 5px 0; padding: 8px; border: 1px solid #81D4FA; border-radius: 5px; background: #f9f9f9; font-size: 14px; outline: none; transition: border-color 0.3s ease, box-shadow 0.3s ease;" onfocus="this.style.borderColor=\'#0066cc\'; this.style.boxShadow=\'0 0 5px rgba(0, 102, 204, 0.5)\'; this.style.background=\'white\';" onblur="this.style.borderColor=\'#81D4FA\'; this.style.boxShadow=\'none\'; this.style.background=\'#f9f9f9\';">' +
            '<button id="submit-share" style="margin-top: 10px; padding: 8px 12px; background: #81D4FA; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.3s ease;" onmouseover="this.style.background=\'#0066cc\'; this.style.color=\'white\';" onmouseout="this.style.background=\'#81D4FA\'; this.style.color=\'black\';">Создать сертификат</button>';

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        modal.querySelector('#submit-share').addEventListener('click', function () {
            var surname = modal.querySelector('#surname').value;
            var name = modal.querySelector('#name').value;
            var className = modal.querySelector('#class').value;
            if (surname && name && className) {
                showCertificate({ surname: surname, name: name, className: className });
                document.body.removeChild(overlay);
            } else {
                alert("Пожалуйста, заполните все поля.");
            }
        });

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    // Функция показа сертификата достижений
    function showCertificate(data) {
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        var modal = document.createElement('div');
        modal.className = 'modal';
        Object.assign(modal.style, {
            width: '80%',
            maxWidth: '800px'
        });
        var certContent = document.createElement('div');
        certContent.className = 'certificate';
        certContent.innerHTML =
            '<h1 style="font-size: 32px; margin-bottom: 10px;">СЕРТИФИКАТ ДОСТИЖЕНИЙ</h1>' +
            '<p style="font-size: 20px;">Присуждается ученику(це) <strong>' + data.className + ' класса ' + data.surname + ' ' + data.name + '</strong></p>' +
            '<hr>' +
            '<p style="font-size: 20px;">За достижения в игре "МЭШ.КЛИК"</p>' +
            '<p style="font-size: 18px;">Достигнутый уровень: ' + levelDisplay.innerHTML.replace('Уровень: ', '') + '</p>' +
            '<p style="font-size: 18px;">Монеты: ' + gameState.coins + '</p>';
        var upgradesList = '<p style="font-size: 18px;">Улучшения:</p><ul style="font-size: 18px; text-align:left;">';
        upgrades.forEach(function (upg) {
            upgradesList += '<li>' + upg.name + ': ' + upg.count + '</li>';
        });
        upgradesList += '</ul>';
        certContent.innerHTML += upgradesList;
        certContent.innerHTML += '<img src="img/meshik.gif" style="width:150px; margin-top:10px;">';
        certContent.innerHTML += '<div style="position:absolute; bottom:10px; right:10px; font-size:24px; color:#0066cc; transform: rotate(-15deg); border:2px solid #0066cc; padding:5px; border-radius:5px;">МЭШ.КЛИК</div>';
        modal.appendChild(certContent);
        var closeBtn = document.createElement('button');
        closeBtn.textContent = 'Закрыть';
        closeBtn.style.cssText = `
margin-top: 10px;
padding: 10px 15px;
font-size: 1.1em;
background: #0066cc;
color: #fff;
border: none;
border-radius: 5px;
cursor: pointer;
user-select: none;
`;
        closeBtn.addEventListener('click', function () {
            document.body.removeChild(overlay);
        });
        var fullScreenBtn = document.createElement('button');
        fullScreenBtn.textContent = 'На весь экран';
        fullScreenBtn.style.cssText = `
margin-top: 10px;
margin-left: 10px;
padding: 10px 15px;
font-size: 1.1em;
background: #0066cc;
color: #fff;
border: none;
border-radius: 5px;
cursor: pointer;
user-select: none;
`;

        fullScreenBtn.addEventListener('click', function () {
            if (overlay.requestFullscreen) {
                overlay.requestFullscreen();
            }
        });
        modal.appendChild(closeBtn);
        modal.appendChild(fullScreenBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // Победное меню при достижении 1 млн монет
    function showVictoryModal() {
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        var modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = '<h1 style="font-size: 36px;">Поздравляем!</h1>' +
            '<p style="font-size: 24px;">Вы достигли 1.000.000 монет!</p>' +
            '<button id="restart-button" style="margin-top: 10px; padding: 10px 15px; font-size: 1.1em; background: #0066cc; color: #fff; border: none; border-radius: 5px; cursor: pointer; user-select: none;">Начать заново</button>';
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        modal.querySelector('#restart-button').addEventListener('click', function () {
            // Полный сброс прогресса
            gameState = {
                coins: 0,
                clickValue: 1,
                autoClickers: 0,
                multiplier: 0,
                lastLevel: 1,
                achievements: [],
                victory: false,
                bugEventsTriggered: []
            };
            upgrades.forEach(function (upg) { upg.count = 0; });
            localStorage.clear();
            updateDisplay();
            updateUpgradesDisplay();
            updateAchievementsPanel();
            document.body.removeChild(overlay);
        });
    }

    // Функция с эффектами "багов" на красивых числах
    var bugThresholds = [100, 1000, 10000, 100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 950000];
    function triggerBugEvent() {
        gameOverlay.style.pointerEvents = 'none';
        var bugOverlay = document.createElement('div');
        Object.assign(bugOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '9999',
            background: '#' + Math.floor(Math.random() * 16777215).toString(16),
            opacity: '0.7',
            transition: 'opacity 1s'
        });
        document.body.appendChild(bugOverlay);
        setTimeout(function () {
            bugOverlay.style.opacity = '0';
            setTimeout(function () {
                if (bugOverlay.parentNode) bugOverlay.parentNode.removeChild(bugOverlay);
                gameOverlay.style.pointerEvents = 'auto';
            }, 1000);
        }, 500);
    }

    // Инициализация состояния игры
    var gameState = {
        coins: 0,
        clickValue: 1,
        autoClickers: 0,
        multiplier: 0,
        lastLevel: 1,
        achievements: [],
        victory: false,
        bugEventsTriggered: []
    };
    var savedState = localStorage.getItem('meshClickGameState');
    if (savedState) {
        try {
            gameState = JSON.parse(savedState);
            // Если отсутствуют некоторые поля, задаём значения по умолчанию
            if (!gameState.lastLevel) gameState.lastLevel = 1;
            if (!gameState.achievements) gameState.achievements = [];
            if (!gameState.bugEventsTriggered) gameState.bugEventsTriggered = [];
            // Если сохраненное состояние содержит информацию об улучшениях – обновляем их
            if (gameState.upgrades) {
                gameState.upgrades.forEach(savedUpg => {
                    let upg = upgrades.find(u => u.id === savedUpg.id);
                    if (upg) {
                        upg.count = savedUpg.count;
                    }
                });
            }
        } catch (e) {
            console.error('Ошибка загрузки состояния:', e);
        }
    }


    function saveState() {
        gameState.upgrades = upgrades.map(upg => ({ id: upg.id, count: upg.count }));
        localStorage.setItem('meshClickGameState', JSON.stringify(gameState));
    }

    // Определение стилей для 10 уровней
    var levelStyles = [
        { coinColor: "#0066cc", catImage: "img/meshik.gif" },
        { coinColor: "#1E90FF", catImage: "img/meshik2.gif" },
        { coinColor: "#00BFFF", catImage: "img/meshik3.gif" },
        { coinColor: "#00CED1", catImage: "img/meshik4.gif" },
        { coinColor: "#40E0D0", catImage: "img/meshik5.gif" },
        { coinColor: "#48D1CC", catImage: "img/meshik6.gif" },
        { coinColor: "#20B2AA", catImage: "img/meshik7.gif" },
        { coinColor: "#5F9EA0", catImage: "img/meshik8.gif" },
        { coinColor: "#4682B4", catImage: "img/meshik9.gif" },
        { coinColor: "#4169E1", catImage: "img/meshik10.gif" }
    ];

    // Функция показа карточки достижения
    function showAchievement(achievement) {
        var card = document.createElement('div');
        card.className = 'achievement-card';
        card.style.zIndex = '20000';
        card.innerHTML = '<img src="' + achievement.image + '" style="width:50px; height:50px;"><br>' +
            '<strong>' + achievement.title + '</strong><br>' +
            '<small>' + achievement.description + '</small>';
        document.body.appendChild(card);
        setTimeout(function () {
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
        }, 100);
        setTimeout(function () {
            card.style.transform = 'translate(10px, 90vh) scale(0.5)';
            card.style.opacity = '0';
        }, 1500);
        setTimeout(function () {
            if (card.parentNode) document.body.removeChild(card);
        }, 2200);
    }


    // Обновление панели достижений
    function updateAchievementsPanel() {
        achievementsPanel.innerHTML = '<h3 style="margin:0 0 10px 0; text-align:center;">Достижения</h3>';
        gameState.achievements.forEach(function (ach) {
            var achDiv = document.createElement('div');
            achDiv.className = 'achievement-card';
            achDiv.style.marginBottom = '10px';
            achDiv.style.background = 'rgb(238, 238, 238)';
            achDiv.style.border = '1px solid #0066cc';
            achDiv.style.borderRadius = '8px';
            achDiv.style.padding = '10px';
            achDiv.innerHTML = '<img src="' + ach.image + '" style="width:30px; vertical-align:middle;"> ' +
                '<strong>' + ach.title + '</strong><br><small>' + ach.description + '</small>';
            achievementsPanel.appendChild(achDiv);
        });
    }
    updateAchievementsPanel();


    // Функция обновления отображения (монеты, уровень, стили и прочее)
    function updateDisplay() {
        coinDisplay.innerHTML = 'Монеты: ' + gameState.coins;
        var currentLevel = Math.min(Math.floor(gameState.coins / 100000) + 1, 10);
        levelDisplay.innerHTML = 'Уровень: ' + currentLevel;
        if (currentLevel > gameState.lastLevel) {
            for (var lvl = gameState.lastLevel + 1; lvl <= currentLevel; lvl++) {
                registerAchievement({ id: 'level_' + lvl, title: 'Достигнут уровень ' + lvl, description: 'Вы достигли уровня ' + lvl, image: levelStyles[lvl - 1].catImage });
            }
            gameState.lastLevel = currentLevel;
            saveState();
        }

        coinButton.style.background = levelStyles[currentLevel - 1].coinColor;
        coinButton.style.border = '10px solid rgb(0, 66, 133)';
        coinImg.src = levelStyles[currentLevel - 1].catImage;
        // "Баги" на красивых числах
        bugThresholds.forEach(function (threshold) {
            if (gameState.coins >= threshold && gameState.bugEventsTriggered.indexOf(threshold) === -1) {
                gameState.bugEventsTriggered.push(threshold);
                triggerBugEvent();
                saveState();
            }
        });
        // Победа
        if (gameState.coins >= 1000000 && !gameState.victory) {
            showVictoryModal();
            gameState.victory = true;
            saveState();
        }

    }

    function updateUpgradesDisplay() {
        var cards = document.querySelectorAll('.upgrade-card');
        cards.forEach(function (card, index) {
            var upgrade = upgrades[index];
            var cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
            card.querySelector('.upgrade-cost').textContent = 'Стоимость: ' + cost;
        });
    }
    updateDisplay();

    // Автокликер: добавление монет каждую секунду
    setInterval(function () {
        if (gameState.autoClickers > 0) {
            gameState.coins += gameState.autoClickers;
            updateDisplay();
            saveState();
        }
    }, 1000);

    // Обработка клика по монетке
    coinButton.addEventListener('click', function () {
        gameState.coins += gameState.clickValue;
        updateDisplay();
        saveState();
        coinScale = 1.2;
        updateCoinTransform();
        setTimeout(function () {
            coinScale = 1;
            updateCoinTransform();
        }, 150);
    });

    // Вращение монетки в зависимости от положения курсора
    coinButton.addEventListener('mousemove', function (e) {
        var rect = coinButton.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        coinRotation = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        updateCoinTransform();
    });

    function updateCoinTransform() {
        coinButton.style.transform = 'rotate(' + coinRotation + 'deg) scale(' + coinScale + ')';
    }

    // СЕКЦИЯ ДОСТИЖЕНИЙ
    var cumulativeRotation = 0;
    coinButton.addEventListener('mousemove', function (e) {
        cumulativeRotation += 1;
        if (cumulativeRotation >= 360 && !gameState.caughtFullRotation) {
            registerAchievement({ id: 'full_rotation', title: 'Полная прокрутка', description: 'Вы полностью прокрутили монетку!', image: 'img/meshik.gif' });
            gameState.caughtFullRotation = true;
            saveState();
        }
    });

    let clickCount = 0;
    levelDisplay.addEventListener("click", () => {
        clickCount++;
        if (clickCount >= 15) {
            coinImg.src = "img/meshik_exe.png";
            Object.assign(coinButton.style, {
                width: '300px',
                height: '300px',
                background: 'red',
                borderRadius: '50%',
                boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
                border: '10px solid darkred',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                top: '-30%',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.2s',
                transformOrigin: '50% 50%'
            });
            registerAchievement({ id: 'meshik_exe', title: 'Темная сторона', description: 'Вы нашли страшную тайну Мэшика!', image: 'img/shocked.gif' });
        }
    });
    // Перемен требуют наши сердца:
    // Игрок должен активировать 5 разных улучшений за одну игровую сессию.
    function checkUpgradeVarietyAchievement() {
        let distinctUpgrades = upgrades.filter(upg => upg.count > 0).length;
        if (distinctUpgrades >= 5 && !gameState.upgradeVarietyAchievement) {
            registerAchievement({
                id: 'peremen',
                title: 'Перемен требуют наши сердца',
                description: 'Примените 5 разных улучшений за одну игровую сессию.',
                image: 'img/meshik7.gif'
            });
            gameState.upgradeVarietyAchievement = true;
            saveState();
        }
    }
    setInterval(checkUpgradeVarietyAchievement, 1000);

    // Видели ночь:
    // Игрок должен собрать 5000 монет в ночной режим (с 22:00 до 07:00).
    function isNightTime() {
        let h = new Date().getHours();
        return (h >= 22 || h < 7);
    }
    // При клике по монетке, если сейчас ночь – суммируем монеты в отдельном счёте.
    coinButton.addEventListener('click', function () {
        if (isNightTime()) {
            gameState.nightCoins = (gameState.nightCoins || 0) + gameState.clickValue;
            if (gameState.nightCoins >= 5000 && !gameState.nightAchievement) {
                registerAchievement({
                    id: 'night',
                    title: 'Видели ночь',
                    description: 'Наберите 5000 монет за ночной режим (от 22:00 до 07:00).',
                    image: 'img/night.gif'
                });
                gameState.nightAchievement = true;
                saveState();
            }
        }
    });

    // Гипнотизёр монет:
    // Игрок не должен нажимать на монетку в течение 1 минуты.
    let noClickTimer;
    function startNoClickTimer() {
        clearTimeout(noClickTimer);
        noClickTimer = setTimeout(function () {
            if (!gameState.hypnotizerAchievement) {
                registerAchievement({
                    id: 'hypnotizer',
                    title: 'Гипнотизёр монет',
                    description: 'Вы просто смотрели на монетку 1 минуту и не кликали.',
                    image: 'img/shocked.gif'
                });
                gameState.hypnotizerAchievement = true;
                saveState();
            }
        }, 60000);
    }
    startNoClickTimer();
    coinButton.addEventListener('click', startNoClickTimer);

    // 418 I’m a Teapot:
    // Игрок должен кликнуть по монетке 418 раз.
    let coinClickStreak = 0;
    coinButton.addEventListener('click', function () {
        coinClickStreak++;
        if (coinClickStreak >= 418 && !gameState.teapotAchievement) {
            registerAchievement({
                id: 'teapot',
                title: '418 I’m a Teapot',
                description: 'Вы попытались заварить чай с помощью кликера. Но увы, это не кофеварка.',
                image: 'img/coder.gif'
            });
            gameState.teapotAchievement = true;
            saveState();
        }
    });

    // 404 Not Found:
    // Игрок должен 10 раз кликнуть за пределами монетки.
    let outsideClickCount = 0;
    document.body.addEventListener('click', function (e) {
        if (!e.target.closest('#coin-button, #reset-button, #achievements-toggle-button, #share-button, #contact-button')) {
            outsideClickCount++;
            if (outsideClickCount >= 10 && !gameState.notFoundAchievement) {
                registerAchievement({
                    id: 'not_found',
                    title: '404 Not Found',
                    description: 'Вы искали секретную кнопку, но ничего не нашли.',
                    image: 'img/coder.gif'
                });
                gameState.notFoundAchievement = true;
                saveState();
            }
        }
    });

    // Fatal Error:
    // Игрок должен сделать более 1000 кликов в секунду.
    let clickTimestamps = [];
    document.addEventListener('click', function () {
        let now = Date.now();
        clickTimestamps.push(now);
        clickTimestamps = clickTimestamps.filter(ts => now - ts <= 1000);
        if (clickTimestamps.length >= 1000 && !gameState.fatalErrorAchievement) {
            registerAchievement({
                id: 'fatal_error',
                title: 'Fatal Error',
                description: 'Вы кликнули слишком быстро, и игра начала странно себя вести…',
                image: 'img/coder.gif'
            });
            gameState.fatalErrorAchievement = true;
            saveState();
        }
    });

    // Skynet Awakens:
    // Игрок должен приобрести 50 автокликеров.
    coinButton.addEventListener('click', function () {
        let autoUpgrade = upgrades.find(u => u.id === 'autoclicker');
        if (autoUpgrade && autoUpgrade.count >= 50 && !gameState.skynetAchievement) {
            registerAchievement({
                id: 'skynet',
                title: 'Skynet Awakens',
                description: 'Вы слишком сильно полагались на автокликер. Теперь он играет вместо вас.',
                image: 'img/coder.gif'
            });
            gameState.skynetAchievement = true;
            saveState();
        }
    });

    // I’m Groot:
    // Игрок должен совершить 100822 кликов по монетке.
    if (!gameState.totalCoinClicks) gameState.totalCoinClicks = 0;
    coinButton.addEventListener('click', function () {
        gameState.totalCoinClicks++;
        if (gameState.totalCoinClicks >= 100822 && !gameState.grootAchievement) {
            registerAchievement({
                id: 'groot',
                title: 'I’m Groot',
                description: 'Вы нажимали, нажимали… и вдруг монетка заговорила.',
                image: 'img/shocked.gif'
            });
            gameState.grootAchievement = true;
            saveState();
        }
    });

    // Hasta la vista, baby:
    // Игрок должен нажать кнопку «Сброс прогресса».
    resetButton.addEventListener('click', function () {
        if (!gameState.hastaAchievement) {
            registerAchievement({
                id: 'hasta',
                title: 'Hasta la vista, baby',
                description: 'Вы сбросили (или нет?) весь прогресс.',
                image: 'img/bye.gif'
            });
            gameState.hastaAchievement = true;
            saveState();
        }
    });

    // CTRL+C, CTRL+V:
    // Игрок должен попытаться вставить текст в игру.
    document.addEventListener('paste', function () {
        if (!gameState.copyPasteAchievement) {
            registerAchievement({
                id: 'ctrlcv',
                title: 'CTRL+C, CTRL+V',
                description: 'Это не курс по программированию.',
                image: 'img/coder.gif'
            });
            gameState.copyPasteAchievement = true;
            saveState();
        }
    });

    // Секретное комбо:
    // Особая последовательность: 2 быстрых клика, затем пауза и 3 быстрых клика.
    let secretCombo = { state: 0, timer: null, clickCount: 0, lastTime: 0 };
    coinButton.addEventListener('click', function () {
        let now = Date.now();
        if (secretCombo.state === 0) {
            // Первый клик – переходим в состояние 1.
            secretCombo.state = 1;
            secretCombo.lastTime = now;
            secretCombo.timer = setTimeout(() => { secretCombo.state = 0; }, 300);
        } else if (secretCombo.state === 1) {
            // Второй клик за 300 мс.
            if (now - secretCombo.lastTime <= 300) {
                clearTimeout(secretCombo.timer);
                secretCombo.state = 2;
                secretCombo.timer = setTimeout(() => {
                    // Если пауза 500 мс, переходим в состояние 3.
                    secretCombo.state = 3;
                    secretCombo.clickCount = 0;
                }, 500);
            } else {
                secretCombo.state = 0;
            }
        } else if (secretCombo.state === 3) {
            // Ожидаем 3 быстрых клика (каждый не более 300 мс).
            if (now - secretCombo.lastTime <= 300) {
                secretCombo.clickCount++;
                secretCombo.lastTime = now;
                if (secretCombo.clickCount >= 3 && !gameState.secretComboAchievement) {
                    registerAchievement({
                        id: 'secret_combo',
                        title: 'Секретное комбо',
                        description: 'Это не фастфуд.',
                        image: 'img/combo.gif'
                    });
                    gameState.secretComboAchievement = true;
                    saveState();
                    secretCombo.state = 0;
                }
            } else {
                secretCombo.state = 0;
            }
        } else {
            secretCombo.state = 0;
        }
    });
})();
