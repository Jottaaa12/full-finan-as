// =============================================================================
// SCRIPT PRINCIPAL DA APLICAÇÃO - Full Finanças
// =============================================================================
// STATUS DO PROJETO:
//
// Funcionalidades Implementadas:
// ✔️ Autenticação de Usuários (Login, Registro)
// ✔️ Gestão de Contas (Contas Correntes, Poupança, etc.)
// ✔️ Gestão de Transações (Receitas e Despesas)
// ✔️ Cálculo de Saldo em Tempo Real
// ✔️ Controle de Cartões de Crédito (Cálculo de Fatura)
// ✔️ Gestão de Orçamentos com acompanhamento visual
// ✔️ Dashboard com Resumo Financeiro e Gráfico
// ✔️ Cache de dados local para performance
// ✔️ Correção de Bug: Menu lateral não aparecia em dispositivos móveis.
// ✔️ Gestão de Objetivos/Metas com acompanhamento visual
//
// Próximos Passos (A Implementar):
// ⏳ Pagamento de Fatura de Cartão
// ⏳ Transações Recorrentes e Parceladas
// ⏳ Anexo de Comprovantes
// ⏳ Relatórios Avançados
// ⏳ Ferramentas (Exportação, Calculadoras, etc.)
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DO DOM ---
    const loader = document.getElementById('loader');
    const appContainer = document.getElementById('app');
    
    // Autenticação
    const authContainer = document.getElementById('auth-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const authError = document.getElementById('auth-error');

    // Conteúdo Principal
    const mainContent = document.getElementById('main-content');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameDisplay = document.getElementById('user-name-display');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const sidebar = document.querySelector('.sidebar');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // Dashboard
    const totalBalanceEl = document.getElementById('total-balance');
    const monthlyIncomeEl = document.getElementById('monthly-income');
    const monthlyExpensesEl = document.getElementById('monthly-expenses');
    const monthlySavingsEl = document.getElementById('monthly-savings');
    const mainChartCanvas = document.getElementById('main-chart');
    const recentTransactionsList = document.getElementById('recent-transactions-list');
    const budgetsOverviewList = document.getElementById('budgets-overview-list');
    
    // Transações
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const transactionModal = document.getElementById('transaction-modal');
    const transactionForm = document.getElementById('transaction-form');
    const transactionModalTitle = document.getElementById('transaction-modal-title');
    const transactionAccountSelect = document.getElementById('transaction-account');
    const transactionsTableBody = document.querySelector('#transactions-table tbody');

    // Contas e Cartões
    const addAccountBtn = document.getElementById('add-account-btn');
    const accountModal = document.getElementById('account-modal');
    const accountForm = document.getElementById('account-form');
    const accountModalTitle = document.getElementById('account-modal-title');
    const accountsList = document.getElementById('accounts-list');
    const accountTypeSelect = document.getElementById('account-type');
    const creditCardFields = document.getElementById('credit-card-fields');
    const initialBalanceGroup = document.getElementById('initial-balance-group');
    const creditCardsList = document.getElementById('credit-cards-list');

    // Orçamentos
    const addBudgetBtn = document.getElementById('add-budget-btn');
    const budgetModal = document.getElementById('budget-modal');
    const budgetForm = document.getElementById('budget-form');
    const budgetModalTitle = document.getElementById('budget-modal-title');
    const budgetsList = document.getElementById('budgets-list');

    // Objetivos
    const addGoalBtn = document.getElementById('add-goal-btn');
    const goalModal = document.getElementById('goal-modal');
    const goalForm = document.getElementById('goal-form');
    const goalModalTitle = document.getElementById('goal-modal-title');
    const goalsList = document.getElementById('goals-list');


    // --- ESTADO DA APLICAÇÃO (CACHE LOCAL) ---
    let currentUser = null;
    let mainChart = null;
    let userAccounts = []; 
    let userTransactions = [];
    let userBudgets = [];
    let userGoals = [];

    // --- INICIALIZAÇÃO ---

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            initApp();
        } else {
            currentUser = null;
            userAccounts = [];
            userTransactions = [];
            userBudgets = [];
            userGoals = [];
            showAuthScreen();
        }
    });

    function showAuthScreen() {
        authContainer.classList.remove('hidden');
        mainContent.classList.add('hidden');
        loader.classList.add('hidden');
        appContainer.classList.remove('hidden');
    }

    async function initApp() {
        mainContent.classList.remove('hidden');
        authContainer.classList.add('hidden');
        
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        userNameDisplay.textContent = userDoc.exists ? userDoc.data().name : currentUser.email;
        
        await fetchAllData();
        setupMobileMenu(); // CORREÇÃO BUG
        navigateTo('dashboard');
        
        loader.classList.add('hidden');
        appContainer.classList.remove('hidden');
    }
    
    async function fetchAllData() {
        if (!currentUser) return;
        
        const accountsSnapshot = await db.collection('accounts').where('userId', '==', currentUser.uid).get();
        userAccounts = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const transactionsSnapshot = await db.collection('transactions').where('userId', '==', currentUser.uid).get();
        userTransactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const budgetsSnapshot = await db.collection('budgets').where('userId', '==', currentUser.uid).get();
        userBudgets = budgetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const goalsSnapshot = await db.collection('goals').where('userId', '==', currentUser.uid).get();
        userGoals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        calculateAllBalances();
    }
    
    function calculateAllBalances() {
        userAccounts.forEach(account => {
            if (account.type === 'cartao_credito') {
                account.currentBalance = 0;
            } else {
                let currentBalance = account.initialBalance;
                const relevantTransactions = userTransactions.filter(t => t.accountId === account.id);
                relevantTransactions.forEach(t => {
                    if (t.type === 'receita') currentBalance += t.amount;
                    else if (t.type === 'despesa') currentBalance -= t.amount;
                });
                account.currentBalance = currentBalance;
            }
        });
    }

    // --- LÓGICA DE AUTENTICAÇÃO ---
    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleForms(true); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleForms(false); });
    function toggleForms(showRegister) {
        loginForm.classList.toggle('hidden', showRegister);
        registerForm.classList.toggle('hidden', !showRegister);
        authError.textContent = '';
    }
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = registerForm['register-name'].value;
        const email = registerForm['register-email'].value;
        const password = registerForm['register-password'].value;
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                return db.collection('users').doc(userCredential.user.uid).set({
                    name: name, email: email, createdAt: firebase.firestore.FieldValue.serverTimestamp(), currency: 'BRL'
                });
            })
            .catch(error => { authError.textContent = getAuthErrorMessage(error.code); });
    });
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => { authError.textContent = getAuthErrorMessage(error.code); });
    });
    logoutBtn.addEventListener('click', () => { auth.signOut(); });
    function getAuthErrorMessage(errorCode) {
        const messages = {
            'auth/email-already-in-use': 'Este email já está em uso.', 'auth/invalid-email': 'O formato do email é inválido.',
            'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.', 'auth/user-not-found': 'Email ou senha incorretos.',
            'auth/wrong-password': 'Email ou senha incorretos.'
        };
        return messages[errorCode] || 'Ocorreu um erro. Tente novamente.';
    }

    // --- NAVEGAÇÃO E MENU MOBILE ---
    function setupMobileMenu() {
        menuToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('hidden');
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.add('hidden');
        });

        // Fecha o menu quando a tela é redimensionada para desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.add('hidden');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => { 
            e.preventDefault(); 
            navigateTo(link.getAttribute('data-page'));
            // Fecha o menu no mobile após clicar em um link
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.add('hidden');
            }
        });
    });
    
    function navigateTo(pageName) {
        pages.forEach(p => p.classList.add('hidden'));
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) targetPage.classList.remove('hidden');
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
        if (activeLink) activeLink.classList.add('active');
        loadPageData(pageName);
    }
    
    function loadPageData(pageName) {
        switch(pageName) {
            case 'dashboard': loadDashboardData(); break;
            case 'transactions': loadTransactionsData(); break;
            case 'accounts': loadAccountsData(); break;
            case 'cards': loadCardsData(); break;
            case 'budgets': loadBudgetsData(); break;
            case 'goals': loadGoalsData(); break;
        }
    }
    
    // --- LÓGICA DE CONTAS E CARTÕES ---
    accountTypeSelect.addEventListener('change', () => {
        const isCreditCard = accountTypeSelect.value === 'cartao_credito';
        creditCardFields.classList.toggle('hidden', !isCreditCard);
        initialBalanceGroup.classList.toggle('hidden', isCreditCard);
        document.getElementById('account-initial-balance').required = !isCreditCard;
        document.getElementById('card-closing-day').required = isCreditCard;
        document.getElementById('card-due-day').required = isCreditCard;
    });

    function loadAccountsData() {
        if (!currentUser) return;
        accountsList.innerHTML = '';
        const regularAccounts = userAccounts.filter(acc => acc.type !== 'cartao_credito');
        
        regularAccounts.forEach(account => {
            const card = document.createElement('div');
            card.className = 'account-card';
            card.innerHTML = `
                <div class="account-card-header"><h3>${account.name}</h3><i class="fas fa-wallet icon"></i></div>
                <p class="account-card-balance">${formatCurrency(account.currentBalance)}</p>
                <p class="account-card-type">${account.type.replace(/_/g, ' ')}</p>
                <div class="account-card-actions">
                    <button class="btn-secondary edit-account-btn" data-id="${account.id}">Editar</button>
                    <button class="btn-danger delete-account-btn" data-id="${account.id}">Excluir</button>
                </div>`;
            accountsList.appendChild(card);
        });
    }

    addAccountBtn.addEventListener('click', () => {
        accountForm.reset();
        accountModalTitle.textContent = 'Nova Conta';
        accountForm['account-id'].value = '';
        accountTypeSelect.value = 'conta_corrente';
        accountTypeSelect.dispatchEvent(new Event('change'));
        openModal(accountModal);
    });

    accountsList.addEventListener('click', (e) => {
        const accountId = e.target.dataset.id;
        if (e.target.classList.contains('edit-account-btn')) {
            const account = userAccounts.find(acc => acc.id === accountId);
            if (account) {
                accountForm.reset();
                accountModalTitle.textContent = 'Editar Conta';
                accountForm['account-id'].value = account.id;
                accountForm['account-name'].value = account.name;
                accountForm['account-type'].value = account.type;
                if(account.type === 'cartao_credito') {
                    accountForm['card-closing-day'].value = account.closingDay;
                    accountForm['card-due-day'].value = account.dueDate;
                } else {
                    accountForm['account-initial-balance'].value = account.initialBalance;
                }
                accountTypeSelect.dispatchEvent(new Event('change'));
                openModal(accountModal);
            }
        }
        if (e.target.classList.contains('delete-account-btn')) {
            if (confirm('Tem certeza que deseja excluir?')) { deleteAccount(accountId); }
        }
    });

    accountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const accountId = accountForm['account-id'].value;
        const type = accountForm['account-type'].value;
        const data = {
            userId: currentUser.uid,
            name: accountForm['account-name'].value,
            type: type
        };

        if (type === 'cartao_credito') {
            data.closingDay = parseInt(accountForm['card-closing-day'].value);
            data.dueDate = parseInt(accountForm['card-due-day'].value);
            data.initialBalance = 0;
        } else {
            data.initialBalance = parseFloat(accountForm['account-initial-balance'].value);
        }

        try {
            if (accountId) {
                await db.collection('accounts').doc(accountId).update(data);
            } else {
                await db.collection('accounts').add(data);
            }
            await fetchAllData();
            loadPageData(document.querySelector('.page.active').id.replace('-page', ''));
            closeModal(accountModal);
        } catch (error) { console.error("Erro ao salvar:", error); alert("Não foi possível salvar."); }
    });
    
    async function deleteAccount(id) {
        try {
            await db.collection('accounts').doc(id).delete();
            await fetchAllData();
            loadPageData(document.querySelector('.page.active').id.replace('-page', ''));
        } catch (error) { console.error("Erro ao excluir:", error); alert("Não foi possível excluir."); }
    }
    
    // --- LÓGICA DA PÁGINA DE CARTÕES ---
    function loadCardsData() {
        creditCardsList.innerHTML = '';
        const creditCards = userAccounts.filter(acc => acc.type === 'cartao_credito');

        creditCards.forEach(card => {
            const billCycle = getBillingCycle(card);
            const billTransactions = userTransactions.filter(t => 
                t.accountId === card.id &&
                t.date.toDate() >= billCycle.start &&
                t.date.toDate() <= billCycle.end
            );
            const billTotal = billTransactions.reduce((sum, t) => sum + t.amount, 0);

            const cardElement = document.createElement('div');
            cardElement.className = 'credit-card-bill';
            cardElement.innerHTML = `
                <div class="credit-card-bill-header">
                    <h3>${card.name}</h3>
                    <i class="fas fa-credit-card icon"></i>
                </div>
                <div class="bill-details">
                    <div>
                        <h4>Fatura Atual</h4>
                        <p class="total">${formatCurrency(billTotal)}</p>
                    </div>
                    <div>
                        <h4>Vencimento</h4>
                        <p>${billCycle.due.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</p>
                    </div>
                </div>
                <ul class="bill-transactions-list">
                    ${billTransactions.map(t => `<li><span>${t.description}</span><strong>${formatCurrency(t.amount)}</strong></li>`).join('') || '<li>Nenhuma transação na fatura atual.</li>'}
                </ul>
                <div class="account-card-actions" style="margin-top: 1rem;">
                    <button class="btn-primary" disabled>Pagar Fatura</button>
                </div>
            `;
            creditCardsList.appendChild(cardElement);
        });
    }

    function getBillingCycle(card) {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const closingDay = card.closingDay;
        const dueDay = card.dueDate;
        let start, end, due;
        if (today.getDate() > closingDay) {
            start = new Date(currentYear, currentMonth, closingDay + 1);
            end = new Date(currentYear, currentMonth + 1, closingDay);
            due = new Date(currentYear, currentMonth + 1, dueDay);
        } else {
            start = new Date(currentYear, currentMonth - 1, closingDay + 1);
            end = new Date(currentYear, currentMonth, closingDay);
            due = new Date(currentYear, currentMonth, dueDay);
        }
        return { start, end, due };
    }

    // --- LÓGICA DE ORÇAMENTOS ---
    function loadBudgetsData() {
        budgetsList.innerHTML = '';
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyBudgets = userBudgets.filter(b => b.month === currentMonth);

        if (monthlyBudgets.length === 0) {
            budgetsList.innerHTML = '<p class="empty-state">Você ainda não criou nenhum orçamento para este mês. Que tal começar agora?</p>';
            return;
        }

        monthlyBudgets.forEach(budget => {
            const spentAmount = userTransactions
                .filter(t => t.category === budget.category && t.type === 'despesa' && t.date.toDate().toISOString().slice(0, 7) === currentMonth)
                .reduce((sum, t) => sum + t.amount, 0);
            const progress = Math.min((spentAmount / budget.amount) * 100, 100);
            const remaining = budget.amount - spentAmount;
            
            const budgetCard = document.createElement('div');
            budgetCard.className = 'budget-card';
            budgetCard.innerHTML = `
                <div class="budget-card-header">
                    <h4>${budget.category}</h4>
                    <button class="btn-danger delete-budget-btn" data-id="${budget.id}">&times;</button>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
                <div class="budget-card-details">
                    <span>${formatCurrency(spentAmount)} / ${formatCurrency(budget.amount)}</span>
                    <span>${formatCurrency(remaining)} ${remaining >= 0 ? 'restante' : 'excedido'}</span>
                </div>
            `;
            budgetsList.appendChild(budgetCard);
        });
    }

    addBudgetBtn.addEventListener('click', () => {
        budgetForm.reset();
        budgetModalTitle.textContent = 'Novo Orçamento';
        budgetForm['budget-id'].value = '';
        openModal(budgetModal);
    });

    budgetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const budgetId = budgetForm['budget-id'].value;
        const category = budgetForm['budget-category'].value;
        const currentMonth = new Date().toISOString().slice(0, 7);
        const existingBudget = userBudgets.find(b => b.category === category && b.month === currentMonth);
        if (existingBudget && !budgetId) {
            alert('Já existe um orçamento para esta categoria neste mês.');
            return;
        }
        const data = {
            userId: currentUser.uid,
            category: category,
            amount: parseFloat(budgetForm['budget-amount'].value),
            month: currentMonth
        };
        try {
            if (budgetId) {
                await db.collection('budgets').doc(budgetId).update(data);
            } else {
                await db.collection('budgets').add(data);
            }
            await fetchAllData();
            loadBudgetsData();
            closeModal(budgetModal);
        } catch (error) { console.error("Erro ao salvar orçamento:", error); alert("Não foi possível salvar."); }
    });

    budgetsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-budget-btn')) {
            const budgetId = e.target.dataset.id;
            if (confirm('Tem certeza que deseja excluir este orçamento?')) {
                deleteBudget(budgetId);
            }
        }
    });

    async function deleteBudget(id) {
        try {
            await db.collection('budgets').doc(id).delete();
            await fetchAllData();
            loadBudgetsData();
        } catch (error) { console.error("Erro ao excluir orçamento:", error); alert("Não foi possível excluir."); }
    }

    // --- LÓGICA DE OBJETIVOS ---
    function loadGoalsData() {
        goalsList.innerHTML = '';

        if (userGoals.length === 0) {
            goalsList.innerHTML = '<p class="empty-state">Defina seus objetivos financeiros e acompanhe seu progresso para alcançá-los!</p>';
            return;
        }

        userGoals.forEach(goal => {
            let currentAmount = goal.currentAmount;
            if (goal.linkedAccountId) {
                const linkedAccount = userAccounts.find(acc => acc.id === goal.linkedAccountId);
                if (linkedAccount) {
                    currentAmount = linkedAccount.currentBalance;
                }
            }
            
            const progress = Math.min((currentAmount / goal.targetAmount) * 100, 100);
            
            const goalCard = document.createElement('div');
            goalCard.className = 'goal-card';
            goalCard.innerHTML = `
                <div class="goal-card-header">
                    <h4><i class="fas fa-flag-checkered"></i> ${goal.name}</h4>
                    <button class="btn-danger delete-goal-btn" data-id="${goal.id}">&times;</button>
                </div>
                <div class="goal-card-body">
                    <p class="goal-progress-text">${formatCurrency(currentAmount)} de ${formatCurrency(goal.targetAmount)}</p>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progress}%; background-color: var(--secondary-color);"></div>
                    </div>
                </div>
            `;
            goalsList.appendChild(goalCard);
        });
    }

    addGoalBtn.addEventListener('click', () => {
        goalForm.reset();
        goalModalTitle.textContent = 'Novo Objetivo';
        goalForm['goal-id'].value = '';
        const savingsAccounts = userAccounts.filter(acc => acc.type === 'poupanca' || acc.type === 'investimento');
        const select = goalForm['goal-linked-account'];
        select.innerHTML = '<option value="">Nenhuma (depósito manual)</option>';
        savingsAccounts.forEach(acc => {
            select.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
        });
        openModal(goalModal);
    });

    goalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const goalId = goalForm['goal-id'].value;
        const data = {
            userId: currentUser.uid,
            name: goalForm['goal-name'].value,
            targetAmount: parseFloat(goalForm['goal-target-amount'].value),
            currentAmount: parseFloat(goalForm['goal-current-amount'].value) || 0,
            linkedAccountId: goalForm['goal-linked-account'].value || null
        };

        try {
            if (goalId) {
                await db.collection('goals').doc(goalId).update(data);
            } else {
                await db.collection('goals').add(data);
            }
            await fetchAllData();
            loadGoalsData();
            closeModal(goalModal);
        } catch (error) { console.error("Erro ao salvar objetivo:", error); alert("Não foi possível salvar."); }
    });

    goalsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-goal-btn')) {
            const goalId = e.target.dataset.id;
            if (confirm('Tem certeza que deseja excluir este objetivo?')) {
                deleteGoal(goalId);
            }
        }
    });

    async function deleteGoal(id) {
        try {
            await db.collection('goals').doc(id).delete();
            await fetchAllData();
            loadGoalsData();
        } catch (error) { console.error("Erro ao excluir objetivo:", error); alert("Não foi possível excluir."); }
    }


    // --- LÓGICA DO DASHBOARD ---
    function loadDashboardData() {
        if (!currentUser) return;
        const totalBalance = userAccounts
            .filter(acc => acc.type !== 'cartao_credito')
            .reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
        totalBalanceEl.textContent = formatCurrency(totalBalance);
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        let monthlyIncome = 0, monthlyExpenses = 0;
        userTransactions.forEach(t => {
            const transactionDate = t.date.toDate();
            if (transactionDate >= startOfMonth) {
                if (t.type === 'receita') monthlyIncome += t.amount;
                else if (t.type === 'despesa') monthlyExpenses += t.amount;
            }
        });
        monthlyIncomeEl.textContent = formatCurrency(monthlyIncome);
        monthlyExpensesEl.textContent = formatCurrency(monthlyExpenses);
        monthlySavingsEl.textContent = formatCurrency(monthlyIncome - monthlyExpenses);
        
        recentTransactionsList.innerHTML = '';
        const sortedTransactions = [...userTransactions].sort((a, b) => b.date.seconds - a.date.seconds);
        sortedTransactions.slice(0, 5).forEach(t => {
            const li = document.createElement('li');
            li.innerHTML = `<span><i class="fas ${t.type === 'receita' ? 'fa-arrow-up' : 'fa-arrow-down'}" style="color:${t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)'};"></i> ${t.description}</span><strong>${formatCurrency(t.amount)}</strong>`;
            recentTransactionsList.appendChild(li);
        });

        renderBudgetsOverview();
        renderMainChart();
    }

    function renderBudgetsOverview() {
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
                    <span>${formatCurrency(spentAmount)}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
            `;
            budgetsOverviewList.appendChild(overviewItem);
        });
    }
    
    function renderMainChart() {
        if (!currentUser) return;
        const labels = [];
        const incomeData = [];
        const expenseData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.toLocaleString('pt-BR', { month: 'short' });
            const year = d.getFullYear();
            labels.push(`${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`);
            const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
            const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            let income = 0;
            let expense = 0;
            userTransactions.forEach(t => {
                const transactionDate = t.date.toDate();
                if (transactionDate >= startOfMonth && transactionDate <= endOfMonth) {
                    if (t.type === 'receita') income += t.amount;
                    if (t.type === 'despesa') expense += t.amount;
                }
            });
            incomeData.push(income);
            expenseData.push(expense);
        }
        if (mainChart) { mainChart.destroy(); }
        mainChart = new Chart(mainChartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Receitas', data: incomeData,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)', borderColor: 'rgba(16, 185, 129, 1)', borderWidth: 1
                }, {
                    label: 'Despesas', data: expenseData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)', borderColor: 'rgba(239, 68, 68, 1)', borderWidth: 1
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }

    // --- LÓGICA DE TRANSAÇÕES ---
    function populateAccountOptions() {
        transactionAccountSelect.innerHTML = '<option value="">Selecione uma conta</option>';
        userAccounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name;
            transactionAccountSelect.appendChild(option);
        });
    }

    addTransactionBtn.addEventListener('click', () => {
        transactionForm.reset();
        transactionModalTitle.textContent = 'Nova Transação';
        transactionForm['transaction-id'].value = '';
        populateAccountOptions();
        openModal(transactionModal);
    });

    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const transactionId = transactionForm['transaction-id'].value;
        const data = {
            userId: currentUser.uid, type: transactionForm['transaction-type'].value,
            description: transactionForm['transaction-description'].value, amount: parseFloat(transactionForm['transaction-amount'].value),
            date: firebase.firestore.Timestamp.fromDate(new Date(transactionForm['transaction-date'].value)),
            accountId: transactionForm['transaction-account'].value, category: transactionForm['transaction-category'].value,
            isPaid: transactionForm['transaction-paid'].checked
        };
        try {
            if (transactionId) {
                await db.collection('transactions').doc(transactionId).update(data);
            } else {
                await db.collection('transactions').add(data);
            }
            await fetchAllData();
            closeModal(transactionModal);
            loadPageData(document.querySelector('.page.active').id.replace('-page', ''));
        } catch (error) { console.error("Erro ao salvar transação: ", error); alert("Não foi possível salvar a transação."); }
    });

    function loadTransactionsData() {
        if (!currentUser) return;
        transactionsTableBody.innerHTML = '';
        const sortedTransactions = [...userTransactions].sort((a, b) => b.date.seconds - a.date.seconds);
        sortedTransactions.forEach(t => {
            const accountName = userAccounts.find(acc => acc.id === t.accountId)?.name || 'N/A';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.date.toDate().toLocaleDateString('pt-BR')}</td> <td>${t.description}</td> <td>${t.category}</td>
                <td>${accountName}</td> <td style="color: ${t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)'};">${formatCurrency(t.amount)}</td>
                <td>${t.isPaid ? 'Pago' : 'Pendente'}</td> <td><!-- Ações --></td>
            `;
            transactionsTableBody.appendChild(tr);
        });
    }

    // --- FUNÇÕES UTILITÁRIAS ---
    function openModal(modalElement) { modalElement.classList.remove('hidden'); }
    function closeModal(modalElement) { modalElement.classList.add('hidden'); }
    document.querySelectorAll('.modal-container').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close-btn')) { closeModal(modal); }
        });
    });
    function formatCurrency(value) {
        if (typeof value !== 'number') value = 0;
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
});
