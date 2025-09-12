
import { formatCurrency } from './utils.js';
import { saveBudget, deleteBudget, saveGoal, deleteGoal } from './firestore.js';
import { openModal, closeModal } from './ui.js';

let currentUser, userAccounts, onUpdateCallback;

export function initBudgetsAndGoals(user, accounts, onUpdate) {
    currentUser = user;
    userAccounts = accounts;
    onUpdateCallback = onUpdate;

    // Listeners
    document.getElementById('add-budget-btn')?.addEventListener('click', openNewBudgetModal);
    document.getElementById('budget-form')?.addEventListener('submit', handleBudgetFormSubmit);
    document.getElementById('budgets-list')?.addEventListener('click', handleBudgetListClick);

    document.getElementById('add-goal-btn')?.addEventListener('click', openNewGoalModal);
    document.getElementById('goal-form')?.addEventListener('submit', handleGoalFormSubmit);
    document.getElementById('goals-list')?.addEventListener('click', handleGoalListClick);
}

// --- LÓGICA DE ORÇAMENTOS ---

export function loadBudgetsData(userBudgets, userTransactions, currency) {
    const budgetsList = document.getElementById('budgets-list');
    if (!budgetsList) return;

    budgetsList.innerHTML = '';
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyBudgets = userBudgets.filter(b => b.month === currentMonth);

    if (monthlyBudgets.length === 0) {
        budgetsList.innerHTML = '<div class="empty-state"><p>Nenhum orçamento definido para este mês. Adicione um para começar a acompanhar!</p></div>';
        return;
    }

    monthlyBudgets.forEach(budget => {
        const spentAmount = userTransactions
            .filter(t => t.category === budget.category && t.type === 'despesa' && t.date.toDate().toISOString().slice(0, 7) === currentMonth)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const remaining = budget.amount - spentAmount;
        const progress = Math.min((spentAmount / budget.amount) * 100, 100);
        const isOverBudget = remaining < 0;

        const card = document.createElement('div');
        card.className = 'budget-card';
        card.innerHTML = `
            <div class="budget-card-header">
                <h3>${budget.category}</h3>
                <button class="btn-action delete-budget-btn" data-id="${budget.id}" title="Excluir Orçamento"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="budget-card-body">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%; background-color: ${isOverBudget ? 'var(--danger-color)' : 'var(--primary-color)'};"></div>
                </div>
                <div class="budget-values">
                    <span class="spent">Gasto: ${formatCurrency(spentAmount, currency)}</span>
                    <span class="total">Total: ${formatCurrency(budget.amount, currency)}</span>
                </div>
                <p class="budget-remaining ${isOverBudget ? 'over-budget' : ''}">
                    ${isOverBudget 
                        ? `Você ultrapassou o orçamento em ${formatCurrency(Math.abs(remaining), currency)}` 
                        : `Restam ${formatCurrency(remaining, currency)}`
                    }
                </p>
            </div>
        `;
        budgetsList.appendChild(card);
    });
}

function openNewBudgetModal() {
    const form = document.getElementById('budget-form');
    form.reset();
    form['budget-id'].value = '';
    document.getElementById('budget-modal-title').textContent = 'Novo Orçamento';
    openModal('budget-modal');
}

async function handleBudgetFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const amount = parseFloat(form['budget-amount'].value);

    if (isNaN(amount) || amount <= 0) {
        alert('O valor deve ser um número maior que zero.');
        return;
    }

    const data = {
        userId: currentUser.uid,
        category: form['budget-category'].value,
        amount: amount,
        month: new Date().toISOString().slice(0, 7)
    };
    await saveBudget(data, form['budget-id'].value || null);
    closeModal('budget-modal');
    onUpdateCallback();
}

function handleBudgetListClick(e) {
    if (e.target.classList.contains('delete-budget-btn')) {
        const id = e.target.dataset.id;
        if (confirm('Tem certeza que deseja excluir este orçamento?')) {
            deleteBudget(id).then(onUpdateCallback);
        }
    }
}

// --- LÓGICA DE METAS ---

export function loadGoalsData(userGoals, userAccounts, currency) {
    const goalsList = document.getElementById('goals-list');
    if (!goalsList) return;

    goalsList.innerHTML = '';

    if (!userGoals || userGoals.length === 0) {
        goalsList.innerHTML = '<div class="empty-state"><p>Nenhum objetivo financeiro definido. Crie um para começar a planejar seu futuro!</p></div>';
        return;
    }

    userGoals.forEach(goal => {
        // If goal is linked to an account, the account's balance is the current amount
        const linkedAccount = goal.linkedAccountId ? userAccounts.find(a => a.id === goal.linkedAccountId) : null;
        const currentAmount = linkedAccount ? linkedAccount.currentBalance : goal.currentAmount;
        
        const progress = Math.min((currentAmount / goal.targetAmount) * 100, 100);

        const card = document.createElement('div');
        card.className = 'goal-card';
        card.innerHTML = `
            <div class="goal-card-header">
                <h3>${goal.name}</h3>
                <button class="btn-action delete-goal-btn" data-id="${goal.id}" title="Excluir Objetivo"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="goal-card-body">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
                <div class="goal-values">
                    <span class="current">Alcançado: ${formatCurrency(currentAmount, currency)}</span>
                    <span class="target">Meta: ${formatCurrency(goal.targetAmount, currency)}</span>
                </div>
                <p class="goal-progress-percent"> ${progress.toFixed(1)}% completo</p>
                ${linkedAccount ? `<small class="linked-account-info"><i class="fas fa-link"></i> Vinculado à conta: ${linkedAccount.name}</small>` : ''}
            </div>
        `;
        goalsList.appendChild(card);
    });
}

function openNewGoalModal() {
    const form = document.getElementById('goal-form');
    form.reset();
    form['goal-id'].value = '';
    document.getElementById('goal-modal-title').textContent = 'Novo Objetivo';
    
    const select = form['goal-linked-account'];
    select.innerHTML = '<option value="">Nenhuma (depósito manual)</option>';
    userAccounts.filter(acc => acc.type === 'poupanca' || acc.type === 'investimento').forEach(acc => {
        select.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
    });

    openModal('goal-modal');
}

async function handleGoalFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const targetAmount = parseFloat(form['goal-target-amount'].value);
    const currentAmount = parseFloat(form['goal-current-amount'].value) || 0;

    if (isNaN(targetAmount) || targetAmount <= 0) {
        alert('O valor deve ser um número maior que zero.');
        return;
    }
    if (isNaN(currentAmount) || currentAmount < 0) {
        alert('O valor atual não pode ser um número negativo.');
        return;
    }

    const data = {
        userId: currentUser.uid,
        name: form['goal-name'].value,
        targetAmount: targetAmount,
        currentAmount: currentAmount,
        linkedAccountId: form['goal-linked-account'].value || null
    };
    await saveGoal(data, form['goal-id'].value || null);
    closeModal('goal-modal');
    onUpdateCallback();
}

function handleGoalListClick(e) {
    if (e.target.classList.contains('delete-goal-btn')) {
        const id = e.target.dataset.id;
        if (confirm('Tem certeza que deseja excluir este objetivo?')) {
            deleteGoal(id).then(onUpdateCallback);
        }
    }
}
