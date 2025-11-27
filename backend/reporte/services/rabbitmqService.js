const amqp = require('amqplib');
const RABBITMQ_CONFIG = require('../config/rabbitmq');
const Reporte = require('../models/Reporte');

let channel = null;
let connection = null;

async function conectarRabbit() {
  try {
    connection = await amqp.connect(RABBITMQ_CONFIG.url);
    channel = await connection.createChannel();
    await channel.assertQueue(RABBITMQ_CONFIG.queues.reportes, { durable: true });
    console.log('RabbitMQ conectado - Reportes');
    return true;
  } catch (error) {
    console.error('Error RabbitMQ Reportes:', error.message);
    throw error;
  }
}

async function consumir() {
  if (!channel) return;
  
  console.log('Esperando mensajes en reportes_queue...');
  
  channel.consume(RABBITMQ_CONFIG.queues.reportes, async (msg) => {
    if (msg) {
      try {
        const mensaje = JSON.parse(msg.content.toString());
        console.log('Mensaje recibido:', mensaje.operacion);
        
        let respuesta;
        switch (mensaje.operacion) {
          case 'obtener_reportes':
            const reportes = await Reporte.findAll({ 
              order: [['createdAt', 'DESC']] 
            });
            respuesta = { success: true, data: reportes };
            break;
          
          case 'crear_reporte':
            const nuevoReporte = await Reporte.create(mensaje.datos);
            respuesta = { success: true, data: nuevoReporte };
            break;
            
          default:
            respuesta = { success: false, mensaje: 'Operacion no soportada' };
        }
        
        if (mensaje.replyTo) {
          channel.sendToQueue(
            mensaje.replyTo,
            Buffer.from(JSON.stringify(respuesta)),
            { correlationId: mensaje.correlationId }
          );
        }
        
        channel.ack(msg);
      } catch (error) {
        console.error('Error procesando mensaje:', error);
        channel.nack(msg, false, false);
      }
    }
  }, { noAck: false });
}

module.exports = { conectarRabbit, consumir };
