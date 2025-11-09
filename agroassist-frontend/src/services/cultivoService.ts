import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

export interface Cultivo {
  id?: number;
  id_usuario?: number;
  nombre_cultivo: string;
  variedad?: string;
  area_sembrada?: number;
  unidad_area?: string;
  fecha_siembra: string;
  fecha_cosecha_estimada?: string;
  fecha_cosecha_real?: string;
  estado?: string;
  notas?: string;
  lote?: string;
}

class CultivoService {
  private static instance: CultivoService;

  public static getInstance(): CultivoService {
    if (!CultivoService.instance) {
      CultivoService.instance = new CultivoService();
    }
    return CultivoService.instance;
  }

  private async getToken(): Promise<string> {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
    }
    return token;
  }

  async getCultivos(): Promise<Cultivo[]> {
    try {
      const token = await this.getToken();

      console.log('📋 Obteniendo cultivos del usuario...');

      const response = await axios.get(`${API_CONFIG.BACKEND_URL}/cultivos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });

      console.log('✅ Cultivos obtenidos:', response.data.cultivos?.length || 0);

      return response.data.cultivos || [];
    } catch (error: any) {
      console.error('❌ Error obteniendo cultivos:', error);

      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }

      throw new Error(error.response?.data?.msg || 'Error al obtener los cultivos');
    }
  }

  async createCultivo(cultivoData: Cultivo): Promise<Cultivo> {
    try {
      const token = await this.getToken();

      console.log('🌱 Creando nuevo cultivo...');
      console.log('   Datos:', cultivoData);

      const response = await axios.post(
        `${API_CONFIG.BACKEND_URL}/cultivos`,
        cultivoData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT,
        }
      );

      console.log('✅ Cultivo creado:', response.data.cultivo);

      return response.data.cultivo;
    } catch (error: any) {
      console.error('❌ Error creando cultivo:', error);

      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }

      throw new Error(error.response?.data?.msg || 'Error al crear el cultivo');
    }
  }

  async updateCultivo(id: number, cultivoData: Partial<Cultivo>): Promise<Cultivo> {
    try {
      const token = await this.getToken();

      console.log('✏️ Actualizando cultivo ID:', id);
      console.log('   Datos:', cultivoData);

      const response = await axios.put(
        `${API_CONFIG.BACKEND_URL}/cultivos/${id}`,
        cultivoData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT,
        }
      );

      console.log('✅ Cultivo actualizado:', response.data.cultivo);

      return response.data.cultivo;
    } catch (error: any) {
      console.error('❌ Error actualizando cultivo:', error);

      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }

      throw new Error(error.response?.data?.msg || 'Error al actualizar el cultivo');
    }
  }

  async deleteCultivo(id: number): Promise<void> {
    try {
      const token = await this.getToken();

      console.log('🗑️ Eliminando cultivo ID:', id);

      await axios.delete(`${API_CONFIG.BACKEND_URL}/cultivos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });

      console.log('✅ Cultivo eliminado');
    } catch (error: any) {
      console.error('❌ Error eliminando cultivo:', error);

      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }

      throw new Error(error.response?.data?.msg || 'Error al eliminar el cultivo');
    }
  }
}

export default CultivoService.getInstance();
