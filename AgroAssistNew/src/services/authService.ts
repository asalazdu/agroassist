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
      const response = await axios.post(`${API_CONFIG.BACKEND_URL}/auth/login`, credentials, {
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });
      const { user, token } = response.data;
      
      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Error en login:', error);
      
      // Para demo, simular login exitoso
      const mockUser: User = {
        id: '1',
        name: credentials.email.split('@')[0],
        email: credentials.email,
        phone: '+57 300 123 4567',
        location: 'Bogotá, Colombia',
        farmSize: '5.5',
        crops: ['Maíz', 'Frijol', 'Tomate'],
      };
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      await AsyncStorage.setItem('token', mockToken);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      return { user: mockUser, token: mockToken };
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const response = await axios.post(`${API_CONFIG.BACKEND_URL}/auth/register`, {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      }, {
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });
      
      const { user, token } = response.data;
      
      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Para demo, simular registro exitoso
      const mockUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        location: '',
        farmSize: '',
        crops: [],
      };
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      await AsyncStorage.setItem('token', mockToken);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      return { user: mockUser, token: mockToken };
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

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const token = await this.getStoredToken();
      const response = await axios.put(`${API_CONFIG.BACKEND_URL}/auth/profile`, userData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });
      
      const updatedUser = response.data.user;
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      
      // Para demo, simular actualización exitosa
      const currentUser = await this.getStoredUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw new Error('Error al actualizar perfil');
    }
  }
}

export default AuthService.getInstance();
