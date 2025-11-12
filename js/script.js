// ====== Datos ======
const categorias = {
    1: {
        nombre: "Macetas",
        productos: [
            { nombre: "Maceta plástica", descripcion: "Maceta plástica chica", precio: 800 },
            { nombre: "Maceta de barro", descripcion: "Maceta mediana de barro", precio: 1500 },
            { nombre: "Maceta colgante", descripcion: "Maceta para balcón", precio: 2000 }
        ]
    },
    2: {
        nombre: "Semillas",
        productos: [
            { nombre: "Semillas de tomate", descripcion: "Variedad perita", precio: 700 },
            { nombre: "Semillas de lechuga", descripcion: "Variedad criolla", precio: 600 },
            { nombre: "Semillas de girasol", descripcion: "Comestible", precio: 900 }
        ]
    },
    3: {
        nombre: "Fertilizantes",
        productos: [
            { nombre: "Fertilizante universal", descripcion: "Para todo tipo de plantas", precio: 1800 },
            { nombre: "Fertilizante orgánico", descripcion: "100% natural", precio: 2200 },
            { nombre: "Activador de floración", descripcion: "Alta concentración", precio: 2500 }
        ]
    }
};

let carrito = [];
let usuario = "";
let password = "";

// ====== Funciones ======

function inicioSesion() {
    alert("Bienvenido al simulador de E-Commerce de Jardinería");

    usuario = prompt("Ingrese su nombre de usuario:");
    while (!usuario) {
        usuario = prompt("Debe ingresar un nombre de usuario.");
    }

    password = prompt("Ingrese su contraseña:");
    while (!password) {
        password = prompt("Debe ingresar una contraseña.");
    }

    alert("Inicio de sesión correcto. Bienvenido " + usuario + "!");
    return true;
}

function menuPrincipal() {
    let opcion;
    do {
        opcion = prompt(
        "=== MENÚ PRINCIPAL ===\n" +
        "1 - Explorar Tienda\n" +
        "2 - Ver Carrito\n" +
        "3 - Salir\n" +
        "Ingrese una opción:"
        );

        switch (opcion) {
        case "1":
            explorarTienda();
            break;
        case "2":
            verCarrito();
            break;
        case "3":
            alert("Gracias por visitar la tienda. ¡Hasta luego!");
            return;
        default:
            alert("Opción inválida. Intente nuevamente.");
        }
    } while (opcion !== "3");
}

function explorarTienda() {
    let salir = false;
    while(salir==false) {
        let mensaje = "=== CATEGORÍAS ===\n";
        for (let id in categorias) {
            mensaje += id + " - " + categorias[id].nombre + "\n";
        }
        mensaje += "CANCELAR - Volver al menú principal";

        let categoriaElegida = prompt(mensaje);

        if (categoriaElegida === "0" || categoriaElegida === null)
            salir=true;
        else if (categorias[categoriaElegida]) {
            explorarCategoria(categorias[categoriaElegida]);
        } else {
            alert("Opción inválida. Intente nuevamente.");
        }
    }
}

function explorarCategoria(categoria) {
    let salir = false;

    while (!salir) {
        let lista = "=== " + categoria.nombre + " ===\n";

        for (let i = 0; i < categoria.productos.length; i++) {
            let p = categoria.productos[i];
            lista += (i + 1) + " - " + p.nombre + " ($" + p.precio + ")\n";
        }

        lista += "CANCELAR - Volver a categorías";

        let opcion = prompt(lista);

        if (opcion === null || opcion === "0") {
            salir = true;
        } else {
            let indice = parseInt(opcion) - 1;
            let producto = categoria.productos[indice];

            if (producto) {
                let cantidad = parseInt(prompt("Ingrese cantidad de '" + producto.nombre + "':"));
                if (!isNaN(cantidad) && cantidad > 0) {
                    let total = producto.precio * cantidad;
                    let confirmar = confirm("Agregar " + cantidad + " x " + producto.nombre + " al carrito (Total: $" + total + ")?");

                    if (confirmar) {
                        carrito.push({ producto: producto, cantidad: cantidad });
                        alert(cantidad + " x " + producto.nombre + " agregado al carrito por $" + total + ".");

                        //let siguiente = prompt(
                        //    "¿Qué desea hacer ahora?\n" +
                        //    "1 - Seguir comprando en esta categoría\n" +
                        //    "2 - Ir al carrito\n" +
                        //    "3 - Volver al menú principal"
                        //);
//
                        //if (siguiente === "2") {
                        //    verCarrito();
                        //} else if (siguiente === "3") {
                        //    salir = true;
                        //}
                    }
                } else {
                alert("Cantidad inválida.");
                }
            } else {
                alert("Opción inválida.");
            }
        }
    }
}



function verCarrito() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let total = 0;
    let resumen = "=== CARRITO DE COMPRAS ===\n";
    for(let i=0;i<carrito.length;i++){
        let subtotal = carrito[i].producto.precio * carrito[i].cantidad;
        total+=subtotal;
        resumen += carrito[i].cantidad + " x " + carrito[i].producto.nombre + " = $" + subtotal + "\n";
    }
    resumen += "\nTOTAL: $" + total;

    let opcion = confirm(resumen + "\n\n¿Desea confirmar la compra?");

    if (opcion === true) {
        let confirmacion = prompt("Ingrese su contraseña para confirmar la compra:");
        let passValida=false;

        if(confirmacion==password){
            passValida=true;
            alert("Compra confirmada. ¡Gracias por su compra!");
            carrito = [];
        } else if(confirmacion===null){
            passValida=true;
            alert("Compra cancelada.");
        }
        while(passValida==false){
            confirmacion = prompt("Contraseña incorrecta. Intente nuevamente:");
            if(confirmacion==password){
                passValida=true;
                alert("Compra confirmada. ¡Gracias por su compra!");
                carrito = [];
            } else if(confirmacion===null){
                passValida=true;
                alert("Compra cancelada.");
            }
        }
    }
}

// ====== Ejecución ======
if (inicioSesion()) {
    menuPrincipal();
}
