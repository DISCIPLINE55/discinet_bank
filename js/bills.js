// /js/bills.js
import { db, session, showToast, setupPage } from './core.js';

setupPage('bills');

const form = document.getElementById('bills-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const billType = e.target.billType.value;
    const billRef = e.target.billRef.value;
    const note = e.target.note.value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;

    try {
        await db.payBill(session.userId, amount, billType, billRef, note);
        showToast('Bill payment successful!', 'success');
        setTimeout(() => window.location.href = '/pages/dashboard.html', 1500);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
}); 
