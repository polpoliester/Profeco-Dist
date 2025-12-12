const express = require('express');
const { conectarDB } = require('./config/database');
const { conectarRabbit, consumir } = require('./services/rabbitmqService');

const resenaRoutes = require('./routes/resenaRoutes');

const app = express();
app.use(express.json());

app.use('/api/resenas', resenaRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    servicio: 'Microservicio de Resenas',
    timestamp: new Date().toISOString()
  });
});

async function iniciar() {
  console.log('Iniciando servidor de Resenas...');
  
  await conectarDB();

  try {
    await conectarRabbit();
    await consumir();
  } catch (error) {
    console.log('Resenas iniciado sin RabbitMQ (modo local)');
  }

  app.listen(4006, () => {
    console.log('Servidor de Resenas en puerto 4006');
    console.log('GET  /health');
    console.log('GET  /api/resenas');
    console.log('POST /api/resenas');
    console.log('GET  /api/resenas/:id');
    console.log('PUT  /api/resenas/:id');
    console.log('DELETE /api/resenas/:id');
    console.log('GET  /api/resenas/estadisticas');
  });
}

iniciar();