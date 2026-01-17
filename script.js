if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js');
    });
}

const passwordForm = document.getElementById('passwordForm');
const serviceInput = document.getElementById('service');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const clearFormBtn = document.getElementById('clearForm');
const generatePasswordBtn = document.getElementById('generatePassword');
const passwordLengthInput = document.getElementById('passwordLength');
const uppercaseCheckbox = document.getElementById('uppercase');
const lowercaseCheckbox = document.getElementById('lowercase');
const numbersCheckbox = document.getElementById('numbers');
const symbolsCheckbox = document.getElementById('symbols');
const passwordsList = document.getElementById('passwordsList');
const emptyMessage = document.getElementById('emptyMessage');

const STORAGE_KEY = 'savedPasswords';

document.addEventListener('DOMContentLoaded', () => {
    loadPasswords();
    setupEventListeners();
});

function setupEventListeners() {
    passwordForm.addEventListener('submit', savePassword);
    clearFormBtn.addEventListener('click', clearForm);
    generatePasswordBtn.addEventListener('click', generatePassword);
}

function clearForm() {
    serviceInput.value = '';
    usernameInput.value = '';
    passwordInput.value = '';
    passwordInput.type = 'text';
}

function generatePassword() {
    const length = parseInt(passwordLengthInput.value) || 12;
    
    const chars = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*'
    };
    
    let availableChars = '';
    if (uppercaseCheckbox.checked) availableChars += chars.uppercase;
    if (lowercaseCheckbox.checked) availableChars += chars.lowercase;
    if (numbersCheckbox.checked) availableChars += chars.numbers;
    if (symbolsCheckbox.checked) availableChars += chars.symbols;
    
    if (!availableChars) {
        alert('Выберите хотя бы один тип символов');
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += availableChars[Math.floor(Math.random() * availableChars.length)];
    }
    
    passwordInput.value = password;
    passwordInput.type = 'text';
}

function savePassword(e) {
    e.preventDefault();
    
    const service = serviceInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!service || !username || !password) {
        alert('Заполните все поля');
        return;
    }
    
    const passwords = getPasswords();
    
    // Проверяем, нет ли уже такого пароля
    const existingIndex = passwords.findIndex(p => 
        p.service === service && p.username === username
    );
    
    if (existingIndex !== -1) {
        if (!confirm('Для этого сервиса и пользователя уже есть пароль. Заменить?')) {
            return;
        }
        passwords[existingIndex].password = password;
    } else {
        passwords.push({ service, username, password });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords));
    
    loadPasswords();
    clearForm();
    alert('Пароль сохранён');
}

function loadPasswords() {
    const passwords = getPasswords();
    
    if (passwords.length === 0) {
        emptyMessage.style.display = 'block';
        passwordsList.innerHTML = '';
        return;
    }
    
    emptyMessage.style.display = 'none';
    passwordsList.innerHTML = '';
    
    passwords.sort((a, b) => a.service.localeCompare(b.service));
    
    passwords.forEach((item, index) => {
        const passwordEl = document.createElement('div');
        passwordEl.className = 'password-item';
        passwordEl.innerHTML = `
            <div class="password-header">
                <div class="service-name">${escapeHtml(item.service)}</div>
            </div>
            <div class="username">${escapeHtml(item.username)}</div>
            <div class="password-row">
                <div class="password-display" id="passwordDisplay${index}">
                    ••••••••
                </div>
                <div class="password-actions">
                    <button class="action-btn show-btn" onclick="togglePassword(${index})">Показать</button>
                    <button class="action-btn delete-btn" onclick="deletePassword(${index})">Удалить</button>
                </div>
            </div>
        `;
        
        passwordEl.querySelector(`#passwordDisplay${index}`).dataset.password = item.password;
        passwordsList.appendChild(passwordEl);
    });
}

function getPasswords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function deletePassword(index) {
    if (!confirm('Удалить этот пароль?')) return;
    
    const passwords = getPasswords();
    passwords.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords));
    loadPasswords();
}

window.togglePassword = function(index) {
    const displayElement = document.getElementById(`passwordDisplay${index}`);
    const button = displayElement.parentElement.querySelector('.show-btn');
    
    if (!displayElement) return;
    
    const isVisible = displayElement.textContent !== '••••••••';
    
    if (isVisible) {
        displayElement.textContent = '••••••••';
        button.textContent = 'Показать';
    } else {
        displayElement.textContent = displayElement.dataset.password;
        button.textContent = 'Скрыть';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}