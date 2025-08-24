// js/firestore.js
import { db, storage } from '../../firebase-config.js';

/**
 * Busca todos os dados do usuário (contas, transações, etc.) do Firestore.
 * @param {string} userId O ID do usuário logado.
 * @returns {Promise<object>} Um objeto contendo os dados do usuário.
 */
export async function fetchAllData(userId) {
    if (!userId) return {};
    try {
        const [accountsSnapshot, transactionsSnapshot, budgetsSnapshot, goalsSnapshot] = await Promise.all([
            db.collection('accounts').where('userId', '==', userId).get(),
            db.collection('transactions').where('userId', '==', userId).get(),
            db.collection('budgets').where('userId', '==', userId).get(),
            db.collection('goals').where('userId', '==', userId).get()
        ]);
        const userAccounts = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const userTransactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const userBudgets = budgetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const userGoals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { userAccounts, userTransactions, userBudgets, userGoals };
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return {};
    }
}

/**
 * Salva ou atualiza um documento em uma coleção.
 * @param {string} collectionName O nome da coleção.
 * @param {object} data Os dados do documento.
 * @param {string|null} docId O ID do documento para atualização (null para novo).
 */
async function saveDocument(collectionName, data, docId) {
    if (docId) {
        await db.collection(collectionName).doc(docId).update(data);
    } else {
        await db.collection(collectionName).add(data);
    }
}

/**
 * Deleta um documento de uma coleção.
 * @param {string} collectionName O nome da coleção.
 * @param {string} docId O ID do documento a ser deletado.
 */
async function deleteDocument(collectionName, docId) {
    await db.collection(collectionName).doc(docId).delete();
}

// Funções específicas por coleção
export const saveTransaction = (data, docId) => saveDocument('transactions', data, docId);
export const saveAccount = (data, docId) => saveDocument('accounts', data, docId);
export const saveBudget = (data, docId) => saveDocument('budgets', data, docId);
export const saveGoal = (data, docId) => saveDocument('goals', data, docId);
export const saveFeedback = (data) => saveDocument('feedback', data, null);

export const deleteAccount = (docId) => deleteDocument('accounts', docId);
export const deleteBudget = (docId) => deleteDocument('budgets', docId);
export const deleteGoal = (docId) => deleteDocument('goals', docId);

/**
 * Atualiza o perfil do usuário no Firestore.
 * @param {string} userId O ID do usuário.
 * @param {object} profileData Os dados do perfil a serem atualizados.
 */
export async function updateUserProfile(userId, profileData) {
    await db.collection('users').doc(userId).update(profileData);
}

/**
 * Faz o upload de um anexo para o Firebase Storage.
 * @param {File} file O arquivo a ser enviado.
 * @param {string} userId O ID do usuário.
 * @param {string} folder A pasta de destino ('comprovantes' ou 'profile_pictures').
 * @returns {Promise<string>} A URL de download do arquivo.
 */
export async function uploadFile(file, userId, folder) {
    const timestamp = Date.now();
    const fileName = `${userId}-${timestamp}-${file.name}`;
    const filePath = `${folder}/${fileName}`;
    const storageRef = storage.ref().child(filePath);
    const snapshot = await storageRef.put(file);
    return await snapshot.ref.getDownloadURL();
}

/**
 * Deleta todas as coleções de um usuário no Firestore.
 * @param {string} userId O ID do usuário.
 */
export async function deleteUserCollections(userId) {
    const collections = ['transactions', 'accounts', 'budgets', 'goals', 'feedback'];
    for (const collectionName of collections) {
        const querySnapshot = await db.collection(collectionName).where('userId', '==', userId).get();
        if (!querySnapshot.empty) {
            const batch = db.batch();
            querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
    }
}

/**
 * Deleta o documento principal do usuário.
 * @param {string} userId O ID do usuário.
 */
export async function deleteUserDocument(userId) {
    await db.collection('users').doc(userId).delete();
}

/**
 * Deleta os arquivos de um usuário no Storage.
 * @param {string} userId O ID do usuário.
 */
export async function deleteUserFiles(userId) {
    const folders = ['comprovantes', 'profile_pictures'];
    for (const folder of folders) {
        const folderRef = storage.ref(folder);
        const fileList = await folderRef.listAll();
        const userFiles = fileList.items.filter(item => item.name.startsWith(userId));
        await Promise.all(userFiles.map(fileRef => fileRef.delete()));
    }
}

/**
 * Calcula os saldos de todas as contas com base nas transações.
 * @param {Array} userAccounts As contas do usuário.
 * @param {Array} userTransactions As transações do usuário.
 * @returns {Array} As contas com os saldos atualizados.
 */
export function calculateAllBalances(userAccounts, userTransactions) {
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
    return userAccounts;
}
