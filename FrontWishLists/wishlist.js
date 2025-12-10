import { api } from "./api.js";

export function initWishlist(usuarioId) {
    const input = document.getElementById("wishlistInput");
    const btnAgregar = document.getElementById("btnAgregarWishlist");
    const table = document.getElementById("wishlistTable");

    async function cargar() {
        const res = await api.getWishlist(usuarioId);
        table.innerHTML = "";

        if (!res.ok || res.data.length === 0) {
            table.innerHTML = `<tr><td colspan="3" class="empty-row">No hay productos</td></tr>`;
            return;
        }

        res.data.forEach(item => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td><input class="edit-input" value="${item.nombreProducto}" disabled></td>
                <td>
                    <button class="btn small btnEditar">✏️</button>
                </td>
                <td>
                    <button class="btn small btnEliminar">❌</button>
                </td>
            `;

            const inputEdit = tr.querySelector(".edit-input");
            const btnEditar = tr.querySelector(".btnEditar");
            const btnEliminar = tr.querySelector(".btnEliminar");

            // Editar
            btnEditar.onclick = async () => {
                if (btnEditar.dataset.editing === "true") {
                    // Guardar cambios
                    await api.updateWishlist(item.id, {
                        nombreProducto: inputEdit.value.trim()
                    });
                    btnEditar.dataset.editing = "false";
                    btnEditar.textContent = "✏️";
                    inputEdit.disabled = true;
                    cargar();
                } else {
                    // Entrar en modo edición
                    btnEditar.dataset.editing = "true";
                    btnEditar.textContent = "💾";
                    inputEdit.disabled = false;
                    inputEdit.focus();
                }
            };

            // Eliminar
            btnEliminar.onclick = async () => {
                if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
                await api.deleteWishlist(item.id);
                cargar();
            };

            table.appendChild(tr);
        });
    }

    // Agregar
    btnAgregar.onclick = async () => {
        const nombre = input.value.trim();
        if (!nombre) return alert("Escribe un nombre");

        // Validar duplicados
        const res = await api.getWishlist(usuarioId);
        if (res.data.some(p => p.nombreProducto.toLowerCase() === nombre.toLowerCase())) {
            return alert("Ese producto ya está en la wishlist");
        }

        await api.addWishlist({
            usuarioId,
            nombreProducto: nombre,
            productoId: crypto.randomUUID() // mejor que Date.now()
        });

        input.value = "";
        cargar();
    };

    cargar();
}
