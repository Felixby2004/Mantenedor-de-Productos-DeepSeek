const sequelize = require('../config/database');
const Producto = require('../models/Producto');

const productosDemo = [
  {
    sku: 'PROD-001',
    nombre: 'Laptop Gaming',
    descripcion: 'Laptop de alta gama para gaming',
    categoria: 'Electrónica',
    precio_compra: 800.00,
    precio_venta: 1200.00,
    stock_actual: 15,
    stock_minimo: 5,
    proveedor: 'TechDistributors S.A.'
  },
  {
    sku: 'PROD-002',
    nombre: 'Mouse Inalámbrico',
    descripcion: 'Mouse ergonómico Bluetooth',
    categoria: 'Accesorios',
    precio_compra: 15.00,
    precio_venta: 29.99,
    stock_actual: 3,
    stock_minimo: 10,
    proveedor: 'Periféricos Plus'
  },
  {
    sku: 'PROD-003',
    nombre: 'Monitor 24"',
    descripcion: 'Monitor Full HD 75Hz',
    categoria: 'Electrónica',
    precio_compra: 120.00,
    precio_venta: 199.99,
    stock_actual: 8,
    stock_minimo: 4,
    proveedor: 'TechDistributors S.A.'
  },
  {
    sku: 'PROD-004',
    nombre: 'Teclado Mecánico',
    descripcion: 'Teclado RGB switches azules',
    categoria: 'Accesorios',
    precio_compra: 45.00,
    precio_venta: 89.99,
    stock_actual: 2,
    stock_minimo: 8,
    proveedor: 'Periféricos Plus'
  },
  {
    sku: 'PROD-005',
    nombre: 'Silla Ergonómica',
    descripcion: 'Silla de oficina con soporte lumbar',
    categoria: 'Mobiliario',
    precio_compra: 150.00,
    precio_venta: 299.99,
    stock_actual: 6,
    stock_minimo: 3,
    proveedor: 'Mobiliario Office'
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida.');
    
    // Limpiar tabla existente
    await Producto.destroy({ where: {}, truncate: true });
    console.log('Datos existentes eliminados.');
    
    // Insertar datos demo
    await Producto.bulkCreate(productosDemo);
    console.log(`${productosDemo.length} productos insertados.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
}

seed();