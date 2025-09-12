import { initAuth } from './auth.js';
import { initUI, navigateTo } from './ui.js';
import { fetchAllData, calculateAllBalances } from './firestore.js';
import { loadDashboardData } from './dashboard.js';
import { initTransactions, loadTransactionsData, loadAccountsData, loadCardsData, loadPayablesData } from './transactions.js';
import { loadReportsData } from './reports.js';
import { initProfile } from './profile.js';
import { initTools } from './tools.js';
import { initSupport } from './support.js';
import { initFeedback } from './feedback.js';
import { initBudgetsAndGoals, loadBudgetsData, loadGoalsData } from './budgets-goals.js';

// --- Estado Global da Aplicação ---
let AppState = {
    currentUser: null,
    accounts: [],
    transactions: [],
    budgets: [],
    goals: [],
    currency: 'BRL'
};

// --- Ponto de Entrada Principal ---
document.addEventListener('DOMContentLoaded', () => {
    initAuth(onAuthenticated, onSignedOut);
});

/**
 * Callback executado quando o usuário é autenticado com sucesso.
 */
async function onAuthenticated(user) {
    // CORREÇÃO: Esconde o loader e mostra o container principal do app
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    AppState.currentUser = user;
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('auth-container').classList.add('hidden');

    await refreshAllData();

    // Inicializa todos os módulos, passando as funções de que precisam
    initUI(user, loadPageData);
    initTransactions(user, AppState.accounts, AppState.transactions, refreshAllData);
    initProfile(user);
    initTools(AppState.transactions);
    initSupport();
    initBudgetsAndGoals(AppState.currentUser, AppState.accounts, refreshAllData);
    initFeedback(AppState.currentUser);

    navigateTo('dashboard');
}

/**
 * Callback para quando o usuário faz logout.
 */
function onSignedOut() {
    // CORREÇÃO: Esconde o loader e mostra o container principal do app
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    AppState = { currentUser: null, accounts: [], transactions: [], budgets: [], goals: [], currency: 'BRL' };
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
}

/**
 * Busca todos os dados do Firestore e atualiza o estado global.
 */
async function refreshAllData() {
    const data = await fetchAllData(AppState.currentUser.uid);
    AppState.transactions = data.userTransactions || [];
    AppState.accounts = data.userAccounts || [];
    AppState.budgets = data.userBudgets || [];
    AppState.goals = data.userGoals || [];
    
    // Recalcula saldos das contas após buscar os dados
    AppState.accounts = calculateAllBalances(AppState.accounts, AppState.transactions);

    // Recarrega os dados da página ativa
    const activePageId = document.querySelector('.page:not(.hidden)')?.id;
    if (activePageId) {
        loadPageData(activePageId.replace('-page', ''));
    }
}

/**
 * Carrega os dados específicos da página solicitada.
 */
function loadPageData(pageName) {
    switch(pageName) {
        case 'dashboard':
            loadDashboardData(AppState.accounts, AppState.transactions, AppState.budgets, AppState.currency);
            break;
        case 'transactions':
            loadTransactionsData(AppState.transactions, AppState.accounts, AppState.currency);
            break;
        case 'accounts':
            loadAccountsData(AppState.accounts, AppState.currency);
            break;
        case 'cards':
            loadCardsData(AppState.accounts, AppState.transactions, AppState.currency);
            break;
        case 'budgets':
            loadBudgetsData(AppState.budgets, AppState.transactions, AppState.currency);
            break;
        case 'goals':
            loadGoalsData(AppState.goals, AppState.accounts, AppState.currency);
            break;
        case 'reports':
            loadReportsData(AppState.transactions, AppState.accounts, AppState.currency);
            break;
        case 'payables':
            loadPayablesData(AppState.transactions, AppState.currency);
            break;
        // Os casos de profile e tools são inicializados e não precisam de recarga de dados aqui.
    }
}