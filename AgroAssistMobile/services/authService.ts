import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, getAuthHeaders } from '../config/api';

// Interfaces actualizadas para compatibilidad con backend Supabase
export interface User {
  id: number;
  nombre: string; // nombre_completo en BD
  correo: string; // email en frontend
  telefono?: string;
  ubicacion?: string;
  tamaño_finca?: string; // tamaño de la finca
  id_rol?: number;
  activo?: boolean;
  fecha_creacion?: string;
}

export interface LoginData {
  correo: string; // Coincide con backend
  contrasena: string; // Coincide con backend
}

export interface RegisterData {
  nombre_completo: string; // Coincide con backend
  correo: string;
  contrasena: string;
  telefono?: string;
  ubicacion?: string;
  tamaño_finca?: string;
}

export interface AuthResponse {
  ok: boolean; // Backend usa 'ok' en lugar de 'success'
  token?: string;
  user?: User;
  msg?: string; // Backend usa 'msg'
  message?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'agroassist_token';
  private readonly USER_KEY = 'agroassist_user';
  
  // Login de usuario
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.ok) {
        // Guardar token y usuario en storage
        await this.saveAuthData(data.token, data.user);
        return data;
      } else {
        return {
          ok: false,
          message: data.msg || data.message || 'Error al iniciar sesión'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        ok: false,
        message: 'Error de conexión. Verifica tu internet.'
      };
    }
  }
  
  // Registro de usuario
  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(registerData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.ok) {
        // Guardar token y usuario en storage
        await this.saveAuthData(data.token, data.user);
        return data;
      } else {
        return {
          ok: false,
          message: data.msg || data.message || 'Error al registrar usuario'
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        ok: false,
        message: 'Error de conexión. Verifica tu internet.'
      };
    }
  }
  
  // Recuperación de contraseña
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      return {
        success: response.ok,
        message: data.message || (response.ok ? 
          'Se envió un enlace de recuperación a tu email' : 
          'Error al enviar enlace de recuperación')
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Error de conexión. Verifica tu internet.'
      };
    }
  }
  
  // Resetear contraseña
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ token, newPassword })
      });
      
      const data = await response.json();
      
      return {
        success: response.ok,
        message: data.message || (response.ok ? 
          'Contraseña actualizada exitosamente' : 
          'Error al actualizar contraseña')
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Error de conexión. Verifica tu internet.'
      };
    }
  }
  
  // Actualizar perfil de usuario
  async updateProfile(userData: Partial<User>): Promise<AuthResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        return { ok: false, message: 'No hay sesión activa' };
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.ok) {
        // Actualizar usuario en storage
        await this.saveUser(data.user);
        return data;
      } else {
        return {
          ok: false,
          message: data.msg || data.message || 'Error al actualizar perfil'
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        ok: false,
        message: 'Error de conexión. Verifica tu internet.'
      };
    }
  }
  
  // Obtener perfil actual
  async getProfile(): Promise<User | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await this.saveUser(data.user);
          return data.user;
        }
      }
      
      // Si falla la request, devolver usuario guardado localmente
      return await this.getStoredUser();
    } catch (error) {
      console.error('Get profile error:', error);
      return await this.getStoredUser();
    }
  }
  
  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.TOKEN_KEY, this.USER_KEY]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch {
      return false;
    }
  }
  
  // Obtener token guardado
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }
  
  // Obtener usuario guardado
  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }
  
  // Guardar datos de autenticación
  private async saveAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [this.TOKEN_KEY, token],
        [this.USER_KEY, JSON.stringify(user)]
      ]);
    } catch (error) {
      console.error('Save auth data error:', error);
    }
  }
  
  // Guardar usuario
  private async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Save user error:', error);
    }
  }
  
  // Validar email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Validar contraseña
  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'La contraseña debe tener al menos una mayúscula y una minúscula' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'La contraseña debe tener al menos un número' };
    }
    return { isValid: true };
  }
}

export const authService = new AuthService();
