import { formatCurrency, getBillingCycle } from './utils.js';
import { openModal, closeModal, showMessage } from './ui.js';
import { saveTransaction, saveAccount, deleteAccount, deleteTransaction } from './firestore.js';
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

    // Listeners
    document.getElementById('add-transaction-btn')?.addEventListener('click', openNewTransactionModal);
    document.getElementById('quick-add-transaction-btn')?.addEventListener('click', openQuickAddModal);
    document.getElementById('transaction-form')?.addEventListener('submit', handleTransactionFormSubmit);
    document.getElementById('add-account-btn')?.addEventListener('click', openNewAccountModal);
    document.getElementById('account-form')?.addEventListener('submit', handleAccountFormSubmit);
    document.getElementById('accounts-list')?.addEventListener('click', handleAccountActions);
    document.getElementById('credit-cards-list')?.addEventListener('click', handleCardActions);
    document.getElementById('payment-form')?.addEventListener('submit', handlePaymentFormSubmit);
    document.getElementById('export-excel-btn')?.addEventListener('click', exportToExcel);
    document.getElementById('export-pdf-btn')?.addEventListener('click', exportToPDF);
    document.getElementById('payables-page')?.addEventListener('click', handlePayableActions);
    document.querySelector('#transactions-table tbody')?.addEventListener('click', handleTransactionActions);
    document.getElementById('transaction-type-selector')?.addEventListener('click', handleTypeSelector);
    document.getElementById('category-chips')?.addEventListener('click', handleCategoryChipClick);
    document.getElementById('save-and-new-btn')?.addEventListener('click', handleSaveAndNew);
}

function handleTypeSelector(e) {
    if (e.target.tagName !== 'BUTTON') return;
    const selector = document.getElementById('transaction-type-selector');
    selector.querySelector('.active').classList.remove('active');
    e.target.classList.add('active');
    document.getElementById('transaction-type').value = e.target.dataset.value;
}

function handleCategoryChipClick(e) {
    if (!e.target.classList.contains('category-chip')) return;
    document.getElementById('transaction-category').value = e.target.textContent;
}

async function handleSaveAndNew(e) {
    e.preventDefault();
    const form = document.getElementById('transaction-form');
    await form.requestSubmit(document.getElementById('save-and-new-btn'));
}

// --- LÓGICA DE TRANSAÇÕES ---
export function loadTransactionsData(transactions, accounts, currency) {
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    [...transactions].sort((a, b) => b.date.seconds - a.date.seconds).forEach(t => {
        const account = accounts.find(acc => acc.id === t.accountId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.date.toDate().toLocaleDateString('pt-BR')}</td>
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td>${account?.name || 'N/A'}</td>
            <td class="${t.type}">${formatCurrency(t.amount, currency)}</td>
            <td>${t.isPaid ? 'Pago' : 'Pendente'}</td>
            <td class="transaction-actions">
                ${t.attachmentURL ? `<a href="${t.attachmentURL}" target="_blank" class="btn-action btn-attachment" title="Ver Anexo"><i class="fas fa-paperclip"></i></a>` : ''}
                <button class="btn-action btn-edit" data-id="${t.id}" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn-action btn-delete" data-id="${t.id}" title="Excluir"><i class="fas fa-trash-alt"></i></button>
            </td>`;
        tbody.appendChild(tr);
    });
}

function openNewTransactionModal() {
    openQuickAddModal();
}

function openQuickAddModal() {
    const form = document.getElementById('transaction-form');
    form.reset();
    form['transaction-id'].value = '';
    form['transaction-date'].value = new Date().toISOString().split('T')[0];
    form['transaction-paid'].checked = true; // Garante que o checkbox começa marcado
    const selector = document.getElementById('transaction-type-selector');
    if (selector) {
        const currentActive = selector.querySelector('.active');
        if(currentActive) currentActive.classList.remove('active');
        selector.querySelector('[data-value="despesa"]').classList.add('active');
    }
    document.getElementById('transaction-type').value = 'despesa';
    document.getElementById('transaction-modal-title').textContent = 'Lançamento Rápido';
    populateAccountOptions(form['transaction-account']);
    renderCategoryChips();
    openModal('transaction-modal');
}

function renderCategoryChips() {
    const container = document.getElementById('category-chips');
    if (!container) return;
    const commonCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário'];
    container.innerHTML = '';
    commonCategories.forEach(category => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'category-chip';
        chip.textContent = category;
        container.appendChild(chip);
    });
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
        isPaid: form['transaction-paid'].checked // Lendo o valor do checkbox
    };

    try {
        await saveTransaction(data, id);
        if (e.submitter && e.submitter.id === 'save-and-new-btn') {
            openQuickAddModal();
        } else {
            closeModal('transaction-modal');
        }
        onUpdateCallback();
    } catch (error) {
        console.error("Erro ao salvar transação:", error);
        showMessage('transaction-message', 'Não foi possível salvar a transação. Tente novamente.', 'error');
    }
}

async function handleTransactionActions(e) {
    const target = e.target.closest('button');
    if (!target) return;
    const transactionId = target.dataset.id;
    if (!transactionId) return;

    if (target.classList.contains('btn-delete')) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            try {
                await deleteTransaction(transactionId);
                onUpdateCallback();
            } catch (error) {
                console.error('Erro ao excluir transação:', error);
                alert('Não foi possível excluir a transação. Tente novamente.'); // Alert is ok for a confirmation action
            }
        }
    } else if (target.classList.contains('btn-edit')) {
        const transaction = userTransactions.find(t => t.id === transactionId);
        if (transaction) {
            openQuickAddModal();
            const form = document.getElementById('transaction-form');
            form['transaction-id'].value = transaction.id;
            form['transaction-description'].value = transaction.description;
            form['transaction-amount'].value = transaction.amount;
            form['transaction-date'].value = transaction.date.toDate().toISOString().split('T')[0];
            form['transaction-category'].value = transaction.category;
            form['transaction-paid'].checked = transaction.isPaid; // Define o estado do checkbox
            const typeSelector = document.getElementById('transaction-type-selector');
            if(typeSelector) {
                typeSelector.querySelector('.active').classList.remove('active');
                const btnToActivate = typeSelector.querySelector(`[data-value="${transaction.type}"]`);
                if(btnToActivate) btnToActivate.classList.add('active');
            }
            form['transaction-type'].value = transaction.type;
            form['transaction-account'].value = transaction.accountId;
            document.getElementById('transaction-modal-title').textContent = 'Editar Transação';
        }
    }
}

// --- LÓGICA DE CONTAS E CARTÕES ---
export function loadAccountsData(accounts, currency) {
    const list = document.getElementById('accounts-list');
    if (!list) return;
    list.innerHTML = '';
    accounts.filter(acc => acc.type !== 'cartao_credito').forEach(acc => {
        const card = document.createElement('div');
        card.className = 'account-card';
        const typeName = acc.type.replace('_', ' ');
        card.innerHTML = `
            <div class="account-card-header"><h3>${acc.name}</h3></div>
            <p class="account-card-balance">${formatCurrency(acc.currentBalance, currency)}</p>
            <p class="account-card-type">${typeName}</p>
            <div class="account-card-actions">
                <button class="btn-action btn-edit" data-id="${acc.id}" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn-action btn-delete" data-id="${acc.id}" title="Excluir"><i class="fas fa-trash-alt"></i></button>
            </div>`;
        list.appendChild(card);
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
    try {
        await saveAccount(data, id);
        closeModal('account-modal');
        onUpdateCallback();
    } catch (error) {
        console.error("Erro ao salvar conta:", error);
        showMessage('account-message', 'Não foi possível salvar a conta. Tente novamente.', 'error');
    }
}

async function handleAccountActions(e) {
    const button = e.target.closest('button');
    if (!button) return;
    const id = button.dataset.id;
    if (!id) return;

    if (button.classList.contains('btn-edit')) {
        const acc = userAccounts.find(a => a.id === id);
        if (acc) {
            const form = document.getElementById('account-form');
            form.reset();
            form['account-id'].value = acc.id;
            form['account-name'].value = acc.name;
            form['account-type'].value = acc.type;
            form['account-initial-balance'].value = acc.initialBalance;
            document.getElementById('account-modal-title').textContent = 'Editar Conta';
            openModal('account-modal');
        }
    } else if (button.classList.contains('btn-delete')) {
        if (confirm('Tem certeza que deseja excluir esta conta? Todas as transações associadas a ela também serão removidas.')) {
            try {
                await deleteAccount(id);
                onUpdateCallback();
            } catch (error) {
                console.error("Erro ao excluir conta:", error);
                alert("Não foi possível excluir a conta. Verifique se existem transações associadas.");
            }
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
    try {
        await saveTransaction(data, null);
        closeModal('payment-modal');
        onUpdateCallback();
    } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        showMessage('payment-message', 'Não foi possível processar o pagamento. Tente novamente.', 'error');
    }
}

async function handlePayableActions(e) {
    if (!e.target.classList.contains('pay-payable-btn')) return;
    const transactionId = e.target.dataset.id;
    if (!transactionId) return;

    try {
        const transaction = userTransactions.find(t => t.id === transactionId);
        if (transaction) {
            const updatedTransactionData = { ...transaction, isPaid: true };
            await saveTransaction(updatedTransactionData, transactionId);
            onUpdateCallback();
        }
    } catch (error) {
        console.error("Error marking transaction as paid:", error);
        alert("Erro ao marcar a conta como paga.");
    }
}

export function loadPayablesData() {
    const unpaidTransactions = userTransactions.filter(t => !t.isPaid && t.type === 'despesa');

    const lists = {
        overdue: document.getElementById('payables-overdue-list'),
        today: document.getElementById('payables-today-list'),
        next7: document.getElementById('payables-next7-list'),
        next30: document.getElementById('payables-next30-list'),
    };

    // Clear existing lists
    for (const key in lists) {
        if (lists[key]) lists[key].innerHTML = '';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneDay = 24 * 60 * 60 * 1000;

    const categories = {
        overdue: [],
        today: [],
        next7: [],
        next30: []
    };

    unpaidTransactions.forEach(t => {
        const dueDate = t.date.toDate();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / oneDay);

        if (diffDays < 0) {
            categories.overdue.push(t);
        } else if (diffDays === 0) {
            categories.today.push(t);
        } else if (diffDays > 0 && diffDays < 7) {
            categories.next7.push(t);
        } else if (diffDays >= 7 && diffDays <= 30) {
            categories.next30.push(t);
        }
    });

    const renderList = (element, transactions) => {
        if (!element) return;
        if (transactions.length === 0) {
            element.innerHTML = '<li class="empty-state-small">Nenhuma conta encontrada.</li>';
            return;
        }
        // Sort transactions by date
        transactions.sort((a, b) => a.date.seconds - b.date.seconds);
        
        transactions.forEach(t => {
            const li = document.createElement('li');
            li.className = 'payable-item';
            li.innerHTML = `
                <div class="payable-info">
                    <span class="payable-desc">${t.description}</span>
                    <span class="payable-date">Venc: ${t.date.toDate().toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="payable-action">
                    <span class="payable-amount">${formatCurrency(t.amount)}</span>
                    <button class="pay-payable-btn" data-id="${t.id}">Marcar como Pago</button>
                </div>
            `;
            element.appendChild(li);
        });
    };

    renderList(lists.overdue, categories.overdue);
    renderList(lists.today, categories.today);
    renderList(lists.next7, categories.next7);
    renderList(lists.next30, categories.next30);
}

function populateAccountOptions(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">Selecione</option>';
    userAccounts.filter(a => a.type !== 'cartao_credito').forEach(acc => {
        selectElement.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
    });
}

// Omitted for brevity: loadCardsData, exportToExcel, exportToPDF, etc. as they don't have write operations.