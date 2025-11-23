const RABBITMQ_CONFIG = require('../config/rabbitmq');
const rabbitmqService = require('../rabbitmqService');

/**
 * Publicar una notificación en RabbitMQ
 */
async function publicarNotificacion(notificacion) {
  const channel = rabbitmqService.obtenerCanal();
  
  if (!channel) {
    console.error('❌ Canal de RabbitMQ no disponible para notificaciones');
    return false;
  }
  
  try {
    const exito = channel.publish(
      RABBITMQ_CONFIG.exchanges.notificaciones,
      '',
      Buffer.from(JSON.stringify(notificacion)),
      { persistent: true }
    );
    
    if (exito) {
      console.log('📢 Notificación publicada:', notificacion.tipo);
      return true;
    }
    return false;

  } catch (error) {
    console.error('❌ Error publicando notificación:', error.message);
    return false;
  }
}

/**
 * Ofertas
 */
async function notificarNuevaOferta(oferta) {
  return await publicarNotificacion({
    tipo: 'nueva_oferta',
    oferta,
    timestamp: new Date().toISOString()
  });
}

async function notificarOfertaActualizada(oferta) {
  return await publicarNotificacion({
    tipo: 'oferta_actualizada',
    oferta,
    timestamp: new Date().toISOString()
  });
}

async function notificarOfertaEliminada(ofertaId) {
  return await publicarNotificacion({
    tipo: 'oferta_eliminada',
    ofertaId,
    timestamp: new Date().toISOString()
  });
}

/**
 * Wishlist
 */
async function notificarWishlistAgregada(wishlistItem) {
  return await publicarNotificacion({
    tipo: "wishlist_agregada",
    wishlist: wishlistItem,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  publicarNotificacion,
  notificarNuevaOferta,
  notificarOfertaActualizada,
  notificarOfertaEliminada,
  notificarWishlistAgregada
};
