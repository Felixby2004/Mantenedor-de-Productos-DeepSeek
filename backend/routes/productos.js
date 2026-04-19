const express = require('express');
const { body } = require('express-validator');
const productoController = require('../controllers/productoController');
const router = express.Router();

const validateProducto = [
  body('sku').notEmpty().withMessage('SKU es requerido')
    .isLength({ max: 50 }).withMessage('SKU no puede exceder 50 caracteres'),
  body('nombre').notEmpty().withMessage('Nombre es requerido')
    .isLength({ max: 100 }).withMessage('Nombre no puede exceder 100 caracteres'),
  body('categoria').notEmpty().withMessage('Categoría es requerida'),
  body('precio_compra').isFloat({ min: 0 }).withMessage('Precio compra debe ser ≥ 0'),
  body('precio_venta').isFloat({ min: 0 }).withMessage('Precio venta debe ser ≥ 0')
    .custom((value, { req }) => {
      if (parseFloat(value) < parseFloat(req.body.precio_compra)) {
        throw new Error('El precio de venta debe ser mayor o igual al precio de compra');
      }
      return true;
    }),
  body('stock_actual').isInt({ min: 0 }).withMessage('Stock actual debe ser ≥ 0'),
  body('stock_minimo').isInt({ min: 0 }).withMessage('Stock mínimo debe ser ≥ 0')
];

// Middleware para verificar SKU duplicado
const checkSkuDuplicate = async (req, res, next) => {
  const { sku } = req.body;
  const { id } = req.params;
  const Producto = require('../models/Producto');
  const { Op } = require('sequelize');
  
  try {
    const whereCondition = { sku };
    if (id) {
      whereCondition.id = { [Op.ne]: id };
    }
    
    const existingProduct = await Producto.findOne({ where: whereCondition });
    if (existingProduct) {
      return res.status(400).json({ error: 'El SKU ya existe en otro producto' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.get('/', productoController.getAll);
router.get('/categorias', productoController.getCategorias);
router.get('/estadisticas', productoController.getEstadisticas);
router.get('/:id', productoController.getById);
router.post('/', validateProducto, checkSkuDuplicate, productoController.create);
router.put('/:id', validateProducto, checkSkuDuplicate, productoController.update);
router.delete('/:id', productoController.delete);

module.exports = router;