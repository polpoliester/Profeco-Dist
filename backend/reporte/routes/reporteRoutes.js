const express = require('express');
const router = express.Router();
const Reporte = require('../models/Reporte');

router.get('/', async (req, res) => {
  try {
    const reportes = await Reporte.findAll({ 
      order: [['createdAt', 'DESC']] 
    });
    res.json({ success: true, data: reportes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const reporte = await Reporte.create(req.body);
    res.status(201).json({ success: true, data: reporte });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) {
      return res.status(404).json({ success: false, mensaje: 'Reporte no encontrado' });
    }
    res.json({ success: true, data: reporte });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) {
      return res.status(404).json({ success: false, mensaje: 'Reporte no encontrado' });
    }
    await reporte.update(req.body);
    res.json({ success: true, data: reporte });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
