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
    const modalCloseBtn = transactionModal.querySelector('.modal-close-btn');
    const transactionsTableBody = document.querySelector('#transactions-table tbody');

    // --- ESTADO DA APLICAÇÃO ---
    let currentUser = null;
    let mainChart = null;

    // --- INICIALIZAÇÃO ---

    // Monitora o estado da autenticação do usuário
    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuário está logado
            currentUser = user;
            initApp();
        } else {
            // Usuário não está logado
            currentUser = null;
            showAuthScreen();
        }
    });

    // Mostra a tela de autenticação e esconde o app
    function showAuthScreen() {
        authContainer.classList.remove('hidden');
        mainContent.classList.add('hidden');
        loader.classList.add('hidden');
        appContainer.classList.remove('hidden');
    }

    // Mostra o app e esconde a tela de autenticação
    async function initApp() {
        mainContent.classList.remove('hidden');
        authContainer.classList.add('hidden');
        
        // Busca dados do usuário no Firestore
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            userNameDisplay.textContent = userDoc.data().name;
        } else {
            userNameDisplay.textContent = currentUser.email;
        }
        
        navigateTo('dashboard'); // Navega para o dashboard por padrão
        loadDashboardData();
        
        loader.classList.add('hidden');
        appContainer.classList.remove('hidden');
    }


    // --- LÓGICA DE AUTENTICAÇÃO ---

    // Alternar entre formulários de login e registro
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authError.textContent = '';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authError.textContent = '';
    });

    // Registro de novo usuário
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = registerForm['register-name'].value;
        const email = registerForm['register-email'].value;
        const password = registerForm['register-password'].value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                // Salva informações adicionais do usuário no Firestore
                return db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    currency: 'BRL'
                });
            })
            .catch(error => {
                authError.textContent = getAuthErrorMessage(error.code);
            });
    });

    // Login de usuário existente
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;

        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                authError.textContent = getAuthErrorMessage(error.code);
            });
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    // Mapeia códigos de erro do Firebase para mensagens amigáveis
    function getAuthErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Este email já está em uso.';
            case 'auth/invalid-email':
                return 'O formato do email é inválido.';
            case 'auth/weak-password':
                return 'A senha deve ter pelo menos 6 caracteres.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Email ou senha incorretos.';
            default:
                return 'Ocorreu um erro. Tente novamente.';
        }
    }

    // --- NAVEGAÇÃO ---
    
    // Adiciona listener para os links de navegação
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.getAttribute('data-page');
            navigateTo(pageName);
        });
    });

    // Função para mostrar a página correta e atualizar o link ativo
    function navigateTo(pageName) {
        // Esconde todas as páginas
        pages.forEach(page => page.classList.add('hidden'));
        pages.forEach(page => page.classList.remove('active'));

        // Mostra a página selecionada
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('active');
        }

        // Atualiza o link ativo no menu
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Carrega os dados da página específica
        loadPageData(pageName);
    }
    
    function loadPageData(pageName) {
        switch(pageName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'transactions':
                loadTransactionsData();
                break;
            // Adicionar casos para outras páginas aqui
        }
    }

    // --- LÓGICA DO DASHBOARD ---

    async function loadDashboardData() {
        if (!currentUser) return;
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Query para transações do mês atual
        const monthlyQuery = db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .where('date', '>=', firebase.firestore.Timestamp.fromDate(startOfMonth));
        
        const snapshot = await monthlyQuery.get();
        
        let monthlyIncome = 0;
        let monthlyExpenses = 0;

        snapshot.forEach(doc => {
            const transaction = doc.data();
            if (transaction.type === 'receita') {
                monthlyIncome += transaction.amount;
            } else if (transaction.type === 'despesa') {
                monthlyExpenses += transaction.amount;
            }
        });

        // Atualiza os cards de resumo
        monthlyIncomeEl.textContent = formatCurrency(monthlyIncome);
        monthlyExpensesEl.textContent = formatCurrency(monthlyExpenses);
        monthlySavingsEl.textContent = formatCurrency(monthlyIncome - monthlyExpenses);
        
        // Carregar saldo total (requer agregação de todas as contas)
        // Placeholder por enquanto
        totalBalanceEl.textContent = 'Calculando...';
        
        // Carregar últimas 5 transações
        const recentSnapshot = await db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .orderBy('date', 'desc')
            .limit(5)
            .get();
            
        recentTransactionsList.innerHTML = ''; // Limpa a lista
        recentSnapshot.forEach(doc => {
            const t = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                <span>
                    <i class="fas ${t.type === 'receita' ? 'fa-arrow-up' : 'fa-arrow-down'}" style="color:${t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)'};"></i>
                    ${t.description}
                </span>
                <strong>${formatCurrency(t.amount)}</strong>
            `;
            recentTransactionsList.appendChild(li);
        });

        // Carregar gráfico
        renderMainChart();
    }
    
    async function renderMainChart() {
        if (!currentUser) return;
        
        const labels = [];
        const incomeData = [];
        const expenseData = [];
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();
            labels.push(`${month}/${year}`);
            
            const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
            const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const snapshot = await db.collection('transactions')
                .where('userId', '==', currentUser.uid)
                .where('date', '>=', firebase.firestore.Timestamp.fromDate(startOfMonth))
                .where('date', '<=', firebase.firestore.Timestamp.fromDate(endOfMonth))
                .get();

            let income = 0;
            let expense = 0;
            snapshot.forEach(doc => {
                const t = doc.data();
                if (t.type === 'receita') income += t.amount;
                if (t.type === 'despesa') expense += t.amount;
            });
            incomeData.push(income);
            expenseData.push(expense);
        }
        
        if (mainChart) {
            mainChart.destroy();
        }

        mainChart = new Chart(mainChartCanvas, {
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
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // --- LÓGICA DE TRANSAÇÕES ---
    
    // Abrir e fechar modal de transação
    addTransactionBtn.addEventListener('click', () => {
        transactionForm.reset();
        document.getElementById('modal-title').textContent = 'Nova Transação';
        document.getElementById('transaction-id').value = '';
        transactionModal.classList.remove('hidden');
    });

    modalCloseBtn.addEventListener('click', () => {
        transactionModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === transactionModal) {
            transactionModal.classList.add('hidden');
        }
    });

    // Salvar transação (nova ou editada)
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const transactionData = {
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
            const transactionId = transactionForm['transaction-id'].value;
            if (transactionId) {
                // Atualizar transação existente
                await db.collection('transactions').doc(transactionId).update(transactionData);
            } else {
                // Adicionar nova transação
                await db.collection('transactions').add(transactionData);
            }
            transactionModal.classList.add('hidden');
            loadPageData(document.querySelector('.page.active').id.replace('-page', ''));
        } catch (error) {
            console.error("Erro ao salvar transação: ", error);
            alert("Não foi possível salvar a transação.");
        }
    });

    // Carregar e exibir dados das transações
    async function loadTransactionsData() {
        if (!currentUser) return;
        
        const snapshot = await db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .orderBy('date', 'desc')
            .get();
            
        transactionsTableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const t = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.date.toDate().toLocaleDateString('pt-BR')}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td>${t.accountId || 'N/A'}</td>
                <td style="color: ${t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)'};">${formatCurrency(t.amount)}</td>
                <td>${t.isPaid ? 'Pago' : 'Pendente'}</td>
                <td><!-- Ações como editar/excluir --></td>
            `;
            transactionsTableBody.appendChild(tr);
        });
    }

    // --- FUNÇÕES UTILITÁRIAS ---

    // Formata um número para o padrão de moeda BRL
    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

});
