console.log("login.js carregado com sucesso!");

// Importações do Firebase
// Importações do Firebase diretamente do CDN

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { app } from "./firebaseConfig.js";
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
    

// Inicialização do Firebase Authentication e Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Aguardar o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM carregado e pronto!");

    // Captura os elementos do DOM
    const loginForm = document.getElementById("login-form");
    const registroForm = document.getElementById("registro-form");
    const registroLink = document.getElementById("registro-link");
    const loginLink = document.getElementById("login-link");
    const formTitle = document.getElementById("form-title");

    if (!loginForm || !registroForm || !registroLink || !loginLink || !formTitle) {
        console.error("Erro: Elementos HTML necessários não foram encontrados.");
        return;
    }

    // Alternar para o formulário de registro
    registroLink.addEventListener("click", () => {
        loginForm.style.display = "none";
        registroForm.style.display = "block";
        formTitle.textContent = "Registro";
    });

    // Alternar para o formulário de login
    loginLink.addEventListener("click", () => {
        registroForm.style.display = "none";
        loginForm.style.display = "block";
        formTitle.textContent = "Login";
    });

    // Registro de Usuário
    registroForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("registro-username").value.trim();
        const email = document.getElementById("registro-email").value.trim();
        const password = document.getElementById("registro-senha").value.trim();

        if (!username || !email || !password) {
            alert("Todos os campos são obrigatórios!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: username, // Define o username como displayName
            });

            // Salvar informações no Firestore
            await addDoc(collection(db, "users"), {
                uid: user.uid,
                username: username,
                email: email,
                createdAt: serverTimestamp(), // Timestamp automático
            });

            alert("Usuário registrado com sucesso!");
            registroForm.reset();
        } catch (error) {
            console.error("Erro ao registrar usuário:", error.message);
            alert("Erro ao registrar. Verifique os dados e tente novamente.");
        }
    });

    // Login de Usuário
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-senha").value.trim();

        if (!email || !password) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            alert(`Bem-vindo, ${user.email}!`);
            localStorage.setItem("token", user.uid); // Salva o UID localmente
            loginForm.reset();
            window.location.href = "index.html"; // Redirecionar após login
        } catch (error) {
            console.error("Erro ao fazer login:", error.message);
            alert("Erro ao fazer login. Verifique suas credenciais e tente novamente.");
        }
    });

    // Logout de Usuário
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                await signOut(auth);
                alert("Você saiu com sucesso!");
                window.location.href = "login.html"; // Redirecionar para a página de login
            } catch (error) {
                console.error("Erro ao fazer logout:", error.message);
            }
        });
    }
});
