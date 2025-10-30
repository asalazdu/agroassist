/**
 * Alert Service - Servicio para obtener alertas climáticas
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../src/config/api';

// Interfaces
export interface Alerta {
  cultivo_id: number;
  cultivo_nombre: string;
  tipo: string;
  severidad: 'danger' | 'warning' | 'info' | 'success';
  titulo: string;
  mensaje: string;
  recomendaciones: string[];
  icono: string;
  fecha: string;
}

export interface Clima {
  temperatura: number;
  sensacion_termica: number;
  humedad: number;
  descripcion: string;
  icono: string;
  viento: number;
  precipitacion: number;
  uvi: number;
}

export interface ResumenAlertas {
  total: number;
  danger: number;
  warning: number;
  info: number;
  success: number;
}

export interface AlertasResponse {
  ok: boolean;
  alertas: Alerta[];
  clima: Clima | null;
  ubicacion: string;
  fecha: string;
  resumen: ResumenAlertas;
  msg?: string;
  error?: string;
}

/**
 * Obtener token de autenticación
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return null;
  }
};

/**
 * Crear headers de autorización
 */
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'x-token': token || '',
    'Content-Type': 'application/json',
  };
};

/**
 * Obtener todas las alertas del usuario
 */
export const obtenerAlertas = async (): Promise<AlertasResponse> => {
  try {
    console.log('📊 Obteniendo alertas climáticas...');
    const headers = await getAuthHeaders();

    const response = await axios.get(`${API_CONFIG.BACKEND_URL}/alerts`, {
      headers,
      timeout: 15000,
    });

    if (response.data.ok) {
      console.log(`✅ ${response.data.alertas.length} alertas obtenidas`);
      return response.data;
    }

    return {
      ok: false,
      alertas: [],
      clima: null,
      ubicacion: '',
      fecha: '',
      resumen: { total: 0, danger: 0, warning: 0, info: 0, success: 0 },
      error: response.data.msg || 'Error al obtener alertas',
    };
  } catch (error: any) {
    console.error('Error obteniendo alertas:', error.message);
    return {
      ok: false,
      alertas: [],
      clima: null,
      ubicacion: '',
      fecha: '',
      resumen: { total: 0, danger: 0, warning: 0, info: 0, success: 0 },
      error: error.response?.data?.msg || 'Error de conexión al obtener alertas',
    };
  }
};

/**
 * Obtener alertas de un cultivo específico
 */
export const obtenerAlertasPorCultivo = async (
  cultivoId: number
): Promise<AlertasResponse> => {
  try {
    console.log(`📊 Obteniendo alertas del cultivo ${cultivoId}...`);
    const headers = await getAuthHeaders();

    const response = await axios.get(
      `${API_CONFIG.BACKEND_URL}/alerts/cultivo/${cultivoId}`,
      {
        headers,
        timeout: 15000,
      }
    );

    if (response.data.ok) {
      return response.data;
    }

    return {
      ok: false,
      alertas: [],
      clima: null,
      ubicacion: '',
      fecha: '',
      resumen: { total: 0, danger: 0, warning: 0, info: 0, success: 0 },
      error: response.data.msg || 'Error al obtener alertas del cultivo',
    };
  } catch (error: any) {
    console.error('Error obteniendo alertas del cultivo:', error.message);
    return {
      ok: false,
      alertas: [],
      clima: null,
      ubicacion: '',
      fecha: '',
      resumen: { total: 0, danger: 0, warning: 0, info: 0, success: 0 },
      error: error.response?.data?.msg || 'Error de conexión',
    };
  }
};

/**
 * Obtener color según severidad
 */
export const getSeverityColor = (severidad: string): string => {
  switch (severidad) {
    case 'danger':
      return '#E74C3C';
    case 'warning':
      return '#F39C12';
    case 'info':
      return '#3498DB';
    case 'success':
      return '#27AE60';
    default:
      return '#95A5A6';
  }
};

/**
 * Obtener color de fondo según severidad
 */
export const getSeverityBackgroundColor = (severidad: string): string => {
  switch (severidad) {
    case 'danger':
      return '#FADBD8';
    case 'warning':
      return '#FEF5E7';
    case 'info':
      return '#D6EAF8';
    case 'success':
      return '#D5F4E6';
    default:
      return '#EAEDED';
  }
};

/**
 * Formatear fecha relativa
 */
export const formatearFechaRelativa = (fecha: string): string => {
  const ahora = new Date();
  const fechaAlerta = new Date(fecha);
  const diff = ahora.getTime() - fechaAlerta.getTime();
  const minutos = Math.floor(diff / 60000);

  if (minutos < 1) return 'Justo ahora';
  if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
  
  const dias = Math.floor(horas / 24);
  return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
};
