/* Módulo de Ingreso: captura credenciales, marca campos vacíos y delega la comprobación a EssencialAuth.
 * Muestra errores y redirige al panel si es administrador o al inicio si es cliente.
 */

const formLogin = document.getElementById("formLogin");
const usuarioLogin = document.getElementById("usuarioLogin");
const passwordLogin = document.getElementById("passwordLogin");
const mensajeLogin = document.getElementById("mensajeLogin");

// Valida los campos y abre la pantalla correspondiente al rol de la sesión.
formLogin.addEventListener("submit", function (event) {
    event.preventDefault();

    const usuario = usuarioLogin.value.trim();
    const password = passwordLogin.value;

    const usuarioValido = usuario.length > 0;
    const passwordValida = password.length > 0;

    usuarioLogin.classList.toggle("is-valid", usuarioValido);
    usuarioLogin.classList.toggle("is-invalid", !usuarioValido);

    passwordLogin.classList.toggle("is-valid", passwordValida);
    passwordLogin.classList.toggle("is-invalid", !passwordValida);

    if (!usuarioValido || !passwordValida) {
        mensajeLogin.className = "alert alert-danger mt-3";
        mensajeLogin.textContent = "Complete usuario y contraseña.";
        return;
    }

    const sesion = EssencialAuth.iniciarSesion(
        usuario,
        password
    );

    if (!sesion) {
        mensajeLogin.className = "alert alert-danger mt-3";
        mensajeLogin.textContent =
            "Credenciales de demostración incorrectas.";
        return;
    }

    mensajeLogin.className = "alert alert-success mt-3";
    mensajeLogin.textContent = "Inicio de sesión correcto.";

    if (sesion.rol === "ADMINISTRADOR") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "index.html";
    }
});
