import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiPackage, FiDollarSign, FiAlertCircle, FiStar } from 'react-icons/fi';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState({
    kpis: {},
    graficos: { topCategorias: [], distribucionCategorias: [] },
    productosReorder: []
  });
  const [loading, setLoading] = useState(true);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await api.get('/productos/estadisticas');
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Dashboard</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Productos</p>
              <p className="text-lg font-bold text-slate-800">{estadisticas.kpis.totalProductos || 0}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <FiPackage className="text-indigo-600 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Valor Inventario</p>
              <p className="text-lg font-bold text-slate-800">${(estadisticas.kpis.valorInventario || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <FiDollarSign className="text-emerald-600 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Bajo Stock</p>
              <p className="text-lg font-bold text-rose-600">{estadisticas.kpis.productosBajoStock || 0}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl">
              <FiAlertCircle className="text-rose-600 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Más Valioso</p>
              <p className="text-md font-bold text-slate-800 truncate max-w-[150px]">{estadisticas.kpis.productoMasValioso?.nombre || 'N/A'}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <FiStar className="text-amber-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
            Top 10 Categorías
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={estadisticas.graficos.topCategorias}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
            Distribución por Categoría
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={estadisticas.graficos.distribucionCategorias}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {estadisticas.graficos.distribucionCategorias.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Productos a Reordenar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-rose-600 rounded-full"></div>
            Alertas de Reabastecimiento
          </h2>
          <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full uppercase">
            {estadisticas.productosReorder.length} Críticos
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-center">Stock Actual</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-center">Stock Mínimo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Categoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estadisticas.productosReorder.map((producto, index) => (
                <tr key={producto.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-rose-50/30 transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{producto.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{producto.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold">
                      {producto.stock_actual}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-500 font-medium">{producto.stock_minimo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {producto.categoria}
                    </span>
                  </td>
                </tr>
              ))}
              {estadisticas.productosReorder.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                    Excelente! Todos los productos están por encima del stock mínimo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;