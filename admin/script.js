import { db, auth } from '../firebase-config.js';
// =============================
//  ADMIN PANEL - FULL FINANÇAS
// =============================
// 
// CORREÇÕES IMPLEMENTADAS:
// ✅ Removida a constante ADMIN_UID para centralizar a verificação por e-mail.
// ✅ Lógica de autenticação simplificada para usar apenas a lista ADMIN_EMAILS.
// ✅ Corrigida a busca e exibição de transações de usuários, ordenando os dados no lado do cliente.
//
// ESTADO: Painel de admin funcional e consistente com as outras partes do sistema.
// =============================

// === VERIFICAÇÃO DE ADMIN ===
const ADMIN_EMAILS = ['joaopedro.torres@ymail.com']; // Lista de emails autorizados

// Aguarda o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    // Referências de elementos com verificação de null
    const loginSection = document.getElementById('login-section');
    const loginForm = document.getElementById('admin-login-form');
    const loginMsg = document.getElementById('admin-login-message');
    const adminPanel = document.getElementById('admin-panel');
    const feedbackTableBody = document.getElementById('feedback-table-body');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const accessDenied = document.getElementById('access-denied');

    // Estado
    let currentUser = null;

    // === SISTEMA DE ABAS ===
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    function switchTab(tabName) {
        // Remove active de todas as abas
        tabBtns.forEach(b => b.classList.remove('active'));
        // Esconde todos os conteúdos
        tabContents.forEach(tc => tc.classList.add('hidden'));
        
        // Ativa a aba clicada
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Mostra o conteúdo correspondente
        const activeContent = document.getElementById(`tab-${tabName}`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }
        
        // Carrega dados específicos da aba
        if (tabName === 'dashboard') {
            loadAdminDashboard();
        } else if (tabName === 'usuarios') {
            fetchUsers();
        } else if (tabName === 'feedbacks') {
            loadFeedbacks();
        }
    }

    // Adiciona event listeners para as abas
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // === GERENCIAMENTO DE USUÁRIOS ===
    const userCardsContainer = document.getElementById('user-cards-container');
    let usersList = [];
    let userToDelete = null;

    async function fetchUsers() {
        if (!userCardsContainer) return;
        userCardsContainer.innerHTML = '<div>Carregando usuários...</div>';
        try {
            const snap = await db.collection('users').orderBy('createdAt', 'desc').get();
            usersList = [];
            let html = '';
            snap.forEach(doc => {
                const user = doc.data();
                user.id = doc.id;
                usersList.push(user);
                html += renderUserCard(user);
            });
            userCardsContainer.innerHTML = html || '<div>Nenhum usuário encontrado.</div>';
            addUserCardListeners();
        } catch (err) {
            userCardsContainer.innerHTML = '<div>Erro ao carregar usuários.</div>';
        }
    }

    // === FILTRO DE BUSCA DE USUÁRIOS ===
    const userSearchInput = document.getElementById('user-search-input');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', function() {
            const search = userSearchInput.value.trim().toLowerCase();
            document.querySelectorAll('.user-card').forEach(card => {
                const name = (card.querySelector('.user-name')?.textContent || '').toLowerCase();
                const email = (card.querySelector('.user-email')?.textContent || '').toLowerCase();
                if (name.includes(search) || email.includes(search)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // === BOTÃO VER DETALHES NOS CARDS ===
    function renderUserCard(user) {
        return `<div class="user-card" data-userid="${user.id}" data-email="${user.email}">
            <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email) + '&background=7c3aed&color=fff'}" alt="Foto de perfil">
            <div class="user-name">${user.displayName || '-'}</div>
            <div class="user-email">${user.email || '-'}</div>
            <div class="user-created">Criado em: ${user.createdAt && user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString('pt-BR') : '-'}</div>
            <div class="user-actions">
                <button class="user-action-btn btn-ver-transacoes">Ver Transações</button>
                <button class="user-action-btn btn-reset-senha">Redefinir Senha</button>
                <button class="user-action-btn btn-deletar">Deletar Usuário</button>
                <button class="user-action-btn btn-secondary view-details-btn" data-userid="${user.id}" data-username="${user.displayName || user.email}">Ver Detalhes</button>
            </div>
        </div>`;
    }

    function addUserCardListeners() {
        document.querySelectorAll('.btn-ver-transacoes').forEach(btn => {
            btn.onclick = async function() {
                const card = btn.closest('.user-card');
                const userId = card.dataset.userid;
                await showUserTransactions(userId);
            };
        });
        document.querySelectorAll('.btn-reset-senha').forEach(btn => {
            btn.onclick = async function() {
                const card = btn.closest('.user-card');
                const email = card.dataset.email;
                try {
                    await auth.sendPasswordResetEmail(email);
                    alert('Email de redefinição de senha enviado para ' + email);
                } catch (err) {
                    alert('Erro ao enviar email: ' + err.message);
                }
            };
        });
        document.querySelectorAll('.btn-deletar').forEach(btn => {
            btn.onclick = function() {
                const card = btn.closest('.user-card');
                userToDelete = usersList.find(u => u.id === card.dataset.userid);
                openDeleteModal();
            };
        });
    }

    // === MODAL DE TRANSAÇÕES ===
    const modalTransacoes = document.getElementById('modal-transacoes');
    const modalTransacoesList = document.getElementById('modal-transacoes-list');
    const closeModalTransacoes = document.getElementById('close-modal-transacoes');
    
    if (closeModalTransacoes) {
        closeModalTransacoes.onclick = () => {
            if (modalTransacoes) modalTransacoes.classList.add('hidden');
        };
    }

    // === LÓGICA DE EDIÇÃO/EXCLUSÃO DE TRANSAÇÕES (ADMIN) ===
    let currentUserTransacoes = [];
    let currentUserIdTransacoes = null;

    async function showUserTransactions(userId) {
        if (!modalTransacoes || !modalTransacoesList) return;
        modalTransacoes.classList.remove('hidden');
        modalTransacoesList.innerHTML = 'Carregando...';
        currentUserIdTransacoes = userId;
        try {
            // ===== INÍCIO DA CORREÇÃO =====
            // 1. A consulta agora busca apenas as transações do usuário, sem ordenação.
            const snap = await db.collection('transactions')
                .where('userId', '==', userId)
                .get();

            if (snap.empty) {
                modalTransacoesList.innerHTML = '<div>Nenhuma transação encontrada.</div>';
                currentUserTransacoes = [];
                return;
            }

            // Mapeia os documentos para um array de transações
            currentUserTransacoes = snap.docs.map(doc => {
                const t = doc.data();
                t.id = doc.id;
                return t;
            });

            // 2. A ordenação é feita aqui, no JavaScript, antes de exibir.
            currentUserTransacoes.sort((a, b) => b.date.seconds - a.date.seconds);

            // Pega apenas as 10 transações mais recentes
            const recentTransactions = currentUserTransacoes.slice(0, 10);
            
            // ===== FIM DA CORREÇÃO =====

            let html = '<table class="transacoes-table-admin"><thead><tr><th>Tipo</th><th>Valor</th><th>Data</th><th>Descrição</th><th>Ações</th></tr></thead><tbody>';
            recentTransactions.forEach(t => { // Itera sobre a lista ordenada e limitada
                const tipo = t.type || '-';
                const valor = t.amount !== undefined ? t.amount : 0;
                const dataFormatada = t.date && t.date.toDate ? t.date.toDate().toLocaleDateString('pt-BR') : '-';
                const descricao = t.description || '';

                html += `<tr data-id="${t.id}">
                    <td>${tipo}</td>
                    <td>R$ ${valor.toFixed(2)}</td>
                    <td>${dataFormatada}</td>
                    <td>${descricao}</td>
                    <td class="transacoes-actions">
                        <button class="btn-edit-transacao edit-user-transaction-btn" data-id="${t.id}">Editar</button>
                        <button class="btn-delete-transacao delete-user-transaction-btn" data-id="${t.id}">Excluir</button>
                    </td>
                </tr>`;
            });
            html += '</tbody></table>';
            modalTransacoesList.innerHTML = html;
        } catch (err) {
            console.error("Erro ao buscar transações:", err);
            modalTransacoesList.innerHTML = '<div>Erro ao buscar transações. Verifique o console.</div>';
            currentUserTransacoes = [];
        }
    }

    // Delegação de eventos para editar/excluir transação
    if (modalTransacoesList) {
        modalTransacoesList.addEventListener('click', async function(e) {
            if (e.target.classList.contains('delete-user-transaction-btn')) {
                const id = e.target.getAttribute('data-id');
                if (confirm('Tem certeza que deseja excluir esta transação?')) {
                    try {
                        await db.collection('transactions').doc(id).delete();
                        showUserTransactions(currentUserIdTransacoes);
                    } catch (err) {
                        alert('Erro ao excluir transação: ' + err.message);
                    }
                }
            }
            if (e.target.classList.contains('edit-user-transaction-btn')) {
                const id = e.target.getAttribute('data-id');
                try {
                    const doc = await db.collection('transactions').doc(id).get();
                    if (!doc.exists) return alert('Transação não encontrada.');
                    const t = doc.data();
                    
                    const editModal = document.getElementById('edit-transaction-modal-admin');
                    if (!editModal) {
                        alert('Modal de edição não encontrado');
                        return;
                    }
                    
                    const elements = {
                        'edit-transaction-id-admin': id,
                        'edit-transaction-desc-admin': t.description || '',
                        'edit-transaction-value-admin': t.amount || '',
                        'edit-transaction-date-admin': t.date && t.date.toDate ? t.date.toDate().toISOString().split('T')[0] : '',
                        'edit-transaction-category-admin': t.category || '',
                        'edit-transaction-type-admin': t.type || 'despesa',
                        'edit-transaction-account-admin': t.accountId || '',
                        'edit-transaction-status-admin': t.isPaid ? 'true' : 'false'
                    };
                    
                    Object.entries(elements).forEach(([elementId, value]) => {
                        const element = document.getElementById(elementId);
                        if (element) {
                            element.value = value;
                        }
                    });
                    
                    editModal.classList.remove('hidden');
                } catch (err) {
                    alert('Erro ao buscar transação: ' + err.message);
                }
            }
        });
    }

    // Event listeners para modal de edição
    const closeEditModal = document.getElementById('close-edit-transaction-modal-admin');
    const editModal = document.getElementById('edit-transaction-modal-admin');
    const editForm = document.getElementById('edit-transaction-form-admin');
    
    if (closeEditModal && editModal) {
        closeEditModal.onclick = function() {
            editModal.classList.add('hidden');
        };
    }
    
    if (editForm) {
        editForm.onsubmit = async function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-transaction-id-admin')?.value;
            if (!id) return;
            
            const data = {
                description: document.getElementById('edit-transaction-desc-admin')?.value || '',
                amount: parseFloat(document.getElementById('edit-transaction-value-admin')?.value) || 0,
                date: firebase.firestore.Timestamp.fromDate(new Date(document.getElementById('edit-transaction-date-admin')?.value)),
                category: document.getElementById('edit-transaction-category-admin')?.value || '',
                type: document.getElementById('edit-transaction-type-admin')?.value || 'despesa',
                accountId: document.getElementById('edit-transaction-account-admin')?.value || '',
                isPaid: document.getElementById('edit-transaction-status-admin')?.value === 'true',
            };
            try {
                await db.collection('transactions').doc(id).update(data);
                if (editModal) editModal.classList.add('hidden');
                showUserTransactions(currentUserIdTransacoes);
            } catch (err) {
                alert('Erro ao atualizar transação: ' + err.message);
            }
        };
    }

    // === MODAL DE DELEÇÃO ===
    const modalDelete = document.getElementById('modal-confirm-delete');
    const closeModalDelete = document.getElementById('close-modal-delete');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    
    if (closeModalDelete) {
        closeModalDelete.onclick = closeDeleteModal;
    }
    if (btnCancelDelete) {
        btnCancelDelete.onclick = closeDeleteModal;
    }
    if (btnConfirmDelete) {
        btnConfirmDelete.onclick = async function() {
            if (!userToDelete) return;
            try {
                await deleteUserData(userToDelete.id);
                await db.collection('users').doc(userToDelete.id).delete();
                alert('Usuário e dados deletados com sucesso!');
                closeDeleteModal();
                fetchUsers();
            } catch (err) {
                alert('Erro ao deletar usuário: ' + err.message);
            }
        };
    }
    
    function openDeleteModal() {
        if (modalDelete) modalDelete.classList.remove('hidden');
    }
    
    function closeDeleteModal() {
        if (modalDelete) modalDelete.classList.add('hidden');
        userToDelete = null;
    }

    // Deleta todas as coleções relacionadas ao usuário
    async function deleteUserData(userId) {
        const collections = ['transactions', 'accounts', 'budgets', 'goals', 'feedback'];
        const batch = db.batch();
        for (const collectionName of collections) {
            const snap = await db.collection(collectionName).where('userId', '==', userId).get();
            snap.forEach(doc => batch.delete(doc.ref));
        }
        await batch.commit();
    }

    // === EVENT LISTENER PARA BOTÃO VER DETALHES ===
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-details-btn')) {
            const userId = e.target.getAttribute('data-userid');
            const userName = e.target.getAttribute('data-username');
            showUserDetails(userId, userName);
        }
    });

    // === MODAL DE DETALHES ===
    const userDetailsModal = document.getElementById('user-details-modal');
    const userDetailsTitle = document.getElementById('user-details-title');
    const detailsAccountsSection = document.getElementById('details-accounts-section')?.querySelector('.details-list');
    const detailsBudgetsSection = document.getElementById('details-budgets-section')?.querySelector('.details-list');
    const detailsGoalsSection = document.getElementById('details-goals-section')?.querySelector('.details-list');
    
    if (userDetailsModal) {
        const closeBtn = userDetailsModal.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => userDetailsModal.classList.add('hidden');
        }
    }

    async function showUserDetails(userId, userName) {
        if (!userDetailsModal || !userDetailsTitle) return;
        
        userDetailsModal.classList.remove('hidden');
        userDetailsTitle.textContent = `Detalhes de ${userName}`;
        
        if (detailsAccountsSection) detailsAccountsSection.innerHTML = '<li>Carregando...</li>';
        if (detailsBudgetsSection) detailsBudgetsSection.innerHTML = '<li>Carregando...</li>';
        if (detailsGoalsSection) detailsGoalsSection.innerHTML = '<li>Carregando...</li>';
        
        try {
            const [accSnap, budSnap, goalSnap] = await Promise.all([
                db.collection('accounts').where('userId', '==', userId).get(),
                db.collection('budgets').where('userId', '==', userId).get(),
                db.collection('goals').where('userId', '==', userId).get()
            ]);
            
            // Contas
            if (detailsAccountsSection) {
                if (accSnap.empty) {
                    detailsAccountsSection.innerHTML = '<li>Nenhuma conta encontrada.</li>';
                } else {
                    detailsAccountsSection.innerHTML = '';
                    accSnap.forEach(doc => {
                        const a = doc.data();
                        detailsAccountsSection.innerHTML += `<li><span><b>${a.name || '-'}:</b> R$ ${a.currentBalance?.toFixed(2) || '0.00'} (${a.type || '-'})</span> <button class="btn-adjust-balance" data-accountid="${doc.id}" data-userid="${userId}">Ajustar</button></li>`;
                    });
                }
            }
            
            // Orçamentos
            if (detailsBudgetsSection) {
                if (budSnap.empty) {
                    detailsBudgetsSection.innerHTML = '<li>Nenhum orçamento encontrado.</li>';
                } else {
                    detailsBudgetsSection.innerHTML = '';
                    budSnap.forEach(doc => {
                        const b = doc.data();
                        detailsBudgetsSection.innerHTML += `<li><b>${b.category || '-'}:</b> R$ ${b.amount?.toFixed(2) || '-'} (${b.month || '-'})</li>`;
                    });
                }
            }
            
            // Objetivos
            if (detailsGoalsSection) {
                if (goalSnap.empty) {
                    detailsGoalsSection.innerHTML = '<li>Nenhum objetivo encontrado.</li>';
                } else {
                    detailsGoalsSection.innerHTML = '';
                    goalSnap.forEach(doc => {
                        const g = doc.data();
                        detailsGoalsSection.innerHTML += `<li><b>${g.name || '-'}:</b> R$ ${g.currentAmount?.toFixed(2) || '0.00'} de ${g.targetAmount?.toFixed(2) || '0.00'}</li>`;
                    });
                }
            }
        } catch (err) {
            if (detailsAccountsSection) detailsAccountsSection.innerHTML = '<li>Erro ao carregar dados.</li>';
            if (detailsBudgetsSection) detailsBudgetsSection.innerHTML = '<li>Erro ao carregar dados.</li>';
            if (detailsGoalsSection) detailsGoalsSection.innerHTML = '<li>Erro ao carregar dados.</li>';
        }
    }

    // === AJUSTE MANUAL DE SALDO (ADMIN) ===
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-adjust-balance')) {
            const accountId = e.target.getAttribute('data-accountid');
            const userId = e.target.getAttribute('data-userid');
            
            const adjustAccountId = document.getElementById('adjust-account-id');
            const adjustUserId = document.getElementById('adjust-user-id');
            const adjustType = document.getElementById('adjust-type');
            const adjustAmount = document.getElementById('adjust-amount');
            const adjustReason = document.getElementById('adjust-reason');
            const adjustModal = document.getElementById('adjust-balance-modal');
            
            if (adjustAccountId) adjustAccountId.value = accountId;
            if (adjustUserId) adjustUserId.value = userId;
            if (adjustType) adjustType.value = 'receita';
            if (adjustAmount) adjustAmount.value = '';
            if (adjustReason) adjustReason.value = '';
            if (adjustModal) adjustModal.classList.remove('hidden');
        }
    });
    
    const closeAdjustModal = document.getElementById('close-adjust-balance-modal');
    const adjustForm = document.getElementById('adjust-balance-form');
    
    if (closeAdjustModal) {
        closeAdjustModal.onclick = function() {
            const adjustModal = document.getElementById('adjust-balance-modal');
            if (adjustModal) adjustModal.classList.add('hidden');
        };
    }
    
    if (adjustForm) {
        adjustForm.onsubmit = async function(e) {
            e.preventDefault();
            const accountId = document.getElementById('adjust-account-id')?.value;
            const userId = document.getElementById('adjust-user-id')?.value;
            const type = document.getElementById('adjust-type')?.value;
            const amount = parseFloat(document.getElementById('adjust-amount')?.value);
            const description = document.getElementById('adjust-reason')?.value;
            
            if (!amount || amount <= 0) {
                alert('Informe um valor válido para o ajuste.');
                return;
            }
            
            try {
                await db.collection('transactions').add({
                    userId: userId,
                    accountId: accountId,
                    type: type,
                    amount: amount,
                    description: description,
                    category: 'Ajuste de Saldo (Admin)',
                    date: firebase.firestore.Timestamp.now(),
                    isPaid: true,
                });
                
                const adjustModal = document.getElementById('adjust-balance-modal');
                if (adjustModal) adjustModal.classList.add('hidden');
                
                alert('Ajuste realizado com sucesso!');
                
                const titleElement = document.getElementById('user-details-title');
                if (titleElement) {
                    showUserDetails(userId, titleElement.textContent.replace('Detalhes de ', ''));
                }
            } catch (err) {
                alert('Erro ao registrar ajuste: ' + err.message);
            }
        };
    }

    // --- Login ---
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email')?.value;
            const password = document.getElementById('admin-password')?.value;
            
            if (!email || !password) {
                if (loginMsg) loginMsg.textContent = 'Por favor, preencha todos os campos.';
                return;
            }

            try {
                await auth.signInWithEmailAndPassword(email, password);
            } catch (err) {
                if (loginMsg) loginMsg.textContent = getAuthErrorMessage(err.code);
            }
        };
    }

    // --- Logout ---
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            try {
                await auth.signOut();
                showLogin();
            } catch (err) {
                alert('Erro ao fazer logout: ' + err.message);
            }
        };
    }

    // --- Controle de telas ---
    function showLogin() {
        if (loginSection) loginSection.classList.remove('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');
        if (accessDenied) accessDenied.classList.add('hidden');
        if (loginForm) {
            loginForm.reset();
            if (loginMsg) loginMsg.textContent = '';
        }
    }

    function showAccessDenied() {
        if (loginSection) loginSection.classList.add('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');
        if (accessDenied) accessDenied.classList.remove('hidden');
    }

    // Verifica se o usuário está logado
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            if (ADMIN_EMAILS.includes(user.email)) {
                if (loginSection) loginSection.classList.add('hidden');
                if (accessDenied) accessDenied.classList.add('hidden');
                if (adminPanel) {
                    adminPanel.classList.remove('hidden');
                    switchTab('dashboard');
                }
            } else {
                showAccessDenied();
            }
        } else {
            showLogin();
        }
    });

    // --- Carregar feedbacks ---
    async function loadFeedbacks() {
        if (!feedbackTableBody) return;
        
        feedbackTableBody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
        try {
            const snap = await db.collection('feedback').orderBy('date', 'desc').get();
            if (snap.empty) {
                feedbackTableBody.innerHTML = '<tr><td colspan="5">Nenhum feedback enviado ainda.</td></tr>';
                return;
            }
            let html = '';
            snap.forEach(doc => {
                const fb = doc.data();
                const data = fb.date && fb.date.toDate ? fb.date.toDate() : null;
                html += `<tr>
                    <td>${data ? data.toLocaleString('pt-BR') : '-'}</td>
                    <td>${fb.type || '-'}</td>
                    <td>${fb.subject || '-'}</td>
                    <td>${fb.description || '-'}</td>
                    <td>${fb.userId || '-'}</td>
                </tr>`;
            });
            feedbackTableBody.innerHTML = html;
        } catch (err) {
            console.error("Erro ao carregar feedbacks:", err);
            feedbackTableBody.innerHTML = '<tr><td colspan="5">Erro ao carregar feedbacks. Verifique o console.</td></tr>';
        }
    }

    // === DASHBOARD DO ADMIN ===
    async function loadAdminDashboard() {
        try {
            console.log('Carregando dashboard do admin...');
            
            const usersSnap = await db.collection('users').get();
            const totalUsers = usersSnap.size;
            const totalUsersElement = document.querySelector('#stat-total-users .stat-value');
            if (totalUsersElement) {
                totalUsersElement.textContent = totalUsers;
            }
            
            const last7 = new Date();
            last7.setDate(last7.getDate() - 7);
            let newUsers = 0;
            usersSnap.forEach(doc => {
                const u = doc.data();
                if (u.createdAt && u.createdAt.toDate && u.createdAt.toDate() >= last7) newUsers++;
                else if (u.createdAt && typeof u.createdAt === 'string' && new Date(u.createdAt) >= last7) newUsers++;
            });
            const newUsersElement = document.querySelector('#stat-new-users .stat-value');
            if (newUsersElement) {
                newUsersElement.textContent = newUsers;
            }
            
            const transSnap = await db.collection('transactions').get();
            const totalTransactions = transSnap.size;
            const totalTransactionsElement = document.querySelector('#stat-total-transactions .stat-value');
            if (totalTransactionsElement) {
                totalTransactionsElement.textContent = totalTransactions;
            }
            
            const fbSnap = await db.collection('feedback').get();
            const totalFeedbacks = fbSnap.size;
            const totalFeedbacksElement = document.querySelector('#stat-feedbacks-pending .stat-value');
            if (totalFeedbacksElement) {
                totalFeedbacksElement.textContent = totalFeedbacks;
            }
            
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            const statElements = document.querySelectorAll('.stat-value');
            statElements.forEach(el => {
                if (el.textContent === '-' || el.textContent === '') {
                    el.textContent = '0';
                }
            });
        }
    }

    function getAuthErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Email inválido.';
            case 'auth/user-disabled':
                return 'Esta conta foi desativada.';
            case 'auth/user-not-found':
                return 'Usuário não encontrado.';
            case 'auth/wrong-password':
                return 'Senha incorreta.';
            case 'auth/too-many-requests':
                return 'Muitas tentativas. Tente novamente mais tarde.';
            default:
                return 'Erro ao fazer login. Tente novamente.';
        }
    }
});