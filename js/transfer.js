 // /js/transfer.js
import { db, session, showToast, setupPage } from './core.js';

setupPage('transfer');

const form = document.getElementById('transfer-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const recipient = e.target.recipient.value;
    const transferType = e.target.transferType.value;
    const note = e.target.note.value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;

    try {
        await db.transfer(session.userId, amount, recipient, transferType, note);
        showToast('Transfer successful!', 'success');
        setTimeout(() => window.location.href = '/pages/dashboard.html', 1500);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});
