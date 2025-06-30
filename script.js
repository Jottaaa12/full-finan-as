// =============================================================================
// SCRIPT PRINCIPAL DA APLICAÇÃO - Full Finanças
// =============================================================================
// Este arquivo contém toda a lógica da aplicação, incluindo:
// 1. Gerenciamento de estado da autenticação (login, logout, registro).
// 2. Navegação entre as diferentes seções (páginas) da aplicação.
// 3. Funções CRUD (Create, Read, Update, Delete) para interagir com o Firestore.
// 4. Renderização dinâmica de componentes (cards, gráficos, tabelas).
// 5. Manipulação de eventos (cliques em botões, submissão de formulários).
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

    // Dashboard
    const totalBalanceEl = document.getElementById('total-balance');
    const monthlyIncomeEl = document.getElementById('monthly-income');
    const monthlyExpensesEl = document.getElementById('monthly-expenses');
    const monthlySavingsEl = document.getElementById('monthly-savings');
    const mainChartCanvas = document.getElementById('main-chart');
    const recentTransactionsList = document.getElementById('recent-transactions-list');
    
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


    // --- ESTADO DA APLICAÇÃO (CACHE LOCAL) ---
    let currentUser = null;
    let mainChart = null;
    let userAccounts = []; 
    let userTransactions = [];

    // --- INICIALIZAÇÃO ---

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            initApp();
        } else {
            currentUser = null;
            userAccounts = [];
            userTransactions = [];
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

        calculateAllBalances();
    }
    
    function calculateAllBalances() {
        userAccounts.forEach(account => {
            if (account.type === 'cartao_credito') {
                // Saldo de cartão de crédito é a fatura, não o limite. Não calculamos aqui.
                account.currentBalance = 0; // Representa o impacto no patrimônio, que é nulo até pagar a fatura.
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

    // --- LÓGICA DE AUTENTICAÇÃO (sem alterações) ---
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

    // --- NAVEGAÇÃO ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); navigateTo(link.getAttribute('data-page')); });
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
            case 'cards': loadCardsData(); break; // NOVO
        }
    }
    
    // --- LÓGICA DE CONTAS E CARTÕES ---
    
    // NOVO: Mostra/esconde campos de cartão de crédito no modal
    accountTypeSelect.addEventListener('change', () => {
        const isCreditCard = accountTypeSelect.value === 'cartao_credito';
        creditCardFields.classList.toggle('hidden', !isCreditCard);
        initialBalanceGroup.classList.toggle('hidden', isCreditCard);
        // Saldo inicial não é obrigatório para cartão
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
                <p class="account-card-type">${account.type.replace('_', ' ')}</p>
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
        accountTypeSelect.dispatchEvent(new Event('change')); // Garante estado inicial correto dos campos
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
            data.initialBalance = 0; // Cartão não tem saldo inicial
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
    
    // NOVO: Função para carregar e exibir as faturas dos cartões
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
                    ${billTransactions.map(t => `<li><span>${t.description}</span><strong>${formatCurrency(t.amount)}</strong></li>`).join('')}
                </ul>
                <div class="account-card-actions" style="margin-top: 1rem;">
                    <button class="btn-primary" disabled>Pagar Fatura</button>
                </div>
            `;
            creditCardsList.appendChild(cardElement);
        });
    }

    // NOVO: Função para determinar o ciclo da fatura atual de um cartão
    function getBillingCycle(card) {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-11
        const closingDay = card.closingDay;
        const dueDay = card.dueDate;

        let start, end, due;

        if (today.getDate() > closingDay) {
            // A fatura atual já começou neste mês e fecha no próximo
            start = new Date(currentYear, currentMonth, closingDay + 1);
            end = new Date(currentYear, currentMonth + 1, closingDay);
            due = new Date(currentYear, currentMonth + 1, dueDay);
        } else {
            // A fatura atual começou no mês passado e fecha neste mês
            start = new Date(currentYear, currentMonth - 1, closingDay + 1);
            end = new Date(currentYear, currentMonth, closingDay);
            due = new Date(currentYear, currentMonth, dueDay);
        }
        return { start, end, due };
    }


    // --- LÓGICA DO DASHBOARD ---
    function loadDashboardData() {
        if (!currentUser) return;
        const totalBalance = userAccounts
            .filter(acc => acc.type !== 'cartao_credito')
            .reduce((sum, acc) => sum + acc.currentBalance, 0);
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
        renderMainChart();
    }
    
    async function renderMainChart() { /* Lógica do gráfico permanece a mesma */ }

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
            if (t
