// /js/mobile.js
import { db, session, showToast, setupPage } from './core.js';

setupPage('mobile');

const form = document.getElementById('mobile-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const mobileNumber = e.target.mobileNumber.value;
    const note = e.target.note.value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;

    try {
        await db.buyMobileCredit(session.userId, amount, mobileNumber, note);
        showToast('Mobile credit purchase successful!', 'success');
        setTimeout(() => window.location.href = '/pages/dashboard.html', 1500);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
}); 
