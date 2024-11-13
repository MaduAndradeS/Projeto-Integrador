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
