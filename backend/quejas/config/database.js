const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('profeco_db', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

async function conectarDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('MySQL conectado - Quejas');
    return true;
  } catch (error) {
    console.error('Error MySQL Quejas:', error.message);
    return false;
  }
}

module.exports = { sequelize, conectarDB };



