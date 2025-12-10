// Archivo: favoritos.js

import { api } from "./api.js";

function crearTarjetaFavorito(item) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cursor = 'default';

    card.innerHTML = `
        <div class="product-image" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            🏬
        </div>
        <div class="product-info">
            <div class="product-name">${item.nombre}</div>
            <button class="btn small btnEliminar" style="background: #ef4444;">❌ Eliminar</button>
        </div>
    `;

    // Eliminar
    card.querySelector(".btnEliminar").onclick = async () => {
        if (!confirm("¿Seguro que deseas eliminar este mercado favorito?")) return;
        await api.deleteFavorito(item.id); 
        // Llamar a la función de recarga después de eliminar
        document.getElementById("favoritosContainer").innerHTML = ""; 
        cargar();
    };

    return card;
}


export function initFavoritos(usuarioId) {
    const select = document.getElementById("selectMercados"); 
    const btnAgregar = document.getElementById("btnAgregarFavorito"); 
    const container = document.getElementById("favoritosContainer"); 

    // Función de carga y renderizado de las tarjetas
    async function cargar() {
        const res = await api.getFavoritos(usuarioId);

        container.innerHTML = "";

        if (!res.ok || res.data.length === 0) {
            container.innerHTML = `<div style="color:#999;text-align:center;padding:20px;">No tienes mercados favoritos</div>`;
            return;
        }

        res.data.forEach(item => {
            container.appendChild(crearTarjetaFavorito(item));
        });
        
        // --- Lógica temporal: Simular datos para el <select> ---
        // Se añade una lista de mercados de ejemplo para que la funcionalidad de "Agregar" funcione en el frontend
        if (select && select.children.length <= 1) { 
            ["Walmart", "Soriana", "Chedraui", "La Comer", "HEB"].forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = m;
                select.appendChild(opt);
            });
            // Añadir una opción por defecto
            select.prepend(new Option("Selecciona un mercado", "", true, true)); 
            select.value = ""; 
        }
    }


    // Lógica para Agregar Favorito
    btnAgregar.onclick = async () => {
        const nombre = select.value; 

        if (!nombre || nombre === "Selecciona un mercado") return alert("Selecciona un mercado");

        const res = await api.getFavoritos(usuarioId);
        if (res.data.some(f => f.nombre.toLowerCase() === nombre.toLowerCase())) {
            return alert("Ese mercado ya es tu favorito");
        }

        await api.addFavorito({
            usuarioId,
            nombre: nombre, 
            mercadoId: crypto.randomUUID() 
        });

        select.value = "";
        cargar();
    };

    cargar();
}