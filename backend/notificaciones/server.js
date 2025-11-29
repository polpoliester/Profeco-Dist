const express = require('express');
const { conectarDB } = require('./config/db');
const rabbitmqService = require('./services/rabbitmqService');
const iniciarNotificacionesConsumer = require('./rabbitmqConsumers/notificacionesConsumer');
const notificacionesRoutes = require('./routes/notificaciones');

const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());

app.use('/api/notificaciones', notificacionesRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    servicio: 'Microservicio Notificaciones',
    puerto: PORT
  });
});

async function iniciar() {
  console.log('Iniciando Microservicio de Notificaciones...');
  
  await conectarDB();
  
  await rabbitmqService.conectar();
  
  await iniciarNotificacionesConsumer();
  
  app.listen(PORT, () => {
    console.log(`Notificaciones en puerto ${PORT}`);
    console.log('GET  /api/notificaciones/:usuarioId');
    console.log('PATCH /api/notificaciones/:id/leida');
  });
}

process.on('SIGINT', async () => {
  await rabbitmqService.cerrar();
  process.exit(0);
});

iniciar();
