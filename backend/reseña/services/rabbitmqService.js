const amqp = require('amqplib');
const RABBITMQ_CONFIG = require('../config/rabbitmq');
const resenaController = require('../controllers/resenaController');

let connection = null;
let channel = null;

async function conectarRabbit() {
  try {
    connection = await amqp.connect(RABBITMQ_CONFIG.url);
    channel = await connection.createChannel();
    
    await channel.assertQueue(RABBITMQ_CONFIG.queues.resenas, RABBITMQ_CONFIG.options);
    
    console.log('RabbitMQ conectado - Resenas');
    return true;
  } catch (error) {
    console.error('Error conectando RabbitMQ:', error.message);
    setTimeout(conectarRabbit, 5000);
    return false;
  }
}

async function consumir() {
  if (!channel) return;
  
  console.log('Esperando mensajes en resenas_queue...');
  
  channel.consume(RABBITMQ_CONFIG.queues.resenas, async (msg) => {
    if (msg) {
      try {
        const mensaje = JSON.parse(msg.content.toString());
        console.log('Mensaje recibido:', mensaje.operacion);
        
        let respuesta;
        switch (mensaje.operacion) {
          case 'obtener_resenas':
            respuesta = await resenaController.obtenerResenas(mensaje.filtros || {});
            break;
          
          case 'crear_resena':
            respuesta = await resenaController.crearResena(mensaje.datos);
            break;
          
          case 'obtener_resena':
            respuesta = await resenaController.obtenerResenaPorId(mensaje.id);
            break;
          
          case 'actualizar_resena':
            respuesta = await resenaController.actualizarResena(
              mensaje.id,
              mensaje.datos
            );
            break;
          
          case 'eliminar_resena':
            respuesta = await resenaController.eliminarResena(mensaje.id);
            break;
          
          case 'obtener_estadisticas':
            respuesta = await resenaController.obtenerEstadisticas(mensaje.supermercadoId);
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

async function cerrar() {
  if (channel) await channel.close();
  if (connection) await connection.close();
}

module.exports = { conectarRabbit, consumir, cerrar };