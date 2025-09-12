// js/ui.js/ui.js
// CORREÇÃO: Arquivo refatorado para corrigir navegação, modais e menu mobile.
import { db } from '../../firebase-config.js';
import { handleLogin, handleRegister, getAuthErrorMessage } from './auth.js';

// --- Estado e Callbacks do Módulo ---
let currentUser = null;
let pageLoaderCallback = null;

// --- Lista de E-mails de Administradores ---
const ADMIN_EMAILS = ['joaopedro.torres@ymail.com'];

// --- Elementos do DOM ---
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');

// --- Funções Exportadas ---

/**
 * Exibe uma mensagem temporária em um elemento da UI.
 * @param {string} elementId - O ID do elemento onde a mensagem será exibida.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo de mensagem ('success', 'error', 'info').
 */
export function showMessage(elementId, message, type = 'info') {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`; // Reset classes and apply new one
        messageElement.classList.remove('hidden');

        // Esconde a mensagem após 5 segundos
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 5000);
    }
}

/**
 * Prepara os formulários de login e registro.
 * Esta função é chamada quando nenhum usuário está logado.
 */
export function initAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authError = document.getElementById('auth-error');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Mostra a tela de autenticação e esconde o app
    if (authContainer) authContainer.classList.remove('hidden');
    if (appContainer) appContainer.classList.add('hidden');

    // Listener para o formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (authError) authError.textContent = '';
            
            const email = loginForm['login-email'].value;
            const password = loginForm['login-password'].value;
            
            try {
                await handleLogin(email, password);
                // O onAuthStateChanged em main.js cuidará da transição de tela.
            } catch (error) {
                if (authError) authError.textContent = getAuthErrorMessage(error.code);
            }
        });
    }

    // Listener para o formulário de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (authError) authError.textContent = '';
            
            const name = registerForm['register-name'].value;
            const email = registerForm['register-email'].value;
            const password = registerForm['register-password'].value;
            const confirmPassword = registerForm['register-confirm-password'].value;
            
            try {
                await handleRegister(name, email, password, confirmPassword);
                // O onAuthStateChanged em main.js cuidará da transição de tela.
            } catch (error) {
                if (authError) {
                    authError.textContent = error.message.includes('senhas') 
                        ? error.message 
                        : getAuthErrorMessage(error.code);
                }
            }
        });
    }

    // Listener para o link "Registre-se"
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            if (authError) authError.textContent = '';
        });
    }

    // Listener para o link "Faça Login"
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            if (authError) authError.textContent = '';
        });
    }
}

/**
 * Inicializa a UI principal da aplicação após o login.
 * @param {object} user - O objeto do usuário do Firebase.
 * @param {function} loaderCallback - A função a ser chamada para carregar dados da página.
 */
export function initUI(user, loaderCallback) {
    currentUser = user;
    pageLoaderCallback = loaderCallback;

    // Mostra o app e esconde a tela de autenticação
    if (authContainer) authContainer.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');

    setupMobileMenu();
    setupNavigation();
    setupModalClosers();
    setupTour();
    
    // Verifica se o usuário é admin para mostrar o link do painel
    const adminPanelLink = document.getElementById('admin-panel-link');
    if (adminPanelLink && user && ADMIN_EMAILS.includes(user.email)) {
        adminPanelLink.classList.remove('hidden');
    }
}

/**
 * Abre um modal específico.
 * @param {string} modalId - O ID do modal a ser aberto.
 */
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Fecha um modal específico.
 * @param {string} modalId - O ID do modal a ser fechado.
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * CORREÇÃO: A função 'showPage' foi renomeada para 'navigateTo' e exportada conforme solicitado.
 * Esta função agora é o ponto central para a navegação de páginas.
 * @param {string} pageId - O ID da página a ser exibida (ex: 'dashboard').
 */
export function navigateTo(pageId) {
    const targetPageId = `${pageId}-page`;
    pages.forEach(page => {
        // Adiciona 'hidden' se não for a página de destino, remove se for.
        page.classList.toggle('hidden', page.id !== targetPageId);
    });

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-page') === pageId);
    });

    // Fecha a sidebar automaticamente ao navegar em modo mobile
    const closeMenu = () => {
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    };
    if (sidebar && sidebar.classList.contains('active')) {
        closeMenu();
    }

    // Carrega os dados da página, se necessário
    if (pageLoaderCallback) {
        pageLoaderCallback(pageId, currentUser);
    }
}

// --- Funções Internas ---

/**
 * CORREÇÃO: A lógica do menu mobile foi refeita para ser mais robusta.
 * Usa funções explícitas de abrir/fechar em vez de 'toggle' para evitar inconsistências de estado.
 */
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');

    const openMenu = () => {
        if (sidebar) sidebar.classList.add('active');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
    };

    const closeMenu = () => {
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar && sidebar.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (sidebarOverlay) {
        // Clicar no overlay sempre fecha o menu.
        sidebarOverlay.addEventListener('click', closeMenu);
    }
}

/**
 * Configura os links de navegação principal.
 */
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            if (pageId) {
                // CORREÇÃO: Chama a função 'navigateTo' renomeada.
                navigateTo(pageId);
            }
        });
    });
}

/**
 * CORREÇÃO: A lógica para fechar modais foi melhorada.
 * Agora, usa delegação de eventos no 'document' para garantir que todos os modais,
 * mesmo os criados dinamicamente, possam ser fechados de forma confiável.
 */
function setupModalClosers() {
    document.addEventListener('click', (e) => {
        const target = e.target;
        // Fecha o modal se o clique for no overlay, no botão 'x' ou em um ícone dentro do botão.
        if (target.classList.contains('modal-overlay') || target.closest('.modal-close')) {
            const modal = target.closest('.modal');
            if (modal && modal.id) {
                // Reutiliza a função exportada para manter a consistência.
                closeModal(modal.id);
            } else if (modal) {
                // Fallback para caso o modal não tenha um ID.
                modal.classList.remove('active');
            }
        }
    });
}

function setupTour() {
    // Lógica do tour (se houver) pode ser mantida ou adicionada aqui.
    // Exemplo: verificar se o usuário precisa ver o tour e iniciá-lo.
}