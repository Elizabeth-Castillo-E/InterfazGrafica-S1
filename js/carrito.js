
/* CARRITO Y COMPRA SIMULADA */

if (EssencialAuth.exigirRol("CLIENTE")) {

    document.getElementById("contenidoCarrito").hidden = false;

    const CLAVE_CARRITO = "essencial_carrito";
    const CLAVE_PEDIDOS = "essencial_pedidos";

    const tabla = document.getElementById("tablaCarrito");
    const totalElemento = document.getElementById("totalCarrito");
    const mensaje = document.getElementById("mensajeCompra");

    function obtenerCarrito() {
        try {
            return JSON.parse(
                localStorage.getItem(CLAVE_CARRITO)
            ) || [];
        } catch {
            return [];
        }
    }

    function guardarCarrito(carrito) {
        localStorage.setItem(
            CLAVE_CARRITO,
            JSON.stringify(carrito)
        );
    }

    function precioCLP(numero) {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }).format(numero);
    }

    function mostrarCarrito() {
        tabla.replaceChildren();

        let total = 0;
        const carrito = obtenerCarrito();

        carrito.forEach(item => {
            const producto = EssencialDatos.buscarProducto(item.id);
            if (!producto) return;

            const subtotal = producto.precio * item.cantidad;
            total += subtotal;

            const fila = document.createElement("tr");

            const nombre = document.createElement("td");
            nombre.textContent = producto.nombre;

            const cantidad = document.createElement("td");
            cantidad.textContent = item.cantidad;

            const subtotalCelda = document.createElement("td");
            subtotalCelda.textContent = precioCLP(subtotal);

            const acciones = document.createElement("td");
            const quitar = document.createElement("button");
            quitar.className = "btn btn-sm btn-outline-danger";
            quitar.textContent = "Quitar";

            quitar.addEventListener("click", () => {
                guardarCarrito(
                    obtenerCarrito().filter(p => p.id !== item.id)
                );
                mostrarCarrito();
            });

            acciones.appendChild(quitar);
            fila.append(nombre, cantidad, subtotalCelda, acciones);
            tabla.appendChild(fila);
        });

        totalElemento.textContent = precioCLP(total);
        document.getElementById("confirmarCompra").disabled =
            carrito.length === 0;
    }

    document.getElementById("confirmarCompra")
        .addEventListener("click", () => {

            const carrito = obtenerCarrito();
            const sucursal = document.getElementById(
                "sucursalCompra"
            ).value;

            if (carrito.length === 0) return;

            const detalles = [];

            for (const item of carrito) {
                const producto = EssencialDatos.buscarProducto(item.id);

                if (!producto ||
                    !Number.isInteger(item.cantidad) ||
                    item.cantidad <= 0 ||
                    producto.stock[sucursal] < item.cantidad) {

                    mensaje.className = "alert alert-danger mt-4";
                    mensaje.textContent =
                        "No hay stock suficiente para completar " +
                        "la compra en la sucursal seleccionada.";
                    return;
                }

                detalles.push({ producto, cantidad: item.cantidad });
            }

            const total = detalles.reduce(
                (suma, item) =>
                    suma + item.producto.precio * item.cantidad,
                0
            );

            // Se simula la actualización del stock.
            detalles.forEach(item => {
                const nuevoStock =
                    item.producto.stock[sucursal] - item.cantidad;

                EssencialDatos.actualizarStock(
                    item.producto.id,
                    sucursal,
                    nuevoStock
                );
            });

            // Historial ficticio de la compra.
            const pedidos = JSON.parse(
                localStorage.getItem(CLAVE_PEDIDOS) || "[]"
            );

            pedidos.push({
                id: Date.now(),
                usuario: EssencialAuth.obtenerSesion().usuario,
                fecha: new Date().toISOString(),
                sucursal,
                total,
                productos: carrito
            });

            localStorage.setItem(
                CLAVE_PEDIDOS,
                JSON.stringify(pedidos)
            );

            guardarCarrito([]);
            mostrarCarrito();

            mensaje.className = "alert alert-success mt-4";
            mensaje.textContent =
                "Pago simulado exitosamente. " +
                "Se actualizó el stock de demostración. " +
                "No se realizó ningún cobro real.";
        });

    mostrarCarrito();
}
