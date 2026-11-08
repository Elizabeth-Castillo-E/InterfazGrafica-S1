/* Módulo de Historial: exige CLIENTE y filtra los pedidos de EssencialDatos según la cuenta de EssencialAuth.
 * Ordena del más reciente al más antiguo, muestra fecha, sucursal, productos y total o un estado vacío.
 * Usa los nombres guardados en el pedido aunque cambie el catálogo.
 */
/* Historial de compras simuladas del cliente. */

// Muestra los pedidos de la cuenta activa, del más reciente al más antiguo.
if (EssencialAuth.exigirRol("CLIENTE")) {
    const { usuario } = EssencialAuth.obtenerSesion();
    const pedidos = EssencialDatos.obtenerPedidos()
        .filter(pedido => pedido?.usuario === usuario)
        .reverse();

    const sucursales = {
        chillan: "Chillán",
        concepcion: "Concepción",
        santiago: "Santiago"
    };
    const fechaCL = new Intl.DateTimeFormat("es-CL", { dateStyle: "short" });
    const precioCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
    const tabla = document.getElementById("tablaCompras");

    pedidos.forEach(pedido => {
        const fila = tabla.insertRow();
        fila.insertCell().textContent = `#${pedido.id}`;
        fila.insertCell().textContent = fechaCL.format(new Date(pedido.fecha));
        fila.insertCell().textContent = sucursales[pedido.sucursal];

        const lista = document.createElement("ul");
        lista.className = "mb-0 ps-3";
        pedido.productos.forEach(item => {
            const producto = document.createElement("li");
            // Los pedidos anteriores solo guardaban el ID y la cantidad.
            const nombre = item.nombre || EssencialDatos.buscarProducto(item.id)?.nombre || `Producto #${item.id}`;
            producto.textContent = `${cantidadTexto(item.cantidad)} · ${nombre}`;
            lista.appendChild(producto);
        });
        fila.insertCell().appendChild(lista);
        fila.insertCell().textContent = precioCLP.format(pedido.total);
    });

    function cantidadTexto(cantidad) {
        return cantidad === 1 ? "1 unidad" : `${cantidad} unidades`;
    }

    document.getElementById("sinCompras").hidden = pedidos.length > 0;
    document.getElementById("historialCompras").hidden = pedidos.length === 0;
    document.getElementById("contenidoCompras").hidden = false;
}
