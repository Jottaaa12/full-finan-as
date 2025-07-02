// =============================================================================
// SCRIPT PRINCIPAL DA APLICAÇÃO - Full Finanças
// =============================================================================
// STATUS DO PROJETO: BETA 2 (Estável)
//
// Próximos Passos (Roteiro Pós-BETA 2):
// ⏳ 1. Relatório de Fluxo de Caixa Projetado
// ⏳ 2. Melhorias de Usabilidade (Busca Global e Divisão de Transações)
// ⏳ 3. Conciliação Bancária via CSV (Versão Avançada)
//
// Funcionalidades já concluídas na BETA 2:
// ✅ Dashboard do Administrador (Métricas Gerais)
// ✅ Ferramentas de Suporte Ativo (Editar/Excluir transações de usuários)
// ✅ Ajuste Manual de Saldo de Contas (Admin)
// ✅ Ferramentas de Diagnóstico (Admin)
// ✅ Controle de Contas a Pagar/Receber
// ✅ Sistema de Feedback e Painel de Admin
// ✅ Tour Guiado para Novos Usuários
// ✅ Interface Responsiva e Moderna
//

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

    const recentTransactionsList = document.getElementById('recent-transactions-list');
    const budgetsOverviewList = document.getElementById('budgets-overview-list');
    
    // Transações
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const transactionModal = document.getElementById('transaction-modal');
    const transactionForm = document.getElementById('transaction-form');
    const transactionModalTitle = document.getElementById('transaction-modal-title');
    const transactionAccountSelect = document.getElementById('transaction-account');
    const transactionsTableBody = document.querySelector('#transactions-table tbody');
    
    // Exportação
    const exportExcelBtn = document.getElementById('export-excel-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    
    // Calculadora de Juros Compostos
    const compoundInterestForm = document.getElementById('compound-interest-form');
    const calculatorResults = document.getElementById('calculator-results');
    const totalInvestedEl = document.getElementById('total-invested');
    const totalInterestEl = document.getElementById('total-interest');
    const finalAmountEl = document.getElementById('final-amount');
    
    // Perfil do Usuário
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const profileEmail = document.getElementById('profile-email');
    const profileName = document.getElementById('profile-name');
    const profileMessage = document.getElementById('profile-message');
    const passwordMessage = document.getElementById('password-message');
    
    // Personalização
    const profilePhotoInput = document.getElementById('profile-photo-input');
    const profilePhotoPreview = document.getElementById('profile-photo-preview');
    const sidebarUserPhoto = document.getElementById('sidebar-user-photo');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const removePhotoBtn = document.getElementById('remove-photo-btn');
    const photoUploadProgress = document.getElementById('photo-upload-progress');
    const defaultCurrency = document.getElementById('default-currency');
    const personalizationMessage = document.getElementById('personalization-message');
    
    // Exclusão de Conta
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteAccountModal = document.getElementById('delete-account-modal');
    const confirmEmail = document.getElementById('confirm-email');
    const userEmailDisplay = document.getElementById('user-email-display');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const deleteProgress = document.getElementById('delete-progress');
    
    // Apoie o Projeto
    const copyPixBtn = document.getElementById('copy-pix-btn');
    const pixKey = document.getElementById('pix-key');
    const copyMessage = document.getElementById('copy-message');
    
    // Recorrência
    const transactionRecurringCheckbox = document.getElementById('transaction-recurring');
    const recurrenceOptions = document.getElementById('recurrence-options');
    const recurrenceTypeRadios = document.querySelectorAll('input[name="recurrence-type"]');
    const monthlyOptions = document.getElementById('monthly-options');
    const installmentOptions = document.getElementById('installment-options');
    const recurrenceMonths = document.getElementById('recurrence-months');
    const recurrenceInstallments = document.getElementById('recurrence-installments');
    
    // Upload de Comprovante
    const transactionAttachment = document.getElementById('transaction-attachment');
    const uploadProgress = document.getElementById('upload-progress');
    
    // Relatórios
    const periodFilter = document.getElementById('period-filter');
    const reportsChartCanvas = document.getElementById('reports-chart');
    const summaryTableBody = document.querySelector('#summary-table tbody');

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

    // Pagamento de Fatura
    const paymentModal = document.getElementById('payment-modal');
    const paymentForm = document.getElementById('payment-form');
    const paymentCardId = document.getElementById('payment-card-id');
    const paymentCardName = document.getElementById('payment-card-name');
    const paymentAmount = document.getElementById('payment-amount');
    const paymentSourceAccount = document.getElementById('payment-source-account');

    // Contas a Pagar/Receber
    const payablesPage = document.getElementById('payables-page');
    const payablesTabs = document.querySelectorAll('.payables-tabs .tab-btn');
    const payablesTabContents = {
        overdue: document.getElementById('overdue-tab'),
        today: document.getElementById('today-tab'),
        next7: document.getElementById('next7-tab'),
        next30: document.getElementById('next30-tab')
    };
    const payablesLists = {
        overdue: document.getElementById('payables-overdue-list'),
        today: document.getElementById('payables-today-list'),
        next7: document.getElementById('payables-next7-list'),
        next30: document.getElementById('payables-next30-list')
    };

    // Card de alerta de próximos vencimentos
    const payablesAlertCard = document.getElementById('payables-alert-card');
    const payablesAlertList = document.getElementById('payables-alert-list');

    // Conciliação Bancária
    const reconciliationCsvInput = document.getElementById('reconciliation-csv-input');
    const reconciliationFileName = document.getElementById('reconciliation-file-name');
    const reconciliationProcessBtn = document.getElementById('reconciliation-process-btn');
    const reconciliationResults = document.getElementById('reconciliation-results');
    const reconciliationToLaunchList = document.getElementById('reconciliation-to-launch-list');
    const reconciliationMatchedInfo = document.getElementById('reconciliation-matched-info');

    let reconciliationParsedRows = [];
    let reconciliationMatches = [];
    let reconciliationToLaunch = [];

    if (reconciliationCsvInput) {
        reconciliationCsvInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                reconciliationFileName.textContent = file.name;
                reconciliationProcessBtn.disabled = false;
            } else {
                reconciliationFileName.textContent = '';
                reconciliationProcessBtn.disabled = true;
            }
        });
    }

    if (reconciliationProcessBtn) {
        reconciliationProcessBtn.addEventListener('click', () => {
            const file = reconciliationCsvInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                reconciliationParsedRows = parseCsvToRows(text);
                processReconciliation();
            };
            reader.readAsText(file, 'utf-8');
        });
    }

    function parseCsvToRows(text) {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        const rows = [];
        for (let line of lines) {
            // Suporta vírgula ou ponto e vírgula
            let cols = line.split(';');
            if (cols.length < 3) cols = line.split(',');
            if (cols.length < 3) continue;
            // Data, Descrição, Valor
            let [date, description, value] = cols;
            date = date.trim();
            description = description.trim();
            value = value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            rows.push({ date, description, value: parseFloat(value) });
        }
        return rows;
    }

    function processReconciliation() {
        if (!Array.isArray(reconciliationParsedRows) || reconciliationParsedRows.length === 0) return;
        reconciliationMatches = [];
        reconciliationToLaunch = [];
        // Normaliza userTransactions para busca
        const trans = (userTransactions || []).map(t => ({
            date: t.date ? t.date.toDate() : null,
            amount: t.amount,
            id: t.id
        }));
        reconciliationParsedRows.forEach(row => {
            const csvDate = parseCsvDate(row.date);
            const csvValue = row.value;
            // Busca por valor próximo (diferença <= 0.05) e data próxima (mesmo dia, anterior ou seguinte)
            const found = trans.find(t => {
                if (!t.date) return false;
                const diffDays = Math.abs((t.date - csvDate) / (1000*60*60*24));
                return Math.abs(t.amount - csvValue) <= 0.05 && diffDays <= 1;
            });
            if (found) {
                reconciliationMatches.push(row);
            } else {
                reconciliationToLaunch.push(row);
            }
        });
        renderReconciliationResults();
    }

    function parseCsvDate(str) {
        // Suporta formatos dd/mm/yyyy ou yyyy-mm-dd
        if (/\d{2}\/\d{2}\/\d{4}/.test(str)) {
            const [d, m, y] = str.split('/');
            return new Date(`${y}-${m}-${d}T00:00:00`);
        } else if (/\d{4}-\d{2}-\d{2}/.test(str)) {
            return new Date(str);
        }
        return new Date(str);
    }

    function renderReconciliationResults() {
        reconciliationResults.classList.remove('hidden');
        // Transações a serem lançadas
        reconciliationToLaunchList.innerHTML = '';
        if (reconciliationToLaunch.length === 0) {
            reconciliationToLaunchList.innerHTML = '<li class="empty-state-small">Nenhuma transação nova encontrada no extrato.</li>';
        } else {
            reconciliationToLaunch.forEach((row, idx) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span><b>${row.date}</b> - ${row.description} <strong style="color: var(--primary-color)">${formatCurrency(row.value)}</strong></span>
                    <button class="btn-primary reconciliation-launch-btn" data-idx="${idx}"><i class="fas fa-plus"></i> Lançar</button>
                `;
                reconciliationToLaunchList.appendChild(li);
            });
        }
        // Transações já conciliadas
        if (reconciliationMatches.length === 0) {
            reconciliationMatchedInfo.innerHTML = '<span class="empty-state-small">Nenhuma transação do extrato já está lançada.</span>';
        } else {
            reconciliationMatchedInfo.innerHTML = `<span>${reconciliationMatches.length} transação(ões) do extrato já estão lançadas no sistema.</span>`;
        }
    }

    // Lançamento rápido: abrir modal de Nova Transação pré-preenchido
    if (reconciliationToLaunchList) {
        reconciliationToLaunchList.addEventListener('click', (e) => {
            if (e.target.classList.contains('reconciliation-launch-btn') || e.target.closest('.reconciliation-launch-btn')) {
                const btn = e.target.closest('.reconciliation-launch-btn');
                const idx = btn.getAttribute('data-idx');
                const row = reconciliationToLaunch[idx];
                if (row) {
                    openReconciliationTransactionModal(row);
                }
            }
        });
    }

    function openReconciliationTransactionModal(row) {
        if (!transactionModal || !transactionForm) return;
        transactionForm.reset();
        transactionModalTitle.textContent = 'Nova Transação (Conciliação)';
        // Preencher campos
        transactionForm['transaction-date'].value = formatDateForInput(row.date);
        transactionForm['transaction-description'].value = row.description;
        transactionForm['transaction-amount'].value = row.value;
        // O usuário só precisa escolher categoria e conta
        openModal(transactionModal);
    }

    function formatDateForInput(dateStr) {
        // Aceita string dd/mm/yyyy ou yyyy-mm-dd
        if (/\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
            const [d, m, y] = dateStr.split('/');
            return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
        } else if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            return dateStr;
        }
        return '';
    }

    // --- ESTADO DA APLICAÇÃO (CACHE LOCAL) ---
    let currentUser = null;
    let mainChart = null;
    let reportsChart = null;
    let userCurrency = 'BRL'; // Moeda padrão
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
        let userData = {};
        if (userDoc.exists) {
            userData = userDoc.data();
            userNameDisplay.textContent = userData.name || currentUser.email;
            // Carregar foto de perfil na barra lateral e na página de perfil
            if (userData.profilePhotoURL) {
                sidebarUserPhoto.src = userData.profilePhotoURL;
                if (typeof profilePhotoPreview !== 'undefined') profilePhotoPreview.src = userData.profilePhotoURL;
                if (typeof removePhotoBtn !== 'undefined') removePhotoBtn.classList.remove('hidden');
            } else {
                // Resetar para imagem padrão se não houver foto
                const defaultPhoto = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23e2e8f0'/><text x='50' y='55' text-anchor='middle' font-size='30' fill='%2394a3b8'>👤</text></svg>";
                sidebarUserPhoto.src = defaultPhoto;
                if (typeof profilePhotoPreview !== 'undefined') profilePhotoPreview.src = defaultPhoto;
                if (typeof removePhotoBtn !== 'undefined') removePhotoBtn.classList.add('hidden');
            }
            // Carregar moeda padrão
            if (userData.currency) {
                userCurrency = userData.currency;
            }
        } else {
            userNameDisplay.textContent = currentUser.email;
        }
        await fetchAllData();
        setupMobileMenu();
        navigateTo('dashboard');
        loader.classList.add('hidden');
        appContainer.classList.remove('hidden');
        // Tour guiado
        if (userData.hasCompletedTour === false) {
            setTimeout(() => startTour(), 800);
        }
        // Após obter currentUser:
        const adminPanelLink = document.getElementById('admin-panel-link');
        if (currentUser && currentUser.uid === "d1J7P7mkgxgHz3kDQtGiDbgmi1M2") {
            adminPanelLink.classList.remove('hidden');
        }
    }
    
    async function fetchAllData() {
        if (!currentUser) return;
        
        try {
            // Otimização: Fazer todas as queries em paralelo
            const [accountsSnapshot, transactionsSnapshot, budgetsSnapshot, goalsSnapshot] = await Promise.all([
                db.collection('accounts').where('userId', '==', currentUser.uid).get(),
                db.collection('transactions').where('userId', '==', currentUser.uid).get(),
                db.collection('budgets').where('userId', '==', currentUser.uid).get(),
                db.collection('goals').where('userId', '==', currentUser.uid).get()
            ]);

            // Mapear dados
            userAccounts = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            userTransactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            userBudgets = budgetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            userGoals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calcular saldos
            calculateAllBalances();
            
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            // Em caso de erro, manter dados existentes se houver
        }
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
                    name: name, email: email, createdAt: firebase.firestore.FieldValue.serverTimestamp(), currency: 'BRL', hasCompletedTour: false
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
            case 'reports': loadReportsData(); break;
            case 'profile': loadProfileData(); break;
            case 'support': /* Página de suporte não precisa carregar dados */ break;
            case 'payables': loadPayablesData(); break;
            case 'feedback': /* Nada a carregar */ break;
        }
    }
    
    // --- LÓGICA DE EXPORTAÇÃO ---
    exportExcelBtn.addEventListener('click', () => {
        exportToExcel();
    });

    exportPdfBtn.addEventListener('click', () => {
        exportToPDF();
    });

    // --- LÓGICA DO PERFIL DO USUÁRIO ---
    function loadProfileData() {
        if (!currentUser) return;
        profileEmail.value = currentUser.email;
        db.collection('users').doc(currentUser.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    profileName.value = userData.name || '';
                    // Carregar foto de perfil
                    if (userData.profilePhotoURL) {
                        profilePhotoPreview.src = userData.profilePhotoURL;
                        sidebarUserPhoto.src = userData.profilePhotoURL;
                        removePhotoBtn.classList.remove('hidden');
                    } else {
                        // Resetar para imagem padrão se não houver foto
                        const defaultPhoto = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23e2e8f0'/><text x='50' y='55' text-anchor='middle' font-size='30' fill='%2394a3b8'>👤</text></svg>";
                        profilePhotoPreview.src = defaultPhoto;
                        sidebarUserPhoto.src = defaultPhoto;
                        removePhotoBtn.classList.add('hidden');
                    }
                    // Carregar moeda padrão
                    if (userData.currency) {
                        userCurrency = userData.currency;
                        defaultCurrency.value = userCurrency;
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao carregar dados do perfil:', error);
            });
    }

    // Atualizar informações pessoais
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newName = profileName.value.trim();
        
        if (!newName) {
            showProfileMessage('Por favor, informe seu nome completo.', 'error');
            return;
        }
        
        try {
            // Atualizar no Firestore
            await db.collection('users').doc(currentUser.uid).update({
                name: newName
            });
            
            // Atualizar na barra lateral
            userNameDisplay.textContent = newName;
            
            showProfileMessage('Nome atualizado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            showProfileMessage('Erro ao atualizar nome. Tente novamente.', 'error');
        }
    });

    // Alterar senha
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validações
        if (newPassword.length < 6) {
            showPasswordMessage('A nova senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showPasswordMessage('As senhas não coincidem.', 'error');
            return;
        }
        
        try {
            // Reautenticar usuário com senha atual
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email, 
                currentPassword
            );
            
            await currentUser.reauthenticateWithCredential(credential);
            
            // Atualizar senha
            await currentUser.updatePassword(newPassword);
            
            // Limpar formulário
            passwordForm.reset();
            
            showPasswordMessage('Senha alterada com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            
            let errorMessage = 'Erro ao alterar senha. Tente novamente.';
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Senha atual incorreta.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A nova senha é muito fraca.';
            }
            
            showPasswordMessage(errorMessage, 'error');
        }
    });

    function showProfileMessage(message, type) {
        profileMessage.textContent = message;
        profileMessage.className = `profile-message ${type}`;
        profileMessage.classList.remove('hidden');
        
        // Esconder mensagem após 5 segundos
        setTimeout(() => {
            profileMessage.classList.add('hidden');
        }, 5000);
    }

    function showPasswordMessage(message, type) {
        passwordMessage.textContent = message;
        passwordMessage.className = `profile-message ${type}`;
        passwordMessage.classList.remove('hidden');
        
        // Esconder mensagem após 5 segundos
        setTimeout(() => {
            passwordMessage.classList.add('hidden');
        }, 5000);
    }

    // --- LÓGICA DE FOTO DE PERFIL ---
    changePhotoBtn.addEventListener('click', () => {
        profilePhotoInput.click();
    });

    profilePhotoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validações
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            showPersonalizationMessage('A foto é muito grande. Tamanho máximo: 5MB', 'error');
            profilePhotoInput.value = '';
            return;
        }
        if (!file.type.startsWith('image/')) {
            showPersonalizationMessage('Por favor, selecione apenas arquivos de imagem.', 'error');
            profilePhotoInput.value = '';
            return;
        }

        // Prévia imediata
        const reader = new FileReader();
        reader.onload = function(ev) {
            profilePhotoPreview.src = ev.target.result;
        };
        reader.readAsDataURL(file);

        // Desabilitar interface
        changePhotoBtn.disabled = true;
        profileForm.querySelector('button[type="submit"]').disabled = true;
        photoUploadProgress.classList.remove('hidden');
        showPersonalizationMessage('Enviando foto...', 'success');

        try {
            // Caminho seguro: profile_pictures/{userId}/profile.jpg
            const userId = currentUser.uid;
            const storageRef = storage.ref().child(`profile_pictures/${userId}/profile.jpg`);
            // Upload seguro
            const uploadTask = storageRef.put(file);
            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', null, reject, resolve);
            });
            // Obter URL
            const photoURL = await storageRef.getDownloadURL();
            // Salvar no Firestore
            await db.collection('users').doc(userId).update({
                profilePhotoURL: photoURL
            });
            // Atualizar interface
            profilePhotoPreview.src = photoURL;
            sidebarUserPhoto.src = photoURL;
            removePhotoBtn.classList.remove('hidden');
            showPersonalizationMessage('Foto de perfil atualizada!', 'success');
        } catch (error) {
            console.error('Erro ao enviar a foto de perfil:', error);
            showPersonalizationMessage('Erro ao enviar a foto. Verifique o tamanho do arquivo e sua conexão.', 'error');
            // Reverter prévia para anterior se possível
            loadProfileData();
        } finally {
            changePhotoBtn.disabled = false;
            profileForm.querySelector('button[type="submit"]').disabled = false;
            photoUploadProgress.classList.add('hidden');
            profilePhotoInput.value = '';
        }
    });

    removePhotoBtn.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja remover sua foto de perfil?')) {
            try {
                // Remover do Firestore
                await db.collection('users').doc(currentUser.uid).update({
                    profilePhotoURL: firebase.firestore.FieldValue.delete()
                });

                // Resetar para imagem padrão
                const defaultPhoto = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23e2e8f0'/><text x='50' y='55' text-anchor='middle' font-size='30' fill='%2394a3b8'>👤</text></svg>";
                profilePhotoPreview.src = defaultPhoto;
                sidebarUserPhoto.src = defaultPhoto;
                removePhotoBtn.classList.add('hidden');

                showPersonalizationMessage('Foto de perfil removida com sucesso!', 'success');

            } catch (error) {
                console.error('Erro ao remover foto:', error);
                showPersonalizationMessage('Erro ao remover foto. Tente novamente.', 'error');
            }
        }
    });

    // --- LÓGICA DE MOEDA PADRÃO ---
    defaultCurrency.addEventListener('change', async () => {
        const newCurrency = defaultCurrency.value;
        
        try {
            // Atualizar no Firestore
            await db.collection('users').doc(currentUser.uid).update({
                currency: newCurrency
            });

            // Atualizar estado local
            userCurrency = newCurrency;

            showPersonalizationMessage('Moeda padrão atualizada com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao atualizar moeda:', error);
            showPersonalizationMessage('Erro ao atualizar moeda. Tente novamente.', 'error');
            // Reverter seleção
            defaultCurrency.value = userCurrency;
        }
    });

    async function uploadProfilePhoto(file) {
        try {
            // Criar nome único para o arquivo
            const timestamp = Date.now();
            const fileName = `${currentUser.uid}-profile-${timestamp}.jpg`;
            const filePath = `profile-photos/${fileName}`;
            
            // Referência no Firebase Storage
            const storageRef = storage.ref().child(filePath);
            
            // Upload do arquivo
            const snapshot = await storageRef.put(file);
            
            // Obter URL de download
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            return downloadURL;
            
        } catch (error) {
            console.error("Erro no upload da foto:", error);
            throw new Error("Falha no upload da foto");
        }
    }

    function showPersonalizationMessage(message, type) {
        personalizationMessage.textContent = message;
        personalizationMessage.className = `profile-message ${type}`;
        personalizationMessage.classList.remove('hidden');
        
        // Esconder mensagem após 5 segundos
        setTimeout(() => {
            personalizationMessage.classList.add('hidden');
        }, 5000);
    }

    // --- LÓGICA DE EXCLUSÃO DE CONTA ---
    deleteAccountBtn.addEventListener('click', () => {
        userEmailDisplay.textContent = currentUser.email;
        confirmEmail.value = '';
        confirmDeleteBtn.disabled = true;
        deleteProgress.classList.add('hidden');
        openModal(deleteAccountModal);
    });

    confirmEmail.addEventListener('input', () => {
        confirmDeleteBtn.disabled = confirmEmail.value !== currentUser.email;
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (confirmEmail.value !== currentUser.email) {
            alert('Por favor, digite seu email corretamente para confirmar a exclusão.');
            return;
        }

        if (!confirm('Tem certeza absoluta que deseja deletar sua conta? Esta ação é IRREVERSÍVEL e todos os seus dados serão perdidos permanentemente.')) {
            return;
        }

        try {
            // Mostrar progresso
            deleteProgress.classList.remove('hidden');
            confirmDeleteBtn.disabled = true;
            confirmEmail.disabled = true;

            console.log('Iniciando processo de exclusão da conta...');

            // Passo 1: Deletar todas as coleções do usuário
            await deleteUserCollections();

            // Passo 2: Deletar documento do usuário
            await deleteUserDocument();

            // Passo 3: Deletar arquivos do Storage
            await deleteUserFiles();

            // Passo 4: Deletar conta de autenticação
            await deleteUserAccount();

            console.log('Conta deletada com sucesso!');
            
            // Redirecionar para tela de login
            alert('Sua conta foi deletada com sucesso. Você será redirecionado para a tela de login.');
            window.location.reload();

        } catch (error) {
            console.error('Erro ao deletar conta:', error);
            alert('Erro ao deletar conta. Por favor, tente novamente ou entre em contato com o suporte.');
            
            // Restaurar interface
            deleteProgress.classList.add('hidden');
            confirmDeleteBtn.disabled = false;
            confirmEmail.disabled = false;
        }
    });

    async function deleteUserCollections() {
        console.log('Deletando coleções do usuário...');
        
        const collections = ['transactions', 'accounts', 'budgets', 'goals'];
        
        for (const collectionName of collections) {
            try {
                const querySnapshot = await db.collection(collectionName)
                    .where('userId', '==', currentUser.uid)
                    .get();
                
                if (!querySnapshot.empty) {
                    const batch = db.batch();
                    querySnapshot.docs.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                    console.log(`Coleção ${collectionName} deletada: ${querySnapshot.size} documentos`);
                }
            } catch (error) {
                console.error(`Erro ao deletar coleção ${collectionName}:`, error);
                throw new Error(`Falha ao deletar ${collectionName}`);
            }
        }
    }

    async function deleteUserDocument() {
        console.log('Deletando documento do usuário...');
        
        try {
            await db.collection('users').doc(currentUser.uid).delete();
            console.log('Documento do usuário deletado');
        } catch (error) {
            console.error('Erro ao deletar documento do usuário:', error);
            throw new Error('Falha ao deletar documento do usuário');
        }
    }

    async function deleteUserFiles() {
        console.log('Deletando arquivos do Storage...');
        
        try {
            // Deletar foto de perfil
            const profilePhotoRef = storage.ref().child(`profile-photos/${currentUser.uid}-profile-*`);
            const profilePhotos = await profilePhotoRef.listAll();
            for (const photo of profilePhotos.items) {
                await photo.delete();
            }
            
            // Deletar comprovantes
            const comprovantesRef = storage.ref().child(`comprovantes/${currentUser.uid}-*`);
            const comprovantes = await comprovantesRef.listAll();
            for (const comprovante of comprovantes.items) {
                await comprovante.delete();
            }
            
            console.log('Arquivos do Storage deletados');
        } catch (error) {
            console.error('Erro ao deletar arquivos do Storage:', error);
            // Não vamos falhar a exclusão por causa de arquivos
            console.log('Continuando exclusão mesmo com erro nos arquivos...');
        }
    }

    async function deleteUserAccount() {
        console.log('Deletando conta de autenticação...');
        
        try {
            await currentUser.delete();
            console.log('Conta de autenticação deletada');
        } catch (error) {
            console.error('Erro ao deletar conta de autenticação:', error);
            throw new Error('Falha ao deletar conta de autenticação');
        }
    }

    // --- LÓGICA DE APOIE O PROJETO ---
    copyPixBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(pixKey.textContent);
            
            // Mostrar mensagem de sucesso
            copyMessage.classList.remove('hidden');
            
            // Esconder mensagem após 3 segundos
            setTimeout(() => {
                copyMessage.classList.add('hidden');
            }, 3000);
            
        } catch (error) {
            console.error('Erro ao copiar chave PIX:', error);
            
            // Fallback para navegadores que não suportam clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = pixKey.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Mostrar mensagem de sucesso mesmo com fallback
            copyMessage.classList.remove('hidden');
            setTimeout(() => {
                copyMessage.classList.add('hidden');
            }, 3000);
        }
    });

    // --- LÓGICA DA CALCULADORA DE JUROS COMPOSTOS ---
    compoundInterestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateCompoundInterest();
    });

    function calculateCompoundInterest() {
        try {
            // Obter valores dos campos
            const initialAmount = parseFloat(document.getElementById('initial-amount').value) || 0;
            const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value) || 0;
            const annualInterestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
            const periodYears = parseFloat(document.getElementById('period-years').value) || 0;

            // Validações básicas
            if (annualInterestRate < 0 || annualInterestRate > 100) {
                alert('A taxa de juros deve estar entre 0% e 100%.');
                return;
            }

            if (periodYears <= 0 || periodYears > 100) {
                alert('O período deve estar entre 0.1 e 100 anos.');
                return;
            }

            // Conversões
            const monthlyInterestRate = annualInterestRate / 100 / 12; // Taxa mensal
            const totalMonths = periodYears * 12; // Total de meses

            // Cálculo do valor final com juros compostos
            let finalAmount = initialAmount * Math.pow(1 + monthlyInterestRate, totalMonths);

            // Adicionar aportes mensais com juros compostos
            if (monthlyContribution > 0) {
                finalAmount += monthlyContribution * ((Math.pow(1 + monthlyInterestRate, totalMonths) - 1) / monthlyInterestRate);
            }

            // Cálculos dos resultados
            const totalInvested = initialAmount + (monthlyContribution * totalMonths);
            const totalInterest = finalAmount - totalInvested;

            // Exibir resultados
            totalInvestedEl.textContent = formatCurrency(totalInvested);
            totalInterestEl.textContent = formatCurrency(totalInterest);
            finalAmountEl.textContent = formatCurrency(finalAmount);

            // Mostrar área de resultados
            calculatorResults.classList.remove('hidden');

        } catch (error) {
            console.error('Erro no cálculo:', error);
            alert('Erro ao calcular. Verifique os valores inseridos.');
        }
    }

    function exportToExcel() {
        try {
            // Obter dados das transações visíveis na tabela
            const tableRows = transactionsTableBody.querySelectorAll('tr');
            const data = [];
            
            // Cabeçalhos
            data.push(['Data', 'Descrição', 'Categoria', 'Conta', 'Valor', 'Status']);
            
            // Dados das linhas
            tableRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length > 0) {
                    const rowData = [];
                    cells.forEach((cell, index) => {
                        if (index < 6) { // Apenas as primeiras 6 colunas (excluindo Ações)
                            rowData.push(cell.textContent.trim());
                        }
                    });
                    data.push(rowData);
                }
            });
            
            // Criar workbook e worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
            
            // Ajustar largura das colunas
            const colWidths = [
                { wch: 12 }, // Data
                { wch: 30 }, // Descrição
                { wch: 15 }, // Categoria
                { wch: 20 }, // Conta
                { wch: 12 }, // Valor
                { wch: 10 }  // Status
            ];
            ws['!cols'] = colWidths;
            
            // Adicionar worksheet ao workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Transações');
            
            // Gerar e baixar arquivo
            XLSX.writeFile(wb, 'transacoes.xlsx');
            
        } catch (error) {
            console.error('Erro ao exportar para Excel:', error);
            alert('Erro ao exportar para Excel. Tente novamente.');
        }
    }

    function exportToPDF() {
        try {
            const tableContainer = document.querySelector('.table-container');
            
            // Criar elemento temporário para o PDF
            const pdfElement = document.createElement('div');
            pdfElement.innerHTML = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #7c3aed; text-align: center; margin-bottom: 30px;">
                        Extrato de Transações - Full Finanças
                    </h1>
                    <div style="margin-bottom: 20px;">
                        <p><strong>Data de Exportação:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                        <p><strong>Usuário:</strong> ${currentUser.email}</p>
                    </div>
                    ${tableContainer.outerHTML}
                </div>
            `;
            
            // Configurações do PDF
            const opt = {
                margin: 1,
                filename: 'extrato_full_financas.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
            };
            
            // Gerar PDF
            html2pdf().set(opt).from(pdfElement).save();
            
        } catch (error) {
            console.error('Erro ao exportar para PDF:', error);
            alert('Erro ao exportar para PDF. Tente novamente.');
        }
    }

    // --- LÓGICA DE RELATÓRIOS ---
    periodFilter.addEventListener('change', () => {
        loadReportsData();
    });

    function loadReportsData() {
        if (!currentUser) return;
        
        const selectedPeriod = periodFilter.value;
        const filteredTransactions = filterTransactionsByPeriod(selectedPeriod);
        const expensesByCategory = aggregateExpensesByCategory(filteredTransactions);
        
        if (Object.keys(expensesByCategory).length === 0) {
            showEmptyReportsState();
            return;
        }
        
        renderReportsChart(expensesByCategory);
        renderSummaryTable(expensesByCategory);
        renderCashflowProjection();
    }

    function filterTransactionsByPeriod(period) {
        const now = new Date();
        const startDate = new Date();
        const endDate = new Date();
        
        switch (period) {
            case 'current-month':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'last-month':
                startDate.setMonth(startDate.getMonth() - 1);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'current-year':
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'last-3-months':
                startDate.setMonth(startDate.getMonth() - 3);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'last-6-months':
                startDate.setMonth(startDate.getMonth() - 6);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
        }
        
        return userTransactions.filter(t => {
            const transactionDate = t.date.toDate();
            return t.type === 'despesa' && 
                   transactionDate >= startDate && 
                   transactionDate <= endDate;
        });
    }

    function aggregateExpensesByCategory(transactions) {
        const categories = {};
        
        transactions.forEach(t => {
            if (!categories[t.category]) {
                categories[t.category] = 0;
            }
            categories[t.category] += t.amount;
        });
        
        return categories;
    }

    function renderReportsChart(expensesByCategory) {
        const labels = Object.keys(expensesByCategory);
        const data = Object.values(expensesByCategory);
        
        // Cores para as categorias
        const colors = [
            '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e',
            '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
            '#a855f7', '#ec4899', '#f43f5e'
        ];
        
        if (reportsChart) {
            reportsChart.destroy();
        }
        
        reportsChart = new Chart(reportsChartCanvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderSummaryTable(expensesByCategory) {
        const total = Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);
        
        // Ordenar categorias por valor (maior para menor)
        const sortedCategories = Object.entries(expensesByCategory)
            .sort(([,a], [,b]) => b - a);
        
        summaryTableBody.innerHTML = '';
        
        sortedCategories.forEach(([category, amount]) => {
            const percentage = ((amount / total) * 100).toFixed(1);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="summary-category">${category}</td>
                <td class="summary-amount">${formatCurrency(amount)}</td>
                <td class="summary-percentage">${percentage}%</td>
            `;
            summaryTableBody.appendChild(row);
        });
    }

    function showEmptyReportsState() {
        // Limpar gráfico se existir
        if (reportsChart) {
            reportsChart.destroy();
            reportsChart = null;
        }
        
        // Mostrar estado vazio
        const chartContainer = document.querySelector('.reports-chart-container');
        const summaryContainer = document.querySelector('.reports-summary');
        
        chartContainer.innerHTML = `
            <div class="reports-empty-state">
                <i class="fas fa-chart-pie"></i>
                <h3>Nenhuma despesa encontrada</h3>
                <p>Não há despesas registradas para o período selecionado.</p>
            </div>
        `;
        
        summaryContainer.innerHTML = `
            <div class="reports-empty-state">
                <i class="fas fa-table"></i>
                <h3>Sem dados para exibir</h3>
                <p>Adicione algumas transações para ver os relatórios.</p>
            </div>
        `;
    }

    // --- LÓGICA DE RECORRÊNCIA ---
    transactionRecurringCheckbox.addEventListener('change', () => {
        recurrenceOptions.classList.toggle('hidden', !transactionRecurringCheckbox.checked);
    });

    recurrenceTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isMonthly = radio.value === 'monthly';
            monthlyOptions.classList.toggle('hidden', !isMonthly);
            installmentOptions.classList.toggle('hidden', isMonthly);
        });
    });

    // Event listener para feedback visual do upload
    transactionAttachment.addEventListener('change', () => {
        if (transactionAttachment.files.length > 0) {
            const file = transactionAttachment.files[0];
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if (file.size > maxSize) {
                alert('O arquivo é muito grande. Tamanho máximo: 5MB');
                transactionAttachment.value = '';
                transactionAttachment.classList.remove('has-file');
                return;
            }
            
            transactionAttachment.classList.add('has-file');
        } else {
            transactionAttachment.classList.remove('has-file');
        }
    });

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
        // Filtro correto: apenas cartões de crédito
        const creditCards = userAccounts.filter(acc => acc.type === 'cartao_credito');
        if (creditCards.length === 0) {
            creditCardsList.innerHTML = '<p class="empty-state">Nenhum cartão de crédito cadastrado. Crie um novo cartão na página de Contas.</p>';
            return;
        }
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
                    <button class="btn-primary pay-bill-btn" data-card-id="${card.id}" data-bill-total="${billTotal}">Pagar Fatura</button>
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

    // --- LÓGICA DE PAGAMENTO DE FATURA ---
    creditCardsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('pay-bill-btn')) {
            const cardId = e.target.dataset.cardId;
            const billTotal = parseFloat(e.target.dataset.billTotal);
            const card = userAccounts.find(acc => acc.id === cardId);
            
            if (card && billTotal > 0) {
                openPaymentModal(card, billTotal);
            } else {
                alert('Não há fatura para pagar neste cartão.');
            }
        }
    });

    function openPaymentModal(card, billTotal) {
        paymentForm.reset();
        paymentCardId.value = card.id;
        paymentCardName.value = card.name;
        paymentAmount.value = billTotal.toFixed(2);
        
        // Popula as opções de conta de origem (excluindo cartões de crédito)
        const regularAccounts = userAccounts.filter(acc => acc.type !== 'cartao_credito');
        paymentSourceAccount.innerHTML = '<option value="">Selecione uma conta</option>';
        regularAccounts.forEach(acc => {
            paymentSourceAccount.innerHTML += `<option value="${acc.id}">${acc.name} - ${formatCurrency(acc.currentBalance)}</option>`;
        });
        
        openModal(paymentModal);
    }

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const cardId = paymentCardId.value;
        const amount = parseFloat(paymentAmount.value);
        const sourceAccountId = paymentSourceAccount.value;
        const card = userAccounts.find(acc => acc.id === cardId);
        const sourceAccount = userAccounts.find(acc => acc.id === sourceAccountId);
        
        if (!sourceAccount) {
            alert('Por favor, selecione uma conta de origem.');
            return;
        }
        
        if (sourceAccount.currentBalance < amount) {
            alert('Saldo insuficiente na conta de origem.');
            return;
        }
        
        try {
            // Cria a transação de pagamento da fatura
            const paymentTransaction = {
                userId: currentUser.uid,
                type: 'despesa',
                description: `Pagamento Fatura ${card.name}`,
                amount: amount,
                date: firebase.firestore.Timestamp.now(),
                accountId: sourceAccountId,
                category: 'Pagamento de Fatura',
                paid: true
            };
            
            await db.collection('transactions').add(paymentTransaction);
            
            // Atualiza os dados e recarrega as páginas
            await fetchAllData();
            loadCardsData();
            loadAccountsData();
            loadDashboardData();
            
            closeModal(paymentModal);
            alert('Pagamento da fatura realizado com sucesso!');
            
        } catch (error) {
            console.error("Erro ao processar pagamento:", error);
            alert("Não foi possível processar o pagamento.");
        }
    });


    // --- LÓGICA DO DASHBOARD ---
    
    // Event listeners para fechar modais
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-container');
            if (modal) closeModal(modal);
        });
    });
    
    function loadDashboardData() {
        if (!currentUser) return;
        
        // Verificar se os elementos existem antes de tentar acessá-los
        if (!totalBalanceEl || !monthlyIncomeEl || !monthlyExpensesEl || !monthlySavingsEl || !recentTransactionsList) {
            console.warn('Elementos do dashboard não encontrados');
            return;
        }
        
        // Otimização: Calcular saldo total uma única vez
        const totalBalance = userAccounts
            .filter(acc => acc.type !== 'cartao_credito')
            .reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
        totalBalanceEl.textContent = formatCurrency(totalBalance);
        
        // Otimização: Calcular dados mensais uma única vez
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        let monthlyIncome = 0, monthlyExpenses = 0;
        
        // Processar transações do mês atual
        userTransactions.forEach(t => {
            const transactionDate = t.date.toDate();
            const transactionMonthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (transactionMonthKey === currentMonthKey) {
                if (t.type === 'receita') {
                    monthlyIncome += t.amount;
                } else if (t.type === 'despesa') {
                    monthlyExpenses += t.amount;
                }
            }
        });
        
        // Atualizar elementos do dashboard
        monthlyIncomeEl.textContent = formatCurrency(monthlyIncome);
        monthlyExpensesEl.textContent = formatCurrency(monthlyExpenses);
        monthlySavingsEl.textContent = formatCurrency(monthlyIncome - monthlyExpenses);
        
        // Otimização: Renderizar transações recentes
        recentTransactionsList.innerHTML = '';
        const sortedTransactions = [...userTransactions]
            .sort((a, b) => b.date.seconds - a.date.seconds)
            .slice(0, 5);
            
        sortedTransactions.forEach(t => {
            const li = document.createElement('li');
            const iconClass = t.type === 'receita' ? 'fa-arrow-up' : 'fa-arrow-down';
            const iconColor = t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)';
            
            li.innerHTML = `
                <span>
                    <i class="fas ${iconClass}" style="color: ${iconColor};"></i> 
                    ${t.description}
                </span>
                <strong>${formatCurrency(t.amount)}</strong>
            `;
            recentTransactionsList.appendChild(li);
        });

        // Renderizar componentes do dashboard
        renderBudgetsOverview();
        
        // CONTROLE DE RENDERIZAÇÃO SEGURO - Só renderizar se dashboard estiver ativo
        const dashboardPage = document.getElementById('dashboard-page');
        if (dashboardPage && !dashboardPage.classList.contains('hidden')) {
            // Calcular dados do gráfico para os últimos 6 meses
            const monthlyData = {};
            
            // Processar transações uma única vez
            userTransactions.forEach(t => {
                try {
                    const transactionDate = t.date.toDate();
                    const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { income: 0, expense: 0 };
                    }
                    
                    if (t.type === 'receita') {
                        monthlyData[monthKey].income += (t.amount || 0);
                    } else if (t.type === 'despesa') {
                        monthlyData[monthKey].expense += (t.amount || 0);
                    }
                } catch (error) {
                    console.warn('Erro ao processar transação:', error);
                }
            });
            
            // Construir dados do gráfico
            const labels = [];
            const incomeData = [];
            const expenseData = [];
            
            // Gerar dados para os últimos 6 meses
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
            
            // Renderizar gráfico com dados calculados
            renderMainChart(labels, incomeData, expenseData);
        }

        // --- ALERTA DE PRÓXIMOS VENCIMENTOS ---
        if (payablesAlertList) {
            payablesAlertList.innerHTML = '';
            // Filtrar transações pendentes
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            const pendentes = userTransactions.filter(t => t.isPaid === false);
            const vencidas = pendentes.filter(t => t.date.toDate() < startOfToday);
            const vencendoHoje = pendentes.filter(t => t.date.toDate() >= startOfToday && t.date.toDate() <= endOfToday);
            // Mostrar até 3 vencidas e 3 vencendo hoje
            const mostrar = [...vencidas.slice(0,3), ...vencendoHoje.slice(0,3)];
            if (mostrar.length === 0) {
                payablesAlertList.innerHTML = '<li class="empty-state-small">Nenhuma conta vencida ou vencendo hoje.</li>';
            } else {
                mostrar.forEach(t => {
                    const li = document.createElement('li');
                    const isVencida = t.date.toDate() < startOfToday;
                    const icon = '<i class="fas fa-exclamation-circle" style="color: var(--warning-color);"></i>';
                    li.innerHTML = `
                        <span>${icon} ${t.description} <small>(${t.date.toDate().toLocaleDateString('pt-BR')}${isVencida ? ' - Vencida' : ' - Hoje'})</small></span>
                        <strong style="color: ${t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)'};">${formatCurrency(t.amount)}</strong>
                    `;
                    payablesAlertList.appendChild(li);
                });
            }
        }
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
    
    // NOVA VERSÃO SEGURA DA FUNÇÃO DO GRÁFICO
    function renderMainChart(labels, incomeData, expenseData) {
        const chartContainer = document.getElementById('main-chart-container');
        if (!chartContainer) return; // Verificação de segurança

        // Destrói o gráfico antigo, se existir
        if (mainChart) {
            mainChart.destroy();
        }

        // Limpa o contêiner e recria o canvas do zero
        chartContainer.innerHTML = '';
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'main-chart';
        chartContainer.appendChild(newCanvas);

        // Cria a nova instância do gráfico no novo canvas
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
                animation: false, // Desativa animações para máxima performance
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
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
        
        // Validação de recorrência
        if (transactionRecurringCheckbox.checked) {
            const selectedType = document.querySelector('input[name="recurrence-type"]:checked').value;
            if (selectedType === 'monthly' && (!recurrenceMonths.value || recurrenceMonths.value < 2)) {
                alert('Por favor, informe durante quantos meses a transação deve se repetir (mínimo 2 meses).');
                return;
            }
            if (selectedType === 'installment' && (!recurrenceInstallments.value || recurrenceInstallments.value < 2)) {
                alert('Por favor, informe o número total de parcelas (mínimo 2 parcelas).');
                return;
            }
        }
        
        const submitButton = transactionForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        try {
            // Desabilitar botão e mostrar progresso se houver arquivo
            if (transactionAttachment.files.length > 0) {
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';
                uploadProgress.classList.add('show');
            }
            
            const transactionId = transactionForm['transaction-id'].value;
            let attachmentURL = null;
            
            // Upload do arquivo se selecionado
            if (transactionAttachment.files.length > 0) {
                attachmentURL = await uploadAttachment(transactionAttachment.files[0]);
            }
            
            const baseData = {
                userId: currentUser.uid,
                type: transactionForm['transaction-type'].value,
                description: transactionForm['transaction-description'].value,
                amount: parseFloat(transactionForm['transaction-amount'].value),
                date: firebase.firestore.Timestamp.fromDate(new Date(transactionForm['transaction-date'].value)),
                accountId: transactionForm['transaction-account'].value,
                category: transactionForm['transaction-category'].value,
                isPaid: transactionForm['transaction-paid'].checked
            };
            
            // Adicionar URL do anexo se existir
            if (attachmentURL) {
                baseData.attachmentURL = attachmentURL;
            }
            
            if (transactionId) {
                // Edição de transação existente (não suporta recorrência)
                await db.collection('transactions').doc(transactionId).update(baseData);
            } else {
                // Nova transação
                if (transactionRecurringCheckbox.checked) {
                    // Criar transações recorrentes
                    await createRecurringTransactions(baseData);
                } else {
                    // Transação única
                    await db.collection('transactions').add(baseData);
                }
            }
            
            await fetchAllData();
            closeModal(transactionModal);
            loadPageData(document.querySelector('.page.active').id.replace('-page', ''));
            
        } catch (error) {
            console.error("Erro ao salvar transação: ", error);
            alert("Não foi possível salvar a transação.");
        } finally {
            // Restaurar botão
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            uploadProgress.classList.remove('show');
        }
    });

    async function uploadAttachment(file) {
        try {
            // Criar nome único para o arquivo
            const timestamp = Date.now();
            const fileName = `${currentUser.uid}-${timestamp}-${file.name}`;
            const filePath = `comprovantes/${fileName}`;
            
            // Referência no Firebase Storage
            const storageRef = storage.ref().child(filePath);
            
            // Upload do arquivo
            const snapshot = await storageRef.put(file);
            
            // Obter URL de download
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            return downloadURL;
            
        } catch (error) {
            console.error("Erro no upload:", error);
            throw new Error("Falha no upload do arquivo");
        }
    }

    async function createRecurringTransactions(baseData) {
        const selectedType = document.querySelector('input[name="recurrence-type"]:checked').value;
        const recurrenceId = crypto.randomUUID();
        const baseDate = new Date(baseData.date.toDate());
        const baseDescription = baseData.description;
        const baseAmount = baseData.amount;
        
        let numberOfTransactions;
        let amountPerTransaction;
        
        if (selectedType === 'monthly') {
            numberOfTransactions = parseInt(recurrenceMonths.value);
            amountPerTransaction = baseAmount; // Mesmo valor para todas
        } else { // installment
            numberOfTransactions = parseInt(recurrenceInstallments.value);
            amountPerTransaction = baseAmount / numberOfTransactions; // Valor dividido
        }
        
        const transactions = [];
        
        for (let i = 0; i < numberOfTransactions; i++) {
            const transactionDate = new Date(baseDate);
            transactionDate.setMonth(transactionDate.getMonth() + i);
            
            let description = baseDescription;
            if (selectedType === 'installment') {
                description = `${baseDescription} (${i + 1}/${numberOfTransactions})`;
            }
            
            const transactionData = {
                ...baseData,
                description: description,
                amount: amountPerTransaction,
                date: firebase.firestore.Timestamp.fromDate(transactionDate),
                recurrenceId: recurrenceId,
                recurrenceType: selectedType,
                recurrenceIndex: i + 1,
                totalRecurrences: numberOfTransactions
            };
            
            transactions.push(transactionData);
        }
        
        // Criar todas as transações no Firestore
        const batch = db.batch();
        transactions.forEach(transaction => {
            const docRef = db.collection('transactions').doc();
            batch.set(docRef, transaction);
        });
        
        await batch.commit();
    }

    function loadTransactionsData() {
        if (!currentUser) return;
        
        // Otimização: Usar DocumentFragment para manipulação eficiente do DOM
        const fragment = document.createDocumentFragment();
        const sortedTransactions = [...userTransactions].sort((a, b) => b.date.seconds - a.date.seconds);
        
        sortedTransactions.forEach(t => {
            const accountName = userAccounts.find(acc => acc.id === t.accountId)?.name || 'N/A';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.date.toDate().toLocaleDateString('pt-BR')}</td> <td>${t.description}</td> <td>${t.category}</td>
                <td>${accountName}</td> <td style="color: ${t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)'};">${formatCurrency(t.amount)}</td>
                <td>${t.isPaid ? 'Pago' : 'Pendente'}</td> <td><!-- Ações --></td>
            `;
            fragment.appendChild(tr);
        });
        
        // Limpar e adicionar todos os elementos de uma vez
        transactionsTableBody.innerHTML = '';
        transactionsTableBody.appendChild(fragment);
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
        
        const currencyMap = {
            'BRL': { locale: 'pt-BR', currency: 'BRL' },
            'USD': { locale: 'en-US', currency: 'USD' },
            'EUR': { locale: 'de-DE', currency: 'EUR' }
        };
        
        const currencyConfig = currencyMap[userCurrency] || currencyMap['BRL'];
        
        return value.toLocaleString(currencyConfig.locale, { 
            style: 'currency', 
            currency: currencyConfig.currency 
        });
    }

    // --- TOUR GUIADO PARA NOVOS USUÁRIOS ---
    const tourSteps = [
        {
            element: '.sidebar',
            title: 'Navegação Principal',
            text: 'Aqui você encontra todas as seções do sistema. Vamos conhecer as principais?'
        },
        {
            element: 'a[data-page="accounts"]',
            title: 'Suas Contas',
            text: 'O primeiro passo é cadastrar suas contas (conta corrente, carteira, poupança). É aqui que seu dinheiro entra e sai.'
        },
        {
            element: 'a[data-page="transactions"]',
            title: 'Transações',
            text: 'Aqui você visualiza, adiciona e gerencia todas as suas receitas e despesas.'
        },
        {
            element: 'a[data-page="cards"]',
            title: 'Cartões de Crédito',
            text: 'Gerencie seus cartões, faturas e pagamentos de forma centralizada.'
        },
        {
            element: 'a[data-page="budgets"]',
            title: 'Orçamentos',
            text: 'Defina limites de gastos por categoria e acompanhe seu progresso mensal.'
        },
        {
            element: 'a[data-page="goals"]',
            title: 'Metas e Objetivos',
            text: 'Crie objetivos financeiros e acompanhe seu avanço até conquistá-los.'
        },
        {
            element: 'a[data-page="reports"]',
            title: 'Relatórios',
            text: 'Visualize gráficos e relatórios detalhados para entender melhor suas finanças.'
        },
        {
            element: '.dashboard-grid',
            title: 'Dashboard',
            text: 'Aqui está o resumo financeiro, gráficos e suas transações recentes.'
        }
    ];

    // Variáveis globais do tour
    let currentTourStep = 0;
    let tourActive = false;
    let resizeTimeout;
    const tourOverlay = document.getElementById('tour-overlay');
    const tourTooltip = document.getElementById('tour-tooltip');
    const restartTourBtn = document.getElementById('restart-tour-btn');

    function startTour() {
        tourActive = true;
        currentTourStep = 0;
        tourOverlay.classList.remove('hidden');
        tourTooltip.classList.remove('hidden');
        
        // Adicionar classe visible após um pequeno delay para ativar a animação
        setTimeout(() => {
            tourOverlay.classList.add('visible');
            tourTooltip.classList.add('visible');
        }, 50);

        // Criar indicadores de progresso
        createProgressDots();
        showTourStep(0);

        // Salvar progresso no localStorage
        localStorage.setItem('tourStarted', 'true');
    }

    function createProgressDots() {
        const progressContainer = document.querySelector('.tour-progress');
        progressContainer.innerHTML = '';
        
        tourSteps.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `tour-progress-dot ${index === currentTourStep ? 'active' : ''}`;
            progressContainer.appendChild(dot);
        });
    }

    function updateProgressDots() {
        const dots = document.querySelectorAll('.tour-progress-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentTourStep);
        });
    }

    function showTourStep(stepIndex) {
        // Remover destaque anterior
        document.querySelectorAll('.highlight-tour').forEach(el => el.classList.remove('highlight-tour'));
        currentTourStep = stepIndex;
        const step = tourSteps[stepIndex];
        const el = document.querySelector(step.element);
        
        if (!el) {
            // Elemento não encontrado - posicionar no centro da tela
            positionTooltipCenter();
        } else {
            // Destacar elemento
            el.classList.add('highlight-tour');
            
            // Calcular e aplicar posição do tooltip
            positionTooltip(el);

            // Garantir que o elemento está visível
            ensureElementVisibility(el);
        }
        
        // Atualizar conteúdo
        document.getElementById('tour-title').textContent = step.title;
        document.getElementById('tour-text').textContent = step.text;
        document.getElementById('tour-prev-btn').disabled = stepIndex === 0;
        document.getElementById('tour-next-btn').textContent = (stepIndex === tourSteps.length - 1) ? 'Finalizar' : 'Próximo';

        // Atualizar indicadores de progresso
        updateProgressDots();

        // Salvar progresso
        if (currentUser) {
            localStorage.setItem('tourStep', stepIndex.toString());
        }
    }

    function positionTooltipCenter() {
        const tooltip = document.getElementById('tour-tooltip');
        tooltip.style.position = 'fixed';
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
    }

    function positionTooltip(targetElement) {
        const tooltip = document.getElementById('tour-tooltip');
        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Resetar posicionamento anterior
        tooltip.style.position = 'fixed';
        tooltip.style.transform = 'none';
        
        // Calcular posições
        let top, left;
        
        // Posicionamento vertical
        if (rect.bottom + tooltipRect.height + 16 <= viewportHeight) {
            // Abaixo do elemento
            top = rect.bottom + 16;
        } else if (rect.top - tooltipRect.height - 16 >= 0) {
            // Acima do elemento
            top = rect.top - tooltipRect.height - 16;
        } else {
            // Centro vertical
            top = Math.max(16, Math.min(viewportHeight - tooltipRect.height - 16, 
                rect.top + rect.height/2 - tooltipRect.height/2));
        }
        
        // Posicionamento horizontal
        left = Math.max(16, Math.min(viewportWidth - tooltipRect.width - 16, 
            rect.left + rect.width/2 - tooltipRect.width/2));
        
        // Aplicar posições
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    function ensureElementVisibility(element) {
        // Verificar se o elemento está na viewport
        const rect = element.getBoundingClientRect();
        const isInViewport = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );

        if (!isInViewport) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    function endTour() {
        tourActive = false;
        
        // Adicionar animação de saída
        tourOverlay.classList.remove('visible');
        tourTooltip.classList.remove('visible');
        
        // Remover elementos após a animação
        setTimeout(() => {
            tourOverlay.classList.add('hidden');
            tourTooltip.classList.add('hidden');
            document.querySelectorAll('.highlight-tour').forEach(el => el.classList.remove('highlight-tour'));
        }, 300);

        // Atualizar no Firestore e localStorage
        if (currentUser) {
            db.collection('users').doc(currentUser.uid).update({ hasCompletedTour: true });
            localStorage.setItem('tourCompleted', 'true');
        }

        // Mostrar botão de reiniciar
        restartTourBtn.classList.remove('hidden');
    }

    // Eventos de navegação do tour
    document.getElementById('tour-prev-btn').onclick = () => {
        if (currentTourStep > 0) showTourStep(currentTourStep - 1);
    };

    document.getElementById('tour-next-btn').onclick = () => {
        if (currentTourStep < tourSteps.length - 1) {
            showTourStep(currentTourStep + 1);
        } else {
            endTour();
        }
    };

    document.getElementById('tour-close-btn').onclick = endTour;

    // Reiniciar tour
    restartTourBtn.onclick = () => {
        restartTourBtn.classList.add('hidden');
        startTour();
    };

    // Restaurar progresso do tour se necessário
    function restoreTourProgress() {
        const tourStarted = localStorage.getItem('tourStarted');
        const tourCompleted = localStorage.getItem('tourCompleted');
        const savedStep = localStorage.getItem('tourStep');

        if (tourStarted && !tourCompleted && savedStep) {
            startTour();
            showTourStep(parseInt(savedStep));
        } else if (tourCompleted) {
            restartTourBtn.classList.remove('hidden');
        }
    }

    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (tourActive) {
                showTourStep(currentTourStep);
            }
        }, 100);
    });

    // Iniciar o tour se necessário
    document.addEventListener('DOMContentLoaded', () => {
        restoreTourProgress();
    });

    // --- LÓGICA DAS ABAS DE CONTAS A PAGAR ---
    if (payablesTabs && payablesTabs.length) {
        payablesTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                payablesTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                Object.keys(payablesTabContents).forEach(key => {
                    payablesTabContents[key].classList.add('hidden');
                });
                const tabKey = tab.getAttribute('data-tab');
                payablesTabContents[tabKey].classList.remove('hidden');
            });
        });
    }

    // --- FUNÇÃO PARA CARREGAR CONTAS A PAGAR/RECEBER ---
    function loadPayablesData() {
        if (!currentUser) return;
        // Limpar listas
        Object.values(payablesLists).forEach(list => list.innerHTML = '');
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const next7 = new Date(now); next7.setDate(now.getDate() + 7);
        const next30 = new Date(now); next30.setDate(now.getDate() + 30);
        // Filtrar transações pendentes
        const pendentes = userTransactions.filter(t => t.isPaid === false);
        // Separar por período
        const vencidas = pendentes.filter(t => t.date.toDate() < startOfToday);
        const vencendoHoje = pendentes.filter(t => t.date.toDate() >= startOfToday && t.date.toDate() <= endOfToday);
        const proximos7 = pendentes.filter(t => t.date.toDate() > endOfToday && t.date.toDate() <= next7);
        const proximos30 = pendentes.filter(t => t.date.toDate() > next7 && t.date.toDate() <= next30);
        // Renderizar listas
        renderPayablesList(payablesLists.overdue, vencidas);
        renderPayablesList(payablesLists.today, vencendoHoje);
        renderPayablesList(payablesLists.next7, proximos7);
        renderPayablesList(payablesLists.next30, proximos30);
    }

    function renderPayablesList(listElement, items) {
        if (!items.length) {
            listElement.innerHTML = '<li class="empty-state-small">Nenhuma transação encontrada.</li>';
            return;
        }
        items.sort((a, b) => a.date.seconds - b.date.seconds);
        items.forEach(t => {
            const li = document.createElement('li');
            const icon = '<i class="fas fa-exclamation-circle" style="color: var(--warning-color);"></i>';
            li.innerHTML = `
                <span>${icon} ${t.description} <small>(${t.date.toDate().toLocaleDateString('pt-BR')})</small></span>
                <strong style="color: ${t.type === 'receita' ? 'var(--secondary-color)' : 'var(--danger-color)'};">${formatCurrency(t.amount)}</strong>
            `;
            listElement.appendChild(li);
        });
    }

    // Projeção de Fluxo de Caixa
    const cashflowProjectionPeriod = document.getElementById('cashflow-projection-period');
    const cashflowProjectionChartCanvas = document.getElementById('cashflow-projection-chart');
    let cashflowProjectionChart = null;

    if (cashflowProjectionPeriod) {
        cashflowProjectionPeriod.addEventListener('change', renderCashflowProjection);
    }
    // Renderizar ao carregar a página de relatórios
    function loadReportsData() {
        // ... existente ...
        renderCashflowProjection();
    }

    function renderCashflowProjection() {
        if (!cashflowProjectionChartCanvas) return;
        // 1. Saldo atual (todas as contas exceto cartões de crédito)
        const saldoAtual = (userAccounts || []).filter(acc => acc.type !== 'cartao_credito').reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
        // 2. Transações futuras pendentes
        const dias = parseInt(cashflowProjectionPeriod?.value || '30', 10);
        const hoje = new Date();
        hoje.setHours(0,0,0,0);
        // Array de datas
        const datas = [];
        for (let i = 0; i < dias; i++) {
            const d = new Date(hoje);
            d.setDate(hoje.getDate() + i);
            datas.push(new Date(d));
        }
        // Inicializa array de saldos
        const saldos = [saldoAtual];
        for (let i = 0; i < dias; i++) {
            // Transações do dia i
            const dataRef = datas[i];
            const receitas = (userTransactions || []).filter(t => t.isPaid === false && t.type === 'receita' && sameDay(t.date?.toDate?.() || t.date, dataRef)).reduce((sum, t) => sum + t.amount, 0);
            const despesas = (userTransactions || []).filter(t => t.isPaid === false && t.type === 'despesa' && sameDay(t.date?.toDate?.() || t.date, dataRef)).reduce((sum, t) => sum + t.amount, 0);
            const saldoAnterior = saldos[i];
            saldos.push(saldoAnterior + receitas - despesas);
        }
        // Monta labels
        const labels = datas.map(d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
        // Remove o saldo inicial extra
        saldos.shift();
        // Cores: vermelho se saldo < 0
        const corLinha = saldos.some(s => s < 0) ? getCashflowGradient(cashflowProjectionChartCanvas, saldos) : 'var(--primary-color)';
        // Destroi gráfico anterior
        if (cashflowProjectionChart) cashflowProjectionChart.destroy();
        cashflowProjectionChart = new Chart(cashflowProjectionChartCanvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Saldo Projetado',
                    data: saldos,
                    fill: false,
                    borderColor: corLinha,
                    backgroundColor: corLinha,
                    tension: 0.2,
                    pointRadius: 2,
                    pointBackgroundColor: saldos.map(s => s < 0 ? 'var(--danger-color)' : 'var(--primary-color)'),
                    pointBorderColor: saldos.map(s => s < 0 ? 'var(--danger-color)' : 'var(--primary-color)'),
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Saldo: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return formatCurrency(value); }
                        }
                    }
                }
            }
        });
    }

    function sameDay(a, b) {
        if (!a || !b) return false;
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function getCashflowGradient(canvas, saldos) {
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        // Se algum saldo < 0, faz um gradiente vermelho
        const n = saldos.length;
        let firstNegative = saldos.findIndex(s => s < 0);
        if (firstNegative === -1) firstNegative = n;
        const stop = firstNegative / n;
        gradient.addColorStop(0, 'var(--primary-color)');
        gradient.addColorStop(Math.max(stop - 0.01, 0), 'var(--primary-color)');
        gradient.addColorStop(stop, 'var(--danger-color)');
        gradient.addColorStop(1, 'var(--danger-color)');
        return gradient;
    }

    // Feedback
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackType = document.getElementById('feedback-type');
    const feedbackSubject = document.getElementById('feedback-subject');
    const feedbackDescription = document.getElementById('feedback-description');
    let feedbackMessage = document.getElementById('feedback-message');
    if (!feedbackMessage) {
        feedbackMessage = document.createElement('div');
        feedbackMessage.id = 'feedback-message';
        feedbackMessage.className = 'feedback-message hidden';
        feedbackForm?.appendChild(feedbackMessage);
    }

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            feedbackMessage.className = 'feedback-message hidden';
            feedbackMessage.textContent = '';
            const data = {
                type: feedbackType.value,
                subject: feedbackSubject.value.trim(),
                description: feedbackDescription.value.trim(),
                date: new Date(),
                userId: currentUser ? currentUser.uid : null
            };
            if (!data.subject || !data.description) {
                feedbackMessage.textContent = 'Preencha todos os campos.';
                feedbackMessage.className = 'feedback-message error';
                feedbackMessage.classList.remove('hidden');
                return;
            }
            try {
                await db.collection('feedback').add(data);
                feedbackForm.reset();
                feedbackMessage.textContent = 'Feedback enviado com sucesso! Obrigado por contribuir.';
                feedbackMessage.className = 'feedback-message success';
                feedbackMessage.classList.remove('hidden');
            } catch (err) {
                feedbackMessage.textContent = 'Erro ao enviar feedback. Tente novamente.';
                feedbackMessage.className = 'feedback-message error';
                feedbackMessage.classList.remove('hidden');
            }
        });
    }
});
