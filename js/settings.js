// /js/settings.js
import { db, session, showToast, setupPage } from './core.js';

setupPage('settings');

const updateForm = document.getElementById('update-form');
const passwordForm = document.getElementById('password-form');
const deleteAccountButton = document.getElementById('delete-account-button');
const confirmModal = document.getElementById('confirm-modal');
const confirmModalText = document.getElementById('confirm-modal-text');
const confirmButton = document.getElementById('confirm-modal-confirm');
const cancelButton = document.getElementById('confirm-modal-cancel');
const closeConfirmModal = confirmModal.querySelector('.close-button');

async function loadSettings() {
    if (!session) return;
    const user = await db.getUserData(session.userId);
    if (user) {
        document.getElementById('settings-username').value = user.username;
        document.getElementById('settings-email').value = user.email;
    }
}

updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;

    try {
        await db.updateUser(session.userId, { username, email });
        showToast('Account details updated!', 'success');
        document.getElementById('header-username').textContent = username;
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;

    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        submitBtn.disabled = false;
        return;
    }

    try {
        await db.updateUser(session.userId, { password: newPassword });
        showToast('Password changed successfully!', 'success');
        e.target.reset();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

deleteAccountButton.addEventListener('click', () => {
    confirmModal.classList.add('is-visible');
    confirmModal.setAttribute('aria-hidden', 'false');
    confirmModalText.textContent = 'Are you sure you want to delete your account? This action cannot be undone.';
    confirmButton.textContent = 'Delete';
    confirmButton.classList.remove('button-primary');
    confirmButton.classList.add('button-danger');
});

cancelButton.addEventListener('click', () => {
    confirmModal.classList.remove('is-visible');
    confirmModal.setAttribute('aria-hidden', 'true');
});

closeConfirmModal.addEventListener('click', () => {
    confirmModal.classList.remove('is-visible');
    confirmModal.setAttribute('aria-hidden', 'true');
});

confirmButton.addEventListener('click', async () => {
    try {
        await db.deleteUser(session.userId);
        showToast('Account deleted successfully. Redirecting...', 'success');
        setTimeout(() => window.location.href = '/index.html', 1500);
    } catch (error) {
        showToast(error.message, 'error');
    }
});

loadSettings(); 
