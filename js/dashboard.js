// /js/dashboard.js
import { db, session, showToast, formatCurrency, setupPage } from './core.js';

setupPage('dashboard');

const usernameDisplay = document.getElementById('username-display');
const balanceValue = document.getElementById('balance-value');
const balanceShimmer = document.getElementById('balance-shimmer');
const transactionsList = document.getElementById('transactions-list');
const transactionSearch = document.getElementById('transaction-search');
const transactionTypeFilter = document.getElementById('transaction-type-filter');
const logoutButton = document.getElementById('logout-button');

async function renderDashboard() {
    if (!session) return;
    usernameDisplay.textContent = session.username;

    // Simulate API delay with shimmer
    setTimeout(() => {
        balanceShimmer.classList.add('hide');
        balanceValue.textContent = formatCurrency(session.balance);
        balanceValue.classList.remove('hide');
    }, 800);

    const transactions = await db.getTransactions(session.userId);
    renderTransactions(transactions);

    logoutButton.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '/index.html';
    });
}

function renderTransactions(transactions) {
    const searchTerm = transactionSearch.value.toLowerCase();
    const filterType = transactionTypeFilter.value;

    const filtered = transactions.filter(t => {
        const matchesSearch = t.note?.toLowerCase().includes(searchTerm) || t.amount.toString().includes(searchTerm);
        const matchesType = !filterType || t.type === filterType;
        return matchesSearch && matchesType;
    });

    transactionsList.innerHTML = '';
    if (filtered.length === 0) {
        transactionsList.innerHTML = '<div class="empty-state">No transactions match your criteria.</div>';
        return;
    }

    filtered.forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const amountClass = ['deposit', 'transfer'].includes(t.type) ? 'positive' : 'negative';
        const formattedAmount = formatCurrency(t.amount);

        item.innerHTML = `
            <div class="transaction-details">
                <span class="transaction-type">${t.type}</span>
                <span class="transaction-note">${t.note || t.recipient || t.billRef || t.feesStudentId || ''}</span>
            </div>
            <span class="transaction-amount ${amountClass}">${amountClass === 'positive' ? '+' : '-'}${formattedAmount}</span>
        `;
        transactionsList.appendChild(item);
    });
}

transactionSearch.addEventListener('input', () => {
    db.getTransactions(session.userId).then(renderTransactions);
});

transactionTypeFilter.addEventListener('change', () => {
    db.getTransactions(session.userId).then(renderTransactions);
});

renderDashboard(); 
