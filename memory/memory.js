let quotes = [];
let clickCount = 0;
let clicksElement;
let gameBoard;
let completionMessage;
let finalClicksElement;

document.addEventListener('DOMContentLoaded', function() {
    clicksElement = document.getElementById('clicks');
    gameBoard = document.getElementById('game-board');
    completionMessage = document.getElementById('completion-message');
    finalClicksElement = document.getElementById('final-clicks');
    
    // Load quotes after DOM is fully loaded
    fetch('quotes.json')
        .then(response => response.json())
        .then(data => {
            quotes = data;
            initGame();
        });
});

function initGame() {
    if (!gameBoard) {
        gameBoard = document.getElementById('game-board');
    }
    
    // Reset the game board
    gameBoard.innerHTML = '';
    let cardsArray = [];

    // Создаём карты из частей цитат
    quotes.forEach((quote, index) => {
        cardsArray.push(createCard(quote.part1, index));
        cardsArray.push(createCard(quote.part2, index));
    });

    // Перемешиваем карты используя алгоритм Fisher-Yates (Knuth) shuffle
    shuffleArray(cardsArray);
    
    // Проверяем, чтобы одинаковые карты не оказались рядом
    while (hasAdjacentPairs(cardsArray)) {
        shuffleArray(cardsArray);
    }

    // Добавляем карты на игровое поле
    cardsArray.forEach(card => {
        gameBoard.appendChild(card);
    });
}

function createCard(text, id) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = id;

    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardBack.textContent = text;

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    card.addEventListener('click', onCardClick);

    return card;
}

let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;

function onCardClick() {
    if (lockBoard) return;
    if (this === firstCard) return;
    
    // Increment click counter and update display
    clickCount++;
    if (clicksElement) {
        clicksElement.textContent = clickCount;
    }

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;

    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.id === secondCard.dataset.id;

    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    // Add matched class for animation effect
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    // Play a success sound (optional)
    playMatchSound();
    
    // Check if all cards are matched
    checkGameCompletion();
    
    firstCard.removeEventListener('click', onCardClick);
    secondCard.removeEventListener('click', onCardClick);

    resetBoard();
}

// Function to play a sound when cards match
function playMatchSound() {
    // You can add actual sound here if desired
    console.log("Match found!");
}

// Function to check if all cards are matched
function checkGameCompletion() {
    const allCards = document.querySelectorAll('.card');
    const matchedCards = document.querySelectorAll('.card.matched');
    
    if (allCards.length === matchedCards.length) {
        setTimeout(() => {
            // Update the final click count in the completion message
            if (finalClicksElement) {
                finalClicksElement.textContent = clickCount;
            }
            
            // Show completion message
            completionMessage.classList.remove('hidden');
        }, 600);
    }
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');

        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Функция для тщательного перемешивания массива (алгоритм Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring swap
    }
    return array;
}

// Функция для проверки наличия соседних пар с одинаковым id
function hasAdjacentPairs(array) {
    for (let i = 0; i < array.length - 1; i++) {
        if (array[i].dataset.id === array[i + 1].dataset.id) {
            return true;
        }
    }
    return false;
}

// Function to reset the game (can be called if you want to add a reset button later)
function resetGame() {
    clickCount = 0;
    if (clicksElement) {
        clicksElement.textContent = clickCount;
    }
    
    if (finalClicksElement) {
        finalClicksElement.textContent = 0;
    }
    
    // Hide completion message when resetting
    if (completionMessage) {
        completionMessage.classList.add('hidden');
    }
    
    initGame();
}
