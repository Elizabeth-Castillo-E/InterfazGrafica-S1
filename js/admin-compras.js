/* Módulo de compras de clientes: historial general exclusivo del administrador.
 * Consulta EssencialDatos, filtra por usuario y ordena por fecha descendente.
 * Muestra el comprador, sucursal, total y detalle desplegable con precios históricos.
 * Actualizar vuelve a leer el almacenamiento local; no realiza peticiones a un servidor.
 */
if (EssencialAuth.exigirRol("ADMINISTRADOR")) {
    const filtro = document.getElementById("clienteComprasAdmin");
    const tabla = document.getElementById("tablaComprasAdmin");
    const moneda = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
    const fecha = new Intl.DateTimeFormat("es-CL", {
        dateStyle: "short", timeStyle: "short", timeZone: "America/Santiago"
    });
    const sucursales = { chillan: "Chillán", concepcion: "Concepción", santiago: "Santiago" };

    // Los pedidos antiguos no guardaban precios por línea; no se inventan con el catálogo actual.
    function importeHistorico(valor) {
        return Number.isFinite(valor) ? moneda.format(valor) : "No registrado";
    }

    function crearDetalle(pedido) {
        const detalle = document.createElement("details");
        const titulo = document.createElement("summary");
        titulo.textContent = `Ver detalle del pedido #${pedido.id}`;
        detalle.appendChild(titulo);
        const contacto = document.createElement("p");
        contacto.className = "my-2";
        contacto.textContent = `Correo: ${pedido.emailCliente || "No registrado"}`;
        detalle.appendChild(contacto);
        const lista = document.createElement("ul");
        lista.className = "ps-3 mb-0";
        (pedido.productos || []).forEach(item => {
            const linea = document.createElement("li");
            const nombre = item.nombre || EssencialDatos.buscarProducto(item.id)?.nombre || `Producto #${item.id}`;
            linea.textContent = `${nombre}${item.codigo ? ` (${item.codigo})` : ""} · ` +
                `Cantidad: ${item.cantidad} · Precio unitario: ${importeHistorico(item.precioUnitario)} · ` +
                `Descuento: ${Number.isFinite(item.descuento) ? `${item.descuento}%` : "No registrado"} · ` +
                `Subtotal: ${importeHistorico(item.subtotal)}`;
            lista.appendChild(linea);
        });
        detalle.appendChild(lista);
        return detalle;
    }

    // Reconstruye las opciones sin perder el cliente seleccionado y calcula el resumen visible.
    function mostrarCompras() {
        const seleccion = filtro.value;
        const pedidos = EssencialDatos.obtenerPedidos().slice().sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        filtro.replaceChildren();
        const todos = document.createElement("option");
        todos.value = "";
        todos.textContent = "Todos los clientes";
        filtro.appendChild(todos);
        const clientes = [...new Set(pedidos.map(pedido => pedido.usuario))].sort();
        clientes.forEach(usuario => {
            const opcion = document.createElement("option");
            opcion.value = usuario;
            opcion.textContent = usuario;
            filtro.appendChild(opcion);
        });
        filtro.value = clientes.includes(seleccion) ? seleccion : "";
        const visibles = pedidos.filter(pedido => !filtro.value || pedido.usuario === filtro.value);
        tabla.replaceChildren();
        visibles.forEach(pedido => {
            const fila = tabla.insertRow();
            fila.insertCell().textContent = `#${pedido.id}`;
            fila.insertCell().textContent = pedido.nombreCliente
                ? `${pedido.nombreCliente} (${pedido.usuario})` : pedido.usuario;
            const instante = new Date(pedido.fecha);
            fila.insertCell().textContent = Number.isNaN(instante.getTime()) ? "Fecha no registrada" : fecha.format(instante);
            fila.insertCell().textContent = sucursales[pedido.sucursal] || pedido.sucursal || "No registrada";
            fila.insertCell().textContent = importeHistorico(pedido.total);
            fila.insertCell().appendChild(crearDetalle(pedido));
        });
        const total = visibles.reduce((suma, pedido) => suma + (Number.isFinite(pedido.total) ? pedido.total : 0), 0);
        document.getElementById("resumenComprasAdmin").textContent =
            `${visibles.length} compra(s) · Total de ventas simuladas: ${moneda.format(total)}`;
        document.getElementById("sinComprasAdmin").hidden = visibles.length > 0;
        document.getElementById("historialComprasAdmin").hidden = visibles.length === 0;
    }

    filtro.addEventListener("change", mostrarCompras);
    document.getElementById("actualizarComprasAdmin").addEventListener("click", mostrarCompras);
    mostrarCompras();
}
