const express = require('express');
const router = express.Router();
const quejaController = require('../controllers/quejaController');

router.get('/', async (req, res) => {
  try {
    const filtros = {
      usuarioId: req.query.usuarioId ? parseInt(req.query.usuarioId) : undefined,
      estado: req.query.estado,
      tipo: req.query.tipo,
      supermercadoId: req.query.supermercadoId ? parseInt(req.query.supermercadoId) : undefined
    };
    
    const respuesta = await quejaController.obtenerQuejas(filtros);
    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/estadisticas', async (req, res) => {
  try {
    const respuesta = await quejaController.obtenerEstadisticas();
    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const respuesta = await quejaController.obtenerQuejaPorId(parseInt(req.params.id));
    
    if (!respuesta.success) {
      return res.status(404).json(respuesta);
    }
    
    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const respuesta = await quejaController.crearQueja(req.body);
    res.status(respuesta.success ? 201 : 400).json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id/estado', async (req, res) => {
  try {
    const usuarioId = req.user?.id || 3; // Default a Profeco si no viene en el token
    const respuesta = await quejaController.actualizarEstadoQueja(
      parseInt(req.params.id),
      req.body,
      usuarioId
    );
    
    res.status(respuesta.success ? 200 : 404).json(respuesta);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

