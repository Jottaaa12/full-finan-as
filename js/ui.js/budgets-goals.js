
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

export function loadBudgetsData(userBudgets, userTransactions) {
    const budgetsList = document.getElementById('budgets-list');
    if (!budgetsList) return;
    // ... (código de loadBudgetsData existente)
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
    const data = {
        userId: currentUser.uid,
        category: form['budget-category'].value,
        amount: parseFloat(form['budget-amount'].value),
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

export function loadGoalsData(userGoals) {
    const goalsList = document.getElementById('goals-list');
    if (!goalsList) return;
    // ... (código de loadGoalsData existente)
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
    const data = {
        userId: currentUser.uid,
        name: form['goal-name'].value,
        targetAmount: parseFloat(form['goal-target-amount'].value),
        currentAmount: parseFloat(form['goal-current-amount'].value) || 0,
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
