// =============================
//  ADMIN PANEL - FULL FINANÇAS
// =============================

// === CONFIGURE O UID DO ADMIN AQUI ===
const ADMIN_UID = 'd1J7P7mkgxgHz3kDQtGiDbgmi1M2'; // <-- Substitua pelo UID do admin

// Referências de elementos
const loginSection = document.getElementById('login-section');
const loginForm = document.getElementById('admin-login-form');
const loginMsg = document.getElementById('admin-login-message');
const adminPanel = document.getElementById('admin-panel');
const feedbackTableBody = document.getElementById('feedback-table-body');
const logoutBtn = document.getElementById('admin-logout-btn');
const accessDenied = document.getElementById('access-denied');

// Inicializa Firebase (caso não esteja)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Estado
let currentUser = null;

// === SISTEMA DE ABAS ===
const tabBtns = document.querySelectorAll('.admin-tab-btn');
const tabContents = document.querySelectorAll('.admin-tab-content');
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabContents.forEach(tc => tc.classList.add('hidden'));
        document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
    });
});

// === GERENCIAMENTO DE USUÁRIOS ===
const userCardsContainer = document.getElementById('user-cards-container');
let usersList = [];
let userToDelete = null;

async function fetchUsers() {
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
document.getElementById('close-modal-transacoes').onclick = () => modalTransacoes.classList.add('hidden');

// === LÓGICA DE EDIÇÃO/EXCLUSÃO DE TRANSAÇÕES (ADMIN) ===
let currentUserTransacoes = [];
let currentUserIdTransacoes = null;

async function showUserTransactions(userId) {
    modalTransacoes.classList.remove('hidden');
    modalTransacoesList.innerHTML = 'Carregando...';
    currentUserIdTransacoes = userId;
    try {
        const snap = await db.collection('transactions')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        if (snap.empty) {
            modalTransacoesList.innerHTML = '<div>Nenhuma transação encontrada.</div>';
            currentUserTransacoes = [];
            return;
        }
        currentUserTransacoes = [];
        let html = '<table class="transacoes-table-admin"><thead><tr><th>Tipo</th><th>Valor</th><th>Data</th><th>Descrição</th><th>Ações</th></tr></thead><tbody>';
        snap.forEach(doc => {
            const t = doc.data();
            t.id = doc.id;
            currentUserTransacoes.push(t);
            html += `<tr data-id="${t.id}">
                <td>${t.tipo || '-'}</td>
                <td>R$ ${t.valor?.toFixed(2) || '-'}</td>
                <td>${t.data || '-'}</td>
                <td>${t.descricao || ''}</td>
                <td class="transacoes-actions">
                    <button class="btn-edit-transacao edit-user-transaction-btn" data-id="${t.id}">Editar</button>
                    <button class="btn-delete-transacao delete-user-transaction-btn" data-id="${t.id}">Excluir</button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        modalTransacoesList.innerHTML = html;
    } catch (err) {
        modalTransacoesList.innerHTML = '<div>Erro ao buscar transações.</div>';
        currentUserTransacoes = [];
    }
}

// Delegação de eventos para editar/excluir transação
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
            document.getElementById('edit-transaction-id-admin').value = id;
            document.getElementById('edit-transaction-desc-admin').value = t.descricao || '';
            document.getElementById('edit-transaction-value-admin').value = t.valor || '';
            document.getElementById('edit-transaction-date-admin').value = t.data || '';
            document.getElementById('edit-transaction-category-admin').value = t.categoria || '';
            document.getElementById('edit-transaction-type-admin').value = t.tipo || 'despesa';
            document.getElementById('edit-transaction-account-admin').value = t.conta || '';
            document.getElementById('edit-transaction-status-admin').value = t.isPaid ? 'true' : 'false';
            document.getElementById('edit-transaction-modal-admin').classList.remove('hidden');
        } catch (err) {
            alert('Erro ao buscar transação: ' + err.message);
        }
    }
});

document.getElementById('close-edit-transaction-modal-admin').onclick = function() {
    document.getElementById('edit-transaction-modal-admin').classList.add('hidden');
};

document.getElementById('edit-transaction-form-admin').onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('edit-transaction-id-admin').value;
    const data = {
        descricao: document.getElementById('edit-transaction-desc-admin').value,
        valor: parseFloat(document.getElementById('edit-transaction-value-admin').value),
        data: document.getElementById('edit-transaction-date-admin').value,
        categoria: document.getElementById('edit-transaction-category-admin').value,
        tipo: document.getElementById('edit-transaction-type-admin').value,
        conta: document.getElementById('edit-transaction-account-admin').value,
        isPaid: document.getElementById('edit-transaction-status-admin').value === 'true',
    };
    try {
        await db.collection('transactions').doc(id).update(data);
        document.getElementById('edit-transaction-modal-admin').classList.add('hidden');
        showUserTransactions(currentUserIdTransacoes);
    } catch (err) {
        alert('Erro ao atualizar transação: ' + err.message);
    }
};

// === MODAL DE DELEÇÃO ===
const modalDelete = document.getElementById('modal-confirm-delete');
document.getElementById('close-modal-delete').onclick = closeDeleteModal;
document.getElementById('btn-cancel-delete').onclick = closeDeleteModal;
document.getElementById('btn-confirm-delete').onclick = async function() {
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
function openDeleteModal() {
    modalDelete.classList.remove('hidden');
}
function closeDeleteModal() {
    modalDelete.classList.add('hidden');
    userToDelete = null;
}

// Deleta todas as coleções relacionadas ao usuário
async function deleteUserData(userId) {
    // Deleta transações
    const transSnap = await db.collection('transactions').where('userId', '==', userId).get();
    const batch = db.batch();
    transSnap.forEach(doc => batch.delete(doc.ref));
    // Deleta contas
    const accSnap = await db.collection('accounts').where('userId', '==', userId).get();
    accSnap.forEach(doc => batch.delete(doc.ref));
    // Deleta orçamentos
    const budSnap = await db.collection('budgets').where('userId', '==', userId).get();
    budSnap.forEach(doc => batch.delete(doc.ref));
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
const detailsAccountsSection = document.getElementById('details-accounts-section').querySelector('.details-list');
const detailsBudgetsSection = document.getElementById('details-budgets-section').querySelector('.details-list');
const detailsGoalsSection = document.getElementById('details-goals-section').querySelector('.details-list');
userDetailsModal.querySelector('.modal-close-btn').onclick = () => userDetailsModal.classList.add('hidden');

async function showUserDetails(userId, userName) {
    userDetailsModal.classList.remove('hidden');
    userDetailsTitle.textContent = `Detalhes de ${userName}`;
    detailsAccountsSection.innerHTML = detailsBudgetsSection.innerHTML = detailsGoalsSection.innerHTML = '<li>Carregando...</li>';
    try {
        const [accSnap, budSnap, goalSnap] = await Promise.all([
            db.collection('accounts').where('userId', '==', userId).get(),
            db.collection('budgets').where('userId', '==', userId).get(),
            db.collection('goals').where('userId', '==', userId).get()
        ]);
        // Contas
        if (accSnap.empty) {
            detailsAccountsSection.innerHTML = '<li>Nenhuma conta encontrada.</li>';
        } else {
            detailsAccountsSection.innerHTML = '';
            accSnap.forEach(doc => {
                const a = doc.data();
                detailsAccountsSection.innerHTML += `<li><span><b>${a.nome || '-'}:</b> R$ ${a.saldo?.toFixed(2) || '-'} (${a.tipo || '-'})</span> <button class="btn-adjust-balance" data-accountid="${doc.id}" data-userid="${userId}">Ajustar</button></li>`;
            });
        }
        // Orçamentos
        if (budSnap.empty) {
            detailsBudgetsSection.innerHTML = '<li>Nenhum orçamento encontrado.</li>';
        } else {
            detailsBudgetsSection.innerHTML = '';
            budSnap.forEach(doc => {
                const b = doc.data();
                detailsBudgetsSection.innerHTML += `<li><b>${b.categoria || '-'}:</b> R$ ${b.valor?.toFixed(2) || '-'} (${b.mes || '-'})</li>`;
            });
        }
        // Objetivos
        if (goalSnap.empty) {
            detailsGoalsSection.innerHTML = '<li>Nenhum objetivo encontrado.</li>';
        } else {
            detailsGoalsSection.innerHTML = '';
            goalSnap.forEach(doc => {
                const g = doc.data();
                detailsGoalsSection.innerHTML += `<li><b>${g.nome || '-'}:</b> R$ ${g.valor?.toFixed(2) || '-'} (${g.status || '-'})</li>`;
            });
        }
    } catch (err) {
        detailsAccountsSection.innerHTML = detailsBudgetsSection.innerHTML = detailsGoalsSection.innerHTML = '<li>Erro ao carregar dados.</li>';
    }
}

// === AJUSTE MANUAL DE SALDO (ADMIN) ===
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-adjust-balance')) {
        const accountId = e.target.getAttribute('data-accountid');
        const userId = e.target.getAttribute('data-userid');
        document.getElementById('adjust-account-id').value = accountId;
        document.getElementById('adjust-user-id').value = userId;
        document.getElementById('adjust-type').value = 'receita';
        document.getElementById('adjust-amount').value = '';
        document.getElementById('adjust-reason').value = '';
        document.getElementById('adjust-balance-modal').classList.remove('hidden');
    }
});
document.getElementById('close-adjust-balance-modal').onclick = function() {
    document.getElementById('adjust-balance-modal').classList.add('hidden');
};
document.getElementById('adjust-balance-form').onsubmit = async function(e) {
    e.preventDefault();
    const accountId = document.getElementById('adjust-account-id').value;
    const userId = document.getElementById('adjust-user-id').value;
    const type = document.getElementById('adjust-type').value;
    const valor = parseFloat(document.getElementById('adjust-amount').value);
    const descricao = document.getElementById('adjust-reason').value;
    if (!valor || valor <= 0) {
        alert('Informe um valor válido para o ajuste.');
        return;
    }
    try {
        await db.collection('transactions').add({
            userId: userId,
            accountId: accountId,
            tipo: type,
            valor: valor,
            descricao: descricao,
            categoria: 'Ajuste de Saldo (Admin)',
            data: new Date().toISOString().slice(0,10),
            isPaid: true,
            createdAt: new Date()
        });
        document.getElementById('adjust-balance-modal').classList.add('hidden');
        alert('Ajuste realizado com sucesso!');
        // Atualiza detalhes do usuário
        showUserDetails(userId, document.getElementById('user-details-title').textContent.replace('Detalhes de ', ''));
    } catch (err) {
        alert('Erro ao registrar ajuste: ' + err.message);
    }
};

// --- Login ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginMsg.textContent = '';
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    try {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        // Verificação de UID
        if (cred.user && cred.user.uid === ADMIN_UID) {
            showAdminPanel();
        } else {
            auth.signOut();
            showAccessDenied();
        }
    } catch (err) {
        loginMsg.textContent = 'Email ou senha inválidos.';
    }
});

// --- Logout ---
logoutBtn.addEventListener('click', () => {
    auth.signOut();
    showLogin();
});

// --- Controle de telas ---
function showLogin() {
    loginSection.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    accessDenied.classList.add('hidden');
    loginForm.reset();
    loginMsg.textContent = '';
}
function showAdminPanel() {
    loginSection.classList.add('hidden');
    document.getElementById('tab-dashboard').classList.remove('hidden');
    document.getElementById('tab-usuarios').classList.add('hidden');
    document.getElementById('tab-feedbacks').classList.add('hidden');
    tabBtns[0].classList.add('active');
    tabBtns[1].classList.remove('active');
    tabBtns[2].classList.remove('active');
    adminPanel.classList.remove('hidden');
    accessDenied.classList.add('hidden');
    loadAdminDashboard();
    fetchUsers();
}
function showAccessDenied() {
    loginSection.classList.add('hidden');
    adminPanel.classList.add('hidden');
    accessDenied.classList.remove('hidden');
}

// --- Autenticação persistente ---
auth.onAuthStateChanged((user) => {
    if (user && user.uid === ADMIN_UID) {
        showAdminPanel();
    } else if (user) {
        auth.signOut();
        showAccessDenied();
    } else {
        showLogin();
    }
});

// --- Carregar feedbacks ---
async function loadFeedbacks() {
    feedbackTableBody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
    try {
        const snap = await db.collection('feedback').orderBy('createdAt', 'desc').get();
        if (snap.empty) {
            feedbackTableBody.innerHTML = '<tr><td colspan="5">Nenhum feedback enviado ainda.</td></tr>';
            return;
        }
        let html = '';
        snap.forEach(doc => {
            const fb = doc.data();
            const data = fb.createdAt && fb.createdAt.toDate ? fb.createdAt.toDate() : (fb.createdAt ? new Date(fb.createdAt) : null);
            html += `<tr>
                <td>${data ? data.toLocaleString('pt-BR') : '-'}</td>
                <td>${fb.tipo || '-'}</td>
                <td>${fb.assunto || '-'}</td>
                <td>${fb.descricao || '-'}</td>
                <td>${fb.userId || '-'}</td>
            </tr>`;
        });
        feedbackTableBody.innerHTML = html;
    } catch (err) {
        feedbackTableBody.innerHTML = '<tr><td colspan="5">Erro ao carregar feedbacks.</td></tr>';
    }
}

// === DASHBOARD DO ADMIN ===
async function loadAdminDashboard() {
    // Total de usuários
    const usersSnap = await db.collection('users').get();
    document.querySelector('#stat-total-users .stat-value').textContent = usersSnap.size;
    // Novos usuários (7 dias)
    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);
    let newUsers = 0;
    usersSnap.forEach(doc => {
        const u = doc.data();
        if (u.createdAt && u.createdAt.toDate && u.createdAt.toDate() >= last7) newUsers++;
        else if (u.createdAt && typeof u.createdAt === 'string' && new Date(u.createdAt) >= last7) newUsers++;
    });
    document.querySelector('#stat-new-users .stat-value').textContent = newUsers;
    // Total de transações
    const transSnap = await db.collection('transactions').get();
    document.querySelector('#stat-total-transactions .stat-value').textContent = transSnap.size;
    // Feedbacks pendentes (por enquanto, todos)
    const fbSnap = await db.collection('feedback').get();
    document.querySelector('#stat-feedbacks-pending .stat-value').textContent = fbSnap.size;
}
// Chamar ao ativar aba dashboard
const dashboardTabBtn = document.querySelector('.admin-tab-btn[data-tab="dashboard"]');
dashboardTabBtn.addEventListener('click', loadAdminDashboard);
// Chamar ao login
function showAdminPanel() {
    loginSection.classList.add('hidden');
    document.getElementById('tab-dashboard').classList.remove('hidden');
    document.getElementById('tab-usuarios').classList.add('hidden');
    document.getElementById('tab-feedbacks').classList.add('hidden');
    tabBtns[0].classList.add('active');
    tabBtns[1].classList.remove('active');
    tabBtns[2].classList.remove('active');
    adminPanel.classList.remove('hidden');
    accessDenied.classList.add('hidden');
    loadAdminDashboard();
    fetchUsers();
} 
