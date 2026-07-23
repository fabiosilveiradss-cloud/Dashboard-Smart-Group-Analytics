//-----------------------------------------------------
// IMPORTAÇÕES DO FIREBASE
//-----------------------------------------------------

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


//-----------------------------------------------------
// CONFIGURAÇÃO DO PROJETO
//-----------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyBIPyLxiDY_BNtxMtHUqXtEv09l-Cibxaw",
  authDomain: "smart-group-analytics.firebaseapp.com",
  projectId: "smart-group-analytics",
  storageBucket: "smart-group-analytics.firebasestorage.app",
  messagingSenderId: "463021033688",
  appId: "1:463021033688:web:466d02021f8831cc4befad"
};


//-----------------------------------------------------
// INICIALIZAÇÃO
//-----------------------------------------------------

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


//-----------------------------------------------------
// EXPORTAÇÕES
//-----------------------------------------------------

export {
  app,
  auth,
  db
};
