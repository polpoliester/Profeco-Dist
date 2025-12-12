const express = require('express');
const router = express.Router();
const resenaController = require('../controllers/resenaController');

// Obtener todas las resenas (con filtros opcionales)
router.get('/', async (req, res) => {
  try {
    const filtros = {
      usuarioId: req.query.usuarioId ? parseInt(req.query.usuarioId) : undefined,
      supermercadoId: req.query.supermercadoId ? parseInt(req.query.supermercadoId) : undefined,
      supermercado: req.query.supermercado,
      calificacion: req.query.calificacion ? parseInt(req.query.calificacion) : undefined
    };
    
    const respuesta = await resenaController.obtenerResenas(filtros);
    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener estadisticas
router.get('/estadisticas', async (req, res) => {
  try {
    const supermercadoId = req.query.supermercadoId ? parseInt(req.query.supermercadoId) : null;
    const respuesta = await resenaController.obtenerEstadisticas(supermercadoId);
    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener resena por ID
router.get('/:id', async (req, res) => {
  try {
    const respuesta = await resenaController.obtenerResenaPorId(parseInt(req.params.id));
    
    if (!respuesta.success) {
      return res.status(404).json(respuesta);
    }
    
    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crear nueva resena
router.post('/', async (req, res) => {
  try {
    const respuesta = await resenaController.crearResena(req.body);
    res.status(respuesta.success ? 201 : 400).json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar resena
router.put('/:id', async (req, res) => {
  try {
    const respuesta = await resenaController.actualizarResena(
      parseInt(req.params.id),
      req.body
    );
    
    res.status(respuesta.success ? 200 : 404).json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Eliminar resena
router.delete('/:id', async (req, res) => {
  try {
    const respuesta = await resenaController.eliminarResena(parseInt(req.params.id));
    
    res.status(respuesta.success ? 200 : 404).json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;