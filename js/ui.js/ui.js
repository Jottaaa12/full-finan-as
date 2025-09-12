// js/ui.js/ui.js
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
 * Mostra a página solicitada e esconde as outras.
 * @param {string} pageId - O ID da página a ser exibida.
 */
export function showPage(pageId) {
    pages.forEach(page => {
        page.classList.toggle('active', page.id === pageId);
    });

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-page') === pageId);
    });

    // Fecha a sidebar em modo mobile ao trocar de página
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }

    // Carrega os dados da página, se necessário
    if (pageLoaderCallback) {
        pageLoaderCallback(pageId, currentUser);
    }
}

// --- Funções Internas ---

function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
}

function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            if (pageId) {
                showPage(pageId);
            }
        });
    });
}

function setupModalClosers() {
    const modalClosers = document.querySelectorAll('.modal-close, .modal-overlay');
    modalClosers.forEach(closer => {
        closer.addEventListener('click', () => {
            const modal = closer.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
}

function setupTour() {
    // Lógica do tour (se houver) pode ser mantida ou adicionada aqui.
    // Exemplo: verificar se o usuário precisa ver o tour e iniciá-lo.
}