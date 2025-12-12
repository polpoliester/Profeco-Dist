const API_GATEWAY = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

if (!token || !usuario) {
    window.location.href = 'index.html';
}

const marketSelect = document.getElementById('market-select');
const reviewForm = document.getElementById('review-form');
const reviewsList = document.getElementById('reviews-list');

async function cargarSupermercados() {
    try {
        const response = await fetch(`${API_GATEWAY}/ofertas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const resultado = await response.json();
        
        if (resultado.success && resultado.data) {
            const supermercados = new Set();
            resultado.data.forEach(oferta => {
                supermercados.add(oferta.supermercado);
            });
            
            marketSelect.innerHTML = '<option value="">Selecciona un supermercado</option>';
            
            Array.from(supermercados).sort().forEach(nombre => {
                const option = document.createElement('option');
                option.value = nombre;
                option.textContent = nombre;
                marketSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando supermercados:', error);
        marketSelect.innerHTML = '<option value="">Error al cargar supermercados</option>';
    }
}

async function cargarResenas() {
    try {
        const response = await fetch(`${API_GATEWAY}/resenas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const resultado = await response.json();
        
        console.log('Resenas cargadas:', resultado);
        
        if (resultado.success && resultado.data) {
            mostrarResenas(resultado.data);
        } else {
            reviewsList.innerHTML = '<li>No hay resenas disponibles</li>';
        }
    } catch (error) {
        console.error('Error cargando resenas:', error);
        reviewsList.innerHTML = '<li>Error al cargar resenas. Verifica que el backend este corriendo.</li>';
    }
}

function mostrarResenas(resenas) {
    if (resenas.length === 0) {
        reviewsList.innerHTML = '<li>No hay resenas disponibles. Se el primero en dejar una.</li>';
        return;
    }
    
    reviewsList.innerHTML = '';
    
    resenas.forEach(resena => {
        const li = document.createElement('li');
        const estrellas = '★'.repeat(resena.calificacion) + '☆'.repeat(5 - resena.calificacion);
        const fecha = new Date(resena.createdAt || resena.created_at).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        li.innerHTML = `
            <div style="margin-bottom: 8px;">
                <strong>${resena.supermercado}</strong>
                <span style="color: #f59e0b; margin-left: 8px;">${estrellas}</span>
                <span style="color: #666; font-size: 12px; margin-left: 8px;">${fecha}</span>
            </div>
            ${resena.comentario ? `<div style="color: #666; font-size: 14px;">${resena.comentario}</div>` : ''}
        `;
        
        reviewsList.appendChild(li);
    });
}

reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const supermercado = marketSelect.value;
    const calificacion = parseInt(document.getElementById('rating').value);
    const comentario = document.getElementById('comment').value;
    
    if (!supermercado) {
        alert('Por favor selecciona un supermercado');
        return;
    }
    
    if (!calificacion) {
        alert('Por favor selecciona una calificacion');
        return;
    }
    
    try {
        const datos = {
            usuarioId: usuario.id,
            supermercadoId: Math.floor(Math.random() * 1000),
            supermercado: supermercado,
            calificacion: calificacion,
            comentario: comentario
        };
        
        console.log('Enviando resena:', datos);
        
        const response = await fetch(`${API_GATEWAY}/resenas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });
        
        const resultado = await response.json();
        
        console.log('Respuesta:', resultado);
        
        if (resultado.success) {
            alert('Resena enviada exitosamente');
            reviewForm.reset();
            cargarResenas();
        } else {
            alert('Error al enviar resena: ' + (resultado.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar la resena');
    }
});

cargarSupermercados();
cargarResenas();