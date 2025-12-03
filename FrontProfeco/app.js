const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
let quejaActual = null;
let precioActual = null;

// Verificar autenticación
if (!token || !usuario || usuario.tipo !== 'profeco') {
    window.location.href = '../FrontConsumidor/index.html';
}

document.getElementById('user-name').textContent = usuario.nombre;

// Manejo de tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        
        if (btn.dataset.tab === 'quejas') {
            cargarQuejas();
        } else if (btn.dataset.tab === 'precios') {
            cargarReportes();
        } else if (btn.dataset.tab === 'estadisticas') {
            cargarEstadisticas();
        }
    });
});

// Cargar quejas
async function cargarQuejas() {
    const loading = document.getElementById('loading-quejas');
    const tabla = document.getElementById('tabla-quejas');
    const noQuejas = document.getElementById('no-quejas');
    const tbody = document.getElementById('quejas-table-body');
    
    try {
        loading.style.display = 'block';
        tabla.style.display = 'none';
        noQuejas.style.display = 'none';
        
        const estado = document.getElementById('filtro-estado-queja').value;
        const tipo = document.getElementById('filtro-tipo-queja').value;
        
        const params = new URLSearchParams();
        if (estado) params.append('estado', estado);
        if (tipo) params.append('tipo', tipo);
        
        const response = await fetch(`${API_URL}/quejas?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const resultado = await response.json();
        
        if (resultado.success && resultado.data) {
            if (resultado.data.length > 0) {
                tbody.innerHTML = '';
                
                resultado.data.forEach(queja => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${formatearFecha(queja.createdAt)}</td>
                        <td>Usuario #${queja.usuarioId}</td>
                        <td>${queja.supermercado}</td>
                        <td><span class="badge">${queja.tipo}</span></td>
                        <td>${queja.titulo}</td>
                        <td>${getBadgeEstadoQueja(queja.estado)}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="abrirModalQueja(${queja.id})">
                                Gestionar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                tabla.style.display = 'block';
            } else {
                noQuejas.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error cargando quejas:', error);
        noQuejas.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

// Cargar reportes de precios
async function cargarReportes() {
    const loading = document.getElementById('loading-precios');
    const tabla = document.getElementById('tabla-precios');
    const noPrecios = document.getElementById('no-precios');
    const tbody = document.getElementById('precios-table-body');
    
    try {
        loading.style.display = 'block';
        tabla.style.display = 'none';
        noPrecios.style.display = 'none';
        
        const estado = document.getElementById('filtro-estado-precio').value;
        
        const params = new URLSearchParams();
        if (estado) params.append('estado', estado);
        
        const response = await fetch(`${API_URL}/reportes?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const resultado = await response.json();
        
        if (resultado.success && resultado.data) {
            if (resultado.data.length > 0) {
                tbody.innerHTML = '';
                
                resultado.data.forEach(reporte => {
                    const diferencia = parseFloat(reporte.precioReal) - parseFloat(reporte.precioPublicado);
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${formatearFecha(reporte.createdAt)}</td>
                        <td>Usuario #${reporte.usuarioId}</td>
                        <td>${reporte.supermercado}</td>
                        <td>${reporte.producto}</td>
                        <td>$${parseFloat(reporte.precioPublicado).toFixed(2)}</td>
                        <td>$${parseFloat(reporte.precioReal).toFixed(2)}</td>
                        <td style="color: ${diferencia > 0 ? '#ef4444' : '#22c55e'}; font-weight: 600;">
                            ${diferencia > 0 ? '+' : ''}$${diferencia.toFixed(2)}
                        </td>
                        <td>${getBadgeEstadoPrecio(reporte.estado)}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="abrirModalPrecio(${reporte.id})">
                                Gestionar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                tabla.style.display = 'block';
            } else {
                noPrecios.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error cargando reportes:', error);
        noPrecios.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

// Cargar estadísticas
async function cargarEstadisticas() {
    const loading = document.getElementById('loading-estadisticas');
    const content = document.getElementById('estadisticas-content');
    
    try {
        loading.style.display = 'block';
        content.style.display = 'none';
        
        const [quejasRes, reportesRes] = await Promise.all([
            fetch(`${API_URL}/quejas/estadisticas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/reportes/estadisticas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);
        
        const quejasData = await quejasRes.json();
        const reportesData = await reportesRes.json();
        
        if (quejasData.success) {
            document.getElementById('stat-total-quejas').textContent = quejasData.data.total || 0;
            const detallesQuejas = quejasData.data.porEstado?.map(e => 
                `${e.estado}: ${e.cantidad}`
            ).join(', ') || 'Sin datos';
            document.getElementById('stat-quejas-detalle').textContent = detallesQuejas;
        }
        
        if (reportesData.success) {
            document.getElementById('stat-total-reportes').textContent = reportesData.data.total || 0;
            const detallesReportes = reportesData.data.porEstado?.map(e => 
                `${e.estado}: ${e.cantidad}`
            ).join(', ') || 'Sin datos';
            document.getElementById('stat-reportes-detalle').textContent = detallesReportes;
        }
        
        content.style.display = 'block';
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    } finally {
        loading.style.display = 'none';
    }
}

// Abrir modal de queja
async function abrirModalQueja(id) {
    try {
        const response = await fetch(`${API_URL}/quejas/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            quejaActual = resultado.data;
            const detalle = document.getElementById('queja-detalle');
            detalle.innerHTML = `
                <div class="detail-item">
                    <strong>Título:</strong> ${quejaActual.titulo}
                </div>
                <div class="detail-item">
                    <strong>Supermercado:</strong> ${quejaActual.supermercado}
                </div>
                <div class="detail-item">
                    <strong>Tipo:</strong> ${quejaActual.tipo}
                </div>
                <div class="detail-item">
                    <strong>Descripción:</strong> ${quejaActual.descripcion}
                </div>
                ${quejaActual.producto ? `
                <div class="detail-item">
                    <strong>Producto:</strong> ${quejaActual.producto}
                </div>
                ` : ''}
                <div class="detail-item">
                    <strong>Estado Actual:</strong> ${quejaActual.estado}
                </div>
                ${quejaActual.respuesta ? `
                <div class="detail-item">
                    <strong>Respuesta:</strong> ${quejaActual.respuesta}
                </div>
                ` : ''}
            `;
            
            document.getElementById('queja-estado').value = quejaActual.estado;
            document.getElementById('queja-respuesta').value = quejaActual.respuesta || '';
            document.getElementById('modal-queja').style.display = 'block';
        }
    } catch (error) {
        console.error('Error cargando queja:', error);
        alert('Error al cargar la queja');
    }
}

// Abrir modal de precio
async function abrirModalPrecio(id) {
    try {
        const response = await fetch(`${API_URL}/reportes/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            precioActual = resultado.data;
            const diferencia = parseFloat(precioActual.precioReal) - parseFloat(precioActual.precioPublicado);
            const detalle = document.getElementById('precio-detalle');
            detalle.innerHTML = `
                <div class="detail-item">
                    <strong>Supermercado:</strong> ${precioActual.supermercado}
                </div>
                <div class="detail-item">
                    <strong>Producto:</strong> ${precioActual.producto}
                </div>
                <div class="detail-item">
                    <strong>Precio Publicado:</strong> $${parseFloat(precioActual.precioPublicado).toFixed(2)}
                </div>
                <div class="detail-item">
                    <strong>Precio Real:</strong> $${parseFloat(precioActual.precioReal).toFixed(2)}
                </div>
                <div class="detail-item">
                    <strong>Diferencia:</strong> 
                    <span style="color: ${diferencia > 0 ? '#ef4444' : '#22c55e'}; font-weight: 600;">
                        ${diferencia > 0 ? '+' : ''}$${diferencia.toFixed(2)}
                    </span>
                </div>
                ${precioActual.descripcion ? `
                <div class="detail-item">
                    <strong>Descripción:</strong> ${precioActual.descripcion}
                </div>
                ` : ''}
                <div class="detail-item">
                    <strong>Estado Actual:</strong> ${precioActual.estado}
                </div>
            `;
            
            document.getElementById('precio-estado').value = precioActual.estado;
            document.getElementById('modal-precio').style.display = 'block';
        }
    } catch (error) {
        console.error('Error cargando reporte:', error);
        alert('Error al cargar el reporte');
    }
}

// Actualizar queja
async function actualizarQueja() {
    if (!quejaActual) return;
    
    try {
        const estado = document.getElementById('queja-estado').value;
        const respuesta = document.getElementById('queja-respuesta').value;
        
        const response = await fetch(`${API_URL}/quejas/${quejaActual.id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                estado: estado,
                respuesta: respuesta
            })
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            alert('Queja actualizada exitosamente');
            cerrarModal('modal-queja');
            cargarQuejas();
        } else {
            alert('Error al actualizar la queja: ' + (resultado.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error actualizando queja:', error);
        alert('Error al actualizar la queja');
    }
}

// Actualizar precio
async function actualizarPrecio() {
    if (!precioActual) return;
    
    try {
        const estado = document.getElementById('precio-estado').value;
        
        const response = await fetch(`${API_URL}/reportes/${precioActual.id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                estado: estado
            })
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            alert('Reporte actualizado exitosamente');
            cerrarModal('modal-precio');
            cargarReportes();
        } else {
            alert('Error al actualizar el reporte: ' + (resultado.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error actualizando reporte:', error);
        alert('Error al actualizar el reporte');
    }
}

// Cerrar modal
function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Funciones auxiliares
function getBadgeEstadoQueja(estado) {
    const badges = {
        'pendiente': '<span class="badge badge-pending">Pendiente</span>',
        'en_revision': '<span class="badge badge-reviewing">En Revisión</span>',
        'resuelta': '<span class="badge badge-resolved">Resuelta</span>',
        'rechazada': '<span class="badge badge-rejected">Rechazada</span>'
    };
    return badges[estado] || badges['pendiente'];
}

function getBadgeEstadoPrecio(estado) {
    const badges = {
        'pendiente': '<span class="badge badge-pending">Pendiente</span>',
        'revisado': '<span class="badge badge-reviewed">Revisado</span>',
        'resuelto': '<span class="badge badge-resolved">Resuelto</span>'
    };
    return badges[estado] || badges['pendiente'];
}

function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function logout() {
    localStorage.clear();
    window.location.href = '../FrontConsumidor/index.html';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Cargar datos iniciales
cargarQuejas();



