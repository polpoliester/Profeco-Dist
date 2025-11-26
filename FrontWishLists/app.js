const usuarioId = 1;
const mainView = document.getElementById("mainView");

// Botones del menú
const btnWishlist = document.getElementById("btnWishlist");
const btnNotifs = document.getElementById("btnNotifs");

// Función para cargar vistas HTML parciales
async function loadView(path) {
    const html = await fetch(path).then(r => r.text());
    mainView.innerHTML = html;
}

// EVENTOS DE NAVEGACIÓN
btnWishlist.onclick = () => {
    btnWishlist.classList.add("primary");
    btnNotifs.classList.remove("primary");

    loadView("src/views/wishlistView.html").then(() => {
        import("./js/wishlist.js").then(mod => mod.initWishlist(usuarioId));
    });
};

btnNotifs.onclick = () => {
    btnWishlist.classList.remove("primary");
    btnNotifs.classList.add("primary");

    loadView("src/views/notificacionesView.html").then(() => {
        import("./js/notificaciones.js").then(mod => mod.initNotificaciones(usuarioId));
    });
};

// Cargar vista por defecto
btnWishlist.click();
