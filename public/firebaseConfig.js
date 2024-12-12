
// Importações do Firebase diretamente do CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAIHCFvdJ7wiQy9-hlScx3jrMUq2q9fIgo",
    authDomain: "projeto-integrador-web.firebaseapp.com",
    projectId: "projeto-integrador-web",
    storageBucket: "projeto-integrador-web.appspot.com", // Corrigido o domínio do storage
    messagingSenderId: "941573147907",
    appId: "1:941573147907:web:dca6e828977cbe9bcbad36",
    measurementId: "G-LESQZJVYPW"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };