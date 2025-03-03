// Глобальные переменные
let questions = [];
let players = [];
let currentQuestionIndex = 0;
let currentPlayerIndex = 0;
let roundAnswers = [];

// Элементы DOM
const playerSelectionScreen = document.getElementById('player-selection');
const nameEntryScreen = document.getElementById('name-entry');
const questionScreen = document.getElementById('question-screen');
const roundResultsScreen = document.getElementById('round-results');
const finalResultsScreen = document.getElementById('final-results');

// Загрузка вопросов и инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка вопросов из JSON файла
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            document.getElementById('total-questions').textContent = questions.length;
            initPlayerSelection();
        })
        .catch(error => console.error('Ошибка загрузки вопросов:', error));
});

// Инициализация выбора количества игроков
function initPlayerSelection() {
    const playerCount = document.getElementById('player-count');
    const decreaseBtn = document.getElementById('decrease-players');
    const increaseBtn = document.getElementById('increase-players');
    const startNameEntryBtn = document.getElementById('start-name-entry');
    
    // Начальное количество игроков
    let count = 2;
    
    // Обработчики кнопок
    decreaseBtn.addEventListener('click', () => {
        if (count > 1) {
            count--;
            playerCount.textContent = count;
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        count++;
        playerCount.textContent = count;
    });
    
    startNameEntryBtn.addEventListener('click', () => {
        setupNameEntry(count);
        showScreen(nameEntryScreen);
    });
}

// Настройка экрана ввода имен
function setupNameEntry(count) {
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'player-name-input';
        
        const label = document.createElement('label');
        label.textContent = `Игрок ${i + 1}:`;
        label.setAttribute('for', `player-${i}`);
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player-${i}`;
        input.placeholder = `Введите имя игрока ${i + 1}`;
        
        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    }
    
    document.getElementById('start-game').addEventListener('click', startGame);
}

// Начало игры
function startGame() {
    // Сбор имен игроков
    players = [];
    const inputs = document.querySelectorAll('#player-names-container input');
    
    inputs.forEach((input, index) => {
        const name = input.value.trim() || `Игрок ${index + 1}`;
        players.push({
            name: name,
            score: 0
        });
    });
    
    // Перемешивание вопросов
    shuffleArray(questions);
    
    // Сброс индексов
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    
    // Показ первого вопроса
    showQuestion();
}

// Показ текущего вопроса
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showFinalResults();
        return;
    }
    
    // Обновление информации о текущем вопросе
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('player-name').textContent = players[currentPlayerIndex].name;
    
    // Получение текущего вопроса
    const question = questions[currentQuestionIndex];
    
    // Установка текста вопроса
    document.getElementById('question-text').textContent = question.question;
    
    // Создание вариантов ответов
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        
        optionElement.addEventListener('click', function() {
            // Снятие выделения со всех опций
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Выделение выбранной опции
            this.classList.add('selected');
            
            // Активация кнопки "Ответить"
            document.getElementById('submit-answer').disabled = false;
        });
        
        optionsContainer.appendChild(optionElement);
    });
    
    // Деактивация кнопки "Ответить" до выбора ответа
    document.getElementById('submit-answer').disabled = true;
    
    // Обработчик кнопки "Ответить"
    document.getElementById('submit-answer').onclick = submitAnswer;
    
    // Показ экрана вопроса
    showScreen(questionScreen);
}

// Отправка ответа
function submitAnswer() {
    const selectedOption = document.querySelector('.option.selected');
    
    if (!selectedOption) return;
    
    const selectedIndex = parseInt(selectedOption.dataset.index);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQuestion.correctAnswer;
    
    // Сохранение ответа для текущего игрока
    roundAnswers.push({
        player: players[currentPlayerIndex],
        answer: selectedIndex,
        isCorrect: isCorrect
    });
    
    // Если ответ правильный, добавляем очки
    if (isCorrect) {
        players[currentPlayerIndex].score += currentQuestion.difficulty;
    }
    
    // Переход к следующему игроку или показ результатов раунда
    currentPlayerIndex++;
    
    if (currentPlayerIndex < players.length) {
        // Еще есть игроки, которые должны ответить на текущий вопрос
        showQuestion();
    } else {
        // Все игроки ответили, показываем результаты раунда
        showRoundResults();
    }
}

// Показ результатов раунда
function showRoundResults() {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Отображение изображения к вопросу
    const questionImage = document.getElementById('question-image');
    if (currentQuestion.image) {
        questionImage.src = currentQuestion.image;
        document.getElementById('question-image-container').classList.remove('hidden');
    } else {
        document.getElementById('question-image-container').classList.add('hidden');
    }
    
    // Отображение правильного ответа
    document.getElementById('correct-answer').textContent = 
        currentQuestion.options[currentQuestion.correctAnswer];
    
    // Отображение результатов игроков
    const resultsContainer = document.getElementById('round-players-results');
    resultsContainer.innerHTML = '';
    
    roundAnswers.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = `player-result ${result.isCorrect ? 'correct' : 'incorrect'}`;
        
        const playerName = document.createElement('div');
        playerName.className = 'player-name';
        playerName.textContent = result.player.name;
        
        const resultText = document.createElement('div');
        resultText.className = 'result-text';
        resultText.textContent = result.isCorrect 
            ? `+${currentQuestion.difficulty} очков` 
            : 'Неправильно';
        
        resultElement.appendChild(playerName);
        resultElement.appendChild(resultText);
        resultsContainer.appendChild(resultElement);
    });
    
    // Обработчик кнопки "Следующий вопрос"
    document.getElementById('next-question').onclick = nextQuestion;
    
    // Показ экрана результатов раунда
    showScreen(roundResultsScreen);
}

// Переход к следующему вопросу
function nextQuestion() {
    // Очистка ответов раунда
    roundAnswers = [];
    
    // Переход к следующему вопросу
    currentQuestionIndex++;
    currentPlayerIndex = 0;
    
    // Показ следующего вопроса или финальных результатов
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showFinalResults();
    }
}

// Показ финальных результатов
function showFinalResults() {
    // Сортировка игроков по очкам (от большего к меньшему)
    players.sort((a, b) => b.score - a.score);
    
    // Отображение лидерборда
    const leaderboardContainer = document.getElementById('leaderboard');
    leaderboardContainer.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = `leaderboard-item ${index === 0 ? 'winner' : ''}`;
        
        const playerInfo = document.createElement('div');
        playerInfo.className = 'player-info';
        
        const playerRank = document.createElement('span');
        playerRank.className = 'player-rank';
        playerRank.textContent = `${index + 1}. `;
        
        const playerName = document.createElement('span');
        playerName.className = 'player-name';
        playerName.textContent = player.name;
        
        playerInfo.appendChild(playerRank);
        playerInfo.appendChild(playerName);
        
        const playerScore = document.createElement('div');
        playerScore.className = 'player-score';
        playerScore.textContent = `${player.score} очков`;
        
        playerElement.appendChild(playerInfo);
        playerElement.appendChild(playerScore);
        leaderboardContainer.appendChild(playerElement);
    });
    
    // Обработчик кнопки "Играть снова"
    document.getElementById('restart-game').onclick = restartGame;
    
    // Показ экрана финальных результатов
    showScreen(finalResultsScreen);
}

// Перезапуск игры
function restartGame() {
    // Возврат к экрану выбора количества игроков
    showScreen(playerSelectionScreen);
}

// Вспомогательная функция для перемешивания массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Вспомогательная функция для показа определенного экрана
function showScreen(screenToShow) {
    // Скрытие всех экранов
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Показ нужного экрана
    screenToShow.classList.remove('hidden');
}
