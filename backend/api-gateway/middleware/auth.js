// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'profeco_secret_key_2025';

// Middleware para verificar token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      mensaje: 'Token de autenticación requerido'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        mensaje: 'Token inválido o expirado'
      });
    }
    req.user = user;
    next();
  });
}

// Middleware para autorizar por roles
function authorize(...tiposPermitidos) {
  return (req, res, next) => {
    if (!tiposPermitidos.includes(req.user.tipo)) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permisos para realizar esta acción'
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorize,
  JWT_SECRET
};
