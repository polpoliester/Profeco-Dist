// Definición de rutas REST para el API de Ofertas

const express = require('express');
const router = express.Router();
const ofertaController = require('./controllers/ofertaController');

/**
 * GET /api/ofertas
 * Obtener todas las ofertas con filtros opcionales
 * Query params: supermercadoId, productoId, activa
 */
router.get('/', async (req, res) => {
  try {
    const filtros = {
      supermercadoId: req.query.supermercadoId ? parseInt(req.query.supermercadoId) : undefined,
      productoId: req.query.productoId ? parseInt(req.query.productoId) : undefined,
      activa: req.query.activa !== undefined ? req.query.activa === 'true' : undefined
    };
    
    const resultado = await ofertaController.obtenerOfertas(filtros);
    const statusCode = resultado.success ? 200 : 500;
    res.status(statusCode).json(resultado);
  } catch (error) {
    console.error('Error en ruta GET /api/ofertas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/ofertas/estadisticas
 * Obtener estadísticas de ofertas
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const resultado = await ofertaController.obtenerEstadisticas();
    const statusCode = resultado.success ? 200 : 500;
    res.status(statusCode).json(resultado);
  } catch (error) {
    console.error('Error en ruta GET /api/ofertas/estadisticas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/ofertas/:id
 * Obtener una oferta específica por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        mensaje: 'ID inválido, debe ser un número'
      });
    }
    
    const resultado = await ofertaController.obtenerOfertaPorId(id);
    const statusCode = resultado.success ? 200 : 404;
    res.status(statusCode).json(resultado);
  } catch (error) {
    console.error('Error en ruta GET /api/ofertas/:id:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/ofertas
 * Crear una nueva oferta
 */
router.post('/', async (req, res) => {
  try {
    const resultado = await ofertaController.crearOferta(req.body);
    const statusCode = resultado.success ? 201 : 400;
    res.status(statusCode).json(resultado);
  } catch (error) {
    console.error('Error en ruta POST /api/ofertas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * PUT /api/ofertas/:id
 * Actualizar una oferta existente
 */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        mensaje: 'ID inválido, debe ser un número'
      });
    }
    
    const resultado = await ofertaController.actualizarOferta(id, req.body);
    const statusCode = resultado.success ? 200 : 404;
    res.status(statusCode).json(resultado);
  } catch (error) {
    console.error('Error en ruta PUT /api/ofertas/:id:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * DELETE /api/ofertas/:id
 * Eliminar una oferta (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        mensaje: 'ID inválido, debe ser un número'
      });
    }
    
    const resultado = await ofertaController.eliminarOferta(id);
    const statusCode = resultado.success ? 200 : 404;
    res.status(statusCode).json(resultado);
  } catch (error) {
    console.error('Error en ruta DELETE /api/ofertas/:id:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;