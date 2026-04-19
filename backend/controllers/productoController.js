const { validationResult } = require('express-validator');
const Producto = require('../models/Producto');
const { Op, Sequelize } = require('sequelize');

const productoController = {
  // Obtener todos los productos con paginación y búsqueda
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '', categoria = '' } = req.query;
      const offset = (page - 1) * limit;
      
      const whereCondition = {};
      
      if (search) {
        whereCondition[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { sku: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      if (categoria) {
        whereCondition.categoria = categoria;
      }
      
      const { count, rows } = await Producto.findAndCountAll({
        where: whereCondition,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha_creacion', 'DESC']]
      });
      
      res.json({
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        data: rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener lista única de categorías
    async getCategorias(req, res) {
      try {
        const categorias = await Producto.findAll({
          attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('categoria')), 'categoria']],
          raw: true
        });
        
        // Extraer valores únicos y ordenar
        const listaCategorias = categorias
          .map(c => c.categoria)
          .filter(c => c && c.trim() !== '')
          .sort();
          
        res.json(listaCategorias);
      } catch (error) {
        console.error('Error en getCategorias:', error);
        res.status(500).json({ error: error.message });
      }
    },
  
  // Obtener producto por ID
  async getById(req, res) {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(producto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  // Crear producto
  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const producto = await Producto.create(req.body);
      res.status(201).json(producto);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Agregar esta función al controlador existente
  async checkSkuExists(req, res, next) {
    const { sku } = req.body;
    const { id } = req.params;
    
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
  },
  
  // Actualizar producto
  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      await producto.update(req.body);
      res.json(producto);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  
  // Eliminar producto
  async delete(req, res) {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      await producto.destroy();
      res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  // Obtener estadísticas para dashboard
  async getEstadisticas(req, res) {
    try {
      const productos = await Producto.findAll();
      
      const totalProductos = productos.length;
      const valorInventario = productos.reduce((sum, p) => 
        sum + (p.stock_actual * parseFloat(p.precio_compra)), 0);
      const productosBajoStock = productos.filter(p => p.stock_actual < p.stock_minimo).length;
      
      let productoMasValioso = null;
      let maxValor = 0;
      productos.forEach(p => {
        const valor = p.stock_actual * parseFloat(p.precio_compra);
        if (valor > maxValor) {
          maxValor = valor;
          productoMasValioso = p;
        }
      });
      
      // Top 10 categorías
      const categoriasCount = {};
      productos.forEach(p => {
        categoriasCount[p.categoria] = (categoriasCount[p.categoria] || 0) + 1;
      });
      const topCategorias = Object.entries(categoriasCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));
      
      // Distribución por categoría (valor)
      const categoriasValor = {};
      productos.forEach(p => {
        const valor = p.stock_actual * parseFloat(p.precio_compra);
        categoriasValor[p.categoria] = (categoriasValor[p.categoria] || 0) + valor;
      });
      const distribucionCategorias = Object.entries(categoriasValor)
        .map(([name, value]) => ({ name, value }));
      
      // Productos a reordenar
      const productosReorder = productos
        .filter(p => p.stock_actual < p.stock_minimo)
        .map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          stock_actual: p.stock_actual,
          stock_minimo: p.stock_minimo,
          categoria: p.categoria
        }));
      
      res.json({
        kpis: {
          totalProductos,
          valorInventario,
          productosBajoStock,
          productoMasValioso: productoMasValioso ? {
            nombre: productoMasValioso.nombre,
            valor: maxValor
          } : null
        },
        graficos: {
          topCategorias,
          distribucionCategorias
        },
        productosReorder
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = productoController;