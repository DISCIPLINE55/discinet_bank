 // /js/withdraw.js
import { db, session, showToast, setupPage } from './core.js';

setupPage('withdraw');

const form = document.getElementById('withdraw-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const destination = e.target.destination.value;
    const note = e.target.note.value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;

    try {
        await db.withdraw(session.userId, amount, destination, note);
        showToast('Withdrawal successful!', 'success');
        setTimeout(() => window.location.href = '/pages/dashboard.html', 1500);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});
