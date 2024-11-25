
document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("login-form");
  const registroForm = document.getElementById("registro-form");
  const registroLink = document.getElementById("registro-link");
  const loginLink = document.getElementById("login-link");
  const formTitle = document.getElementById("form-title");

  // Exibe o formulário de registro e esconde o de login ao clicar no link de registro
  registroLink.addEventListener("click", function() {
    loginForm.style.display = "none";
    registroForm.style.display = "block";
    formTitle.textContent = "Registro";
  });

  // Exibe o formulário de login e esconde o de registro ao clicar no link de login
  loginLink.addEventListener("click", function() {
    registroForm.style.display = "none";
    loginForm.style.display = "block";
    formTitle.textContent = "Login";
  });
});

/////////////////////////////////

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("registro-form");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-senha").value;

    const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
        alert("Login realizado com sucesso!");
        localStorage.setItem("token", data.token);
    } else {
        alert(data.message);
    }
});

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("registro-username").value;
    const email = document.getElementById("registro-email").value;
    const password = document.getElementById("registro-senha").value;

    const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (response.ok) {
        alert("Registro realizado com sucesso!");
    } else {
        alert(data.message);
    }
});
localStorage.setItem("token", data.token); // Salva o token no localStorage 