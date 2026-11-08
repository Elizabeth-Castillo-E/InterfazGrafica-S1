
/* Módulo de autenticación: cuentas demo y locales, perfiles, sesión y menú.
 * Depende del almacenamiento del navegador; no realiza peticiones a un servidor.
 * Las credenciales locales pertenecen únicamente a esta demostración frontend.
 */

const EssencialAuth = (() => {

    const CLAVE_SESION = "essencial_sesion";
    const CLAVE_PERFILES = "essencial_perfiles";
    const CLAVE_CUENTAS = "essencial_cuentas";

    const usuariosDemo = [
        {
            usuario: "admin",
            password: "Admin123!",
            rol: "ADMINISTRADOR",
            nombre: "Administrador",
            email: "admin@demo.local"
        },
        {
            usuario: "cliente",
            password: "Cliente123!",
            rol: "CLIENTE",
            nombre: "Cliente",
            email: "cliente@demo.local"
        }
    ];

    function obtenerSesion() {
        try {
            return JSON.parse(
                sessionStorage.getItem(CLAVE_SESION)
            );
        } catch {
            return null;
        }
    }

    // Guarda el perfil activo y su rol en la sesión de la pestaña.
    function guardarSesion(usuario) {
        const sesion = {
            usuario: usuario.usuario,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };

        sessionStorage.setItem(
            CLAVE_SESION,
            JSON.stringify(sesion)
        );

        return sesion;
    }

    // Lee las credenciales locales por separado para no incluirlas en los perfiles.
    function obtenerCuentas() {
        try {
            const cuentas = JSON.parse(localStorage.getItem(CLAVE_CUENTAS));
            return Array.isArray(cuentas) ? cuentas : [];
        } catch {
            return [];
        }
    }

    // Comprueba cuentas demo y creadas, y recupera el perfil actualizado.
    function iniciarSesion(usuario, password) {
        const encontrado = [...usuariosDemo, ...obtenerCuentas()].find(
            u => u.usuario.toLowerCase() === usuario.trim().toLowerCase()
                && u.password === password
        );

        if (!encontrado) return null;

        const perfil = obtenerUsuarios().find(p => p.usuario === encontrado.usuario);
        return guardarSesion({ ...encontrado, ...perfil, rol: encontrado.rol });
    }

    function cerrarSesion() {
        sessionStorage.removeItem(CLAVE_SESION);
        window.location.href = "index.html";
    }

    // Redirige a inicio de sesión o a portada según la sesión y el rol.
    function exigirRol(rol) {
        const sesion = obtenerSesion();

        if (!sesion) {
            window.location.replace("login.html");
            return false;
        }

        if (sesion.rol !== rol) {
            window.location.replace("index.html");
            return false;
        }

        return true;
    }

    function exigirSesion() {
        if (!obtenerSesion()) {
            window.location.replace("login.html");
            return false;
        }

        return true;
    }

    function obtenerPerfiles() {
        try {
            return JSON.parse(
                localStorage.getItem(CLAVE_PERFILES)
            ) || [];
        } catch {
            return [];
        }
    }

    // Combina las cuentas de demostración y los perfiles locales para el panel.
    function obtenerUsuarios() {
        const perfiles = obtenerPerfiles();
        const cuentas = usuariosDemo.map(({ usuario, nombre, email, rol }) => ({
            usuario,
            nombre,
            email,
            ...perfiles.find(perfil => perfil.usuario === usuario),
            rol
        }));
        return cuentas.concat(perfiles.filter(
            perfil => !cuentas.some(cuenta => cuenta.usuario === perfil.usuario)
        ));
    }

    // Actualiza el perfil local y sincroniza el nombre y el correo de la sesión activa.
    function guardarPerfil(perfil) {
        const perfiles = obtenerPerfiles();
        const indice = perfiles.findIndex(
            p => p.usuario === perfil.usuario
        );

        if (indice >= 0) {
            perfiles[indice] = { ...perfiles[indice], ...perfil };
        } else {
            perfiles.push(perfil);
        }

        localStorage.setItem(
            CLAVE_PERFILES,
            JSON.stringify(perfiles)
        );

        const sesion = obtenerSesion();

        if (sesion && sesion.usuario === perfil.usuario) {
            guardarSesion({
                ...sesion,
                nombre: perfil.nombre,
                email: perfil.email
            });
        }
    }

    // Comparte las reglas del alta pública y del panel; no cambia la sesión activa.
    function crearCuenta(datos, rol) {
        const usuario = (datos.usuario || "").trim();
        const nombre = (datos.nombre || "").trim();
        const email = (datos.email || "").trim();
        const password = datos.password || "";
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(usuario) ||
            !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/.test(nombre) ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\s])\S{6,18}$/.test(password) ||
            !["CLIENTE", "ADMINISTRADOR"].includes(rol)) {
            return { ok: false, mensaje: "Revise usuario, nombre, correo, contraseña y rol." };
        }
        const existe = usuariosDemo.some(
            u => u.usuario.toLowerCase() ===
                usuario.toLowerCase()
        ) || obtenerPerfiles().some(
            p => p.usuario.toLowerCase() ===
                usuario.toLowerCase()
        ) || obtenerCuentas().some(
            cuenta => cuenta.usuario.toLowerCase() === usuario.toLowerCase()
        );

        if (existe) return { ok: false, mensaje: "Este nombre de usuario ya está registrado." };

        const perfil = {
            usuario,
            nombre,
            apellido: datos.apellido || "",
            email,
            direccion: datos.direccion || "",
            rol
        };

        guardarPerfil(perfil);
        // En esta simulación la contraseña se conserva localmente en texto plano.
        localStorage.setItem(CLAVE_CUENTAS, JSON.stringify([
            ...obtenerCuentas(), { usuario, password, rol }
        ]));
        return { ok: true, perfil };
    }

    // El administrador crea cuentas sin perder su propia sesión.
    function crearUsuario(datos) {
        if (obtenerSesion()?.rol !== "ADMINISTRADOR") {
            return { ok: false, mensaje: "Solo el administrador puede crear usuarios." };
        }
        return crearCuenta(datos, datos.rol);
    }

    // El registro público siempre crea clientes e inicia la nueva sesión.
    function registrarCliente(datos) {
        const resultado = crearCuenta(datos, "CLIENTE");
        if (!resultado.ok) return false;
        guardarSesion(resultado.perfil);
        return true;
    }

    
// Reconstruye los enlaces de sesión según el rol y marca la página actual.
function actualizarSesionMenu() {
    const menu = document.querySelector(".menu");

    if (!menu) return;

    const sesion = obtenerSesion();

    // Eliminar enlaces dinámicos anteriores.
    menu.querySelectorAll("[data-sesion]").forEach(
        elemento => elemento.remove()
    );

    // Evitar enlaces de sesión duplicados.
    [
        "login.html",
        "registroUsuario.html",
        "admin.html",
        "perfil.html",
        "carrito.html",
        "compras.html"
    ].forEach(ruta => {
        menu.querySelectorAll(`a[href="${ruta}"]`).forEach(
            enlace => enlace.remove()
        );
    });

    function agregarEnlace(texto, ruta) {
        const enlace = document.createElement("a");

        enlace.href = ruta;
        enlace.textContent = texto;
        enlace.dataset.sesion = "true";

        menu.appendChild(enlace);
    }

    if (!sesion) {
        agregarEnlace("Iniciar sesión", "login.html");
        agregarEnlace("Registrarse", "registroUsuario.html");
    } else {
        if (sesion.rol === "ADMINISTRADOR") {
            agregarEnlace("Administración", "admin.html");
        }

        if (sesion.rol === "CLIENTE") {
            agregarEnlace("Mi carrito", "carrito.html");
            agregarEnlace("Mis compras", "compras.html");
        }

        agregarEnlace("Mi perfil", "perfil.html");

        const salir = document.createElement("button");
        salir.type = "button";
        salir.textContent = "Cerrar sesión";
        salir.className = "btn btn-outline-light btn-sm";
        salir.dataset.sesion = "true";

        salir.addEventListener("click", cerrarSesion);

        menu.appendChild(salir);
    }

    // Resaltar la página actual.
    const paginaActual =
        window.location.pathname.split("/").pop() || "index.html";

    menu.querySelectorAll("a").forEach(enlace => {
        enlace.removeAttribute("aria-current");

        const url = new URL(enlace.href);
        const paginaEnlace =
            url.pathname.split("/").pop() || "index.html";

        if (
            paginaEnlace === paginaActual &&
            !url.hash &&
            enlace.getAttribute("href") !== "index.html#categorias"
        ) {
            enlace.setAttribute("aria-current", "page");
        }
    });
}


    document.addEventListener(
        "DOMContentLoaded",
        actualizarSesionMenu
    );

    return {
        obtenerSesion,
        iniciarSesion,
        cerrarSesion,
        exigirRol,
        exigirSesion,
        obtenerPerfiles,
        obtenerUsuarios,
        guardarPerfil,
        crearUsuario,
        registrarCliente
    };
})();
