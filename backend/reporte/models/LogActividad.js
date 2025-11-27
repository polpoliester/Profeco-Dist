const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LogActividad = sequelize.define('LogActividad', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuarioId: { type: DataTypes.INTEGER, field: 'usuario_id' },
  accion: { type: DataTypes.STRING(100), allowNull: false },
  entidad: { type: DataTypes.STRING(50) },
  entidadId: { type: DataTypes.INTEGER, field: 'entidad_id' },
  detalles: { type: DataTypes.TEXT }
}, {
  tableName: 'logs_actividad',
  timestamps: true,
  underscored: true
});

module.exports = LogActividad;
