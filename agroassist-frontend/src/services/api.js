import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración base de la API
const BASE_URL = 'http://localhost:3000/api';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT automáticamente
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener el token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // Aquí podrías navegar al login si tienes acceso al navegador
    }
    return Promise.reject(error);
  }
);

/**
 * Servicios de Autenticación
 */
export const authService = {
  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error en el registro',
        details: error.response?.data,
      };
    }
  },

  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Guardar token y datos del usuario
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error en el login',
        details: error.response?.data,
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Error al cerrar sesión',
      };
    }
  },

  // Recuperar contraseña
  recoverPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/recover-password', { email });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al recuperar contraseña',
      };
    }
  },

  // Verificar si está logueado
  isLoggedIn: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        return {
          success: true,
          token,
          user: JSON.parse(userData),
        };
      }
      
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  },
};

/**
 * Servicios de Plagas (Sistema Colombiano en Español)
 */
export const plagasService = {
  // Información del sistema
  getSystemInfo: async () => {
    try {
      const response = await apiClient.get('/plagas/info-sistema');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener información del sistema',
      };
    }
  },

  // Test del sistema
  testSystem: async () => {
    try {
      const response = await apiClient.get('/plagas/test-colombia');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error en el test del sistema',
      };
    }
  },

  // Lista de cultivos disponibles
  getCultivos: async () => {
    try {
      const response = await apiClient.get('/plagas/cultivos-colombia');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener cultivos',
      };
    }
  },

  // Buscar información de una plaga
  buscarPlaga: async (nombrePlaga) => {
    try {
      const response = await apiClient.get(`/plagas/buscar/${encodeURIComponent(nombrePlaga)}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al buscar la plaga',
      };
    }
  },

  // Obtener plagas de un cultivo
  getPlagasCultivo: async (nombreCultivo) => {
    try {
      const response = await apiClient.get(`/plagas/cultivo/${encodeURIComponent(nombreCultivo)}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener plagas del cultivo',
      };
    }
  },

  // Buscar plagas por ubicación
  buscarPorUbicacion: async (latitud, longitud, tipoCultivo = null) => {
    try {
      const response = await apiClient.post('/plagas/ubicacion', {
        latitud,
        longitud,
        tipoCultivo,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al buscar plagas por ubicación',
      };
    }
  },

  // Obtener plan de manejo
  getPlanManejo: async (nombrePlaga, nombreCultivo = null) => {
    try {
      const response = await apiClient.post('/plagas/plan-manejo', {
        nombrePlaga,
        nombreCultivo,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener plan de manejo',
      };
    }
  },
};

/**
 * Servicios de Precios de Mercado
 */
export const preciosService = {
  // Test del sistema de precios
  testSystem: async () => {
    try {
      const response = await apiClient.get('/market/test');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error en el test de precios',
      };
    }
  },

  // Obtener precios por producto
  getPreciosProducto: async (nombreProducto) => {
    try {
      const response = await apiClient.get(`/market/prices/${encodeURIComponent(nombreProducto)}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener precios del producto',
      };
    }
  },

  // Análisis de mercado
  getAnalisisMercado: async (producto, region = null) => {
    try {
      const response = await apiClient.post('/market/analysis', {
        producto,
        region,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener análisis de mercado',
      };
    }
  },

  // Comparación regional
  getComparacionRegional: async (producto) => {
    try {
      const response = await apiClient.get(`/market/regional/${encodeURIComponent(producto)}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener comparación regional',
      };
    }
  },

  // Historial de precios
  getHistorialPrecios: async (producto, dias = 30) => {
    try {
      const response = await apiClient.get(`/market/history/${encodeURIComponent(producto)}?dias=${dias}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener historial de precios',
      };
    }
  },
};

/**
 * Servicios de Clima
 */
export const climaService = {
  // Pronóstico del clima
  getPronostico: async (latitud, longitud) => {
    try {
      const response = await apiClient.post('/weather/forecast', {
        lat: latitud,
        lon: longitud,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener pronóstico del clima',
      };
    }
  },
};

export default apiClient;
