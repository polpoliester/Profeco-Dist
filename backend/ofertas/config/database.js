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
    console.log('✅ MySQL conectado');
    return true;
  } catch (error) {
    console.error('❌ Error MySQL:', error.message);
    return false;
  }
}

async function sincronizarModelos() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados');
    return true;
  } catch (error) {
    console.error('❌ Error sincronizando:', error.message);
    return false;
  }
}

async function cerrarConexion() {
  try {
    await sequelize.close();
    console.log('✅ MySQL cerrado');
  } catch (error) {
    console.error('Error cerrando:', error.message);
  }
}

module.exports = { sequelize, conectarDB, sincronizarModelos, cerrarConexion };
