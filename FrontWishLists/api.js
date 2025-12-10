// Archivo: api.js

const API = "http://localhost:3000";

export const api = {
    // --- Wishlist CRUD ---
    getWishlist: (userId) => fetch(`${API}/wishlist/${userId}`).then(r => r.json()),
    addWishlist: (data) =>
        fetch(`${API}/wishlist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    // FUNCIÓN AGREGADA para actualizar el producto en la Wishlist
    updateWishlist: (id, data) =>
        fetch(`${API}/wishlist/${id}`, {
            method: "PATCH", // Se usa PATCH para actualizar un recurso existente
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    deleteWishlist: (id) =>
        fetch(`${API}/wishlist/${id}`, { method: "DELETE" }).then(r => r.json()),

    // --- Notificaciones ---
    getNotifs: (userId) => fetch(`${API}/notificaciones/${userId}`).then(r => r.json()),
    markNotif: (id) =>
        fetch(`${API}/notificaciones/${id}/leida`, { method: "PATCH" })
            .then(r => r.json()),

    // --- Mercados Favoritos CRUD (Nuevas Funciones) ---
    getFavoritos: (userId) => fetch(`${API}/favoritos/${userId}`).then(r => r.json()),
    addFavorito: (data) =>
        fetch(`${API}/favoritos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    deleteFavorito: (id) =>
        fetch(`${API}/favoritos/${id}`, { method: "DELETE" }).then(r => r.json()),
};