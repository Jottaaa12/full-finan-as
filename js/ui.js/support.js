
/**
 * Inicializa a lógica da página de Apoio ao Projeto.
 */
export function initSupport() {
    const copyPixBtn = document.getElementById('copy-pix-btn');
    const pixKey = document.getElementById('pix-key');
    const copyMessage = document.getElementById('copy-message');

    if (!copyPixBtn) return;

    copyPixBtn.addEventListener('click', async () => {
        if (!pixKey || !copyMessage) return;

        try {
            await navigator.clipboard.writeText(pixKey.textContent);
            copyMessage.classList.remove('hidden');
            setTimeout(() => {
                copyMessage.classList.add('hidden');
            }, 3000);
        } catch (error) {
            console.error('Erro ao copiar chave PIX:', error);
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = pixKey.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            copyMessage.classList.remove('hidden');
            setTimeout(() => {
                copyMessage.classList.add('hidden');
            }, 3000);
        }
    });
}
