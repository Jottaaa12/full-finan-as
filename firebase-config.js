// =============================================================================
// ARQUIVO DE CONFIGURAÇÃO DO FIREBASE - Full Finanças
// =============================================================================
// Este arquivo contém a configuração do Firebase para o App Full Finanças.
// Ele inicializa os serviços do Firebase (Firestore, Auth, Storage) e os
// disponibiliza para serem usados no arquivo principal script.js.
//
// IMPORTANTE: Estas chaves são de um projeto de exemplo. Você DEVE substituí-las
// pelas chaves do SEU PRÓPRIO projeto no Firebase para que a aplicação funcione
// corretamente com seus dados.
// =============================================================================

// Configuração do Firebase para o App Full Finanças
// As chaves agora são lidas das Variáveis de Ambiente configuradas na Vercel
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa o Firebase.
// Esta verificação evita que o app seja inicializado múltiplas vezes.
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

// Exporta os serviços do Firebase para uso nos módulos
export const db = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();
