
import { updateUserProfile, uploadFile, deleteUserCollections, deleteUserDocument, deleteUserFiles } from './firestore.js';
import { showMessage, openModal, closeModal } from './ui.js';
import { auth, db, storage } from '../../firebase-config.js';

let currentUser = null;

/**
 * Inicializa a página de perfil, configurando os listeners de formulários e botões.
 */
export function initProfile(user) {
    currentUser = user;
    loadProfileData();

    // Listeners
    document.getElementById('profile-form')?.addEventListener('submit', handleProfileUpdate);
    document.getElementById('password-form')?.addEventListener('submit', handlePasswordChange);
    document.getElementById('change-photo-btn')?.addEventListener('click', () => document.getElementById('profile-photo-input').click());
    document.getElementById('profile-photo-input')?.addEventListener('change', handlePhotoUpload);
    document.getElementById('remove-photo-btn')?.addEventListener('click', handlePhotoRemove);
    document.getElementById('delete-account-btn')?.addEventListener('click', openDeleteModal);
    document.getElementById('confirm-delete-btn')?.addEventListener('click', handleDeleteAccount);
    document.getElementById('confirm-email')?.addEventListener('input', validateDeleteEmail);
}

/**
 * Carrega os dados do perfil do usuário nos campos da página.
 */
function loadProfileData() {
    const userDocRef = db.collection('users').doc(currentUser.uid);
    userDocRef.get().then(doc => {
        if (doc.exists) {
            const userData = doc.data();
            document.getElementById('profile-name').value = userData.name || '';
            document.getElementById('profile-email').value = currentUser.email;
            document.getElementById('default-currency').value = userData.currency || 'BRL';
            updateProfileImages(userData.profilePhotoURL);
        }
    });
}

function updateProfileImages(photoURL) {
    const defaultPhoto = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23e2e8f0'/><text x='50' y='55' text-anchor='middle' font-size='30' fill='%2394a3b8'>👤</text></svg>";
    const url = photoURL || defaultPhoto;
    document.getElementById('profile-photo-preview').src = url;
    document.getElementById('sidebar-user-photo').src = url;
    document.getElementById('remove-photo-btn').classList.toggle('hidden', !photoURL);
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const newName = document.getElementById('profile-name').value.trim();
    if (!newName) return;

    try {
        await updateUserProfile(currentUser.uid, { name: newName });
        document.getElementById('user-name-display').textContent = newName;
        showMessage('profile-message', 'Nome atualizado com sucesso!', 'success');
    } catch (error) {
        showMessage('profile-message', 'Erro ao atualizar nome.', 'error');
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    const form = e.target;
    const currentPassword = form['current-password'].value;
    const newPassword = form['new-password'].value;

    try {
        const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);
        await currentUser.reauthenticateWithCredential(credential);
        await currentUser.updatePassword(newPassword);
        form.reset();
        showMessage('password-message', 'Senha alterada com sucesso!', 'success');
    } catch (error) {
        const message = error.code === 'auth/wrong-password' ? 'Senha atual incorreta.' : 'Erro ao alterar senha.';
        showMessage('password-message', message, 'error');
    }
}

async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const photoURL = await uploadFile(file, currentUser.uid, 'profile_pictures');
        await updateUserProfile(currentUser.uid, { profilePhotoURL: photoURL });
        updateProfileImages(photoURL);
        showMessage('personalization-message', 'Foto de perfil atualizada!', 'success');
    } catch (error) {
        showMessage('personalization-message', 'Erro ao enviar a foto.', 'error');
    }
}

async function handlePhotoRemove() {
    if (!confirm('Tem certeza que deseja remover sua foto de perfil?')) return;
    try {
        await updateUserProfile(currentUser.uid, { profilePhotoURL: firebase.firestore.FieldValue.delete() });
        updateProfileImages(null);
        showMessage('personalization-message', 'Foto removida com sucesso!', 'success');
    } catch (error) {
        showMessage('personalization-message', 'Erro ao remover a foto.', 'error');
    }
}

function openDeleteModal() {
    document.getElementById('user-email-display').textContent = currentUser.email;
    document.getElementById('confirm-email').value = '';
    document.getElementById('confirm-delete-btn').disabled = true;
    openModal('delete-account-modal');
}

function validateDeleteEmail(e) {
    document.getElementById('confirm-delete-btn').disabled = e.target.value !== currentUser.email;
}

async function handleDeleteAccount() {
    try {
        await deleteUserCollections(currentUser.uid);
        await deleteUserDocument(currentUser.uid);
        await deleteUserFiles(currentUser.uid);
        await currentUser.delete();
        alert('Conta deletada com sucesso.');
        window.location.reload();
    } catch (error) {
        alert('Erro ao deletar conta. Por favor, faça login novamente e tente outra vez.');
        auth.signOut();
    }
}
