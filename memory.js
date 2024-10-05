let quotes = [];
fetch('quotes.json')
    .then(response => response.json())
    .then(data => {
        quotes = data;
        initGame();
    });

function initGame() {
    const gameBoard = document.getElementById('game-board');
    let cardsArray = [];

    // Создаём карты из частей цитат
    quotes.forEach((quote, index) => {
        cardsArray.push(createCard(quote.part1, index));
        cardsArray.push(createCard(quote.part2, index));
    });

    // Перемешиваем карты
    cardsArray.sort(() => 0.5 - Math.random());

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
    firstCard.removeEventListener('click', onCardClick);
    secondCard.removeEventListener('click', onCardClick);

    resetBoard();
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
