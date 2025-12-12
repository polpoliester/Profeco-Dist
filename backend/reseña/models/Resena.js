const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resena = sequelize.define('Resena', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  usuarioId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    field: 'usuario_id' 
  },
  supermercadoId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    field: 'supermercado_id' 
  },
  supermercado: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  calificacion: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comentario: { 
    type: DataTypes.TEXT 
  }
}, {
  tableName: 'resenas',
  timestamps: true,
  underscored: true
});

module.exports = Resena;