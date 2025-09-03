// /js/core.js
const useApi = false;
const API_BASE = 'https://api.example.com/v1';

const STORAGE_PREFIX = 'discinet_';

const dataService = {
    local: {
        async login(username, password) {
            const users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users') || '[]');
            const user = users.find(u => u.username === username && u.password === password);
            if (!user) throw new Error('Invalid username or password.');
            sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify({
                userId: user.id,
                username: user.username,
                balance: user.balance
            }));
            return user;
        },

        async register(username, email, password) {
            let users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users') || '[]');
            if (users.find(u => u.username === username || u.email === email)) {
                throw new Error('Username or email already exists.');
            }
            const newUser = {
                id: Date.now(),
                username,
                email,
                password,
                balance: 500.00,
                accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString()
            };
            users.push(newUser);
            localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
            return newUser;
        },

        async getUserData(userId) {
            const users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users') || '[]');
            const user = users.find(u => u.id === userId);
            return user;
        },

        async updateUser(userId, updates) {
            let users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) throw new Error('User not found.');
            
            const oldUser = users[userIndex];
            const updatedUser = { ...oldUser, ...updates };

            users[userIndex] = updatedUser;
            localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));

            // Update session data
            const session = JSON.parse(sessionStorage.getItem(STORAGE_PREFIX + 'session'));
            sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify({ ...session, ...{ username: updatedUser.username, balance: updatedUser.balance } }));

            return updatedUser;
        },

        async deleteUser(userId) {
            let users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users') || '[]');
            users = users.filter(u => u.id !== userId);
            localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
            localStorage.removeItem(STORAGE_PREFIX + 'transactions');
            localStorage.removeItem(STORAGE_PREFIX + 'cards');
            sessionStorage.removeItem(STORAGE_PREFIX + 'session');
        },

        async getTransactions(userId) {
            const transactions = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'transactions') || '[]');
            return transactions.filter(t => t.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
        },

        async addTransaction(transaction) {
            let transactions = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'transactions') || '[]');
            transaction.id = Date.now();
            transaction.date = new Date().toISOString();
            transactions.push(transaction);
            localStorage.setItem(STORAGE_PREFIX + 'transactions', JSON.stringify(transactions));
            return transaction;
        },
        
        async getCards(userId) {
            const cards = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'cards') || '[]');
            return cards.filter(c => c.userId === userId);
        },

        async addCard(card) {
            let cards = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'cards') || '[]');
            card.id = Date.now();
            cards.push(card);
            localStorage.setItem(STORAGE_PREFIX + 'cards', JSON.stringify(cards));
            return card;
        },

        async deposit(userId, amount, source, note) {
            const user = await this.getUserData(userId);
            if (!user) throw new Error('User not found.');
            const newBalance = user.balance + amount;
            await this.updateUser(userId, { balance: newBalance });
            await this.addTransaction({ userId, type: 'deposit', amount, source, note });
            return newBalance;
        },

        async withdraw(userId, amount, destination, note) {
            const user = await this.getUserData(userId);
            if (!user) throw new Error('User not found.');
            if (user.balance < amount) throw new Error('Insufficient balance.');
            const newBalance = user.balance - amount;
            await this.updateUser(userId, { balance: newBalance });
            await this.addTransaction({ userId, type: 'withdraw', amount, destination, note });
            return newBalance;
        },

        async transfer(userId, amount, recipient, transferType, note) {
            const sender = await this.getUserData(userId);
            if (!sender) throw new Error('Sender not found.');
            if (sender.balance < amount) throw new Error('Insufficient balance.');

            await this.updateUser(userId, { balance: sender.balance - amount });

            const transactionData = { userId, type: 'transfer', amount, recipient, transferType, note };
            await this.addTransaction(transactionData);

            if (transferType === 'internal') {
                const users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users') || '[]');
                const receiver = users.find(u => u.username === recipient);
                if (receiver) {
                    await this.updateUser(receiver.id, { balance: receiver.balance + amount });
                    await this.addTransaction({
                        userId: receiver.id,
                        type: 'deposit',
                        amount,
                        source: 'bank-transfer',
                        note: `Transfer from ${sender.username}`
                    });
                }
            }
            return sender.balance - amount;
        },

        async payBill(userId, amount, billType, billRef, note) {
            const user = await this.getUserData(userId);
            if (!user) throw new Error('User not found.');
            if (user.balance < amount) throw new Error('Insufficient balance.');
            const newBalance = user.balance - amount;
            await this.updateUser(userId, { balance: newBalance });
            await this.addTransaction({ userId, type: 'bill', amount, billType, billRef, note });
            return newBalance;
        },

        async buyMobileCredit(userId, amount, mobileNumber, note) {
            const user = await this.getUserData(userId);
            if (!user) throw new Error('User not found.');
            if (user.balance < amount) throw new Error('Insufficient balance.');
            const newBalance = user.balance - amount;
            await this.updateUser(userId, { balance: newBalance });
            await this.addTransaction({ userId, type: 'mobile', amount, mobileNumber, note });
            return newBalance;
        },

        async payFees(userId, amount, feesInstitution, feesStudentId, note) {
            const user = await this.getUserData(userId);
            if (!user) throw new Error('User not found.');
            if (user.balance < amount) throw new Error('Insufficient balance.');
            const newBalance = user.balance - amount;
            await this.updateUser(userId, { balance: newBalance });
            await this.addTransaction({ userId, type: 'fees', amount, feesInstitution, feesStudentId, note });
            return newBalance;
        },
    },

    api: {
        async login(username, password) {
            // Placeholder for API call
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) throw new Error('Login failed.');
            const data = await res.json();
            sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify({
                userId: data.user.id,
                username: data.user.username,
                balance: data.user.balance,
                token: data.token
            }));
            return data.user;
        },
        // All other methods would have similar fetch implementations
        async register() { throw new Error('Not implemented for API mode.'); },
        async getUserData() { throw new Error('Not implemented for API mode.'); },
        async getTransactions() { throw new Error('Not implemented for API mode.'); },
        async getCards() { throw new Error('Not implemented for API mode.'); },
        async addCard() { throw new Error('Not implemented for API mode.'); },
        async updateUser() { throw new Error('Not implemented for API mode.'); },
        async deleteUser() { throw new Error('Not implemented for API mode.'); },
        async deposit() { throw new Error('Not implemented for API mode.'); },
        async withdraw() { throw new Error('Not implemented for API mode.'); },
        async transfer() { throw new Error('Not implemented for API mode.'); },
        async payBill() { throw new Error('Not implemented for API mode.'); },
        async buyMobileCredit() { throw new Error('Not implemented for API mode.'); },
        async payFees() { throw new Error('Not implemented for API mode.'); },
    }
};

export const db = useApi ? dataService.api : dataService.local;

export const session = JSON.parse(sessionStorage.getItem(STORAGE_PREFIX + 'session'));

export function checkAuth() {
    if (!session) {
        window.location.href = '/pages/index.html';
        return false;
    }
    return true;
}

export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export async function loadComponent(selector, path) {
    try {
        const response = await fetch(path);
        const html = await response.text();
        document.querySelector(selector).innerHTML = html;
        
        // Handle mobile menu toggle
        if (selector === '#header-placeholder') {
            document.querySelector('.menu-toggle').addEventListener('click', () => {
                document.querySelector('.app-sidebar').classList.toggle('is-visible');
            });
        }
    } catch (error) {
        console.error(`Failed to load component from ${path}`, error);
    }
}

export function setupPage(pageName) {
    if (pageName !== 'index' && !checkAuth()) return;
    loadComponent('#header-placeholder', '/components/header.html');
    loadComponent('#sidebar-placeholder', '/components/sidebar.html');
    loadComponent('#tabbar-placeholder', '/components/tabbar.html');
    loadComponent('#modals-placeholder', '/components/modals.html');

    const sidebarLink = document.querySelector(`.sidebar-link[data-page="${pageName}"]`);
    if (sidebarLink) {
        document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
        sidebarLink.classList.add('active');
    }

    const tabbarLink = document.querySelector(`.tabbar-link[data-page="${pageName}"]`);
    if (tabbarLink) {
        document.querySelectorAll('.tabbar-link').forEach(link => link.classList.remove('active'));
        tabbarLink.classList.add('active');
    }
} 
