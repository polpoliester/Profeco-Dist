const Wishlist = require("../models/Wishlist");
const { crearRespuesta, validarCamposRequeridos } = require("../utils/helpers");
const { notificarWishlistAgregada } = require("../services/notificationService");

async function agregarWishlist(datos) {
  try {
    const validacion = validarCamposRequeridos(datos, [
      "usuarioId",
      "productoId",
      "nombreProducto"
    ]);

    if (!validacion.valido) {
      return crearRespuesta(false, "Faltan campos", null, validacion.errores);
    }

    const nuevo = await Wishlist.create(datos);

    // 🔔 Notificación wishlist
    await notificarWishlistAgregada(nuevo.toJSON());

    return crearRespuesta(true, "Producto agregado a wishlist", nuevo);

  } catch (error) {
    console.error("Error agregarWishlist:", error.message);
    return crearRespuesta(false, "Error", null, error.message);
  }
}

module.exports = {
  agregarWishlist
};
