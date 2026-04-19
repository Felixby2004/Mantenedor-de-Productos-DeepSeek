const PDFDocument = require('pdfkit');
const Producto = require('../models/Producto');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

class ReporteService {
  async generarReporteOperacional(categoria = null) {
    const whereCondition = categoria ? { categoria } : {};
    const productos = await Producto.findAll({ where: whereCondition });
    
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    // Header mejorado (similar a captura)
    doc.fontSize(22).fillColor('#2563eb').font('Helvetica-Bold').text('Sistema de Gestión de Productos', { align: 'left' });
    doc.fontSize(10).fillColor('#64748b').font('Helvetica').text('Reporte Operacional', { align: 'left' });
    
    // Info de fecha y filtros a la derecha
    const rightInfoX = 400;
    doc.fontSize(9).fillColor('#1e293b');
    doc.text(`Fecha: ${dayjs().format('DD/MM/YYYY')}`, rightInfoX, 50, { align: 'right' });
    doc.text(`Categoría: ${categoria || 'Todas'}`, rightInfoX, 62, { align: 'right' });
    doc.text(`Total registros: ${productos.length}`, rightInfoX, 74, { align: 'right' });
    
    // Línea azul separadora
    doc.moveTo(50, 100).lineTo(550, 100).strokeColor('#2563eb').lineWidth(2).stroke();
    doc.moveDown(2);
    
    doc.fontSize(14).fillColor('#1e293b').font('Helvetica-Bold').text('Listado del Inventario Actual', 50, 120);
    doc.moveDown();
    
    // Tabla con estilo (Azul como en captura)
    const tableTop = 150;
    const colWidths = { sku: 70, nombre: 150, categoria: 80, stock: 40, precio: 70, valor: 70, proveedor: 70 };
    
    // Header de tabla azul
    doc.rect(50, tableTop, 500, 25).fill('#2563eb');
    doc.fontSize(10).fillColor('#ffffff').font('Helvetica-Bold');
    doc.text('SKU', 55, tableTop + 7);
    doc.text('Nombre', 125, tableTop + 7);
    doc.text('Categoría', 275, tableTop + 7);
    doc.text('Stock', 355, tableTop + 7);
    doc.text('Precio Venta', 400, tableTop + 7);
    doc.text('Valor Total', 475, tableTop + 7);
    
    let currentY = tableTop + 25;
    let totalInventario = 0;
    
    doc.font('Helvetica').fontSize(9).fillColor('#334155');
    
    productos.forEach((producto, index) => {
      const valorTotal = producto.stock_actual * parseFloat(producto.precio_venta);
      totalInventario += valorTotal;
      
      // Fondo alterno
      if (index % 2 === 1) {
        doc.rect(50, currentY, 500, 20).fill('#f8fafc');
        doc.fillColor('#334155');
      }
      
      doc.text(producto.sku, 55, currentY + 5);
      doc.text(producto.nombre.substring(0, 25), 125, currentY + 5);
      doc.text(producto.categoria, 275, currentY + 5);
      doc.text(producto.stock_actual.toString(), 355, currentY + 5);
      doc.text(`S/ ${parseFloat(producto.precio_venta).toLocaleString()}`, 400, currentY + 5);
      doc.text(`S/ ${valorTotal.toLocaleString()}`, 475, currentY + 5);
      
      currentY += 20;
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });
    
    // Total final con banda azul clara
    doc.rect(50, currentY, 500, 25).fill('#eff6ff');
    doc.fontSize(10).fillColor('#1e3a8a').font('Helvetica-Bold');
    doc.text('Total inventario (valor venta)', 55, currentY + 7);
    doc.text(`S/ ${totalInventario.toLocaleString()}`, 450, currentY + 7, { align: 'right', width: 90 });
    
    // Footer profesional
    doc.fontSize(8).fillColor('#94a3b8').text('Documento generado automáticamente por Sistema de Gestión de Productos • Confidencial', 50, 750, { align: 'center' });
    
    doc.end();
    
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    });
  }
  
  async generarReporteGestion(estadisticas) {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    // Header profesional
    doc.fontSize(22).fillColor('#2563eb').font('Helvetica-Bold').text('Sistema de Gestión de Productos', { align: 'left' });
    doc.fontSize(10).fillColor('#64748b').font('Helvetica').text('Reporte de Gestión', { align: 'left' });
    doc.fontSize(9).fillColor('#1e293b').text(`Fecha: ${dayjs().format('DD/MM/YYYY')}`, 400, 50, { align: 'right' });
    
    doc.moveTo(50, 100).lineTo(550, 100).strokeColor('#2563eb').lineWidth(2).stroke();
    
    // KPIs en Cards (simulado con rectángulos)
    const cardY = 130;
    const cardWidth = 150;
    
    // Card 1
    doc.roundedRect(50, cardY, cardWidth, 60, 8).strokeColor('#e2e8f0').stroke();
    doc.fontSize(8).fillColor('#64748b').text('TOTAL PRODUCTOS', 60, cardY + 15);
    doc.fontSize(18).fillColor('#2563eb').text(estadisticas.kpis.totalProductos.toString(), 60, cardY + 30);
    
    // Card 2
    doc.roundedRect(220, cardY, cardWidth, 60, 8).stroke();
    doc.fontSize(8).fillColor('#64748b').text('VALOR INVENTARIO', 230, cardY + 15);
    doc.fontSize(18).fillColor('#2563eb').text(`S/ ${estadisticas.kpis.valorInventario.toLocaleString()}`, 230, cardY + 30);
    
    // Card 3
    doc.roundedRect(390, cardY, cardWidth, 60, 8).stroke();
    doc.fontSize(8).fillColor('#64748b').text('BAJO STOCK', 400, cardY + 15);
    doc.fontSize(18).fillColor('#ef4444').text(estadisticas.kpis.productosBajoStock.toString(), 400, cardY + 30);
    
    doc.moveDown(6);
    
    // Top Categorías con Valor
    doc.fontSize(14).fillColor('#1e293b').font('Helvetica-Bold').text('Análisis por Categoría', 50, 210);
    doc.moveDown();
    
    const catHeaderY = 230;
    doc.rect(50, catHeaderY, 500, 20).fill('#2563eb');
    doc.fontSize(9).fillColor('#ffffff').text('Categoría', 60, catHeaderY + 6);
    doc.text('Productos', 250, catHeaderY + 6);
    doc.text('Valor Inventario', 400, catHeaderY + 6);
    
    let currentY = catHeaderY + 20;
    estadisticas.graficos.topCategorias.forEach((cat, index) => {
      if (index % 2 === 1) doc.rect(50, currentY, 500, 18).fill('#f8fafc');
      doc.fillColor('#334155').text(cat.name, 60, currentY + 5);
      doc.text(cat.value.toString(), 250, currentY + 5);
      
      // Obtener el valor para esta categoría de distribucionCategorias
      const catValor = estadisticas.graficos.distribucionCategorias.find(d => d.name === cat.name)?.value || 0;
      doc.text(`S/ ${catValor.toLocaleString()}`, 400, currentY + 5);
      currentY += 18;
    });
    
    // Productos con bajo stock
    currentY += 20;
    if (currentY > 600) { doc.addPage(); currentY = 50; }
    
    doc.fontSize(14).fillColor('#1e293b').font('Helvetica-Bold').text('Productos por reordenar (bajo stock)', 50, currentY);
    currentY += 20;
    
    doc.rect(50, currentY, 500, 20).fill('#ef4444'); // Rojo para bajo stock
    doc.fontSize(9).fillColor('#ffffff').text('SKU', 60, currentY + 6);
    doc.text('Nombre', 120, currentY + 6);
    doc.text('Stock Actual', 320, currentY + 6);
    doc.text('Mínimo', 420, currentY + 6);
    doc.text('Proveedor', 480, currentY + 6);
    
    currentY += 20;
    if (estadisticas.productosReorder.length === 0) {
      doc.fillColor('#334155').text('No hay productos con bajo stock.', 60, currentY + 5);
      currentY += 20;
    } else {
      estadisticas.productosReorder.forEach((p, index) => {
        if (index % 2 === 1) doc.rect(50, currentY, 500, 18).fill('#fef2f2');
        doc.fillColor('#334155').text(p.sku, 60, currentY + 5);
        doc.text(p.nombre.substring(0, 30), 120, currentY + 5);
        doc.fillColor('#ef4444').font('Helvetica-Bold').text(p.stock_actual.toString(), 320, currentY + 5);
        doc.fillColor('#334155').font('Helvetica').text(p.stock_minimo.toString(), 420, currentY + 5);
        doc.text((p.proveedor || 'N/A').substring(0, 15), 480, currentY + 5);
        currentY += 18;
        
        if (currentY > 700) { doc.addPage(); currentY = 50; }
      });
    }
    
    // Recomendaciones Estratégicas
    currentY += 30;
    doc.fontSize(14).fillColor('#1e293b').font('Helvetica-Bold').text('Recomendaciones Estratégicas', 50, currentY);
    currentY += 20;
    
    doc.fontSize(10).font('Helvetica').fillColor('#1e293b');
    const recs = [];
    if (estadisticas.kpis.productosBajoStock > 0) {
      recs.push(`• Alerta: Existen ${estadisticas.kpis.productosBajoStock} productos por debajo del stock mínimo. Se recomienda reabastecer inmediatamente para evitar pérdida de ventas.`);
    }
    if (estadisticas.kpis.valorInventario > 50000) {
      recs.push('• Optimización: El valor del inventario es alto. Considere promociones para productos de baja rotación y liberar flujo de caja.');
    }
    recs.push(`• Enfoque: La categoría "${estadisticas.graficos.topCategorias[0]?.name || 'Principal'}" lidera el inventario. Asegure acuerdos preferenciales con proveedores de este rubro.`);
    
    recs.forEach(rec => {
      doc.text(rec, 50, currentY, { width: 500 });
      currentY += doc.heightOfString(rec, { width: 500 }) + 5;
    });
    
    doc.fontSize(8).fillColor('#94a3b8').text('Documento generado automáticamente por Sistema de Gestión de Productos • Confidencial', 50, 750, { align: 'center' });
    
    doc.end();
    
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    });
  }
}

module.exports = new ReporteService();