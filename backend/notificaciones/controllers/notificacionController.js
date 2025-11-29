const {
  obtenerNotificaciones,
  marcarLeida
} = require("../services/userNotificationService");

async function getNotificaciones(req, res) {
  const { usuarioId } = req.params;
  const r = await obtenerNotificaciones(usuarioId);
  res.status(r.ok ? 200 : 400).json(r);
}

async function patchNotificacion(req, res) {
  const { id } = req.params;
  const r = await marcarLeida(id);
  res.status(r.ok ? 200 : 400).json(r);
}

module.exports = {
  getNotificaciones,
  patchNotificacion
};
