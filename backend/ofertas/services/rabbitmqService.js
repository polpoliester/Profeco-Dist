// services/rabbitmqService.js
const amqp = require('amqplib');
const Oferta = require('../models/Oferta');

let channel = null;
let connection = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_OFERTAS = 'ofertas_queue';

async function conectar() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    await channel.assertQueue(QUEUE_OFERTAS, { durable: true });
    
    console.log('Conectado a RabbitMQ:D');
    return true;
  } catch (error) {
    console.error('Error conectando a RabbitMQ:', error.message);
    setTimeout(conectar, 5000);
    return false;
  }
}

async function consumirMensajes() {
  if (!channel) {
    console.error('Canal de RabbitMQ no disponible');
    return;
  }
  
  console.log('Esperando mensajes en la cola:', QUEUE_OFERTAS);
  
  channel.consume(QUEUE_OFERTAS, async (msg) => {
    if (msg !== null) {
      try {
        const mensaje = JSON.parse(msg.content.toString());
        console.log('Mensaje recibido:', mensaje.operacion);
        
        const respuesta = await procesarMensaje(mensaje);
        
        if (mensaje.replyTo) {
          channel.sendToQueue(
            mensaje.replyTo,
            Buffer.from(JSON.stringify(respuesta)),
            { correlationId: mensaje.correlationId }
          );
        }
        
        channel.ack(msg);
      } catch (error) {
        console.error('Error procesando mensaje:', error.message);
        channel.nack(msg, false, false);
      }
    }
  }, { noAck: false });
}

async function procesarMensaje(mensaje) {
  try {
    switch (mensaje.operacion) {
      case 'obtener_ofertas':
        const ofertas = await Oferta.findAll({
          where: mensaje.filtros || {},
          order: [['createdAt', 'DESC']]
        });
        return { success: true, data: ofertas, total: ofertas.length };
        
      case 'crear_oferta':
        const nuevaOferta = await Oferta.create(mensaje.datos);
        return { success: true, mensaje: 'Oferta creada exitosamente', data: nuevaOferta };
        
      case 'actualizar_oferta':
        const oferta = await Oferta.findByPk(mensaje.id);
        if (!oferta) {
          return { success: false, mensaje: 'Oferta no encontrada' };
        }
        await oferta.update(mensaje.datos);
        return { success: true, mensaje: 'Oferta actualizada exitosamente', data: oferta };
        
      default:
        return { success: false, mensaje: `Operación no soportada: ${mensaje.operacion}` };
    }
  } catch (error) {
    console.error('Error en procesarMensaje:', error);
    return { success: false, mensaje: 'Error procesando solicitud', error: error.message };
  }
}

async function cerrar() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('Conexión a RabbitMQ cerrada:D');
  } catch (error) {
    console.error('Error cerrando RabbitMQ:', error.message);
  }
}

module.exports = {
  conectar,
  consumirMensajes,
  cerrar
};
