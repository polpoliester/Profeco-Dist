const express = require('express');
const { conectarDB, sincronizarModelos, cerrarConexion } = require('./config/database');
const Oferta = require('./models/Oferta');
const rabbitmqService = require('./services/rabbitmqService');

const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', servicio: 'Microservicio Ofertas' });
});

app.get('/api/ofertas', async (req, res) => {
  try {
    const ofertas = await Oferta.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: ofertas, total: ofertas.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ofertas', async (req, res) => {
  try {
    const oferta = await Oferta.create(req.body);
    res.status(201).json({ success: true, data: oferta });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

async function iniciar() {
  console.log('🚀 Iniciando servidor...');
  
  const conectado = await conectarDB();
  if (conectado) {
    await sincronizarModelos();
  }
  
  // Conectar a RabbitMQ
  await rabbitmqService.conectar();
  await rabbitmqService.consumirMensajes();
  
  app.listen(PORT, () => {
    console.log(`✅ Servidor en http://localhost:${PORT}`);
    console.log('📋 GET  /health');
    console.log('📋 GET  /api/ofertas');
    console.log('📋 POST /api/ofertas\n');
  });
}

process.on('SIGINT', async () => {
  await cerrarConexion();
  await rabbitmqService.cerrar();
  process.exit(0);
});

iniciar();
