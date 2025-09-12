import { formatCurrency, getBillingCycle } from './utils.js';
import { openModal, closeModal } from './ui.js';
import { saveTransaction, uploadFile, saveAccount, deleteAccount, deleteTransaction } from './firestore.js';
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
    
    // Listeners com delegação de evento
    document.getElementById('payables-page')?.addEventListener('click', handlePayableActions);
    document.querySelector('#transactions-table tbody')?.addEventListener('click', handleTransactionActions);
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
            <td class="transaction-actions">
                ${t.attachmentURL ? `<a href="${t.attachmentURL}" target="_blank" class="btn-action btn-attachment" title="Ver Anexo"><i class="fas fa-paperclip"></i></a>` : ''}
                <button class="btn-action btn-edit" data-id="${t.id}" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn-action btn-delete" data-id="${t.id}" title="Excluir"><i class="fas fa-trash-alt"></i></button>
            </td>`;
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

    const amount = parseFloat(form['transaction-amount'].value);
    const dateValue = form['transaction-date'].value;

    if (isNaN(amount) || amount <= 0) {
        alert('O valor deve ser um número maior que zero.');
        return;
    }
    if (!dateValue) {
        alert('A data da transação não pode estar vazia.');
        return;
    }

    const data = {
        userId: currentUser.uid,
        type: form['transaction-type'].value,
        description: form['transaction-description'].value,
        amount: amount,
        date: firebase.firestore.Timestamp.fromDate(new Date(dateValue)),
        accountId: form['transaction-account'].value,
        category: form['transaction-category'].value,
        isPaid: form['transaction-paid'].checked
    };
    await saveTransaction(data, id);
    closeModal('transaction-modal');
    onUpdateCallback();
}

/**
 * Manipula as ações de edição e exclusão de uma transação na tabela principal.
 */
async function handleTransactionActions(e) {
    const target = e.target.closest('button');
    if (!target) return;

    const transactionId = target.dataset.id;
    if (!transactionId) return;

    // Ação de Excluir
    if (target.classList.contains('btn-delete')) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            try {
                await deleteTransaction(transactionId);
                onUpdateCallback(); // Atualiza a UI
            } catch (error) {
                console.error('Erro ao excluir transação:', error);
                alert('Não foi possível excluir a transação.');
            }
        }
    }

    // Ação de Editar
    if (target.classList.contains('btn-edit')) {
        const transaction = userTransactions.find(t => t.id === transactionId);
        if (transaction) {
            const form = document.getElementById('transaction-form');
            form.reset();

            // Preenche o formulário com os dados da transação
            form['transaction-id'].value = transaction.id;
            form['transaction-type'].value = transaction.type;
            form['transaction-description'].value = transaction.description;
            form['transaction-amount'].value = transaction.amount;
            // Formata a data para o input type="date" (YYYY-MM-DD)
            form['transaction-date'].value = transaction.date.toDate().toISOString().split('T')[0];
            form['transaction-category'].value = transaction.category;
            form['transaction-paid'].checked = transaction.isPaid;

            // Popula e seleciona a conta correta
            populateAccountOptions(form['transaction-account']);
            form['transaction-account'].value = transaction.accountId;

            // Altera o título do modal e abre
            document.getElementById('transaction-modal-title').textContent = 'Editar Transação';
            openModal('transaction-modal');
        }
    }
}


// --- LÓGICA DE CONTAS E CARTÕES ---
export function loadAccountsData() {
    const list = document.getElementById('accounts-list');
    if (!list) return;
    list.innerHTML = '';
    userAccounts.filter(acc => acc.type !== 'cartao_credito').forEach(acc => {
        const card = document.createElement('div');
        card.className = 'account-card';
        const typeName = acc.type.replace('_', ' ');
        card.innerHTML = `
            <div class="account-card-header">
                <h3>${acc.name}</h3>
            </div>
            <p class="account-card-balance">${formatCurrency(acc.currentBalance)}</p>
            <p class="account-card-type">${typeName}</p>
            <div class="account-card-actions">
                <button class="btn-action btn-edit" data-id="${acc.id}" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn-action btn-delete" data-id="${acc.id}" title="Excluir"><i class="fas fa-trash-alt"></i></button>
            </div>`;
        list.appendChild(card);
    });
}

export function loadCardsData(accounts, transactions, currency) {
    const list = document.getElementById('credit-cards-list');
    if (!list) return;
    list.innerHTML = '';
    accounts.filter(acc => acc.type === 'cartao_credito').forEach(card => {
        const billCycle = getBillingCycle(card);
        const billTransactions = transactions.filter(t => t.accountId === card.id && t.date.toDate() >= billCycle.start && t.date.toDate() <= billCycle.end);
        const billTotal = billTransactions.reduce((sum, t) => sum + t.amount, 0);
        const cardEl = document.createElement('div');
        cardEl.className = 'credit-card-bill';
        cardEl.innerHTML = `<h3>${card.name}</h3><p>Fatura: ${formatCurrency(billTotal, currency)}</p><p>Vencimento: ${billCycle.due.toLocaleDateString('pt-BR')}</p><button class="pay-bill-btn" data-card-id="${card.id}" data-bill-total="${billTotal}">Pagar</button>`;
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
    const initialBalance = parseFloat(form['account-initial-balance'].value) || 0;

    if (isNaN(initialBalance) || initialBalance <= 0) {
        alert('O valor deve ser um número maior que zero.');
        return;
    }

    const data = {
        userId: currentUser.uid,
        name: form['account-name'].value,
        type: form['account-type'].value,
        initialBalance: initialBalance
    };
    await saveAccount(data, id);
    closeModal('account-modal');
    onUpdateCallback();
}

function handleAccountActions(e) {
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
async function handlePayableActions(e) {
    if (e.target.classList.contains('pay-payable-btn')) {
        const transactionId = e.target.dataset.id;
        if (!transactionId) return;

        try {
            const transaction = userTransactions.find(t => t.id === transactionId);
            if (transaction) {
                // The saveTransaction function likely expects a plain data object.
                // We create a new object with only the data, setting isPaid to true.
                const updatedTransactionData = {
                    userId: transaction.userId,
                    type: transaction.type,
                    description: transaction.description,
                    amount: transaction.amount,
                    date: transaction.date, // Keep the original Firestore Timestamp
                    accountId: transaction.accountId,
                    category: transaction.category,
                    isPaid: true // Update the status
                };

                await saveTransaction(updatedTransactionData, transactionId);
                onUpdateCallback(); // Refresh UI
            }
        } catch (error) {
            console.error("Error marking transaction as paid:", error);
            alert("Erro ao marcar a conta como paga.");
        }
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
            element.innerHTML = '<li>Nenhuma conta encontrada.</li>';
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


// --- FUNÇÕES UTILITÁRIAS ---
function populateAccountOptions(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">Selecione</option>';
    userAccounts.filter(a => a.type !== 'cartao_credito').forEach(acc => {
        selectElement.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
    });
}

// --- LÓGICA DE EXPORTAÇÃO ---
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        console.error('SheetJS library (XLSX) not found.');
        alert('A biblioteca de exportação não foi carregada. Verifique a conexão com a internet.');
        return;
    }

    const data = userTransactions.map(t => {
        const account = userAccounts.find(a => a.id === t.accountId);
        return {
            'Data': t.date.toDate().toLocaleDateString('pt-BR'),
            'Descrição': t.description,
            'Categoria': t.category,
            'Conta': account ? account.name : 'N/A',
            'Valor': t.amount,
            'Tipo': t.type === 'receita' ? 'Receita' : 'Despesa',
            'Situação': t.isPaid ? 'Pago' : 'Pendente'
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');

    const colWidths = [
        { wch: 12 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 12 }
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, 'Extrato_Full_Financas.xlsx');
}

function exportToPDF() {
    if (typeof html2pdf === 'undefined') {
        console.error('html2pdf.js library not found.');
        alert('A biblioteca de exportação para PDF não foi carregada.');
        return;
    }

    const element = document.getElementById('transactions-table');
    if (!element) {
        console.error('Element #transactions-table not found.');
        alert('A tabela de transações não foi encontrada para exportação.');
        return;
    }

    const opt = {
        margin: 0.5,
        filename: 'Extrato_Full_Financas.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    const clonedElement = element.cloneNode(true);
    
    const header = document.createElement('div');
    header.innerHTML = '<h1>Relatório de Transações</h1>';
    header.style.textAlign = 'center';
    header.style.marginBottom = '20px';

    const container = document.createElement('div');
    container.appendChild(header);
    container.appendChild(clonedElement);

    html2pdf().from(container).set(opt).save();
}