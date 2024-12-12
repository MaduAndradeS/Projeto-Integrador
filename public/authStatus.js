import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Inicializar Firebase Authentication
const auth = getAuth();

// Referência ao botão de login
const loginBtn = document.getElementById("login-btn");

// Verificar estado de autenticação do usuário
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário está logado
        loginBtn.textContent = "Sair";
        loginBtn.href = "#";
        loginBtn.addEventListener("click", async () => {
            try {
                await signOut(auth);
                alert("Você saiu com sucesso!");
                window.location.reload(); // Recarregar a página para refletir as mudanças
            } catch (error) {
                console.error("Erro ao sair:", error.message);
            }
        });
    } else {
        // Usuário não está logado
        loginBtn.textContent = "Login";
        loginBtn.href = "login.html";
    }
});
