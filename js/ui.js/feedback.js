
import { db } from '../../firebase-config.js';

/**
 * Inicializa a lógica do formulário de feedback.
 * @param {object} currentUser - O objeto do usuário logado.
 */
export function initFeedback(currentUser) {
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
}
