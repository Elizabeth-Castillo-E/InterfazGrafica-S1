/* Módulo de Carrito: exige rol CLIENTE, consulta precios actuales y muestra líneas y totales; permite quitar productos.
 * Al confirmar valida stock de la sucursal, descuenta unidades, registra el pedido y vacía el carrito.
 * El pago es simulado y no procesa cobros.
 */

/* CARRITO Y COMPRA SIMULADA */

if (EssencialAuth.exigirRol("CLIENTE")) {

    document.getElementById("contenidoCarrito").hidden = false;

    const CLAVE_CARRITO = "essencial_carrito";

    const tabla = document.getElementById("tablaCarrito");
    const precioOriginalElemento = document.getElementById("precioOriginalCarrito");
    const descuentoElemento = document.getElementById("descuentoCarrito");
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

    // Multiplica el precio final por la cantidad para el resumen y el pedido.
    function calcularSubtotal(producto, cantidad) {
        return EssencialDatos.calcularPrecioFinal(producto) * cantidad;
    }

    // Muestra las líneas del carrito y calcula el precio original, el descuento y el total.
    function mostrarCarrito() {
        tabla.replaceChildren();

        let precioOriginal = 0;
        let total = 0;
        const carrito = obtenerCarrito();

        carrito.forEach(item => {
            const producto = EssencialDatos.buscarProducto(item.id);
            if (!producto) return;

            const subtotal = calcularSubtotal(producto, item.cantidad);
            precioOriginal += producto.precio * item.cantidad;
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

        precioOriginalElemento.textContent = precioCLP(precioOriginal);
        descuentoElemento.textContent = precioCLP(total - precioOriginal);
        totalElemento.textContent = precioCLP(total);
        document.getElementById("confirmarCompra").disabled =
            carrito.length === 0;
    }

    // Valida el stock de la sucursal y registra el pedido de demostración.
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
                (suma, item) => suma + calcularSubtotal(item.producto, item.cantidad),
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

            // Guarda identidad y precios de esta compra para conservar el detalle histórico.
            const sesion = EssencialAuth.obtenerSesion();
            EssencialDatos.guardarPedido({
                id: Date.now(),
                usuario: sesion.usuario,
                nombreCliente: sesion.nombre,
                emailCliente: sesion.email,
                fecha: new Date().toISOString(),
                sucursal,
                total,
                productos: detalles.map(({ producto, cantidad }) => ({
                    id: producto.id,
                    nombre: producto.nombre,
                    codigo: producto.codigo,
                    cantidad,
                    precioOriginal: producto.precio,
                    descuento: producto.descuento,
                    precioUnitario: EssencialDatos.calcularPrecioFinal(producto),
                    subtotal: calcularSubtotal(producto, cantidad)
                }))
            });

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
