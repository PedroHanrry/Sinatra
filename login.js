// ----------------------------------------
// LOGIN SIMPLES – usuário e senha definidos
// ----------------------------------------
const VALID_USER = "Sinatra"; // usuário escolhido
const VALID_PASS = "barbada123"; // senha escolhida

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  if (!form) return;

  const userInput = document.getElementById("username");
  const passInput = document.getElementById("password");
  const errorBox = document.getElementById("login-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const user = userInput.value.trim();
    const pass = passInput.value.trim();

    if (user === VALID_USER && pass === VALID_PASS) {
      // marca que está autenticado
      localStorage.setItem("auth_sinatra", "true");

      // vai para a página principal
      window.location.href = "index.html";
    } else {
      // exibe mensagem de erro
      if (errorBox) {
        errorBox.style.display = "block";
      }
    }
  });
});
