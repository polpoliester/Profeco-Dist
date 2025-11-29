const amqp = require('amqplib');
const RABBITMQ_CONFIG = require('../config/rabbitmq');

let channel = null;
let connection = null;

async function conectar() {
  try {
    console.log('Conectando a RabbitMQ...');
    connection = await amqp.connect(RABBITMQ_CONFIG.url);
    channel = await connection.createChannel();
    
    await channel.assertExchange(
      RABBITMQ_CONFIG.exchanges.notificaciones,
      'fanout',
      { durable: true }
    );
    
    console.log('RabbitMQ conectado - Notificaciones');
    return true;
  } catch (error) {
    console.error('Error RabbitMQ Notificaciones:', error.message);
    setTimeout(conectar, 5000);
    return false;
  }
}

function obtenerCanal() {
  return channel;
}

async function cerrar() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('Conexion RabbitMQ cerrada - Notificaciones');
  } catch (error) {
    console.error('Error cerrando RabbitMQ:', error.message);
  }
}

module.exports = {
  conectar,
  obtenerCanal,
  cerrar
};
