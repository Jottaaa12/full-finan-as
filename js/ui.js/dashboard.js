// js/dashboard.js
import { formatCurrency } from './utils.js';

let mainChart = null;

/**
 * Carrega e exibe os dados do dashboard.
 * @param {Array} userAccounts As contas do usuário.
 * @param {Array} userTransactions As transações do usuário.
 * @param {Array} userBudgets Os orçamentos do usuário.
 * @param {string} userCurrency A moeda do usuário.
 */
export function loadDashboardData(userAccounts, userTransactions, userBudgets, userCurrency) {
    const totalBalanceEl = document.getElementById('total-balance');
    const monthlyIncomeEl = document.getElementById('monthly-income');
    const monthlyExpensesEl = document.getElementById('monthly-expenses');
    const monthlySavingsEl = document.getElementById('monthly-savings');
    const recentTransactionsList = document.getElementById('recent-transactions-list');
    const payablesAlertList = document.getElementById('payables-alert-list');

    if (!totalBalanceEl || !monthlyIncomeEl || !monthlyExpensesEl || !monthlySavingsEl || !recentTransactionsList) return;

    // Calcula saldo total
    const totalBalance = userAccounts
        .filter(acc => acc.type !== 'cartao_credito')
        .reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
    totalBalanceEl.textContent = formatCurrency(totalBalance, userCurrency);

    // Calcula dados do mês atual
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let monthlyIncome = 0, monthlyExpenses = 0;
    userTransactions.forEach(t => {
        const transactionDate = t.date.toDate();
        const transactionMonthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
        if (transactionMonthKey === currentMonthKey) {
            if (t.type === 'receita') monthlyIncome += t.amount;
            else if (t.type === 'despesa') monthlyExpenses += t.amount;
        }
    });

    monthlyIncomeEl.textContent = formatCurrency(monthlyIncome, userCurrency);
    monthlyExpensesEl.textContent = formatCurrency(monthlyExpenses, userCurrency);
    monthlySavingsEl.textContent = formatCurrency(monthlyIncome - monthlyExpenses, userCurrency);

    // Exibe transações recentes
    recentTransactionsList.innerHTML = '';
    const sortedTransactions = [...userTransactions]
        .sort((a, b) => b.date.seconds - a.date.seconds)
        .slice(0, 5);
        
    sortedTransactions.forEach(t => {
        const li = document.createElement('li');
        const iconClass = t.type === 'receita' ? 'fa-arrow-up' : 'fa-arrow-down';
        const iconColor = t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)';
        li.innerHTML = `<span><i class="fas ${iconClass}" style="color: ${iconColor};"></i> ${t.description}</span><strong>${formatCurrency(t.amount, userCurrency)}</strong>`;
        recentTransactionsList.appendChild(li);
    });

    // Exibe alerta de próximos vencimentos
    if (payablesAlertList) {
        payablesAlertList.innerHTML = '';
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const pendentes = userTransactions.filter(t => t.isPaid === false);
        const vencidas = pendentes.filter(t => t.date.toDate() < startOfToday);
        const vencendoHoje = pendentes.filter(t => t.date.toDate() >= startOfToday && t.date.toDate() <= endOfToday);
        const mostrar = [...vencidas.slice(0, 3), ...vencendoHoje.slice(0, 3)];
        if (mostrar.length === 0) {
            payablesAlertList.innerHTML = '<li class="empty-state-small">Nenhuma conta vencida ou vencendo hoje.</li>';
        } else {
            mostrar.forEach(t => {
                const li = document.createElement('li');
                const isVencida = t.date.toDate() < startOfToday;
                const icon = '<i class="fas fa-exclamation-circle" style="color: var(--warning-color);"></i>';
                li.innerHTML = `
                    <span>${icon} ${t.description} <small>(${t.date.toDate().toLocaleDateString('pt-BR')}${isVencida ? ' - Vencida' : ' - Hoje'})</small></span>
                    <strong style="color: ${t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)'};">${formatCurrency(t.amount, userCurrency)}</strong>
                `;
                payablesAlertList.appendChild(li);
            });
        }
    }

    renderBudgetsOverview(userTransactions, userBudgets, userCurrency);
    
    // Prepara dados para o gráfico principal
    const monthlyData = {};
    userTransactions.forEach(t => {
        const transactionDate = t.date.toDate();
        const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        if (t.type === 'receita') monthlyData[monthKey].income += (t.amount || 0);
        else if (t.type === 'despesa') monthlyData[monthKey].expense += (t.amount || 0);
    });

    const labels = [];
    const incomeData = [];
    const expenseData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.toLocaleString('pt-BR', { month: 'short' });
        const year = d.getFullYear();
        labels.push(`${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`);
        const monthKey = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthData = monthlyData[monthKey] || { income: 0, expense: 0 };
        incomeData.push(monthData.income);
        expenseData.push(monthData.expense);
    }
    renderMainChart(labels, incomeData, expenseData);
}

/**
 * Renderiza o gráfico principal do dashboard.
 * @param {Array<string>} labels Os rótulos do eixo X.
 * @param {Array<number>} incomeData Os dados de receita.
 * @param {Array<number>} expenseData Os dados de despesa.
 */
export function renderMainChart(labels, incomeData, expenseData) {
    const chartContainer = document.getElementById('main-chart-container');
    if (!chartContainer) return;

    if (mainChart) mainChart.destroy();

    chartContainer.innerHTML = '<canvas id="main-chart"></canvas>';
    const newCanvas = document.getElementById('main-chart');

    mainChart = new Chart(newCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Receitas',
                data: incomeData,
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }, {
                label: 'Despesas',
                data: expenseData,
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

/**
 * Renderiza a visão geral dos orçamentos no dashboard.
 * @param {Array} userTransactions As transações do usuário.
 * @param {Array} userBudgets Os orçamentos do usuário.
 * @param {string} userCurrency A moeda do usuário.
 */
export function renderBudgetsOverview(userTransactions, userBudgets, userCurrency) {
    const budgetsOverviewList = document.getElementById('budgets-overview-list');
    if (!budgetsOverviewList) return;

    budgetsOverviewList.innerHTML = '';
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyBudgets = userBudgets.filter(b => b.month === currentMonth);

    if (monthlyBudgets.length === 0) {
        budgetsOverviewList.innerHTML = '<p class="empty-state-small">Sem orçamentos para este mês.</p>';
        return;
    }

    monthlyBudgets.slice(0, 4).forEach(budget => {
        const spentAmount = userTransactions
            .filter(t => t.category === budget.category && t.type === 'despesa' && t.date.toDate().toISOString().slice(0, 7) === currentMonth)
            .reduce((sum, t) => sum + t.amount, 0);
        const progress = Math.min((spentAmount / budget.amount) * 100, 100);
        
        const overviewItem = document.createElement('div');
        overviewItem.className = 'budget-overview-item';
        overviewItem.innerHTML = `
            <div class="budget-overview-header">
                <span>${budget.category}</span>
                <span>${formatCurrency(spentAmount, userCurrency)}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progress}%;"></div>
            </div>
        `;
        budgetsOverviewList.appendChild(overviewItem);
    });
}
