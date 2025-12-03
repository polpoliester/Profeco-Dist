const amqp = require('amqplib');
const RABBITMQ_CONFIG = require('../config/rabbitmq');
const quejaController = require('../controllers/quejaController');

let connection = null;
let channel = null;

async function conectarRabbit() {
  try {
    connection = await amqp.connect(RABBITMQ_CONFIG.url);
    channel = await connection.createChannel();
    
    await channel.assertQueue(RABBITMQ_CONFIG.queues.quejas, RABBITMQ_CONFIG.options);
    
    console.log('RabbitMQ conectado - Quejas');
    return true;
  } catch (error) {
    console.error('Error conectando RabbitMQ:', error.message);
    setTimeout(conectarRabbit, 5000);
    return false;
  }
}

async function consumir() {
  if (!channel) return;
  
  console.log('Esperando mensajes en quejas_queue...');
  
  channel.consume(RABBITMQ_CONFIG.queues.quejas, async (msg) => {
    if (msg) {
      try {
        const mensaje = JSON.parse(msg.content.toString());
        console.log('Mensaje recibido:', mensaje.operacion);
        
        let respuesta;
        switch (mensaje.operacion) {
          case 'obtener_quejas':
            respuesta = await quejaController.obtenerQuejas(mensaje.filtros || {});
            break;
          
          case 'crear_queja':
            respuesta = await quejaController.crearQueja(mensaje.datos);
            break;
          
          case 'obtener_queja':
            respuesta = await quejaController.obtenerQuejaPorId(mensaje.id);
            break;
          
          case 'actualizar_estado_queja':
            respuesta = await quejaController.actualizarEstadoQueja(
              mensaje.id,
              mensaje.datos,
              mensaje.usuarioId
            );
            break;
          
          case 'obtener_estadisticas':
            respuesta = await quejaController.obtenerEstadisticas();
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

