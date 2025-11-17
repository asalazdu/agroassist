import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

export interface PestAnalysisResult {
  detectado: boolean;
  cultivo_identificado?: string;
  problemas: Array<{
    tipo: 'plaga' | 'enfermedad' | 'deficiencia' | 'daño_mecanico';
    nombre: string;
    confianza: 'alta' | 'media' | 'baja';
    descripcion: string;
    sintomas_visibles: string[];
    gravedad: 'leve' | 'moderada' | 'severa';
    etapa?: string;
  }>;
  recomendaciones: Array<{
    accion: string;
    prioridad: 'inmediata' | 'alta' | 'media' | 'baja';
    descripcion: string;
    productos_sugeridos: string[];
  }>;
  condiciones_observadas: {
    estado_general: string;
    color_hojas: string;
    signos_estres: string[];
  };
  prevencion: string[];
}

export interface WeatherAlert {
  tipo: string;
  titulo: string;
  descripcion: string;
  plagas_riesgo: string[];
  recomendaciones: string[];
  nivel_riesgo: 'bajo' | 'medio' | 'alto';
  icono: string;
}

class PestAnalysisService {
  private static instance: PestAnalysisService;

  public static getInstance(): PestAnalysisService {
    if (!PestAnalysisService.instance) {
      PestAnalysisService.instance = new PestAnalysisService();
    }
    return PestAnalysisService.instance;
  }

  private async getToken(): Promise<string> {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
    }
    return token;
  }

  /**
   * Analiza una imagen de cultivo para detectar plagas y enfermedades
   * @param imageBase64 - Imagen en formato base64
   * @param cropName - Nombre del cultivo (opcional)
   */
  async analyzeImage(imageBase64: string, cropName?: string): Promise<{
    exito: boolean;
    analisis: PestAnalysisResult;
    modelo_utilizado: string;
    tokens_utilizados: number;
    analizado_en: string;
  }> {
    try {
      const token = await this.getToken();

      console.log('📸 Enviando imagen para análisis con IA...');
      if (cropName) {
        console.log(`🌱 Cultivo: ${cropName}`);
      }

      const response = await axios.post(
        `${API_CONFIG.BACKEND_URL}/pests/analyze-image`,
        {
          imageBase64,
          cropName,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 segundos para análisis de IA
        }
      );

      if (response.data.success) {
        console.log('✅ Análisis completado exitosamente');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error al analizar imagen');
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        } else if (error.response?.status === 429) {
          throw new Error('Has excedido el límite de análisis. Intenta más tarde.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('El análisis está tomando mucho tiempo. Intenta con una imagen más pequeña.');
        }
        throw new Error(error.response?.data?.error || 'Error al analizar la imagen');
      }
      throw error;
    }
  }

  /**
   * Obtiene alertas de plagas basadas en el clima actual
   * @param weatherData - Datos del clima actual
   * @param cropName - Nombre del cultivo (opcional)
   */
  async getWeatherAlerts(weatherData: any, cropName?: string): Promise<{
    exito: boolean;
    clima_actual: {
      temperatura: number;
      humedad: number;
      ubicacion: string;
    };
    total_alertas: number;
    alertas: WeatherAlert[];
    nivel_riesgo_general: 'bajo' | 'medio' | 'alto';
    consultado_en: string;
  }> {
    try {
      const token = await this.getToken();

      console.log('🌤️ Obteniendo alertas de plagas basadas en clima...');

      const response = await axios.post(
        `${API_CONFIG.BACKEND_URL}/pests/weather-alerts`,
        {
          weatherData,
          cropName,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT,
        }
      );

      if (response.data.success) {
        console.log(`✅ ${response.data.total_alertas} alertas generadas`);
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error al obtener alertas');
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        throw new Error(error.response?.data?.error || 'Error al obtener alertas de clima');
      }
      throw error;
    }
  }
}

export default PestAnalysisService.getInstance();
