import { api } from "./api.js";

// Cambiamos 'table' por 'container'
export function initNotificaciones(usuarioId) {
    const container = document.getElementById("notifsContainer");

    async function cargar() {
        const res = await api.getNotifs(usuarioId);
        container.innerHTML = "";

        if (!res.ok || res.data.length === 0) {
            container.innerHTML = `<div class="empty-row" style="text-align:center; padding: 20px; color: #999;">No hay notificaciones</div>`;
            return;
        }

        res.data.forEach(n => {
            // Creamos un DIV que simula una tarjeta de notificación
            const div = document.createElement("div");
            div.className = "card"; 
            div.style.padding = "15px";
            div.style.marginBottom = "0"; // Quitamos el margen inferior para que el gap del contenedor lo maneje

            const estadoBadge = n.leida 
                ? '<span class="pill-success" style="background: #d1fae5; color: #065f46; border-radius: 4px; padding: 3px 8px;">Leída</span>' 
                : '<span class="pill-danger" style="background: #fef3c7; color: #92400e; border-radius: 4px; padding: 3px 8px;">Pendiente</span>';

            const payloadText = JSON.stringify(n.payload, null, 2);

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h3 style="font-size: 16px; color: var(--profeco-primary);">${n.tipo}</h3>
                    ${estadoBadge}
                </div>
                <p style="font-size: 14px; color: var(--profeco-text-light); margin-bottom: 8px;">Contenido:</p>
                <pre style="font-size: 12px; background: #f9f9f9; padding: 8px; border-radius: 4px; border: 1px solid #eee; overflow-x: auto; color: var(--profeco-text);">${payloadText}</pre>
                
                ${!n.leida ? '<button class="btn primary small btnMarcar" style="margin-top: 10px; background: #8B1538; color: white;">Marcar como Leída</button>' : ''}
            `;

            if (!n.leida) {
                div.querySelector(".btnMarcar").onclick = async () => {
                    await api.markNotif(n.id);
                    cargar();
                };
            }

            container.appendChild(div);
        });
    }

    cargar();
}