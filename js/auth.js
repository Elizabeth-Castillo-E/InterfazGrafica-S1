
/* AUTENTICACIÓN SIMULADA
*/

const EssencialAuth = (() => {

    const CLAVE_SESION = "essencial_sesion";
    const CLAVE_PERFILES = "essencial_perfiles";

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

    function iniciarSesion(usuario, password) {
        const encontrado = usuariosDemo.find(
            u => u.usuario === usuario && u.password === password
        );

        if (!encontrado) return null;

        return guardarSesion(encontrado);
    }

    function cerrarSesion() {
        sessionStorage.removeItem(CLAVE_SESION);
        window.location.href = "index.html";
    }

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

    function guardarPerfil(perfil) {
        const perfiles = obtenerPerfiles();
        const indice = perfiles.findIndex(
            p => p.usuario === perfil.usuario
        );

        if (indice >= 0) {
            perfiles[indice] = perfil;
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

    function registrarCliente(datos) {
        const existe = usuariosDemo.some(
            u => u.usuario.toLowerCase() ===
                datos.usuario.toLowerCase()
        ) || obtenerPerfiles().some(
            p => p.usuario.toLowerCase() ===
                datos.usuario.toLowerCase()
        );

        if (existe) return false;

        const perfil = {
            usuario: datos.usuario,
            nombre: datos.nombre,
            apellido: datos.apellido,
            email: datos.email,
            direccion: datos.direccion || "",
            rol: "CLIENTE"
        };

        guardarPerfil(perfil);
        guardarSesion(perfil);
        return true;
    }

    function actualizarSesionMenu() {
        const menu = document.querySelector(".menu");
        if (!menu) return;

        const sesion = obtenerSesion();

        // Sustituye los enlaces de sesión anteriores.
        menu.querySelectorAll("[data-sesion]").forEach(
            elemento => elemento.remove()
        );

        if (sesion) {
            menu.querySelectorAll('a[href="login.html"], a[href="registroUsuario.html"]')
                .forEach(elemento => elemento.remove());

            const enlace = document.createElement("a");
            enlace.href = sesion.rol === "ADMINISTRADOR"
                ? "admin.html" : "carrito.html";
            enlace.textContent = sesion.rol === "ADMINISTRADOR"
                ? "Administración" : "Mi carrito";
            enlace.dataset.sesion = "true";
            menu.appendChild(enlace);

            const perfil = document.createElement("a");
            perfil.href = "perfil.html";
            perfil.textContent = "Mi perfil";
            perfil.dataset.sesion = "true";
            menu.appendChild(perfil);

            const salir = document.createElement("button");
            salir.type = "button";
            salir.textContent = "Cerrar sesión";
            salir.className = "btn btn-outline-light btn-sm";
            salir.dataset.sesion = "true";
            salir.addEventListener("click", cerrarSesion);
            menu.appendChild(salir);

        } else {
            if (!menu.querySelector('a[href="login.html"]')) {
                const login = document.createElement("a");
                login.href = "login.html";
                login.textContent = "Iniciar sesión";
                login.dataset.sesion = "true";
                menu.appendChild(login);
            }

            if (!menu.querySelector('a[href="registroUsuario.html"]')) {
                const registro = document.createElement("a");
                registro.href = "registroUsuario.html";
                registro.textContent = "Registrarse";
                registro.dataset.sesion = "true";
                menu.appendChild(registro);
            }
        }
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
        guardarPerfil,
        registrarCliente
    };
})();
