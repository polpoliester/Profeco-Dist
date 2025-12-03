const express = require('express');
const { conectarDB } = require('./config/database');
const { conectarRabbit, consumir } = require('./services/rabbitmqService');

const quejaRoutes = require('./routes/quejaRoutes');

const app = express();
app.use(express.json());

app.use('/api/quejas', quejaRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    servicio: 'Microservicio de Quejas',
    timestamp: new Date().toISOString()
  });
});

async function iniciar() {
  console.log('Iniciando servidor de Quejas...');
  
  await conectarDB();

  try {
    await conectarRabbit();
    await consumir();
  } catch (error) {
    console.log('Quejas iniciado sin RabbitMQ (modo local)');
  }

  app.listen(4004, () => {
    console.log('Servidor de Quejas en puerto 4004');
    console.log('GET  /health');
    console.log('GET  /api/quejas');
    console.log('POST /api/quejas');
    console.log('GET  /api/quejas/:id');
    console.log('PUT  /api/quejas/:id/estado');
    console.log('GET  /api/quejas/estadisticas');
  });
}

iniciar();



