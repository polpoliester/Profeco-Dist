const rabbitmqService = require("../rabbitmqService");
const RABBITMQ_CONFIG = require("../config/rabbitmq");
const Notificacion = require("../models/Notificacion");

/**
 * Consumidor de notificaciones (fanout)
 */
async function iniciarNotificacionesConsumer() {
  const canal = rabbitmqService.obtenerCanal();

  if (!canal) {
    console.error("❌ No hay canal disponible para consumir notificaciones");
    return;
  }

  const exchange = RABBITMQ_CONFIG.exchanges.notificaciones;

  await canal.assertExchange(exchange, "fanout", { durable: true });

  const { queue } = await canal.assertQueue("", { exclusive: true });

  canal.bindQueue(queue, exchange, "");

  console.log("📥 Esperando notificaciones...");

  canal.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      let usuarioDestino = 1;

      // Wishlist
      if (data.tipo === "wishlist_agregada" && data.wishlist?.usuarioId) {
        usuarioDestino = data.wishlist.usuarioId;
      }

      // Oferta
      else if (data.oferta?.usuarioId) {
        usuarioDestino = data.oferta.usuarioId;
      }

      await Notificacion.create({
        usuarioId: usuarioDestino,
        tipo: data.tipo,
        payload: data,
      });

      console.log(`🔔 Notificación guardada: ${data.tipo}`);
    } catch (error) {
      console.error("❌ Error procesando mensaje:", error.message);
    }
  });
}

module.exports = iniciarNotificacionesConsumer;
