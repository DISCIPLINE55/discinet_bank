 // /js/cards.js
import { db, session, showToast, setupPage } from './core.js';

setupPage('dashboard');

const cardsContainer = document.getElementById('cards-container');
const addCardButton = document.getElementById('add-card-button');
const cardModal = document.getElementById('card-modal');
const addCardForm = document.getElementById('add-card-form');
const closeCardModal = cardModal.querySelector('.close-button');

function renderCards(cards) {
    document.querySelectorAll('.card-item').forEach(el => el.remove());
    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card glassy-card card-item';
        cardEl.innerHTML = `
            <div class="card-title">Debit Card</div>
            <div class="card-number">${card.number.replace(/(\d{4})/g, '$1 ').trim()}</div>
            <div class="card-bottom">
                <span class="card-holder">${card.holder}</span>
                <span class="card-expiry">${card.expiry}</span>
            </div>
        `;
        cardsContainer.insertBefore(cardEl, addCardButton);
    });
}

function fetchCards() {
    if (!session) return;
    db.getCards(session.userId).then(renderCards);
}

addCardButton.addEventListener('click', () => {
    cardModal.classList.add('is-visible');
    cardModal.setAttribute('aria-hidden', 'false');
});

closeCardModal.addEventListener('click', () => {
    cardModal.classList.remove('is-visible');
    cardModal.setAttribute('aria-hidden', 'true');
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cardModal.classList.contains('is-visible')) {
        closeCardModal.click();
    }
});

addCardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const holder = e.target.holder.value;
    const number = e.target.number.value.replace(/\s/g, '');
    const expiry = e.target.expiry.value;

    const newCard = { userId: session.userId, holder, number, expiry };

    try {
        await db.addCard(newCard);
        showToast('Card added successfully!', 'success');
        addCardForm.reset();
        closeCardModal.click();
        fetchCards();
    } catch (error) {
        showToast(error.message, 'error');
    }
});

fetchCards();
