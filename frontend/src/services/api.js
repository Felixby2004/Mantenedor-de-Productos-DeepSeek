import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('Recurso no encontrado');
    } else if (error.response?.status === 500) {
      console.error('Error del servidor');
    }
    return Promise.reject(error);
  }
);

export default api;