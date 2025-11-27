// services/notificationService.js
// Servicio para publicar notificaciones en RabbitMQ

const RABBITMQ_CONFIG = require('../config/rabbitmq');
const rabbitmqService = require('../rabbitmqService');

/**
 * Publicar una notificación en el exchange
 */
async function publicarNotificacion(notificacion) {
  const channel = rabbitmqService.obtenerCanal();
  
  if (!channel) {
    console.error('Canal de RabbitMQ no disponible para notificaciones');
    return false;
  }
  
  try {
    const exito = channel.publish(
      RABBITMQ_CONFIG.exchanges.notificaciones,
      '', // routing key vacío para fanout
      Buffer.from(JSON.stringify(notificacion)),
      { persistent: true } // Hacer el mensaje persistente
    );
    
    if (exito) {
      console.log('Notificación publicada:', notificacion.tipo);
      return true;
    } else {
      console.warn('Buffer de RabbitMQ lleno, notificación no enviada');
      return false;
    }
  } catch (error) {
    console.error('Error publicando notificación:', error.message);
    return false;
  }
}

/**
 * Publicar notificación de nueva oferta
 */
async function notificarNuevaOferta(oferta) {
  return await publicarNotificacion({
    tipo: 'nueva_oferta',
    oferta,
    timestamp: new Date().toISOString()
  });
}

/**
 * Publicar notificación de oferta actualizada
 */
async function notificarOfertaActualizada(oferta) {
  return await publicarNotificacion({
    tipo: 'oferta_actualizada',
    oferta,
    timestamp: new Date().toISOString()
  });
}

/**
 * Publicar notificación de oferta eliminada
 */
async function notificarOfertaEliminada(ofertaId) {
  return await publicarNotificacion({
    tipo: 'oferta_eliminada',
    ofertaId,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  publicarNotificacion,
  notificarNuevaOferta,
  notificarOfertaActualizada,
  notificarOfertaEliminada
};