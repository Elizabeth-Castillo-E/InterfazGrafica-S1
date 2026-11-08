
const formularioRecuperar = document.getElementById("formRecuperar");

formularioRecuperar.addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("emailRecuperacion");
    const mensaje = document.getElementById("mensajeRecuperar");

    const correcto = email.checkValidity() &&
        email.value.trim() !== "";

    email.classList.toggle("is-valid", correcto);
    email.classList.toggle("is-invalid", !correcto);

    if (!correcto) {
        mensaje.className = "alert alert-danger mt-3";
        mensaje.textContent = "Ingrese un correo válido.";
        return;
    }

    mensaje.className = "alert alert-success mt-3";
    mensaje.textContent =
        "Solicitud validada correctamente. " +
        "Esta es una demostración: no se ha enviado " +
        "ningún correo ni modificado la contraseña.";
});
