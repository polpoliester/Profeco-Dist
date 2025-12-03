const Queja = require('../models/Queja');

function crearRespuesta(success, mensaje, data = null, error = null) {
  return {
    success,
    mensaje,
    data,
    error
  };
}

/**
 * Obtener todas las quejas
 */
async function obtenerQuejas(filtros = {}) {
  try {
    const where = {};
    
    if (filtros.usuarioId) {
      where.usuarioId = filtros.usuarioId;
    }
    
    if (filtros.estado) {
      where.estado = filtros.estado;
    }
    
    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }
    
    if (filtros.supermercadoId) {
      where.supermercadoId = filtros.supermercadoId;
    }
    
    const quejas = await Queja.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    
    return crearRespuesta(true, 'Quejas obtenidas exitosamente', quejas);
  } catch (error) {
    console.error('Error en obtenerQuejas:', error.message);
    return crearRespuesta(
      false,
      'Error al obtener quejas',
      null,
      error.message
    );
  }
}

/**
 * Obtener queja por ID
 */
async function obtenerQuejaPorId(id) {
  try {
    const queja = await Queja.findByPk(id);
    
    if (!queja) {
      return crearRespuesta(false, 'Queja no encontrada');
    }
    
    return crearRespuesta(true, 'Queja obtenida exitosamente', queja);
  } catch (error) {
    console.error('Error en obtenerQuejaPorId:', error.message);
    return crearRespuesta(
      false,
      'Error al obtener queja',
      null,
      error.message
    );
  }
}

/**
 * Crear una nueva queja
 */
async function crearQueja(datos) {
  try {
    // Validar campos requeridos
    const camposRequeridos = ['usuarioId', 'supermercadoId', 'supermercado', 'titulo', 'descripcion'];
    const faltantes = camposRequeridos.filter(campo => !datos[campo]);
    
    if (faltantes.length > 0) {
      return crearRespuesta(
        false,
        'Faltan campos requeridos',
        null,
        `Campos faltantes: ${faltantes.join(', ')}`
      );
    }
    
    const nuevaQueja = await Queja.create({
      usuarioId: datos.usuarioId,
      supermercadoId: datos.supermercadoId,
      supermercado: datos.supermercado,
      tipo: datos.tipo || 'otro',
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      productoId: datos.productoId,
      producto: datos.producto,
      estado: 'pendiente'
    });
    
    return crearRespuesta(
      true,
      'Queja creada exitosamente',
      nuevaQueja
    );
  } catch (error) {
    console.error('Error en crearQueja:', error.message);
    return crearRespuesta(
      false,
      'Error al crear queja',
      null,
      error.message
    );
  }
}

/**
 * Actualizar estado de una queja (para Profeco)
 */
async function actualizarEstadoQueja(id, datos, usuarioId) {
  try {
    const queja = await Queja.findByPk(id);
    
    if (!queja) {
      return crearRespuesta(false, 'Queja no encontrada');
    }
    
    const actualizacion = {
      estado: datos.estado
    };
    
    if (datos.respuesta) {
      actualizacion.respuesta = datos.respuesta;
    }
    
    if (datos.estado === 'resuelta' || datos.estado === 'rechazada') {
      actualizacion.resueltaPor = usuarioId;
      actualizacion.fechaResolucion = new Date();
    }
    
    await queja.update(actualizacion);
    
    return crearRespuesta(
      true,
      'Estado de queja actualizado exitosamente',
      queja
    );
  } catch (error) {
    console.error('Error en actualizarEstadoQueja:', error.message);
    return crearRespuesta(
      false,
      'Error al actualizar estado de queja',
      null,
      error.message
    );
  }
}

/**
 * Obtener estadísticas de quejas
 */
async function obtenerEstadisticas() {
  try {
    const total = await Queja.count();
    const porEstado = await Queja.findAll({
      attributes: [
        'estado',
        [Queja.sequelize.fn('COUNT', Queja.sequelize.col('id')), 'cantidad']
      ],
      group: ['estado'],
      raw: true
    });
    
    const porTipo = await Queja.findAll({
      attributes: [
        'tipo',
        [Queja.sequelize.fn('COUNT', Queja.sequelize.col('id')), 'cantidad']
      ],
      group: ['tipo'],
      raw: true
    });
    
    return crearRespuesta(true, 'Estadísticas obtenidas', {
      total,
      porEstado,
      porTipo
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
  obtenerQuejas,
  obtenerQuejaPorId,
  crearQueja,
  actualizarEstadoQueja,
  obtenerEstadisticas
};

