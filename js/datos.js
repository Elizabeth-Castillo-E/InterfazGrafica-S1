
/* DATOS SIMULADOS - PERFUMERÍA ESSENCIAL
*/

const EssencialDatos = (() => {
    const CLAVE = "essencial_productos";

    const productosIniciales = [
        {
            id: 1,
            codigo: "FEM-001",
            nombre: "DKNY Be Delicious Fresh Blossom EDP 100 ML",
            categoria: "femeninos",
            descripcion: "Fragancia floral y frutal, fresca y delicada.",
            precio: 59992,
            descuento: 20,
            imagen: "img/productos/femenino-01.jpg",
            stock: { chillan: 10, concepcion: 5, santiago: 8 }
        },
        {
            id: 2,
            codigo: "FEM-002",
            nombre: "La Vie Est Belle Parfum 100 ML",
            categoria: "femeninos",
            descripcion: "Fragancia femenina con notas florales y frutales.",
            precio: 137752,
            descuento: 0,
            imagen: "img/productos/femenino-02.jpg",
            stock: { chillan: 4, concepcion: 3, santiago: 6 }
        },
        {
            id: 3,
            codigo: "FEM-003",
            nombre: "Femme Boss 75 ML",
            categoria: "femeninos",
            descripcion: "Fragancia floral y frutal, suave y elegante.",
            precio: 92990,
            descuento: 20,
            imagen: "img/productos/femenino-03.jpg",
            stock: { chillan: 6, concepcion: 2, santiago: 4 }
        }
    ];

    function iniciar() {
        if (localStorage.getItem(CLAVE) === null) {
            guardar(productosIniciales);
        }
    }

    function obtenerProductos() {
        try {
            return JSON.parse(localStorage.getItem(CLAVE)) || [];
        } catch {
            return [];
        }
    }

    function guardar(productos) {
        localStorage.setItem(CLAVE, JSON.stringify(productos));
    }

    function buscarProducto(id) {
        return obtenerProductos().find(p => p.id === Number(id));
    }

    function guardarProducto(producto) {
        const productos = obtenerProductos();

        const id = Number(producto.id);
        const posicion = productos.findIndex(p => p.id === id);

        if (posicion >= 0) {
            productos[posicion] = producto;
        } else {
            producto.id = Math.max(
                0, ...productos.map(p => p.id)
            ) + 1;

            productos.push(producto);
        }

        guardar(productos);
        return producto;
    }

    function eliminarProducto(id) {
        const productos = obtenerProductos().filter(
            p => p.id !== Number(id)
        );
        guardar(productos);
    }

    function actualizarStock(id, sucursal, cantidad) {
        const producto = buscarProducto(id);

        if (!producto ||
            !["chillan", "concepcion", "santiago"].includes(sucursal) ||
            !Number.isInteger(cantidad) ||
            cantidad < 0) {
            return false;
        }

        producto.stock[sucursal] = cantidad;
        guardarProducto(producto);
        return true;
    }

    iniciar();

    return {
        obtenerProductos,
        buscarProducto,
        guardarProducto,
        eliminarProducto,
        actualizarStock
    };
})();
