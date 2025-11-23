function calcularDescuento(precioOriginal, precioOferta) {
  if (!precioOriginal || !precioOferta) {
    return 0;
  }
  
  const original = parseFloat(precioOriginal);
  const oferta = parseFloat(precioOferta);
  
  if (original <= 0 || oferta <= 0 || oferta >= original) {
    return 0;
  }
  
  return Math.round(((original - oferta) / original) * 100);
}

function validarCamposRequeridos(datos, camposRequeridos) {
  const errores = [];
  
  for (const campo of camposRequeridos) {
    if (!datos[campo] && datos[campo] !== 0 && datos[campo] !== false) {
      errores.push(`El campo '${campo}' es requerido`);
    }
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}

function formatearErrorSequelize(error) {
  if (error.name === 'SequelizeValidationError') {
    return error.errors.map(e => e.message).join(', ');
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return 'Ya existe un registro con esos datos';
  }
  
  return error.message || 'Error en la base de datos';
}

function crearRespuesta(success, mensaje, data = null, error = null) {
  const respuesta = { success, mensaje };
  
  if (data !== null) {
    respuesta.data = data;
  }
  
  if (error !== null) {
    respuesta.error = error;
  }
  
  return respuesta;
}

function estaVigente(vigenciaInicio, vigenciaFin) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const inicio = new Date(vigenciaInicio);
  const fin = new Date(vigenciaFin);
  
  return hoy >= inicio && hoy <= fin;
}

module.exports = {
  calcularDescuento,
  validarCamposRequeridos,
  formatearErrorSequelize,
  crearRespuesta,
  estaVigente
};