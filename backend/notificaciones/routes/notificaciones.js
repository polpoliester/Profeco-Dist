const express = require("express");
const router = express.Router();

const {
  getNotificaciones,
  patchNotificacion
} = require("../controllers/notificacionController");

router.get("/:usuarioId", getNotificaciones);   // Obtener notificaciones del usuario
router.patch("/:id/leida", patchNotificacion);  // Marcar como leída

module.exports = router;
