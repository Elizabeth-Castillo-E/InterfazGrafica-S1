
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
        "carrito.html"
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
        guardarPerfil,
        registrarCliente
    };
})();
