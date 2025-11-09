import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { User, LoginCredentials, RegisterData } from '../types';
import { API_CONFIG } from '../config/api';

class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      // Mapear campos del frontend (inglés) al backend (español)
      const payload = {
        correo: credentials.email,
        contrasena: credentials.password
      };
      
      const url = `${API_CONFIG.BACKEND_URL}/auth/login`;
      console.log('🔗 Intentando conectar a:', url);
      console.log('📧 Email:', credentials.email);
      
      const response = await axios.post(url, payload, {
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });
      const { user, token } = response.data;
      
      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Lanzar error específico según el tipo
      if (error.response) {
        // Error del servidor (401, 404, 500, etc.)
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        
        if (status === 401) {
          throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else if (status === 423) {
          throw new Error('Cuenta bloqueada por múltiples intentos fallidos. Intenta más tarde.');
        } else {
          throw new Error(message || 'Error al iniciar sesión. Intenta nuevamente.');
        }
      } else if (error.request) {
        // Error de red - backend no disponible
        console.error('❌ Error de red. Backend URL:', API_CONFIG.BACKEND_URL);
        throw new Error(`No se pudo conectar al servidor. Verifica que el backend esté corriendo.\nURL: ${API_CONFIG.BACKEND_URL}`);
      } else {
        // Otro tipo de error
        throw new Error(error.message || 'Error inesperado al iniciar sesión.');
      }
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Mapear campos del frontend (inglés) al backend (español)
      const payload = {
        nombre_completo: data.name,
        correo: data.email,
        contrasena: data.password,
        telefono: data.phone
      };

      const response = await axios.post(`${API_CONFIG.BACKEND_URL}/auth/register`, payload, {
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });
      
      const { user, token } = response.data;
      
      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      // Lanzar error específico según el tipo
      if (error.response) {
        // Error del servidor
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        
        if (status === 409 || status === 400) {
          throw new Error(message || 'El email ya está registrado o los datos son inválidos.');
        } else {
          throw new Error(message || 'Error al registrar usuario. Intenta nuevamente.');
        }
      } else if (error.request) {
        // Error de red - backend no disponible
        throw new Error('No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3000');
      } else {
        // Validación local o error inesperado
        throw new Error(error.message || 'Error inesperado al registrar usuario.');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  async getUserProfile(): Promise<User> {
    try {
      const token = await this.getStoredToken();
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
      }
      
      console.log('🔍 Obteniendo perfil del usuario desde el backend...');
      
      const response = await axios.get(`${API_CONFIG.BACKEND_URL}/auth/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });
      
      console.log('✅ Perfil obtenido:', response.data);
      
      if (response.data.ok && response.data.user) {
        const user = response.data.user;
        // Actualizar datos locales con los datos del servidor
        await AsyncStorage.setItem('user', JSON.stringify(user));
        return user;
      } else {
        throw new Error(response.data.msg || 'Error al obtener perfil');
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo perfil:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.msg || error.response.data?.message;
        
        if (status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        } else {
          throw new Error(message || 'Error al obtener perfil. Intenta nuevamente.');
        }
      } else if (error.request) {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión.');
      } else {
        throw new Error(error.message || 'Error inesperado al obtener perfil.');
      }
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await axios.post(`${API_CONFIG.BACKEND_URL}/auth/forgot-password`, { email }, {
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      
      // Para demo, simular envío exitoso
      console.log('Demo: Email de recuperación enviado a', email);
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User & { cacheInvalidated?: boolean }> {
    try {
      const token = await this.getStoredToken();
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
      }
      
      console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
      console.log('📝 Datos a actualizar:', userData);
      
      // Mapear campos del frontend al backend
      // Prioridad: valores en inglés (que son los editados en el form) > valores en español (que son los cargados)
      const payload: any = {};
      
      // Mapear campos en inglés (del formulario) a español (del backend)
      if (userData.name !== undefined) {
        payload.nombre_completo = userData.name;
      }
      if (userData.phone !== undefined) {
        payload.telefono = userData.phone;
      }
      if (userData.location !== undefined) {
        payload.ubicacion = userData.location;
      }
      if (userData.farmSize !== undefined) {
        payload.tamaño_finca = userData.farmSize;
      }
      
      console.log('📤 Payload enviado al backend:', payload);
      console.log('🔗 URL:', `${API_CONFIG.BACKEND_URL}/auth/profile`);
      
      const response = await axios.put(`${API_CONFIG.BACKEND_URL}/auth/profile`, payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });
      
      console.log('✅ Respuesta del backend:', response.data);
      
      if (response.data.ok && response.data.user) {
        const updatedUser = response.data.user;
        const cacheInvalidated = response.data.cacheInvalidated || false;
        
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Si cambió la ubicación, notificar al componente
        if (cacheInvalidated) {
          console.log('📍 Ubicación actualizada - Los datos de clima se actualizarán');
        }
        
        return { ...updatedUser, cacheInvalidated };
      } else {
        throw new Error(response.data.msg || 'Error al actualizar perfil');
      }
    } catch (error: any) {
      console.error('❌ Error actualizando perfil:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.msg || error.response.data?.message;
        
        console.error('Status:', status);
        console.error('Mensaje:', message);
        console.error('Data:', error.response.data);
        
        if (status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        } else if (status === 400) {
          throw new Error(message || 'Datos inválidos. Verifica la información ingresada.');
        } else {
          throw new Error(message || 'Error al actualizar perfil. Intenta nuevamente.');
        }
      } else if (error.request) {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión.');
      } else {
        throw new Error(error.message || 'Error inesperado al actualizar perfil.');
      }
    }
  }
}

export default AuthService.getInstance();
