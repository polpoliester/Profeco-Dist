const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Wishlist = sequelize.define("Wishlist", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  nombreProducto: {
    type: DataTypes.STRING,
    allowNull: false
  },

  supermercado: {
    type: DataTypes.STRING,
    allowNull: true
  },

  precioReferencia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }

}, {
  tableName: "wishlist",
  timestamps: true
});

module.exports = Wishlist;
