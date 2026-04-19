import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { createPortal } from 'react-dom';
import ProductoModal from '../components/Productos/ProductoModal';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  const cargarCategorias = useCallback(async () => {
    try {
      const response = await api.get('/productos/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }, []);

  const cargarProductos = useCallback(async () => {
    try {
      const response = await api.get('/productos', {
        params: { page: currentPage, limit: 10, search, categoria }
      });
      setProductos(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Error cargando productos');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, categoria]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await api.delete(`/productos/${id}`);
        toast.success('Producto eliminado exitosamente');
        cargarProductos();
      } catch (error) {
        toast.error('Error eliminando producto');
      }
    }
  };

  const handleSave = async (productoData) => {
    try {
      if (selectedProducto) {
        await api.put(`/productos/${selectedProducto.id}`, productoData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await api.post('/productos', productoData);
        toast.success('Producto creado exitosamente');
      }
      setModalOpen(false);
      setSelectedProducto(null);
      cargarProductos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error guardando producto');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Productos</h1>
        <button
          onClick={() => {
            setSelectedProducto(null);
            setModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <FiPlus className="text-xl" /> Nuevo Producto
        </button>
      </div>
      
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm appearance-none cursor-pointer text-slate-600"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Tabla de productos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider first:rounded-tl-2xl">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Precio Venta</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider last:rounded-tr-2xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-slate-500 font-medium">Cargando productos...</span>
                    </div>
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 italic">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                productos.map((producto, index) => (
                  <tr 
                    key={producto.id} 
                    className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    onClick={() => {
                      setSelectedProducto(producto);
                      setModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{producto.sku}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{producto.nombre}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className={`flex items-center gap-2 font-semibold ${producto.stock_actual < producto.stock_minimo ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {producto.stock_actual < producto.stock_minimo && (
                          <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></div>
                        )}
                        {producto.stock_actual}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">${producto.precio_venta}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProducto(producto);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 className="text-lg" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(producto.id);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
      
      <ProductoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProducto(null);
        }}
        onSave={handleSave}
        producto={selectedProducto}
      />
    </div>
  );

  return createPortal(
    <>
      {/* tu modal completo */}
    </>,
    document.body
  );

};

export default Productos;