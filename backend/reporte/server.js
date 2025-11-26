const express = require("express");
const { conectarDB } = require("./config/database");
const { conectarRabbit, consumir } = require("./services/rabbitmqService");

const reporteRoutes = require("./routes/reporteRoutes");

const app = express();
app.use(express.json());

// Rutas
app.use("/api/reportes", reporteRoutes);

async function iniciar() {
  await conectarDB();

  try {
    await conectarRabbit();
    await consumir();
  } catch {
    console.log("⚠️ Reporte inició sin RabbitMQ (modo local)");
  }

  app.listen(4003, () => console.log("📊 Reporte en puerto 4003"));
}

iniciar();
