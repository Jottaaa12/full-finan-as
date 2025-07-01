// =============================================================================
// SCRIPT PRINCIPAL DA APLICAÇÃO - Full Finanças
// =============================================================================
// STATUS DO PROJETO: BETA 1
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
// ✔️ Pagamento de Fatura de Cartão
// ✔️ Transações Recorrentes e Parceladas
// ✔️ Anexo de Comprovantes
// ✔️ Relatórios Avançados
// ✔️ Exportação de Dados (Excel/PDF)
// ✔️ Calculadora de Juros Compostos
// ✔️ Perfil do Usuário (Fase 1: Informações Pessoais e Segurança)
// ✔️ Perfil do Usuário (Fase 2: Personalização - Foto e Moeda)
// ✔️ Perfil do Usuário (Fase 3: Gerenciamento de Dados e "Zona de Perigo")
// ✔️ Seção "Apoie o Projeto" com doação PIX
// ✔️ Rodapé BETA 1
//
// 🎉 SEÇÃO PERFIL DO USUÁRIO CONCLUÍDA!
// 🚀 PROJETO OFICIALIZADO COMO BETA 1!
//
// PRÓXIMAS FASES (Nova Ordem de Prioridade):
// 1. Controle de Contas a Pagar/Receber
// 2. Conciliação Bancária (Importação de Extrato CSV)
// 3. Alertas e Notificações
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
        if (userDoc.exists) {
            const userData = userDoc.data();
            userNameDisplay.textContent = userData.name || currentUser.email;
            
            // Carregar foto de perfil na barra lateral
            if (userData.profilePhotoURL) {
                sidebarUserPhoto.src = userData.profilePhotoURL;
            }
            
            // Carregar moeda padrão
            if (userData.currency) {
                userCurrency = userData.currency;
            }
        } else {
            userNameDisplay.textContent = currentUser.email;
        }
        
        await fetchAllData();
        setupMobileMenu(); // CORREÇÃO BUG
        navigateTo('dashboard');
        
        loader.classList.add('hidden');
        appContainer.classList.remove('hidden');
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
            case 'reports': loadReportsData(); break;
            case 'profile': loadProfileData(); break;
            case 'support': /* Página de suporte não precisa carregar dados */ break;
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
        
        // Carregar dados do usuário
        profileEmail.value = currentUser.email;
        
        // Buscar dados do usuário no Firestore
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
            return;
        }

        if (!file.type.startsWith('image/')) {
            showPersonalizationMessage('Por favor, selecione apenas arquivos de imagem.', 'error');
            return;
        }

        try {
            // Mostrar progresso
            photoUploadProgress.classList.remove('hidden');
            changePhotoBtn.disabled = true;

            // Upload da foto
            const photoURL = await uploadProfilePhoto(file);

            // Atualizar no Firestore
            await db.collection('users').doc(currentUser.uid).update({
                profilePhotoURL: photoURL
            });

            // Atualizar previews
            profilePhotoPreview.src = photoURL;
            sidebarUserPhoto.src = photoURL;
            removePhotoBtn.classList.remove('hidden');

            showPersonalizationMessage('Foto de perfil atualizada com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            showPersonalizationMessage('Erro ao fazer upload da foto. Tente novamente.', 'error');
        } finally {
            photoUploadProgress.classList.add('hidden');
            changePhotoBtn.disabled = false;
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
            // Renderizar gráfico apenas se a página estiver visível
            renderMainChart();
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
    
    function renderMainChart() {
        // VERIFICAÇÃO DE SEGURANÇA CRÍTICA
        if (!currentUser || !mainChartCanvas) {
            console.warn('renderMainChart: Elementos necessários não encontrados');
            return;
        }
        
        // PASSO 1: PREPARAÇÃO DOS DADOS (FORA DO GRÁFICO)
        const monthlyData = {};
        
        // Processar transações uma única vez - SEM BUSCAS NO BANCO
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
                // Continuar processando outras transações
            }
        });
        
        // PASSO 2: CONSTRUÇÃO SEGURA DOS DADOS DO GRÁFICO
        const labels = [];
        const incomeData = [];
        const expenseData = [];
        
        // Gerar dados para os últimos 6 meses de forma segura
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
        
        // DESTRUIR GRÁFICO ANTERIOR ANTES DE CRIAR NOVO
        if (mainChart) {
            try {
                mainChart.destroy();
                mainChart = null;
            } catch (error) {
                console.warn('Erro ao destruir gráfico anterior:', error);
            }
        }
        
        // PASSO 3: CRIAÇÃO SEGURA DO NOVO GRÁFICO
        try {
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
                    animation: {
                        duration: 300 // Animação mais rápida
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erro crítico ao criar gráfico:', error);
            // Em caso de erro, não quebrar a aplicação
        }
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
});
