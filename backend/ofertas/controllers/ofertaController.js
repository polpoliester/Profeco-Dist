// Ofertas negocio
const Oferta = require('./models/Oferta');
const { 
  calcularDescuento, 
  validarCamposRequeridos,
  formatearErrorSequelize,
  crearRespuesta 
} = require('./utils/helpers');
const { publicarNotificacion } = require('./services/notificationService');

/**
 * Obtener todas las ofertas con filtros opcionales
 */
async function obtenerOfertas(filtros = {}) {
  try {
    const where = {};
    
    // Filtrar por supermercado
    if (filtros.supermercadoId) {
      where.supermercadoId = filtros.supermercadoId;
    }
    
    // Filtrar por estado activo/inactivo
    if (filtros.activa !== undefined) {
      where.activa = filtros.activa;
    }
    
    // Filtrar por producto
    if (filtros.productoId) {
      where.productoId = filtros.productoId;
    }
    
    const ofertas = await Oferta.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    
    return crearRespuesta(
      true,
      'Ofertas obtenidas exitosamente',
      ofertas,
      null
    );
  } catch (error) {
    console.error('Error en obtenerOfertas:', error.message);
    return crearRespuesta(
      false,
      'Error al obtener ofertas',
      null,
      error.message
    );
  }
}

/**
 * Obtener una oferta por su ID
 */
async function obtenerOfertaPorId(id) {
  try {
    const oferta = await Oferta.findByPk(id);
    
    if (!oferta) {
      return crearRespuesta(false, 'Oferta no encontrada');
    }
    
    return crearRespuesta(
      true,
      'Oferta obtenida exitosamente',
      oferta
    );
  } catch (error) {
    console.error('Error en obtenerOfertaPorId:', error.message);
    return crearRespuesta(
      false,
      'Error al obtener oferta',
      null,
      error.message
    );
  }
}

/**
 * Crear una nueva oferta
 */
async function crearOferta(datos) {
  try {
    // Validar campos requeridos
    const validacion = validarCamposRequeridos(datos, [
      'supermercadoId',
      'supermercado',
      'productoId',
      'producto',
      'precioOriginal',
      'precioOferta',
      'vigenciaInicio',
      'vigenciaFin'
    ]);
    
    if (!validacion.valido) {
      return crearRespuesta(
        false,
        'Faltan campos requeridos',
        null,
        validacion.errores.join(', ')
      );
    }
    
    // Calcular descuento si no viene en los datos
    if (!datos.descuento) {
      datos.descuento = calcularDescuento(
        datos.precioOriginal, 
        datos.precioOferta
      );
    }
    
    // Crear oferta en la base de datos
    const nuevaOferta = await Oferta.create({
      supermercadoId: datos.supermercadoId,
      supermercado: datos.supermercado,
      productoId: datos.productoId,
      producto: datos.producto,
      precioOriginal: datos.precioOriginal,
      precioOferta: datos.precioOferta,
      descuento: datos.descuento,
      vigenciaInicio: datos.vigenciaInicio,
      vigenciaFin: datos.vigenciaFin,
      activa: datos.activa !== undefined ? datos.activa : true
    });
    
    // Publicar notificación de nueva oferta
    await publicarNotificacion({
      tipo: 'nueva_oferta',
      oferta: nuevaOferta.toJSON(),
      timestamp: new Date().toISOString()
    });
    
    return crearRespuesta(
      true,
      'Oferta creada exitosamente',
      nuevaOferta
    );
  } catch (error) {
    console.error('Error en crearOferta:', error.message);
    const mensajeError = formatearErrorSequelize(error);
    return crearRespuesta(
      false,
      'Error al crear oferta',
      null,
      mensajeError
    );
  }
}

/**
 * Actualizar una oferta existente
 */
async function actualizarOferta(id, datos) {
  try {
    const oferta = await Oferta.findByPk(id);
    
    if (!oferta) {
      return crearRespuesta(false, 'Oferta no encontrada');
    }
    
    // Si se actualizan precios, recalcular descuento
    if (datos.precioOriginal || datos.precioOferta) {
      const precioOriginal = datos.precioOriginal || oferta.precioOriginal;
      const precioOferta = datos.precioOferta || oferta.precioOferta;
      datos.descuento = calcularDescuento(precioOriginal, precioOferta);
    }
    
    // Actualizar la oferta
    await oferta.update(datos);
    
    return crearRespuesta(
      true,
      'Oferta actualizada exitosamente',
      oferta
    );
  } catch (error) {
    console.error('Error en actualizarOferta:', error.message);
    const mensajeError = formatearErrorSequelize(error);
    return crearRespuesta(
      false,
      'Error al actualizar oferta',
      null,
      mensajeError
    );
  }
}

/**
 * Eliminar una oferta (soft delete - marcar como inactiva)
 */
async function eliminarOferta(id) {
  try {
    const oferta = await Oferta.findByPk(id);
    
    if (!oferta) {
      return crearRespuesta(false, 'Oferta no encontrada');
    }
    
    // Soft delete - marcar como inactiva
    await oferta.update({ activa: false });
    
    return crearRespuesta(
      true,
      'Oferta eliminada exitosamente'
    );
  } catch (error) {
    console.error('Error en eliminarOferta:', error.message);
    return crearRespuesta(
      false,
      'Error al eliminar oferta',
      null,
      error.message
    );
  }
}

/**
 * Obtener estadísticas de ofertas
 */
async function obtenerEstadisticas() {
  try {
    const total = await Oferta.count();
    const activas = await Oferta.count({ where: { activa: true } });
    const inactivas = total - activas;
    
    return crearRespuesta(
      true,
      'Estadísticas obtenidas exitosamente',
      {
        total,
        activas,
        inactivas
      }
    );
  } catch (error) {
    console.error('Error en obtenerEstadisticas:', error.message);
    return crearRespuesta(
      false,
      'Error al obtener estadísticas',
      null,
      error.message
    );
  }
}

module.exports = {
  obtenerOfertas,
  obtenerOfertaPorId,
  crearOferta,
  actualizarOferta,
  eliminarOferta,
  obtenerEstadisticas
};