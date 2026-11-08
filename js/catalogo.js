
/* CATÁLOGO DINÁMICO */

const contenedorCatalogo = document.getElementById("catalogoDinamico");

if (contenedorCatalogo) {

    const categoria = contenedorCatalogo.dataset.categoria;

    const productos = EssencialDatos.obtenerProductos()
        .filter(p => p.categoria === categoria);

    const precioCLP = numero => new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(numero);

    contenedorCatalogo.replaceChildren();

    if (productos.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "No hay productos en esta categoría.";
        contenedorCatalogo.appendChild(mensaje);
    }

    productos.forEach(p => {

        const columna = document.createElement("div");
        columna.className = "col-12 col-md-6 col-lg-4";

        const tarjeta = document.createElement("article");
        tarjeta.className = "producto";

        const imagen = document.createElement("img");
        imagen.src = p.imagen;
        imagen.alt = p.nombre;

        const titulo = document.createElement("h2");
        titulo.textContent = p.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = p.descripcion;

        const precio = document.createElement("p");
        precio.className = "precio";
        precio.textContent = precioCLP(EssencialDatos.calcularPrecioFinal(p));

        tarjeta.append(imagen, titulo, descripcion);

        if (p.descuento > 0) {
            const precios = document.createElement("div");
            precios.className = "contenedor-precios";

            const precioAnterior = document.createElement("del");
            precioAnterior.className = "precio-anterior";
            precioAnterior.textContent = precioCLP(p.precio);
            precios.append(precioAnterior, precio);

            const descuento = document.createElement("span");
            descuento.className = "descuento";
            descuento.textContent = `${p.descuento}% de descuento`;
            tarjeta.append(precios, descuento);
        } else {
            tarjeta.appendChild(precio);
        }

        const stock = document.createElement("p");
        stock.textContent =
            `Chillán: ${p.stock.chillan} | ` +
            `Concepción: ${p.stock.concepcion} | ` +
            `Santiago: ${p.stock.santiago}`;

        tarjeta.appendChild(stock);

        const sesion = EssencialAuth.obtenerSesion();

        if (sesion && sesion.rol === "CLIENTE") {
            const boton = document.createElement("button");
            boton.className = "btn btn-danger mb-3";
            boton.textContent = "Agregar al carrito";

            boton.addEventListener("click", () => {
                agregarAlCarrito(p.id);
            });

            tarjeta.appendChild(boton);
        }

        columna.appendChild(tarjeta);
        contenedorCatalogo.appendChild(columna);
    });
}

function agregarAlCarrito(id) {
    const carrito = JSON.parse(
        localStorage.getItem("essencial_carrito") || "[]"
    );

    const existente = carrito.find(item => item.id === id);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ id, cantidad: 1 });
    }

    localStorage.setItem(
        "essencial_carrito",
        JSON.stringify(carrito)
    );

    alert("Producto agregado al carrito de demostración.");
}
