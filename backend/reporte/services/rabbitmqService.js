const amqp = require('amqplib');
const RABBITMQ_CONFIG = require('../config/rabbitmq');

// Cargar el controlador de forma diferida para evitar problemas de caché
let reporteController = null;

function getReporteController() {
  if (!reporteController) {
    // Limpiar caché del módulo si existe
    const controllerPath = require.resolve('../controllers/reporteController');
    delete require.cache[controllerPath];
    reporteController = require('../controllers/reporteController');
    
    // Verificar que se cargó correctamente
    if (!reporteController || typeof reporteController.obtenerReportes !== 'function') {
      console.error('Error: reporteController no se cargó correctamente');
      console.error('reporteController:', reporteController);
      console.error('Keys disponibles:', Object.keys(reporteController || {}));
      throw new Error('No se pudo cargar el controlador de reportes');
    }
  }
  return reporteController;
}

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
  
  // Verificar que el controlador se pueda cargar correctamente
  try {
    getReporteController();
    console.log('Controlador de reportes cargado correctamente');
  } catch (error) {
    console.error('Error cargando controlador:', error.message);
    return;
  }
  
  console.log('Esperando mensajes en reportes_queue...');
  
  channel.consume(RABBITMQ_CONFIG.queues.reportes, async (msg) => {
    if (msg) {
      try {
        const mensaje = JSON.parse(msg.content.toString());
        console.log('Mensaje recibido:', mensaje.operacion);
        
        let respuesta;
        
        try {
          const controller = getReporteController();
          
          switch (mensaje.operacion) {
            case 'obtener_reportes':
              respuesta = await controller.obtenerReportes(mensaje.filtros || {});
              break;
            
            case 'crear_reporte':
              respuesta = await controller.crearReporte(mensaje.datos);
              break;
            
            case 'obtener_reporte':
              respuesta = await controller.obtenerReportePorId(mensaje.id);
              break;
            
            case 'actualizar_estado_reporte':
              respuesta = await controller.actualizarEstadoReporte(
                mensaje.id,
                mensaje.datos,
                mensaje.usuarioId
              );
              break;
            
            case 'obtener_estadisticas':
              respuesta = await controller.obtenerEstadisticas();
              break;
              
            default:
              respuesta = { success: false, mensaje: 'Operacion no soportada' };
          }
        } catch (controllerError) {
          console.error('Error en el controlador:', controllerError);
          respuesta = {
            success: false,
            mensaje: 'Error procesando la operación',
            error: controllerError.message
          };
        }
        
        // Siempre enviar respuesta si hay replyTo (RPC)
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
        
        // Intentar enviar respuesta de error si es RPC
        try {
          const mensaje = JSON.parse(msg.content.toString());
          if (mensaje.replyTo) {
            const errorRespuesta = {
              success: false,
              mensaje: 'Error procesando mensaje',
              error: error.message
            };
            channel.sendToQueue(
              mensaje.replyTo,
              Buffer.from(JSON.stringify(errorRespuesta)),
              { correlationId: mensaje.correlationId }
            );
          }
        } catch (parseError) {
          console.error('Error parseando mensaje para respuesta de error:', parseError);
        }
        
        channel.nack(msg, false, false);
      }
    }
  }, { noAck: false });
}

module.exports = { conectarRabbit, consumir };