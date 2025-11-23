const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Oferta = sequelize.define('Oferta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  supermercadoId: { type: DataTypes.INTEGER, allowNull: false, field: 'supermercado_id' },
  supermercado: { type: DataTypes.STRING(100), allowNull: false },
  productoId: { type: DataTypes.INTEGER, allowNull: false, field: 'producto_id' },
  producto: { type: DataTypes.STRING(200), allowNull: false },
  precioOriginal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'precio_original' },
  precioOferta: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'precio_oferta' },
  descuento: { type: DataTypes.INTEGER, allowNull: false },
  vigenciaInicio: { type: DataTypes.DATEONLY, allowNull: false, field: 'vigencia_inicio' },
  vigenciaFin: { type: DataTypes.DATEONLY, allowNull: false, field: 'vigencia_fin' },
  activa: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'ofertas',
  timestamps: true,
  underscored: true
});

module.exports = Oferta;
