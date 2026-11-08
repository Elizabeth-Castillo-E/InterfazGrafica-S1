
/* ADMINISTRACIÓN SIMULADA */

if (EssencialAuth.exigirRol("ADMINISTRADOR")) {
    document.getElementById("contenidoAdmin").hidden = false;

    const formulario = document.getElementById("formProducto");
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

    function mostrarProductos() {
        tabla.replaceChildren();

        EssencialDatos.obtenerProductos().forEach(producto => {
            const fila = document.createElement("tr");

            const nombre = document.createElement("td");
            nombre.textContent = producto.nombre;

            const precio = document.createElement("td");
            precio.textContent = precioCLP(producto.precio);

            const stock = document.createElement("td");
            stock.textContent = Object.values(producto.stock)
                .reduce((total, n) => total + n, 0);

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
        campo("stockChillan").value = p.stock.chillan;
        campo("stockConcepcion").value = p.stock.concepcion;
        campo("stockSantiago").value = p.stock.santiago;

        campo("tituloFormulario").textContent = "Editar producto";
        formulario.scrollIntoView({ behavior: "smooth" });
    }

    formulario.addEventListener("submit", event => {
        event.preventDefault();

        const camposObligatorios = [
            "codigo", "nombreProducto", "categoria",
            "descripcion", "imagenProducto",
            "precioProducto", "descuentoProducto",
            "stockChillan", "stockConcepcion", "stockSantiago"
        ];

        let valido = true;

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
        campo("productoId").value = "";
        campo("tituloFormulario").textContent = "Agregar producto";

        formulario.querySelectorAll(".is-valid, .is-invalid")
            .forEach(el => el.classList.remove("is-valid", "is-invalid"));

        mostrarProductos();
        mostrarMensaje("Producto guardado correctamente.");
    });

    formulario.addEventListener("reset", () => {
        campo("productoId").value = "";
        campo("tituloFormulario").textContent = "Agregar producto";
        formulario.querySelectorAll(".is-valid, .is-invalid")
            .forEach(el => el.classList.remove("is-valid", "is-invalid"));
    });

    function mostrarUsuarios() {
        const tablaUsuarios = document.getElementById("tablaUsuarios");
        tablaUsuarios.replaceChildren();

        const usuarios = [
            { usuario: "admin", rol: "ADMINISTRADOR" },
            { usuario: "cliente", rol: "CLIENTE" },
            ...EssencialAuth.obtenerPerfiles().map(p => ({
                usuario: p.usuario,
                rol: "CLIENTE"
            }))
        ];

        usuarios.forEach(u => {
            const fila = document.createElement("tr");
            const nombre = document.createElement("td");
            const rol = document.createElement("td");

            nombre.textContent = u.usuario;
            rol.textContent = u.rol;
            fila.append(nombre, rol);
            tablaUsuarios.appendChild(fila);
        });
    }

    mostrarProductos();
    mostrarUsuarios();
}
