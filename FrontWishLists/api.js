const API = "http://localhost:3000";

export const api = {
    getWishlist: (userId) => fetch(`${API}/wishlist/${userId}`).then(r => r.json()),
    addWishlist: (data) =>
        fetch(`${API}/wishlist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    deleteWishlist: (id) =>
        fetch(`${API}/wishlist/${id}`, { method: "DELETE" }).then(r => r.json()),

    getNotifs: (userId) => fetch(`${API}/notificaciones/${userId}`).then(r => r.json()),
    markNotif: (id) =>
        fetch(`${API}/notificaciones/${id}/leida`, { method: "PATCH" })
            .then(r => r.json())
};
