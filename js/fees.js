 // /js/fees.js
import { db, session, showToast, setupPage } from './core.js';

setupPage('fees');

const form = document.getElementById('fees-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const feesInstitution = e.target.feesInstitution.value;
    const feesStudentId = e.target.feesStudentId.value;
    const note = e.target.note.value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;

    try {
        await db.payFees(session.userId, amount, feesInstitution, feesStudentId, note);
        showToast('Fee payment successful!', 'success');
        setTimeout(() => window.location.href = '/pages/dashboard.html', 1500);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});
