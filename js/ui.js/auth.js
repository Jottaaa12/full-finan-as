// js/auth.js
import { auth, db } from '../../firebase-config.js';

/**
 * Configura o listener de estado de autenticação.
 * @param {Function} onUserLoggedIn Callback para quando o usuário está logado.
 * @param {Function} onUserLoggedOut Callback para quando o usuário está deslogado.
 */
export function setupAuthListener(onUserLoggedIn, onUserLoggedOut) {
    auth.onAuthStateChanged(user => {
        if (user) {
            onUserLoggedIn(user);
        } else {
            onUserLoggedOut();
        }
    });
}

/**
 * Lida com o processo de login.
 * @param {string} email O email do usuário.
 * @param {string} password A senha do usuário.
 */
export async function handleLogin(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

/**
 * Lida com o processo de registro.
 * @param {string} name O nome do usuário.
 * @param {string} email O email do usuário.
 * @param {string} password A senha do usuário.
 */
export async function handleRegister(name, email, password) {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    // Adiciona o usuário à coleção 'users' no Firestore
    await db.collection('users').doc(userCredential.user.uid).set({
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        currency: 'BRL',
        hasCompletedTour: false // Inicia o tour para novos usuários
    });
    return userCredential;
}

/**
 * Retorna uma mensagem de erro de autenticação amigável.
 * @param {string} errorCode O código de erro do Firebase.
 * @returns {string} A mensagem de erro formatada.
 */
export function getAuthErrorMessage(errorCode) {
    const messages = {
        'auth/email-already-in-use': 'Este email já está em uso.',
        'auth/invalid-email': 'O formato do email é inválido.',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
        'auth/user-not-found': 'Email ou senha incorretos.',
        'auth/wrong-password': 'Email ou senha incorretos.'
    };
    return messages[errorCode] || 'Ocorreu um erro. Tente novamente.';
}
