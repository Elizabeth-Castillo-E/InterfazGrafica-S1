/* Módulo de Perfil: exige sesión y carga los datos locales de la cuenta activa.
 * Valida nombre, apellido y correo y guarda mediante EssencialAuth, sincronizando la sesión.
 * Conserva usuario, rol y credenciales.
 */

// Carga los datos del perfil de la sesión activa en el formulario.
if (EssencialAuth.exigirSesion()) {

    document.getElementById("contenidoPerfil").hidden = false;

    const sesion = EssencialAuth.obtenerSesion();

    const perfiles = EssencialAuth.obtenerPerfiles();
    const perfil = perfiles.find(
        p => p.usuario === sesion.usuario
    ) || sesion;

    document.getElementById("perfilUsuario").value = sesion.usuario;
    document.getElementById("perfilNombre").value = perfil.nombre || "";
    document.getElementById("perfilApellido").value = perfil.apellido || "";
    document.getElementById("perfilEmail").value = perfil.email || "";
    document.getElementById("perfilDireccion").value = perfil.direccion || "";

    // Valida nombre, apellido y correo antes de guardar el perfil.
    document.getElementById("formPerfil").addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const nombre = document.getElementById("perfilNombre");
            const apellido = document.getElementById("perfilApellido");
            const email = document.getElementById("perfilEmail");
            const mensaje = document.getElementById("mensajePerfil");

            const nombresValidos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/;

            const validaciones = [
                [nombre, nombresValidos.test(nombre.value.trim())],
                [apellido, nombresValidos.test(apellido.value.trim())],
                [email, email.checkValidity() &&
                    email.value.trim() !== ""]
            ];

            validaciones.forEach(([elemento, valido]) => {
                elemento.classList.toggle("is-valid", valido);
                elemento.classList.toggle("is-invalid", !valido);
            });

            if (validaciones.some(([, valido]) => !valido)) {
                mensaje.className = "alert alert-danger mt-3";
                mensaje.textContent = "Revise los datos ingresados.";
                return;
            }

            EssencialAuth.guardarPerfil({
                usuario: sesion.usuario,
                nombre: nombre.value.trim(),
                apellido: apellido.value.trim(),
                email: email.value.trim(),
                direccion: document.getElementById("perfilDireccion")
                    .value.trim(),
                rol: sesion.rol
            });

            mensaje.className = "alert alert-success mt-3";
            mensaje.textContent = "Perfil actualizado correctamente.";
        }
    );
}
