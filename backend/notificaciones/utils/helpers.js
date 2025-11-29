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

function crearRespuesta(success, mensaje, data = null, error = null) {
  const respuesta = { ok: success, mensaje };
  
  if (data !== null) {
    respuesta.data = data;
  }
  
  if (error !== null) {
    respuesta.error = error;
  }
  
  return respuesta;
}

module.exports = {
  validarCamposRequeridos,
  crearRespuesta
};
