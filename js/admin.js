
/* Módulo de administración: productos, imágenes, stock y creación/edición de usuarios.
 * Depende de EssencialAuth y EssencialDatos; solo muestra el panel al administrador.
 * Los formularios validan datos, actualizan el almacenamiento local y refrescan tablas.
 */

if (EssencialAuth.exigirRol("ADMINISTRADOR")) {
    document.getElementById("contenidoAdmin").hidden = false;

    const formulario = document.getElementById("formProducto");

    const archivoImagen = document.getElementById("archivoImagen");
    const imagenProducto = document.getElementById("imagenProducto");
    const vistaPrevia = document.getElementById("vistaPreviaImagen");
    const errorImagen = document.getElementById("errorImagen");

    // Valida el tipo y tamaño de la imagen antes de mostrar la vista previa.
    archivoImagen.addEventListener("change", function () {
        const archivo = this.files[0];

        if (!archivo) return;

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!tiposPermitidos.includes(archivo.type)) {
            errorImagen.textContent =
                "Selecciona una imagen JPG, PNG o WebP.";
            this.value = "";
            return;
        }

        if (archivo.size > 300 * 1024) {
            errorImagen.textContent =
                "La imagen supera los 300 KB. " +
                "Utiliza una imagen más pequeña.";
            this.value = "";
            return;
        }

        errorImagen.textContent = "";

        const lector = new FileReader();

        lector.onload = function (evento) {
            if (archivoImagen.files[0] !== archivo) return;

            imagenProducto.value = evento.target.result;

            vistaPrevia.src = evento.target.result;
            vistaPrevia.classList.remove("d-none");
        };

        lector.onerror = function () {
            if (archivoImagen.files[0] !== archivo) return;

            errorImagen.textContent =
                "No fue posible leer la imagen seleccionada.";
        };

        lector.readAsDataURL(archivo);
    });

    const tabla = document.getElementById("tablaProductos");
    const mensaje = document.getElementById("mensajeAdmin");

    function campo(id) {
        return document.getElementById(id);
    }

    function mostrarMensaje(texto, correcto = true) {
        mensaje.className = correcto
            ? "alert alert-success mt-3"
            : "alert alert-danger mt-3";
        mensaje.textContent = texto;
    }

    function precioCLP(valor) {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }).format(valor);
    }

    // Actualiza la tabla de productos con sus acciones de edición y eliminación.
    function mostrarProductos() {
        tabla.replaceChildren();

        EssencialDatos.obtenerProductos().forEach(producto => {
            const fila = document.createElement("tr");

            const nombre = document.createElement("td");
            nombre.textContent = producto.nombre;

            const precio = document.createElement("td");
            precio.textContent = precioCLP(producto.precio);

            const stock = document.createElement("td");
            const existencias = document.createElement("ul");
            existencias.className = "list-unstyled mb-0";
            [
                ["Chillán", producto.stock.chillan],
                ["Concepción", producto.stock.concepcion],
                ["Santiago", producto.stock.santiago]
            ].forEach(([sucursal, cantidad]) => {
                const linea = document.createElement("li");
                linea.textContent = `${sucursal}: ${cantidad}`;
                existencias.appendChild(linea);
            });
            stock.appendChild(existencias);

            const acciones = document.createElement("td");

            const editar = document.createElement("button");
            editar.textContent = "Editar";
            editar.className = "btn btn-sm btn-outline-primary me-2";
            editar.addEventListener("click", () => editarProducto(producto.id));

            const eliminar = document.createElement("button");
            eliminar.textContent = "Eliminar";
            eliminar.className = "btn btn-sm btn-outline-danger";
            eliminar.addEventListener("click", () => {
                if (confirm("¿Eliminar este producto de demostración?")) {
                    EssencialDatos.eliminarProducto(producto.id);
                    mostrarProductos();
                    mostrarMensaje("Producto eliminado correctamente.");
                }
            });

            acciones.append(editar, eliminar);
            fila.append(nombre, precio, stock, acciones);
            tabla.appendChild(fila);
        });
    }

    // Carga en el formulario los datos y la imagen del producto elegido.
    function editarProducto(id) {
        const p = EssencialDatos.buscarProducto(id);
        if (!p) return;

        campo("productoId").value = p.id;
        campo("codigo").value = p.codigo;
        campo("nombreProducto").value = p.nombre;
        campo("categoria").value = p.categoria;
        campo("descripcion").value = p.descripcion;
        campo("precioProducto").value = p.precio;
        campo("descuentoProducto").value = p.descuento;
        campo("imagenProducto").value = p.imagen;
        vistaPrevia.src = p.imagen;
        vistaPrevia.classList.remove("d-none");

        archivoImagen.value = "";
        errorImagen.textContent = "";
        campo("stockChillan").value = p.stock.chillan;
        campo("stockConcepcion").value = p.stock.concepcion;
        campo("stockSantiago").value = p.stock.santiago;

        campo("tituloFormulario").textContent = "Editar producto";
        formulario.scrollIntoView({ behavior: "smooth" });
    }

    // Valida los campos y el código único del producto antes de guardar.
    formulario.addEventListener("submit", event => {
        event.preventDefault();

        const camposObligatorios = [
            "codigo", "nombreProducto", "categoria",
            "descripcion", "imagenProducto",
            "precioProducto", "descuentoProducto",
            "stockChillan", "stockConcepcion", "stockSantiago"
        ];
        let valido = true;
        if (!imagenProducto.value.trim()) {
            errorImagen.textContent =
                "Debes seleccionar una imagen del producto.";
            valido = false;
        } else {
            errorImagen.textContent = "";
        }
        camposObligatorios.forEach(id => {
            const elemento = campo(id);
            const correcto = elemento.checkValidity() &&
                elemento.value.trim() !== "";

            elemento.classList.toggle("is-invalid", !correcto);
            elemento.classList.toggle("is-valid", correcto);

            if (!correcto) valido = false;
        });

        if (!valido) {
            mostrarMensaje("Revise los campos del producto.", false);
            return;
        }

        const id = Number(campo("productoId").value) || 0;
        const codigo = campo("codigo").value.trim();

        const repetido = EssencialDatos.obtenerProductos().some(
            p => p.codigo.toLowerCase() === codigo.toLowerCase()
                && p.id !== id
        );

        if (repetido) {
            mostrarMensaje("El código del producto ya existe.", false);
            return;
        }

        const producto = {
            id,
            codigo,
            nombre: campo("nombreProducto").value.trim(),
            categoria: campo("categoria").value,
            descripcion: campo("descripcion").value.trim(),
            precio: Number(campo("precioProducto").value),
            descuento: Number(campo("descuentoProducto").value),
            imagen: campo("imagenProducto").value.trim(),
            stock: {
                chillan: Number(campo("stockChillan").value),
                concepcion: Number(campo("stockConcepcion").value),
                santiago: Number(campo("stockSantiago").value)
            }
        };

        EssencialDatos.guardarProducto(producto);
        formulario.reset();

        mostrarProductos();
        mostrarMensaje("Producto guardado correctamente.");
    });

    // Limpia la imagen seleccionada, la vista previa y las marcas de validación.
    formulario.addEventListener("reset", () => {
        archivoImagen.value = "";
        imagenProducto.value = "";
        vistaPrevia.removeAttribute("src");
        vistaPrevia.classList.add("d-none");
        errorImagen.textContent = "";
        campo("productoId").value = "";
        campo("tituloFormulario").textContent = "Agregar producto";
        formulario.querySelectorAll(".is-valid, .is-invalid")
            .forEach(el => el.classList.remove("is-valid", "is-invalid"));
    });

    const tablaUsuarios = campo("tablaUsuarios");
    const formUsuario = campo("formUsuarioAdmin");
    const nombreUsuario = campo("nombreUsuarioAdmin");
    const correoUsuario = campo("correoUsuarioAdmin");
    const mensajeUsuario = campo("mensajeUsuarioAdmin");
    let usuarioEnEdicion = null;

    // Alterna alta/edición y deshabilita los campos que no corresponden al modo.
    function abrirFormularioUsuario(perfil = null) {
        formUsuario.reset();
        usuarioEnEdicion = perfil?.usuario || null;
        const creando = !perfil;
        campo("camposAltaUsuario").hidden = !creando;
        ["cuentaUsuarioAdmin", "passwordUsuarioAdmin", "rolUsuarioAdmin"].forEach(id => {
            campo(id).disabled = !creando;
        });
        campo("tituloUsuarioAdmin").textContent = creando ? "Crear usuario" : `Editar perfil de ${perfil.usuario}`;
        campo("guardarUsuarioAdmin").textContent = creando ? "Crear usuario" : "Guardar perfil";
        nombreUsuario.value = perfil?.nombre || "";
        correoUsuario.value = perfil?.email || "";
        mensajeUsuario.textContent = "";
        formUsuario.hidden = false;
        (creando ? campo("cuentaUsuarioAdmin") : nombreUsuario).focus();
    }

    campo("nuevoUsuarioAdmin").addEventListener("click", () => abrirFormularioUsuario());

    // Muestra las cuentas y permite abrir el formulario de edición de perfil.
    function mostrarUsuarios() {
        tablaUsuarios.replaceChildren();
        EssencialAuth.obtenerUsuarios().forEach(perfil => {
            const fila = tablaUsuarios.insertRow();
            fila.insertCell().textContent = perfil.usuario;
            fila.insertCell().textContent = [perfil.nombre, perfil.apellido].filter(Boolean).join(" ") || "—";
            fila.insertCell().textContent = perfil.email || "—";
            fila.insertCell().textContent = perfil.rol;

            const editar = document.createElement("button");
            editar.type = "button";
            editar.className = "btn btn-sm btn-outline-primary";
            editar.textContent = "Editar";
            editar.setAttribute("aria-label", `Editar perfil de ${perfil.usuario}`);
            editar.addEventListener("click", () => {
                abrirFormularioUsuario(perfil);
            });
            fila.insertCell().appendChild(editar);
        });
    }

    campo("cancelarUsuarioAdmin").addEventListener("click", () => {
        formUsuario.hidden = true;
        formUsuario.reset();
        usuarioEnEdicion = null;
    });

    // Crea una cuenta o edita el contacto conservando la identidad y el rol existentes.
    formUsuario.addEventListener("submit", event => {
        event.preventDefault();
        nombreUsuario.value = nombreUsuario.value.trim();
        correoUsuario.value = correoUsuario.value.trim();
        if (!formUsuario.reportValidity()) return;

        const creando = usuarioEnEdicion === null;
        if (creando) {
            const resultado = EssencialAuth.crearUsuario({
                usuario: campo("cuentaUsuarioAdmin").value.trim(),
                password: campo("passwordUsuarioAdmin").value,
                rol: campo("rolUsuarioAdmin").value,
                nombre: nombreUsuario.value,
                email: correoUsuario.value
            });
            if (!resultado.ok) {
                mensajeUsuario.textContent = resultado.mensaje;
                return;
            }
        } else {
            const perfil = EssencialAuth.obtenerUsuarios().find(
                usuario => usuario.usuario === usuarioEnEdicion
            );
            if (!perfil) return;
            EssencialAuth.guardarPerfil({
                ...perfil,
                nombre: nombreUsuario.value,
                email: correoUsuario.value
            });
        }
        formUsuario.hidden = true;
        formUsuario.reset();
        usuarioEnEdicion = null;
        mostrarUsuarios();
        mensajeUsuario.textContent = creando ? "Usuario creado correctamente." : "Perfil actualizado correctamente.";
    });

    mostrarProductos();
    mostrarUsuarios();
}
