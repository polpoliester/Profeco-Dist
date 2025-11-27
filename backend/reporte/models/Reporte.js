const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reporte = sequelize.define('Reporte', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
  supermercadoId: { type: DataTypes.INTEGER, allowNull: false, field: 'supermercado_id' },
  supermercado: { type: DataTypes.STRING(100), allowNull: false },
  productoId: { type: DataTypes.INTEGER, allowNull: false, field: 'producto_id' },
  producto: { type: DataTypes.STRING(200), allowNull: false },
  precioPublicado: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'precio_publicado' },
  precioReal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'precio_real' },
  descripcion: { type: DataTypes.TEXT },
  estado: { 
    type: DataTypes.ENUM('pendiente', 'revisado', 'resuelto'), 
    defaultValue: 'pendiente' 
  }
}, {
  tableName: 'reportes',
  timestamps: true,
  underscored: true
});

module.exports = Reporte;
