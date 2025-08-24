import { formatCurrency } from './utils.js';
import { openModal, closeModal } from './ui.js';
import { saveTransaction, uploadFile, saveAccount, deleteAccount } from './firestore.js';
import { db } from '../../firebase-config.js';

let currentUser, userAccounts, userTransactions, onUpdateCallback;

/**
 * Inicializa o módulo de transações, contas e cartões.
 */
export function initTransactions(user, accounts, transactions, onUpdate) {
    currentUser = user;
    userAccounts = accounts;
    userTransactions = transactions;
    onUpdateCallback = onUpdate;

    // Listeners Gerais
    document.getElementById('add-transaction-btn')?.addEventListener('click', openNewTransactionModal);
    document.getElementById('transaction-form')?.addEventListener('submit', handleTransactionFormSubmit);
    document.getElementById('add-account-btn')?.addEventListener('click', openNewAccountModal);
    document.getElementById('account-form')?.addEventListener('submit', handleAccountFormSubmit);
    document.getElementById('accounts-list')?.addEventListener('click', handleAccountActions);
    document.getElementById('credit-cards-list')?.addEventListener('click', handleCardActions);
    document.getElementById('payment-form')?.addEventListener('submit', handlePaymentFormSubmit);
    document.getElementById('export-excel-btn')?.addEventListener('click', exportToExcel);
    document.getElementById('export-pdf-btn')?.addEventListener('click', exportToPDF);
}

// --- LÓGICA DE TRANSAÇÕES ---
export function loadTransactionsData() {
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    [...userTransactions].sort((a, b) => b.date.seconds - a.date.seconds).forEach(t => {
        const account = userAccounts.find(acc => acc.id === t.accountId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.date.toDate().toLocaleDateString('pt-BR')}</td>
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td>${account?.name || 'N/A'}</td>
            <td class="${t.type}">${formatCurrency(t.amount)}</td>
            <td>${t.isPaid ? 'Pago' : 'Pendente'}</td>
            <td>...</td>`;
        tbody.appendChild(tr);
    });
}

function openNewTransactionModal() {
    const form = document.getElementById('transaction-form');
    form.reset();
    form['transaction-id'].value = '';
    document.getElementById('transaction-modal-title').textContent = 'Nova Transação';
    populateAccountOptions(form['transaction-account']);
    openModal('transaction-modal');
}

async function handleTransactionFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const id = form['transaction-id'].value;
    const data = {
        userId: currentUser.uid,
        type: form['transaction-type'].value,
        description: form['transaction-description'].value,
        amount: parseFloat(form['transaction-amount'].value),
        date: firebase.firestore.Timestamp.fromDate(new Date(form['transaction-date'].value)),
        accountId: form['transaction-account'].value,
        category: form['transaction-category'].value,
        isPaid: form['transaction-paid'].checked
    };
    await saveTransaction(data, id);
    closeModal('transaction-modal');
    onUpdateCallback();
}

// --- LÓGICA DE CONTAS E CARTÕES ---
export function loadAccountsData() {
    const list = document.getElementById('accounts-list');
    if (!list) return;
    list.innerHTML = '';
    userAccounts.filter(acc => acc.type !== 'cartao_credito').forEach(acc => {
        const card = document.createElement('div');
        card.className = 'account-card';
        card.innerHTML = `<h3>${acc.name}</h3><p>${formatCurrency(acc.currentBalance)}</p><div><button class="edit-account-btn" data-id="${acc.id}">Editar</button><button class="delete-account-btn" data-id="${acc.id}">Excluir</button></div>`;
        list.appendChild(card);
    });
}

export function loadCardsData() {
    const list = document.getElementById('credit-cards-list');
    if (!list) return;
    list.innerHTML = '';
    userAccounts.filter(acc => acc.type === 'cartao_credito').forEach(card => {
        const billCycle = getBillingCycle(card);
        const billTransactions = userTransactions.filter(t => t.accountId === card.id && t.date.toDate() >= billCycle.start && t.date.toDate() <= billCycle.end);
        const billTotal = billTransactions.reduce((sum, t) => sum + t.amount, 0);
        const cardEl = document.createElement('div');
        cardEl.className = 'credit-card-bill';
        cardEl.innerHTML = `<h3>${card.name}</h3><p>Fatura: ${formatCurrency(billTotal)}</p><p>Vencimento: ${billCycle.due.toLocaleDateString('pt-BR')}</p><button class="pay-bill-btn" data-card-id="${card.id}" data-bill-total="${billTotal}">Pagar</button>`;
        list.appendChild(cardEl);
    });
}

function openNewAccountModal() {
    const form = document.getElementById('account-form');
    form.reset();
    form['account-id'].value = '';
    document.getElementById('account-modal-title').textContent = 'Nova Conta';
    openModal('account-modal');
}

async function handleAccountFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const id = form['account-id'].value;
    const data = {
        userId: currentUser.uid,
        name: form['account-name'].value,
        type: form['account-type'].value,
        initialBalance: parseFloat(form['account-initial-balance'].value) || 0
    };
    await saveAccount(data, id);
    closeModal('account-modal');
    onUpdateCallback();
}

function handleAccountActions(e) {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('edit-account-btn')) {
        const acc = userAccounts.find(a => a.id === id);
        const form = document.getElementById('account-form');
        form.reset();
        form['account-id'].value = acc.id;
        form['account-name'].value = acc.name;
        form['account-type'].value = acc.type;
        form['account-initial-balance'].value = acc.initialBalance;
        document.getElementById('account-modal-title').textContent = 'Editar Conta';
        openModal('account-modal');
    } else if (e.target.classList.contains('delete-account-btn')) {
        if (confirm('Tem certeza?')) {
            deleteAccount(id).then(onUpdateCallback);
        }
    }
}

function handleCardActions(e) {
    if (e.target.classList.contains('pay-bill-btn')) {
        const cardId = e.target.dataset.cardId;
        const billTotal = parseFloat(e.target.dataset.billTotal);
        const card = userAccounts.find(acc => acc.id === cardId);
        if (card && billTotal > 0) {
            const form = document.getElementById('payment-form');
            form.reset();
            form['payment-card-id'].value = card.id;
            form['payment-card-name'].value = card.name;
            form['payment-amount'].value = billTotal.toFixed(2);
            populateAccountOptions(form['payment-source-account']);
            openModal('payment-modal');
        }
    }
}

async function handlePaymentFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        userId: currentUser.uid,
        type: 'despesa',
        description: `Pagamento Fatura ${form['payment-card-name'].value}`,
        amount: parseFloat(form['payment-amount'].value),
        date: firebase.firestore.Timestamp.now(),
        accountId: form['payment-source-account'].value,
        category: 'Pagamento de Fatura',
        isPaid: true
    };
    await saveTransaction(data, null);
    closeModal('payment-modal');
    onUpdateCallback();
}

// --- LÓGICA DE CONTAS A PAGAR ---
export function loadPayablesData() { /* ... */ }

// --- FUNÇÕES UTILITÁRIAS ---
function populateAccountOptions(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">Selecione</option>';
    userAccounts.filter(a => a.type !== 'cartao_credito').forEach(acc => {
        selectElement.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
    });
}

function getBillingCycle(card) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const closingDay = card.closingDay;
    let start, end, due;
    if (today.getDate() > closingDay) {
        start = new Date(year, month, closingDay + 1);
        end = new Date(year, month + 1, closingDay);
        due = new Date(year, month + 1, card.dueDate);
    } else {
        start = new Date(year, month - 1, closingDay + 1);
        end = new Date(year, month, closingDay);
        due = new Date(year, month, card.dueDate);
    }
    return { start, end, due };
}

// --- LÓGICA DE EXPORTAÇÃO ---
function exportToExcel() { /* ... */ }
function exportToPDF() { /* ... */ }