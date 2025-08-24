import { db } from '../../firebase-config.js';

// --- Estado e Callbacks do Módulo ---
let currentUser = null;
let pageLoaderCallback = null;
let tourActive = false;
let currentTourStep = 0;

// --- CORREÇÃO: Lista de E-mails de Administradores ---
const ADMIN_EMAILS = ['joaopedro.torres@ymail.com']; // Adicione outros e-mails de admin aqui, se necessário

// --- Elementos do DOM (para evitar repetição) ---
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

// --- Funções Exportadas ---

/**
 * Inicializa o módulo de UI, configurando o usuário e os event listeners.
 * @param {object} user - O objeto do usuário do Firebase.
 * @param {function} loaderCallback - A função a ser chamada para carregar dados da página.
 */
export function initUI(user, loaderCallback) {
    currentUser = user;
    pageLoaderCallback = loaderCallback;

    setupMobileMenu();
    setupNavigation();
    setupModalClosers();
    setupTour();

    // --- CORREÇÃO: Verifica se o e-mail do usuário está na lista de admins ---
    const adminPanelLink = document.getElementById('admin-panel-link');
    if (adminPanelLink && ADMIN_EMAILS.includes(user.email)) {
        adminPanelLink.classList.remove('hidden');
    }
    // --- FIM DA CORREÇÃO ---
}


/**
 * Abre um modal pelo seu ID.
 * @param {string} modalId - O ID do elemento do modal.
 */
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

/**
 * Fecha um modal pelo seu ID.
 * @param {string} modalId - O ID do elemento do modal.
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Exibe uma mensagem de feedback para o usuário.
 * @param {string} elementId - O ID do elemento da mensagem.
 * @param {string} message - O texto a ser exibido.
 * @param {'success' | 'error'} type - O tipo de mensagem.
 */
export function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `profile-message ${type}`; // Reutilizando a classe de perfil
        messageEl.classList.remove('hidden');
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 5000);
    }
}

/**
 * Navega para uma página específica da aplicação.
 * @param {string} pageName - O nome da página (ex: 'dashboard').
 */
export function navigateTo(pageName) {
    pages.forEach(p => p.classList.add('hidden'));
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    if (pageLoaderCallback) {
        pageLoaderCallback(pageName);
    }
}

// --- Lógica Interna e Setup de Eventos ---

function setupMobileMenu() {
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('hidden');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.add('hidden');
        });
    }
}

function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.getAttribute('data-page'));
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.add('hidden');
            }
        });
    });
}

function setupModalClosers() {
    document.querySelectorAll('.modal-container').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close-btn')) {
                closeModal(modal.id);
            }
        });
    });
}


// --- Lógica do Tour Guiado ---

const tourSteps = [
    { element: '.sidebar', title: 'Navegação Principal', text: 'Aqui você encontra todas as seções do sistema.' },
    { element: 'a[data-page="accounts"]', title: 'Suas Contas', text: 'O primeiro passo é cadastrar suas contas (corrente, carteira, etc.).' },
    { element: 'a[data-page="transactions"]', title: 'Transações', text: 'Aqui você gerencia todas as suas receitas e despesas.' },
    { element: '.dashboard-grid', title: 'Dashboard', text: 'Aqui está o resumo financeiro e suas transações recentes.' }
];

function setupTour() {
    const restartTourBtn = document.getElementById('restart-tour-btn');
    if (restartTourBtn) {
        restartTourBtn.onclick = () => {
            restartTourBtn.classList.add('hidden');
            startTour();
        };
    }
    document.getElementById('tour-prev-btn')?.addEventListener('click', () => {
        if (currentTourStep > 0) showTourStep(currentTourStep - 1);
    });
    document.getElementById('tour-next-btn')?.addEventListener('click', () => {
        if (currentTourStep < tourSteps.length - 1) {
            showTourStep(currentTourStep + 1);
        } else {
            endTour();
        }
    });
    document.getElementById('tour-close-btn')?.addEventListener('click', endTour);
}

export function startTour() {
    tourActive = true;
    currentTourStep = 0;
    const tourOverlay = document.getElementById('tour-overlay');
    const tourTooltip = document.getElementById('tour-tooltip');
    tourOverlay.classList.remove('hidden');
    tourTooltip.classList.remove('hidden');
    setTimeout(() => {
        tourOverlay.classList.add('visible');
        tourTooltip.classList.add('visible');
    }, 50);
    showTourStep(0);
}

function endTour() {
    tourActive = false;
    const tourOverlay = document.getElementById('tour-overlay');
    const tourTooltip = document.getElementById('tour-tooltip');
    tourOverlay.classList.remove('visible');
    tourTooltip.classList.remove('visible');
    setTimeout(() => {
        tourOverlay.classList.add('hidden');
        tourTooltip.classList.add('hidden');
        document.querySelectorAll('.highlight-tour').forEach(el => el.classList.remove('highlight-tour'));
    }, 300);

    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({ hasCompletedTour: true });
    }
    const restartTourBtn = document.getElementById('restart-tour-btn');
    if(restartTourBtn) restartTourBtn.classList.remove('hidden');
}

function showTourStep(stepIndex) {
    document.querySelectorAll('.highlight-tour').forEach(el => el.classList.remove('highlight-tour'));
    currentTourStep = stepIndex;
    const step = tourSteps[stepIndex];
    const el = document.querySelector(step.element);

    if (el) {
        el.classList.add('highlight-tour');
        positionTooltip(el);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    document.getElementById('tour-title').textContent = step.title;
    document.getElementById('tour-text').textContent = step.text;
    document.getElementById('tour-prev-btn').disabled = stepIndex === 0;
    document.getElementById('tour-next-btn').textContent = (stepIndex === tourSteps.length - 1) ? 'Finalizar' : 'Próximo';
}

function positionTooltip(targetElement) {
    const tooltip = document.getElementById('tour-tooltip');
    const rect = targetElement.getBoundingClientRect();
    let top = rect.bottom + 10;
    let left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;

    // Adjust if off-screen
    if (left < 10) left = 10;
    if (left + tooltip.offsetWidth > window.innerWidth) {
        left = window.innerWidth - tooltip.offsetWidth - 10;
    }
    if (top + tooltip.offsetHeight > window.innerHeight) {
        top = rect.top - tooltip.offsetHeight - 10;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}