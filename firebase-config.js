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
// SUBSTITUA ESTES VALORES PELOS DO SEU PROJETO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyB9xYQv5_iyGcDGLPz-M8DSHp_DFWxLd6o",
  authDomain: "full-financas-web.firebaseapp.com",
  projectId: "full-financas-web",
  storageBucket: "full-financas-web.firebasestorage.app",
  messagingSenderId: "771231898402",
  appId: "1:771231898402:web:98f9c7dc55304b46e5a37b"
};

// Inicializa o Firebase.
// Esta verificação evita que o app seja inicializado múltiplas vezes.
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

// Exporta os serviços do Firebase para uso no script.js
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
