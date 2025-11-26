import { api } from "./api.js";

export function initWishlist(usuarioId) {
    const input = document.getElementById("wishlistInput");
    const btnAgregar = document.getElementById("btnAgregarWishlist");
    const table = document.getElementById("wishlistTable");

    async function cargar() {
        const res = await api.getWishlist(usuarioId);
        table.innerHTML = "";

        if (!res.ok || res.data.length === 0) {
            table.innerHTML = `<tr><td colspan="2" class="empty-row">No hay productos</td></tr>`;
            return;
        }

        res.data.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.nombreProducto}</td>
                <td><button class="btn small">❌</button></td>
            `;
            tr.querySelector("button").onclick = async () => {
                await api.deleteWishlist(item.id);
                cargar();
            };
            table.appendChild(tr);
        });
    }

    btnAgregar.onclick = async () => {
        const nombre = input.value.trim();
        if (!nombre) return;

        await api.addWishlist({
            usuarioId,
            nombreProducto: nombre,
            productoId: Date.now()
        });

        input.value = "";
        cargar();
    };

    cargar();
}
