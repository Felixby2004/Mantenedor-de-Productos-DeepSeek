import React, { useState, useEffect, useCallback } from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const Reportes = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [generating, setGenerating] = useState(false);

  const cargarCategorias = useCallback(async () => {
    try {
      const response = await api.get('/productos/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const generarReporteOperacional = async () => {
    setGenerating(true);
    try {
      const params = selectedCategoria ? { categoria: selectedCategoria } : {};
      const response = await api.get('/reportes/operacional', {
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_operacional_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      toast.error('Error generando reporte');
    } finally {
      setGenerating(false);
    }
  };

  const generarReporteGestion = async () => {
    setGenerating(true);
    try {
      const response = await api.get('/reportes/gestion', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_gestion_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      toast.error('Error generando reporte');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reportes</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reporte Operacional */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Reporte Operacional</h2>
            <p className="text-gray-600 mt-1">Listado detallado del inventario actual</p>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Filtrar por categoría (opcional)</label>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              onClick={generarReporteOperacional}
              disabled={generating}
              className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
            >
              <FiDownload /> {generating ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>
        
        {/* Reporte de Gestión */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Reporte de Gestión</h2>
            <p className="text-gray-600 mt-1">Análisis de inventario y toma de decisiones</p>
          </div>
          <div className="p-6">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Este reporte incluye: KPIs clave, análisis de categorías, productos con bajo stock y recomendaciones estratégicas.
              </p>
            </div>
            <button
              onClick={generarReporteGestion}
              disabled={generating}
              className="w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
            >
              <FiPrinter /> {generating ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;