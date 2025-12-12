const Resena = require('../models/Resena');

function crearRespuesta(success, mensaje, data = null, error = null) {
  return {
    success,
    mensaje,
    data,
    error
  };
}

/**
 * Obtener todas las resenas
 */
async function obtenerResenas(filtros = {}) {
  try {
    const where = {};
    
    if (filtros.usuarioId) {
      where.usuarioId = filtros.usuarioId;
    }
    
    if (filtros.supermercadoId) {
      where.supermercadoId = filtros.supermercadoId;
    }

    if (filtros.supermercado) {
      where.supermercado = filtros.supermercado;
    }

    if (filtros.calificacion) {
      where.calificacion = filtros.calificacion;
    }
    
    const resenas = await Resena.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    
    return crearRespuesta(true, 'Resenas obtenidas exitosamente', resenas);
  } catch (error) {
    console.error('Error en obtenerResenas:', error.message);
    return crearRespuesta(
      false,
      'Error al obtener resenas',
      null,
      error.message
    );
  }
}

/**
 * Obtener resena por ID
 */
async function obtenerResenaPorId(id) {
  try {
    const resena = await Resena.findByPk(id);
    
    if (!resena) {
      return crearRespuesta(false, 'Resena no encontrada');
    }
    
    return crearRespuesta(true, 'Resena obtenida exitosamente', resena);
  } catch (error) {
    console.error('Error en obtenerResenaPorId:', error.message);
    return crearRespuesta(
      false,
      'Error al obtener resena',
      null,
      error.message
    );
  }
}

/**
 * Crear una nueva resena
 */
async function crearResena(datos) {
  try {
    const camposRequeridos = ['usuarioId', 'supermercadoId', 'supermercado', 'calificacion'];
    const faltantes = camposRequeridos.filter(campo => !datos[campo]);
    
    if (faltantes.length > 0) {
      return crearRespuesta(
        false,
        'Faltan campos requeridos',
        null,
        `Campos faltantes: ${faltantes.join(', ')}`
      );
    }

    if (datos.calificacion < 1 || datos.calificacion > 5) {
      return crearRespuesta(
        false,
        'La calificacion debe estar entre 1 y 5',
        null,
        'Calificacion invalida'
      );
    }
    
    const nuevaResena = await Resena.create({
      usuarioId: datos.usuarioId,
      supermercadoId: datos.supermercadoId,
      supermercado: datos.supermercado,
      calificacion: datos.calificacion,
      comentario: datos.comentario || ''
    });
    
    return crearRespuesta(
      true,
      'Resena creada exitosamente',
      nuevaResena
    );
  } catch (error) {
    console.error('Error en crearResena:', error.message);
    return crearRespuesta(
      false,
      'Error al crear resena',
      null,
      error.message
    );
  }
}

/**
 * Actualizar una resena
 */
async function actualizarResena(id, datos) {
  try {
    const resena = await Resena.findByPk(id);
    
    if (!resena) {
      return crearRespuesta(false, 'Resena no encontrada');
    }

    const actualizacion = {};

    if (datos.calificacion) {
      if (datos.calificacion < 1 || datos.calificacion > 5) {
        return crearRespuesta(
          false,
          'La calificacion debe estar entre 1 y 5'
        );
      }
      actualizacion.calificacion = datos.calificacion;
    }

    if (datos.comentario !== undefined) {
      actualizacion.comentario = datos.comentario;
    }
    
    await resena.update(actualizacion);
    
    return crearRespuesta(
      true,
      'Resena actualizada exitosamente',
      resena
    );
  } catch (error) {
    console.error('Error en actualizarResena:', error.message);
    return crearRespuesta(
      false,
      'Error al actualizar resena',
      null,
      error.message
    );
  }
}

/**
 * Eliminar una resena
 */
async function eliminarResena(id) {
  try {
    const resena = await Resena.findByPk(id);
    
    if (!resena) {
      return crearRespuesta(false, 'Resena no encontrada');
    }
    
    await resena.destroy();
    
    return crearRespuesta(
      true,
      'Resena eliminada exitosamente',
      { id }
    );
  } catch (error) {
    console.error('Error en eliminarResena:', error.message);
    return crearRespuesta(
      false,
      'Error al eliminar resena',
      null,
      error.message
    );
  }
}

/**
 * Obtener estadisticas de resenas por supermercado
 */
async function obtenerEstadisticas(supermercadoId = null) {
  try {
    const where = supermercadoId ? { supermercadoId } : {};

    const resenas = await Resena.findAll({ where });

    if (resenas.length === 0) {
      return crearRespuesta(true, 'No hay resenas', {
        total: 0,
        promedioCalificacion: 0,
        distribucionCalificaciones: {}
      });
    }

    const total = resenas.length;
    const sumaCalificaciones = resenas.reduce((sum, r) => sum + r.calificacion, 0);
    const promedioCalificacion = (sumaCalificaciones / total).toFixed(2);

    const distribucion = {};
    for (let i = 1; i <= 5; i++) {
      distribucion[i] = resenas.filter(r => r.calificacion === i).length;
    }

    const porSupermercado = await Resena.findAll({
      attributes: [
        'supermercado',
        'supermercadoId',
        [Resena.sequelize.fn('COUNT', Resena.sequelize.col('id')), 'cantidad'],
        [Resena.sequelize.fn('AVG', Resena.sequelize.col('calificacion')), 'promedio']
      ],
      group: ['supermercado', 'supermercadoId'],
      raw: true
    });
    
    return crearRespuesta(true, 'Estadisticas obtenidas', {
      total,
      promedioCalificacion: parseFloat(promedioCalificacion),
      distribucionCalificaciones: distribucion,
      porSupermercado
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticas:', error.message);
    return crearRespuesta(
      false,
      'Error al obtener estadisticas',
      null,
      error.message
    );
  }
}

module.exports = {
  obtenerResenas,
  obtenerResenaPorId,
  crearResena,
  actualizarResena,
  eliminarResena,
  obtenerEstadisticas
};