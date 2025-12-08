const Reporte = require('../models/Reporte');
const LogActividad = require('../models/LogActividad');

function crearRespuesta(success, mensaje, data = null, error = null) {
  return {
    success,
    mensaje,
    data,
    error
  };
}

/**
 * Obtener todos los reportes
 */
async function obtenerReportes(filtros = {}) {
  try {
    const where = {};
    
    if (filtros.usuarioId) {
      where.usuarioId = filtros.usuarioId;
    }
    
    if (filtros.estado) {
      where.estado = filtros.estado;
    }
    
    if (filtros.supermercadoId) {
      where.supermercadoId = filtros.supermercadoId;
    }
    
    const reportes = await Reporte.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    
    return crearRespuesta(true, 'Reportes obtenidos exitosamente', reportes);
  } catch (error) {
    console.error('Error en obtenerReportes:', error.message);
    return crearRespuesta(
      false,
      'Error al obtener reportes',
      null,
      error.message
    );
  }
}

/**
 * Obtener reporte por ID
 */
async function obtenerReportePorId(id) {
  try {
    const reporte = await Reporte.findByPk(id);
    
    if (!reporte) {
      return crearRespuesta(false, 'Reporte no encontrado');
    }
    
    return crearRespuesta(true, 'Reporte obtenido exitosamente', reporte);
  } catch (error) {
    console.error('Error en obtenerReportePorId:', error.message);
    return crearRespuesta(
      false,
      'Error al obtener reporte',
      null,
      error.message
    );
  }
}

/**
 * Crear un nuevo reporte
 */
async function crearReporte(datos) {
  try {
    const camposRequeridos = ['usuarioId', 'supermercadoId', 'supermercado', 'productoId', 'producto', 'precioPublicado', 'precioReal'];
    const faltantes = camposRequeridos.filter(campo => !datos[campo]);
    
    if (faltantes.length > 0) {
      return crearRespuesta(
        false,
        'Faltan campos requeridos',
        null,
        `Campos faltantes: ${faltantes.join(', ')}`
      );
    }
    
    const nuevoReporte = await Reporte.create({
      usuarioId: datos.usuarioId,
      supermercadoId: datos.supermercadoId,
      supermercado: datos.supermercado,
      productoId: datos.productoId,
      producto: datos.producto,
      precioPublicado: datos.precioPublicado,
      precioReal: datos.precioReal,
      descripcion: datos.descripcion,
      estado: 'pendiente'
    });
    
    // Registrar actividad
    await LogActividad.create({
      usuarioId: datos.usuarioId,
      accion: 'crear_reporte',
      entidad: 'Reporte',
      entidadId: nuevoReporte.id,
      detalles: `Reporte creado para ${datos.producto} en ${datos.supermercado}`
    });
    
    return crearRespuesta(
      true,
      'Reporte creado exitosamente',
      nuevoReporte
    );
  } catch (error) {
    console.error('Error en crearReporte:', error.message);
    return crearRespuesta(
      false,
      'Error al crear reporte',
      null,
      error.message
    );
  }
}

/**
 * Actualizar estado de un reporte (para Profeco - gestión de precios)
 */
async function actualizarEstadoReporte(id, datos, usuarioId) {
  try {
    const reporte = await Reporte.findByPk(id);
    
    if (!reporte) {
      return crearRespuesta(false, 'Reporte no encontrado');
    }
    
    const estadoAnterior = reporte.estado;
    await reporte.update({
      estado: datos.estado
    });
    
    // Registrar actividad
    await LogActividad.create({
      usuarioId: usuarioId,
      accion: 'actualizar_estado_reporte',
      entidad: 'Reporte',
      entidadId: reporte.id,
      detalles: `Estado cambiado de ${estadoAnterior} a ${datos.estado}`
    });
    
    return crearRespuesta(
      true,
      'Estado de reporte actualizado exitosamente',
      reporte
    );
  } catch (error) {
    console.error('Error en actualizarEstadoReporte:', error.message);
    return crearRespuesta(
      false,
      'Error al actualizar estado de reporte',
      null,
      error.message
    );
  }
}

/**
 * Obtener estadísticas de reportes
 */
async function obtenerEstadisticas() {
  try {
    const total = await Reporte.count();
    const porEstado = await Reporte.findAll({
      attributes: [
        'estado',
        [Reporte.sequelize.fn('COUNT', Reporte.sequelize.col('id')), 'cantidad']
      ],
      group: ['estado'],
      raw: true
    });
    
    return crearRespuesta(true, 'Estadísticas obtenidas', {
      total,
      porEstado
    });
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
  obtenerReportes,
  obtenerReportePorId,
  crearReporte,
  actualizarEstadoReporte,
  obtenerEstadisticas
};



