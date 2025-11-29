const Notificacion = require('../models/Notificacion');

async function obtenerNotificaciones(usuarioId) {
  try {
    const notificaciones = await Notificacion.findAll({
      where: { usuarioId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    return {
      ok: true,
      data: notificaciones
    };
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return {
      ok: false,
      mensaje: 'Error al obtener notificaciones',
      error: error.message
    };
  }
}

async function marcarLeida(id) {
  try {
    const notificacion = await Notificacion.findByPk(id);
    
    if (!notificacion) {
      return {
        ok: false,
        mensaje: 'Notificacion no encontrada'
      };
    }
    
    await notificacion.update({ leida: true });
    
    return {
      ok: true,
      mensaje: 'Notificacion marcada como leida',
      data: notificacion
    };
  } catch (error) {
    console.error('Error marcando notificacion:', error);
    return {
      ok: false,
      mensaje: 'Error al marcar notificacion',
      error: error.message
    };
  }
}

module.exports = {
  obtenerNotificaciones,
  marcarLeida
};
