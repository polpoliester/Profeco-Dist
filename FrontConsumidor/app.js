const API_URL = 'http://localhost:3000/api';
let token = null;
let usuario = null;

async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      token = data.data.token;
      usuario = data.data.usuario;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error login:', error);
    return false;
  }
}

async function getOfertas() {
  try {
    const response = await fetch(`${API_URL}/ofertas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo ofertas:', error);
    return { success: false, data: [] };
  }
}

async function crearReporte(datos) {
  try {
    const response = await fetch('http://localhost:4003/api/reportes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(datos)
    });
    return await response.json();
  } catch (error) {
    console.error('Error creando reporte:', error);
    return { success: false };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  if (usuarioStr) {
    usuario = JSON.parse(usuarioStr);
  }
});
