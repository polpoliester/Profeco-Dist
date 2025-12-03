const express = require("express");
const { conectarDB } = require("./config/database");
const { conectarRabbit, consumir } = require("./services/rabbitmqService");

const reporteRoutes = require("./routes/reporteRoutes");

const app = express();
app.use(express.json());

app.use("/api/reportes", reporteRoutes);

async function iniciar() {
  try {
    await conectarDB();
  } catch (error) {
    console.error('Error conectando a la base de datos:', error.message);
    process.exit(1);
  }

  try {
    await conectarRabbit();
    await consumir();
    console.log('Servicio de reportes listo y escuchando en RabbitMQ');
  } catch (error) {
    console.error('Error conectando a RabbitMQ:', error.message);
    console.error('El servicio no podrá recibir mensajes del API Gateway');
    console.error('Asegúrate de que RabbitMQ esté ejecutándose');
  }

  app.listen(4003, () => {
    console.log("Reporte en puerto 4003");
    console.log("Endpoints HTTP disponibles en /api/reportes");
  });
}

iniciar();
