    // js/reports.js
    import { formatCurrency } from './utils.js';

    let reportsChart = null;
    let cashflowProjectionChart = null;

    /**
     * Carrega e exibe os dados da página de relatórios.
     * @param {Array} userTransactions As transações do usuário.
     * @param {Array} userAccounts As contas do usuário.
     * @param {string} userCurrency A moeda do usuário.
     */
    export function loadReportsData(userTransactions, userAccounts, userCurrency) {
        const periodFilter = document.getElementById('period-filter');
        if (!periodFilter) return;

        const selectedPeriod = periodFilter.value;
        const filteredTransactions = filterTransactionsByPeriod(selectedPeriod, userTransactions);
        const expensesByCategory = aggregateExpensesByCategory(filteredTransactions);

        if (Object.keys(expensesByCategory).length === 0) {
            showEmptyReportsState();
        } else {
            renderReportsChart(expensesByCategory, userCurrency);
            renderSummaryTable(expensesByCategory, userCurrency);
        }
        
        renderCashflowProjection(userTransactions, userAccounts, userCurrency);
    }

    function filterTransactionsByPeriod(period, userTransactions) {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        switch (period) {
            case 'current-month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                break;
            case 'last-month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                break;
            case 'current-year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                break;
            case 'last-3-months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'last-6-months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                break;
        }
        
        return userTransactions.filter(t => {
            const transactionDate = t.date.toDate();
            return t.type === 'despesa' && transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    function aggregateExpensesByCategory(transactions) {
        const categories = {};
        transactions.forEach(t => {
            const category = t.category || 'Sem Categoria';
            if (!categories[category]) categories[category] = 0;
            categories[category] += t.amount;
        });
        return categories;
    }

    function renderReportsChart(expensesByCategory, userCurrency) {
        const reportsChartCanvas = document.getElementById('reports-chart');
        if (!reportsChartCanvas) return;

        const labels = Object.keys(expensesByCategory);
        const data = Object.values(expensesByCategory);
        const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'];

        if (reportsChart) reportsChart.destroy();

        reportsChart = new Chart(reportsChartCanvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${formatCurrency(context.parsed, userCurrency)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderSummaryTable(expensesByCategory, userCurrency) {
        const summaryTableBody = document.querySelector('#summary-table tbody');
        if (!summaryTableBody) return;

        const total = Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);
        const sortedCategories = Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a);
        
        summaryTableBody.innerHTML = '';
        sortedCategories.forEach(([category, amount]) => {
            const percentage = ((amount / total) * 100).toFixed(1);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="summary-category">${category}</td>
                <td class="summary-amount">${formatCurrency(amount, userCurrency)}</td>
                <td class="summary-percentage">${percentage}%</td>
            `;
            summaryTableBody.appendChild(row);
        });
    }

    function showEmptyReportsState() {
        if (reportsChart) reportsChart.destroy();
        const chartContainer = document.querySelector('.reports-chart-container .chart-wrapper');
        const summaryContainer = document.querySelector('.reports-summary');
        if (chartContainer) chartContainer.innerHTML = '<p class="empty-state">Nenhuma despesa encontrada para o período.</p>';
        if (summaryContainer) summaryContainer.innerHTML = '<p class="empty-state">Sem dados para exibir.</p>';
    }

    function renderCashflowProjection(userTransactions, userAccounts, userCurrency) {
        const cashflowProjectionChartCanvas = document.getElementById('cashflow-projection-chart');
        const cashflowProjectionPeriod = document.getElementById('cashflow-projection-period');
        if (!cashflowProjectionChartCanvas || !cashflowProjectionPeriod) return;

        const saldoAtual = userAccounts.filter(acc => acc.type !== 'cartao_credito').reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
        const dias = parseInt(cashflowProjectionPeriod.value, 10);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const datas = Array.from({ length: dias }, (_, i) => {
            const d = new Date(hoje);
            d.setDate(hoje.getDate() + i);
            return d;
        });

        const saldos = [saldoAtual];
        for (let i = 0; i < dias; i++) {
            const dataRef = datas[i];
            const receitas = userTransactions.filter(t => t.isPaid === false && t.type === 'receita' && t.date.toDate().toDateString() === dataRef.toDateString()).reduce((sum, t) => sum + t.amount, 0);
            const despesas = userTransactions.filter(t => t.isPaid === false && t.type === 'despesa' && t.date.toDate().toDateString() === dataRef.toDateString()).reduce((sum, t) => sum + t.amount, 0);
            saldos.push(saldos[i] + receitas - despesas);
        }
        saldos.shift();

        const labels = datas.map(d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));

        if (cashflowProjectionChart) cashflowProjectionChart.destroy();
        
        cashflowProjectionChart = new Chart(cashflowProjectionChartCanvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Saldo Projetado',
                    data: saldos,
                    borderColor: 'var(--primary-color)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Saldo: ${formatCurrency(context.parsed.y, userCurrency)}`
                        }
                    }
                }
            }
        });
    }
