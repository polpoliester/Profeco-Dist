const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notificacion = sequelize.define('Notificacion', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuarioId: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false },
  payload: { type: DataTypes.JSON, allowNull: false },
  leida: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'notificaciones',
  timestamps: true
});

module.exports = Notificacion;
