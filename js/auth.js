 // /js/auth.js
import { db, showToast } from './core.js';

const loginForm = document.getElementById('login-form-el');
const registerForm = document.getElementById('register-form-el');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginContainer = document.getElementById('login-form');
const registerContainer = document.getElementById('register-form');

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginContainer.classList.add('active');
    registerContainer.classList.remove('active');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerContainer.classList.add('active');
    loginContainer.classList.remove('active');
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;

    try {
        await db.login(username, password);
        showToast('Login successful! Redirecting to dashboard...', 'success');
        setTimeout(() => window.location.href = '/pages/dashboard.html', 1500);
    } catch (error) {
        showToast(error.message, 'error');
        submitBtn.disabled = false;
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;

    if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        submitBtn.disabled = false;
        return;
    }

    try {
        await db.register(username, email, password);
        showToast('Registration successful! Please log in.', 'success');
        e.target.reset();
        loginTab.click();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});
