const sequelize = require('../config/database');
const Producto = require('../models/Producto');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');
    
    // Sincronizar modelos
    await sequelize.sync({ force: true });
    console.log('Modelos sincronizados correctamente.');
    
    console.log('Migración completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
}

migrate();