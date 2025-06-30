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

    // Contas
    const addAccountBtn = document.getElementById('add-account-btn');
    const accountModal = document.getElementById('account-modal');
    const accountForm = document.getElementById('account-form');
    const accountModalTitle = document.getElementById('account-modal-title');
    const accountsList = document.getElementById('accounts-list');

    // --- ESTADO DA APLICAÇÃO ---
    let currentUser = null;
    let mainChart = null;
    let userAccounts = []; // Cache local para as contas do usuário

    // --- INICIALIZAÇÃO ---

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            initApp();
        } else {
            currentUser = null;
            userAccounts = [];
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
        if (userDoc.exists) {
            userNameDisplay.textContent = userDoc.data().name;
        } else {
            userNameDisplay.textContent = currentUser.email;
        }
        
        await fetchUserAccounts(); // Carrega as contas do usuário no início
        navigateTo('dashboard');
        
        loader.classList.add('hidden');
        appContainer.classList.remove('hidden');
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
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    currency: 'BRL'
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
            'auth/email-already-in-use': 'Este email já está em uso.',
            'auth/invalid-email': 'O formato do email é inválido.',
            'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
            'auth/user-not-found': 'Email ou senha incorretos.',
            'auth/wrong-password': 'Email ou senha incorretos.'
        };
        return messages[errorCode] || 'Ocorreu um erro. Tente novamente.';
    }

    // --- NAVEGAÇÃO ---
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.getAttribute('data-page'));
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
        }
    }
    
    // --- LÓGICA DAS CONTAS ---

    // Busca as contas do usuário e armazena localmente
    async function fetchUserAccounts() {
        if (!currentUser) return;
        const snapshot = await db.collection('accounts').where('userId', '==', currentUser.uid).get();
        userAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Carrega e renderiza os dados na página de contas
    function loadAccountsData() {
        if (!currentUser) return;
        accountsList.innerHTML = ''; // Limpa a lista
        
        userAccounts.forEach(account => {
            const card = document.createElement('div');
            card.className = 'account-card';
            card.innerHTML = `
                <div class="account-card-header">
                    <h3>${account.name}</h3>
                    <i class="fas fa-wallet icon"></i>
                </div>
                <p class="account-card-balance">${formatCurrency(account.initialBalance)}</p>
                <p class="account-card-type">${account.type.replace('_', ' ')}</p>
                <div class="account-card-actions">
                    <button class="btn-secondary edit-account-btn" data-id="${account.id}">Editar</button>
                    <button class="btn-danger delete-account-btn" data-id="${account.id}">Excluir</button>
                </div>
            `;
            accountsList.appendChild(card);
        });
    }

    // Abre o modal de contas (para adicionar)
    addAccountBtn.addEventListener('click', () => {
        accountForm.reset();
        accountModalTitle.textContent = 'Nova Conta';
        accountForm['account-id'].value = '';
        openModal(accountModal);
    });

    // Delegação de eventos para editar e excluir contas
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
                accountForm['account-initial-balance'].value = account.initialBalance;
                openModal(accountModal);
            }
        }
        if (e.target.classList.contains('delete-account-btn')) {
            if (confirm('Tem certeza que deseja excluir esta conta? Todas as transações associadas também serão afetadas.')) {
                deleteAccount(accountId);
            }
        }
    });

    // Salva ou atualiza uma conta
    accountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const accountId = accountForm['account-id'].value;
        const data = {
            userId: currentUser.uid,
            name: accountForm['account-name'].value,
            type: accountForm['account-type'].value,
            initialBalance: parseFloat(accountForm['account-initial-balance'].value)
        };

        try {
            if (accountId) {
                await db.collection('accounts').doc(accountId).update(data);
            } else {
                await db.collection('accounts').add(data);
            }
            await fetchUserAccounts(); // Re-sincroniza o cache local
            loadAccountsData(); // Re-renderiza a lista
            closeModal(accountModal);
        } catch (error) {
            console.error("Erro ao salvar conta:", error);
            alert("Não foi possível salvar a conta.");
        }
    });
    
    // Deleta uma conta
    async function deleteAccount(id) {
        try {
            await db.collection('accounts').doc(id).delete();
            await fetchUserAccounts();
            loadAccountsData();
        } catch (error) {
            console.error("Erro ao excluir conta:", error);
            alert("Não foi possível excluir a conta.");
        }
    }

    // Popula o select de contas no modal de transação
    function populateAccountOptions() {
        transactionAccountSelect.innerHTML = '<option value="">Selecione uma conta</option>';
        userAccounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name;
            transactionAccountSelect.appendChild(option);
        });
    }

    // --- LÓGICA DO DASHBOARD ---

    async function loadDashboardData() {
        if (!currentUser) return;
        
        // Calcula o saldo total somando o saldo inicial de todas as contas
        const totalBalance = userAccounts.reduce((sum, acc) => sum + acc.initialBalance, 0);
        totalBalanceEl.textContent = formatCurrency(totalBalance);
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyQuery = db.collection('transactions').where('userId', '==', currentUser.uid).where('date', '>=', firebase.firestore.Timestamp.fromDate(startOfMonth));
        const snapshot = await monthlyQuery.get();
        
        let monthlyIncome = 0, monthlyExpenses = 0;
        snapshot.forEach(doc => {
            const t = doc.data();
            if (t.type === 'receita') monthlyIncome += t.amount;
            else if (t.type === 'despesa') monthlyExpenses += t.amount;
        });

        monthlyIncomeEl.textContent = formatCurrency(monthlyIncome);
        monthlyExpensesEl.textContent = formatCurrency(monthlyExpenses);
        monthlySavingsEl.textContent = formatCurrency(monthlyIncome - monthlyExpenses);
        
        const recentSnapshot = await db.collection('transactions').where('userId', '==', currentUser.uid).orderBy('date', 'desc').limit(5).get();
        recentTransactionsList.innerHTML = '';
        recentSnapshot.forEach(doc => {
            const t = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `<span><i class="fas ${t.type === 'receita' ? 'fa-arrow-up' : 'fa-arrow-down'}" style="color:${t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)'};"></i> ${t.description}</span><strong>${formatCurrency(t.amount)}</strong>`;
            recentTransactionsList.appendChild(li);
        });

        renderMainChart();
    }
    
    async function renderMainChart() { /* ... Lógica do gráfico permanece a mesma ... */ }

    // --- LÓGICA DE TRANSAÇÕES ---
    
    addTransactionBtn.addEventListener('click', () => {
        transactionForm.reset();
        transactionModalTitle.textContent = 'Nova Transação';
        transactionForm['transaction-id'].value = '';
        populateAccountOptions(); // Popula as contas antes de abrir
        openModal(transactionModal);
    });

    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const transactionId = transactionForm['transaction-id'].value;
        const data = {
            userId: currentUser.uid,
            type: transactionForm['transaction-type'].value,
            description: transactionForm['transaction-description'].value,
            amount: parseFloat(transactionForm['transaction-amount'].value),
            date: firebase.firestore.Timestamp.fromDate(new Date(transactionForm['transaction-date'].value)),
            accountId: transactionForm['transaction-account'].value,
            category: transactionForm['transaction-category'].value,
            isPaid: transactionForm['transaction-paid'].checked
        };
        
        try {
            if (transactionId) {
                await db.collection('transactions').doc(transactionId).update(data);
            } else {
                await db.collection('transactions').add(data);
            }
            closeModal(transactionModal);
            loadPageData(document.querySelector('.page.active').id.replace('-page', ''));
        } catch (error) {
            console.error("Erro ao salvar transação: ", error);
            alert("Não foi possível salvar a transação.");
        }
    });

    async function loadTransactionsData() {
        if (!currentUser) return;
        const snapshot = await db.collection('transactions').where('userId', '==', currentUser.uid).orderBy('date', 'desc').get();
        transactionsTableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const t = doc.data();
            const accountName = userAccounts.find(acc => acc.id === t.accountId)?.name || 'N/A';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.date.toDate().toLocaleDateString('pt-BR')}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td>${accountName}</td>
                <td style="color: ${t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)'};">${formatCurrency(t.amount)}</td>
                <td>${t.isPaid ? 'Pago' : 'Pendente'}</td>
                <td><!-- Ações --></td>
            `;
            transactionsTableBody.appendChild(tr);
        });
    }

    // --- FUNÇÕES UTILITÁRIAS DE MODAL ---
    function openModal(modalElement) {
        modalElement.classList.remove('hidden');
    }

    function closeModal(modalElement) {
        modalElement.classList.add('hidden');
    }

    // Adiciona listener para fechar qualquer modal
    document.querySelectorAll('.modal-container').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close-btn')) {
                closeModal(modal);
            }
        });
    });

    // --- FUNÇÕES UTILITÁRIAS GERAIS ---
    function formatCurrency(value) {
        if (typeof value !== 'number') value = 0;
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
});
