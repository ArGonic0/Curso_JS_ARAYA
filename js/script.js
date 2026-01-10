// ====== Datos ======
const categorias = {
    1: {
        nombre: "Macetas",
        productos: [
            { id: 101, nombre: "Maceta plástica", descripcion: "Maceta plástica chica", precio: 800 },
            { id: 102, nombre: "Maceta de barro", descripcion: "Maceta mediana de barro", precio: 1500 },
            { id: 103, nombre: "Maceta colgante", descripcion: "Maceta para balcón", precio: 2000 }
        ]
    },
    2: {
        nombre: "Semillas",
        productos: [
            { id: 201, nombre: "Semillas de tomate", descripcion: "Variedad perita", precio: 700 },
            { id: 202, nombre: "Semillas de lechuga", descripcion: "Variedad criolla", precio: 600 },
            { id: 203, nombre: "Semillas de girasol", descripcion: "Comestible", precio: 900 }
        ]
    },
    3: {
        nombre: "Fertilizantes",
        productos: [
            { id: 301, nombre: "Fertilizante universal", descripcion: "Para todo tipo de plantas", precio: 1800 },
            { id: 302, nombre: "Fertilizante orgánico", descripcion: "100% natural", precio: 2200 },
            { id: 303, nombre: "Activador de floración", descripcion: "Alta concentración", precio: 2500 }
        ]
    }
};

// ====== Variables Globales y del DOM ======
let carrito = [];
let usuario = "";
let password = "";

const TIEMPO_INACTIVIDAD = 5 * 60 * 1000; // 5 minutos
let timeoutSesion = null;
let intervaloTimerVisual = null;
let tiempoRestante = TIEMPO_INACTIVIDAD;


const productContainer = document.getElementById('productContainer');
const backToCategoriesBtn = document.getElementById('backToCategoriesBtn');
const cartItemsContainer = document.getElementById('cartItems');
const cartCountSpan = document.getElementById('cartCount');
const cartTotalSpan = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const userInfoDiv = document.getElementById('userInfo');
const closeBtn = document.getElementById('closeBtn');

let categoriaActual = null; // Para saber si estamos viendo categorías o productos

// ====== Funciones de Storage y Sesion ======

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
}

function guardarSesion(user, pass) {
    localStorage.setItem('usuario', user);
    localStorage.setItem('password', pass);
}

function cargarSesion() {
    usuario = localStorage.getItem('usuario');
    password = localStorage.getItem('password');
    return usuario && password;
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('password');
    localStorage.removeItem('carrito');
    location.reload();
}


function escucharActividadUsuario() {
    const eventos = ["click", "keydown", "scroll"];

    eventos.forEach(evento => {
        document.addEventListener(evento, reiniciarTimeoutSesion);
    });
}

function formatearTiempo(ms) {
    const totalSegundos = Math.floor(ms / 1000);
    const minutos = String(Math.floor(totalSegundos / 60)).padStart(2, "0");
    const segundos = String(totalSegundos % 60).padStart(2, "0");
    return `Tiempo restante: ${minutos}:${segundos}`;
}

function iniciarTimerVisual() {
    const timerDiv = document.getElementById("sessionTimer");

    if (intervaloTimerVisual) {
        clearInterval(intervaloTimerVisual);
    }

    tiempoRestante = TIEMPO_INACTIVIDAD;
    timerDiv.textContent = formatearTiempo(tiempoRestante);

    intervaloTimerVisual = setInterval(() => {
        tiempoRestante -= 1000;

        if (tiempoRestante <= 0) {
            clearInterval(intervaloTimerVisual);
            timerDiv.textContent = "00:00";
            return;
        }

        timerDiv.textContent = formatearTiempo(tiempoRestante);
    }, 1000);
}

function reiniciarTimeoutSesion() {
    if (timeoutSesion) {
        clearTimeout(timeoutSesion);
    }

    timeoutSesion = setTimeout(() => {
        swal.fire({
            icon: "info",
            title: "Sesión cerrada por inactividad."
        });
        cerrarSesion();
    }, TIEMPO_INACTIVIDAD);
    iniciarTimerVisual();
}

// ====== Funciones de Tienda ======

function mostrarCategorias() {
    categoriaActual = null;
    productContainer.innerHTML = '<h3>Elige una categoría:</h3>';
    backToCategoriesBtn.classList.add('hidden');

    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'category-grid'; 

    for (let id in categorias) {
        const categoria = categorias[id];
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-card';
        categoryDiv.innerHTML = `
            <h4>${categoria.nombre}</h4>
            <p>(${categoria.productos.length} productos)</p>
        `;
        categoryDiv.addEventListener('click', () => explorarCategoria(categoria));
        categoryGrid.appendChild(categoryDiv);
    }
    productContainer.appendChild(categoryGrid);
}

function explorarCategoria(categoria) {
    categoriaActual = categoria;
    productContainer.innerHTML = `<h3>Productos en ${categoria.nombre}</h3>`;
    backToCategoriesBtn.classList.remove('hidden');

    const productList = document.createElement('div');
    productList.className = 'product-list';

    categoria.productos.forEach(producto => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h4>${producto.nombre}</h4>
            <p>${producto.descripcion}</p>
            <p class="price">**$${producto.precio}**</p>
            <input type="number" min="1" value="1" id="qty-${producto.id}" class="product-qty">
            <button data-product-id="${producto.id}" class="addToCartBtn">Agregar</button>
        `;
        
        const btn = productCard.querySelector('.addToCartBtn');
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.productId);
            const qtyInput = document.getElementById(`qty-${id}`);
            const cantidad = parseInt(qtyInput.value);
            
            if (!isNaN(cantidad) && cantidad > 0) {
                agregarAlCarrito(producto, cantidad);
                qtyInput.value = 1; // Resetear cantidad
            } else {
                Swal.fire({
                    icon: "error",
                    text: "Cantidad Invalida."
                });
            }
        });
        productList.appendChild(productCard);
    });

    productContainer.appendChild(productList);
}

function agregarAlCarrito(producto, cantidad) {
    const total = producto.precio * cantidad;
    const itemExistente = carrito.find(item => item.producto.id === producto.id);

    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        carrito.push({ producto: producto, cantidad: cantidad });
    }

    guardarCarrito();
    actualizarCarritoDOM();
}

function actualizarCarritoDOM() {
    let total = 0;
    cartItemsContainer.innerHTML = ''; 

    if (carrito.length === 0) {
        emptyCartMessage.style.display = 'block';
        checkoutBtn.disabled = true;
    } else {
        emptyCartMessage.style.display = 'none';
        checkoutBtn.disabled = false;
        
        carrito.forEach((item, index) => {
            const subtotal = item.producto.precio * item.cantidad;
            total += subtotal;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <p>${item.cantidad} x ${item.producto.nombre}</p>
                <p>Total: **$${subtotal}**</p>
                <button data-index="${index}" class="removeItemBtn">Quitar</button>
            `;
            
            itemDiv.querySelector('.removeItemBtn').addEventListener('click', (e) => {
                quitarDelCarrito(parseInt(e.target.dataset.index));
            });
            
            cartItemsContainer.appendChild(itemDiv);
        });
    }

    cartCountSpan.textContent = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartTotalSpan.textContent = total;
}

function quitarDelCarrito(index) {
    Swal.fire({
        title: "Quitar producto",
        text: "¿Seguro que desea quitar este ítem?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, quitar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            carrito.splice(index, 1);
            guardarCarrito();
            actualizarCarritoDOM();
        }
    });
}
function finalizarCompra() {
    if (carrito.length === 0) return;

    Swal.fire({
        title: "Confirmar compra",
        html: `
            <p>Total a pagar: <strong>$${cartTotalSpan.textContent}</strong></p>
            <input id="swal-pass-confirm" type="password" class="swal2-input" placeholder="Ingrese su contraseña">
        `,
        confirmButtonText: "Confirmar",
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const pass = document.getElementById("swal-pass-confirm").value;
            if (!pass) {
                Swal.showValidationMessage("Debe ingresar su contraseña");
                return false;
            }
            return pass;
        }
    }).then(result => {

        if (!result.isConfirmed) return;

        const passIngresada = result.value;

        if (passIngresada !== password) {
            Swal.fire({
                icon: "error",
                title: "Contraseña incorrecta",
                text: "Intente nuevamente."
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Compra confirmada",
            text: "¡Gracias por su compra!"
        });

        carrito = [];
        guardarCarrito();
        actualizarCarritoDOM();
    });
}


// ====== Funciones de Sesión ======

function inicioSesion() {
    if (cargarSesion()) {
        Swal.fire({
            text: `Bienvenido de vuelta, ${usuario}.`
        });
        closeBtn.classList.remove('hidden');
        userInfoDiv.textContent = `Usuario: ${usuario}`;
        return true;
    }

    Swal.fire({
        title: 'Ingreso de sesión',
        html: `
            <input id="swal-user" class="swal2-input" placeholder="Usuario">
            <input id="swal-pass" type="password" class="swal2-input" placeholder="Contraseña">
        `,
        focusConfirm: false,
        confirmButtonText: 'Ingresar',
        preConfirm: () => {
            const user = document.getElementById('swal-user').value;
            const pass = document.getElementById('swal-pass').value;

            if (!user || !pass) {
                Swal.showValidationMessage("Debe completar ambos campos");
                return false;
            }
            return { user, pass };
        }
    }).then(result => {
        if (!result.isConfirmed) return;

        const { user, pass } = result.value;

        usuario = user;
        password = pass;
        guardarSesion(usuario, password);

        Swal.fire({
            icon: 'success',
            title: 'Sesión iniciada',
            text: `Bienvenido ${usuario}`
        });
        userInfoDiv.textContent = `Usuario: ${usuario}`;
        closeBtn.classList.remove('hidden');
        escucharActividadUsuario();
        reiniciarTimeoutSesion();
    });
    return true;
}

// ====== Clima y locacion ======
function obtenerClimaConUbicacion() {
    if (!navigator.geolocation) {
        console.error("Geolocalización no soportada");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Error al obtener el clima");
                }

                const data = await response.json();

                const temp = data.current.temperature_2m;
                //const temp= 50; // Valor fijo para pruebas
                let recomendacion = " Evite regar las plantas en las horas de mayor intensidad del sol.";
                if(temp>30){
                    recomendacion = " 🔥 Recuerde regar las plantas con frecuencia debido al calor.";
                }
                else if(temp<10){
                    recomendacion = " ❄️ Proteja sus plantas del frío.";
                }

                document.getElementById("clima").innerHTML = `
                    🌡️ Temperatura Actual: ${temp}°C ${recomendacion}
                `;
        } catch (error) {
            console.error(error);
        }
        },
        (error) => {
            console.error("Permiso de ubicación denegado", error);
        }
    );
}


// ====== Inicio ======

function init() {
    if (inicioSesion()) {
        cargarCarrito();
        actualizarCarritoDOM();
        mostrarCategorias();
        
        obtenerClimaConUbicacion();
        
        // Asignar eventos a botones globales
        backToCategoriesBtn.addEventListener('click', mostrarCategorias);
        checkoutBtn.addEventListener('click', finalizarCompra);
        closeBtn.addEventListener('click', cerrarSesion);

        escucharActividadUsuario();
        reiniciarTimeoutSesion();
    }
}






// ====== Ejecución ======
init();