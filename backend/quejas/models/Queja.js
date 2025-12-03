const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Queja = sequelize.define('Queja', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
  supermercadoId: { type: DataTypes.INTEGER, allowNull: false, field: 'supermercado_id' },
  supermercado: { type: DataTypes.STRING(100), allowNull: false },
  tipo: { 
    type: DataTypes.ENUM('precio', 'calidad', 'servicio', 'publicidad_engañosa', 'otro'), 
    allowNull: false,
    defaultValue: 'otro'
  },
  titulo: { type: DataTypes.STRING(200), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  productoId: { type: DataTypes.INTEGER, field: 'producto_id' },
  producto: { type: DataTypes.STRING(200) },
  estado: { 
    type: DataTypes.ENUM('pendiente', 'en_revision', 'resuelta', 'rechazada'), 
    defaultValue: 'pendiente' 
  },
  respuesta: { type: DataTypes.TEXT },
  resueltaPor: { type: DataTypes.INTEGER, field: 'resuelta_por' },
  fechaResolucion: { type: DataTypes.DATE, field: 'fecha_resolucion' }
}, {
  tableName: 'quejas',
  timestamps: true,
  underscored: true
});

module.exports = Queja;

