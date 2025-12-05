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

// ====== Funciones de Storage ======

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
                alert("Cantidad inválida.");
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
    alert(`${cantidad} x ${producto.nombre} agregado al carrito por $${total}.`);
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
    if (confirm(`¿Está seguro de querer quitar ${carrito[index].producto.nombre} del carrito?`)) {
        carrito.splice(index, 1);
        guardarCarrito();
        actualizarCarritoDOM();
    }
}

function finalizarCompra() {
    if (carrito.length === 0) return;

    let confirmacion = prompt(`Ingrese su contraseña para confirmar la compra por un total de $${cartTotalSpan.textContent}:`);
    
    if (confirmacion === password) {
        alert("Compra confirmada. ¡Gracias por su compra!");
        carrito = [];
        guardarCarrito();
        actualizarCarritoDOM();
    } else if (confirmacion === null) {
        alert("Compra cancelada.");
    } else {
        while (confirmacion !== password && confirmacion !== null) {
            confirmacion = prompt("Contraseña incorrecta. Intente nuevamente:");
            if (confirmacion === password) {
                alert("Compra confirmada. ¡Gracias por su compra!");
                carrito = [];
                guardarCarrito();
                actualizarCarritoDOM();
                break;
            } else if (confirmacion === null) {
                alert("Compra cancelada.");
                break;
            }
        }
    }
}

// ====== Funciones de Sesión ======

function inicioSesion() {
    if (cargarSesion()) {
        alert(`Bienvenido de vuelta, ${usuario}.`);
        closeBtn.classList.remove('hidden');
        return true;
    }

    alert("Bienvenido al simulador de E-Commerce de Jardinería\nPor favor, inicie sesión (cualquier usuario y contraseña son válidos).");

    let user = prompt("Ingrese su nombre de usuario:");
    while (!user) {
        user = prompt("Debe ingresar un nombre de usuario.");
    }

    let pass = prompt("Ingrese su contraseña:");
    while (!pass) {
        pass = prompt("Debe ingresar una contraseña.");
    }
    
    usuario = user;
    password = pass;
    guardarSesion(usuario, password);
    
    alert(`Inicio de sesión correcto. Bienvenido ${usuario}!`);

    closeBtn.classList.remove('hidden');    

    return true;
}

// ====== Inicio ======

function init() {
    if (inicioSesion()) {
        userInfoDiv.textContent = `Usuario: ${usuario}`;
        cargarCarrito();
        actualizarCarritoDOM();
        mostrarCategorias();
        
        // Asignar eventos a botones globales
        backToCategoriesBtn.addEventListener('click', mostrarCategorias);
        checkoutBtn.addEventListener('click', finalizarCompra);
        closeBtn.addEventListener('click', cerrarSesion);
    }
}



// ====== Ejecución ======
init();