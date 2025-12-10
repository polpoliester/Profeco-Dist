// Archivo: app.js

const usuarioId = 1;
const mainView = document.getElementById("mainView");

// Botones del menú
const btnWishlist = document.getElementById("btnWishlist");
const btnNotifs = document.getElementById("btnNotifs");
// 1. OBTENER REFERENCIA DEL NUEVO BOTÓN
const btnFavoritos = document.getElementById("btnFavoritos");

// Función para cargar vistas HTML parciales
async function loadView(path) {
    const html = await fetch(path).then(r => r.text());
    mainView.innerHTML = html;
}

// Función auxiliar para gestionar la activación de botones
function activateButton(activeButton) {
    [btnWishlist, btnNotifs, btnFavoritos].forEach(btn => {
        btn.classList.remove("primary");
    });
    activeButton.classList.add("primary");
}

// EVENTOS DE NAVEGACIÓN
btnWishlist.onclick = () => {
    activateButton(btnWishlist);

    loadView("src/views/wishlistView.html").then(() => {
        import("./js/wishlist.js").then(mod => mod.initWishlist(usuarioId));
    });
};

btnNotifs.onclick = () => {
    activateButton(btnNotifs);

    loadView("src/views/notificacionesView.html").then(() => {
        import("./js/notificaciones.js").then(mod => mod.initNotificaciones(usuarioId));
    });
};

// 2. NUEVO EVENTO PARA MERCADOS FAVORITOS
btnFavoritos.onclick = () => {
    activateButton(btnFavoritos);

    // Cargar la vista HTML y luego el script JS
    loadView("src/views/mercadosFavoritos.html").then(() => {
        import("./js/favoritos.js").then(mod => mod.initFavoritos(usuarioId));
    });
};

// Cargar vista por defecto
btnWishlist.click();