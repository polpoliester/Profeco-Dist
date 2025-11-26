import { api } from "./api.js";

export function initNotificaciones(usuarioId) {
    const table = document.getElementById("notifsTable");

    async function cargar() {
        const res = await api.getNotifs(usuarioId);
        table.innerHTML = "";

        if (!res.ok || res.data.length === 0) {
            table.innerHTML = `<tr><td colspan="4" class="empty-row">No hay notificaciones</td></tr>`;
            return;
        }

        res.data.forEach(n => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${n.tipo}</td>
                <td><pre style="font-size:0.75rem">${JSON.stringify(n.payload, null, 2)}</pre></td>
                <td>${n.leida ? '<span class="pill-success">Leída</span>' : '<span class="pill-danger">Pendiente</span>'}</td>
                <td>
                    ${!n.leida ? '<button class="btn primary small">Marcar</button>' : ''}
                </td>
            `;

            if (!n.leida) {
                tr.querySelector("button").onclick = async () => {
                    await api.markNotif(n.id);
                    cargar();
                };
            }

            table.appendChild(tr);
        });
    }

    cargar();
}
