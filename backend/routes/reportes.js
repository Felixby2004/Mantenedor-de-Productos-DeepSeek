const express = require('express');
const reporteService = require('../services/reporteService');
const Producto = require('../models/Producto');
const dayjs = require('dayjs');
const router = express.Router();

router.get('/operacional', async (req, res) => {
  try {
    const { categoria } = req.query;
    const pdfBuffer = await reporteService.generarReporteOperacional(categoria);
    
    const fecha = dayjs().format('DD-MM-YYYY');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_Operacional_${fecha}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/gestion', async (req, res) => {
  try {
    // Obtener estadísticas actuales
    const productos = await Producto.findAll();
    const totalProductos = productos.length;
    const valorInventario = productos.reduce((sum, p) => 
      sum + (p.stock_actual * parseFloat(p.precio_venta)), 0);
    const productosBajoStock = productos.filter(p => p.stock_actual < p.stock_minimo).length;
    
    let productoMasValioso = null;
    let maxValor = 0;
    productos.forEach(p => {
      const valor = p.stock_actual * parseFloat(p.precio_venta);
      if (valor > maxValor) {
        maxValor = valor;
        productoMasValioso = p;
      }
    });
    
    // Conteo por categorías
    const categoriasCount = {};
    productos.forEach(p => {
      categoriasCount[p.categoria] = (categoriasCount[p.categoria] || 0) + 1;
    });
    const topCategorias = Object.entries(categoriasCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Valor por categorías
    const categoriasValor = {};
    productos.forEach(p => {
      const valor = p.stock_actual * parseFloat(p.precio_venta);
      categoriasValor[p.categoria] = (categoriasValor[p.categoria] || 0) + valor;
    });
    const distribucionCategorias = Object.entries(categoriasValor)
      .map(([name, value]) => ({ name, value }));
    
    const productosReorder = productos
      .filter(p => p.stock_actual < p.stock_minimo)
      .map(p => ({
        sku: p.sku,
        nombre: p.nombre,
        stock_actual: p.stock_actual,
        stock_minimo: p.stock_minimo,
        proveedor: p.proveedor
      }));
    
    const estadisticas = {
      kpis: {
        totalProductos,
        valorInventario,
        productosBajoStock,
        productoMasValioso: productoMasValioso ? {
          nombre: productoMasValioso.nombre,
          valor: maxValor
        } : null
      },
      graficos: { topCategorias, distribucionCategorias },
      productosReorder
    };
    
    const pdfBuffer = await reporteService.generarReporteGestion(estadisticas);
    
    const fecha = dayjs().format('DD-MM-YYYY');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_Gestion_${fecha}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;