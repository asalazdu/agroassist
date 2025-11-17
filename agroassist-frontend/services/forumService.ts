/**
 * Forum Service - Servicio para gestión del foro comunitario
 * Consume los endpoints del backend /api/forum
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../src/config/api';

// =============================================
// INTERFACES Y TIPOS
// =============================================

export interface Usuario {
  id: number;
  nombre_completo: string;
  ubicacion?: string;
}

export interface Hilo {
  id: number;
  usuario_id: number;
  titulo: string;
  contenido: string;
  categoria: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  usuario?: Usuario;
  comentarios?: Array<{ count: number }>;
}

export interface Comentario {
  id: number;
  hilo_id: number;
  usuario_id: number;
  comentario_padre_id: number | null;
  contenido: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  usuario?: Usuario;
  respuestas?: Comentario[];
}

export interface CreateHiloDto {
  titulo: string;
  contenido: string;
  categoria?: string;
}

export interface CreateComentarioDto {
  contenido: string;
}

export interface CreateRespuestaDto {
  contenido: string;
  hiloId: number;
}

// =============================================
// HELPERS
// =============================================

/**
 * Obtener el token JWT del AsyncStorage
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('🔑 Token obtenido desde AsyncStorage:', token ? `${token.substring(0, 20)}...` : 'NULL');
    return token;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error);
    return null;
  }
};

/**
 * Crear headers de autorización
 */
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  console.log('📋 Headers creados con token:', token ? 'PRESENTE' : 'AUSENTE');
  return {
    'x-token': token || '',
    'Content-Type': 'application/json',
  };
};

// =============================================
// SERVICIO DEL FORO
// =============================================

/**
 * Obtener lista de hilos del foro
 * @param categoria - Filtrar por categoría (opcional)
 * @param limite - Número máximo de resultados (default: 20)
 * @param offset - Offset para paginación (default: 0)
 */
export const obtenerHilos = async (
  categoria?: string,
  limite: number = 20,
  offset: number = 0
): Promise<{ ok: boolean; hilos?: Hilo[]; total?: number; error?: string }> => {
  try {
    console.log('📖 Obteniendo hilos del foro...');
    const headers = await getAuthHeaders();
    console.log('🌐 URL:', `${API_CONFIG.BACKEND_URL}/forum/threads`);
    console.log('📨 Headers:', headers);
    const params: any = { limite, offset };
    if (categoria) params.categoria = categoria;

    const response = await axios.get(`${API_CONFIG.BACKEND_URL}/forum/threads`, {
      headers,
      params,
      timeout: 10000,
    });

    if (response.data.ok) {
      return {
        ok: true,
        hilos: response.data.hilos || [],
        total: response.data.total || 0,
      };
    }

    return { ok: false, error: response.data.msg || 'Error desconocido' };
  } catch (error: any) {
    console.error('Error obteniendo hilos:', error.message);
    return {
      ok: false,
      error: error.response?.data?.msg || 'Error de conexión al obtener hilos',
    };
  }
};

/**
 * Obtener detalles de un hilo específico
 * @param hiloId - ID del hilo
 */
export const obtenerHiloPorId = async (
  hiloId: number
): Promise<{ ok: boolean; hilo?: Hilo; error?: string }> => {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.get(
      `${API_CONFIG.BACKEND_URL}/forum/threads/${hiloId}`,
      { headers, timeout: 10000 }
    );

    if (response.data.ok) {
      return { ok: true, hilo: response.data.hilo };
    }

    return { ok: false, error: response.data.msg || 'Hilo no encontrado' };
  } catch (error: any) {
    console.error('Error obteniendo hilo:', error.message);
    return {
      ok: false,
      error: error.response?.data?.msg || 'Error al obtener hilo',
    };
  }
};

/**
 * Crear un nuevo hilo en el foro
 * @param data - Datos del hilo (título, contenido, categoría)
 */
export const crearHilo = async (
  data: CreateHiloDto
): Promise<{ ok: boolean; hilo?: Hilo; error?: string }> => {
  try {
    console.log('✍️ Creando nuevo hilo:', data);
    const headers = await getAuthHeaders();
    console.log('🌐 URL:', `${API_CONFIG.BACKEND_URL}/forum/threads`);
    console.log('📨 Headers:', headers);

    const response = await axios.post(
      `${API_CONFIG.BACKEND_URL}/forum/threads`,
      data,
      { headers, timeout: 10000 }
    );

    if (response.data.ok) {
      return { ok: true, hilo: response.data.hilo };
    }

    return { ok: false, error: response.data.msg || 'Error al crear hilo' };
  } catch (error: any) {
    console.error('Error creando hilo:', error.message);
    
    // Manejar errores de validación
    if (error.response?.status === 400) {
      return {
        ok: false,
        error: error.response.data.msg || 'Datos inválidos. Revisa el título y contenido.',
      };
    }

    return {
      ok: false,
      error: error.response?.data?.msg || 'Error de conexión al crear hilo',
    };
  }
};

/**
 * Obtener comentarios de un hilo (con respuestas anidadas)
 * @param hiloId - ID del hilo
 */
export const obtenerComentarios = async (
  hiloId: number
): Promise<{ ok: boolean; comentarios?: Comentario[]; error?: string }> => {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.get(
      `${API_CONFIG.BACKEND_URL}/forum/threads/${hiloId}/comments`,
      { headers, timeout: 10000 }
    );

    if (response.data.ok) {
      return { ok: true, comentarios: response.data.comentarios || [] };
    }

    return { ok: false, error: response.data.msg || 'Error al obtener comentarios' };
  } catch (error: any) {
    console.error('Error obteniendo comentarios:', error.message);
    return {
      ok: false,
      error: error.response?.data?.msg || 'Error de conexión',
    };
  }
};

/**
 * Crear un comentario en un hilo
 * @param hiloId - ID del hilo
 * @param data - Datos del comentario (contenido)
 */
export const crearComentario = async (
  hiloId: number,
  data: CreateComentarioDto
): Promise<{ ok: boolean; comentario?: Comentario; error?: string }> => {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.post(
      `${API_CONFIG.BACKEND_URL}/forum/threads/${hiloId}/comments`,
      data,
      { headers, timeout: 10000 }
    );

    if (response.data.ok) {
      return { ok: true, comentario: response.data.comentario };
    }

    return { ok: false, error: response.data.msg || 'Error al crear comentario' };
  } catch (error: any) {
    console.error('Error creando comentario:', error.message);
    return {
      ok: false,
      error: error.response?.data?.msg || 'Error de conexión',
    };
  }
};

/**
 * Responder a un comentario
 * @param comentarioId - ID del comentario padre
 * @param data - Datos de la respuesta (contenido, hiloId)
 */
export const responderComentario = async (
  comentarioId: number,
  data: CreateRespuestaDto
): Promise<{ ok: boolean; comentario?: Comentario; error?: string }> => {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.post(
      `${API_CONFIG.BACKEND_URL}/forum/comments/${comentarioId}/replies`,
      data,
      { headers, timeout: 10000 }
    );

    if (response.data.ok) {
      return { ok: true, comentario: response.data.comentario };
    }

    return { ok: false, error: response.data.msg || 'Error al crear respuesta' };
  } catch (error: any) {
    console.error('Error respondiendo comentario:', error.message);
    return {
      ok: false,
      error: error.response?.data?.msg || 'Error de conexión',
    };
  }
};

/**
 * Eliminar un hilo (solo el creador)
 * @param hiloId - ID del hilo
 */
export const eliminarHilo = async (
  hiloId: number
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.delete(
      `${API_CONFIG.BACKEND_URL}/forum/threads/${hiloId}`,
      { headers, timeout: 10000 }
    );

    if (response.data.ok) {
      return { ok: true };
    }

    return { ok: false, error: response.data.msg || 'Error al eliminar hilo' };
  } catch (error: any) {
    console.error('Error eliminando hilo:', error.message);
    return {
      ok: false,
      error: error.response?.data?.msg || 'Error de conexión',
    };
  }
};

/**
 * Eliminar un comentario (solo el creador)
 * @param comentarioId - ID del comentario
 */
export const eliminarComentario = async (
  comentarioId: number
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.delete(
      `${API_CONFIG.BACKEND_URL}/forum/comments/${comentarioId}`,
      { headers, timeout: 10000 }
    );

    if (response.data.ok) {
      return { ok: true };
    }

    return { ok: false, error: response.data.msg || 'Error al eliminar comentario' };
  } catch (error: any) {
    console.error('Error eliminando comentario:', error.message);
    return {
      ok: false,
      error: error.response?.data?.msg || 'Error de conexión',
    };
  }
};

/**
 * Buscar hilos por texto
 * @param query - Texto de búsqueda
 */
export const buscarHilos = async (
  query: string
): Promise<{ ok: boolean; hilos?: Hilo[]; error?: string }> => {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.get(`${API_CONFIG.BACKEND_URL}/forum/search`, {
      headers,
      params: { q: query },
      timeout: 10000,
    });

    if (response.data.ok) {
      return { ok: true, hilos: response.data.hilos || [] };
    }

    return { ok: false, error: response.data.msg || 'Error en búsqueda' };
  } catch (error: any) {
    console.error('Error buscando hilos:', error.message);
    return {
      ok: false,
      error: error.response?.data?.msg || 'Error de conexión',
    };
  }
};

/**
 * Obtener hilos del usuario actual
 */
export const obtenerMisHilos = async (): Promise<{
  ok: boolean;
  hilos?: Hilo[];
  error?: string;
}> => {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.get(`${API_CONFIG.BACKEND_URL}/forum/my-threads`, {
      headers,
      timeout: 10000,
    });

    if (response.data.ok) {
      return { ok: true, hilos: response.data.hilos || [] };
    }

    return { ok: false, error: response.data.msg || 'Error al obtener hilos' };
  } catch (error: any) {
    console.error('Error obteniendo mis hilos:', error.message);
    return {
      ok: false,
      error: error.response?.data?.msg || 'Error de conexión',
    };
  }
};

/**
 * Formatear fecha relativa (ej: "hace 2 horas")
 */
export const formatearFechaRelativa = (fecha: string): string => {
  const ahora = new Date();
  const fechaComentario = new Date(fecha);
  const diferencia = ahora.getTime() - fechaComentario.getTime();

  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 7) {
    return fechaComentario.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  if (dias > 0) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `hace ${minutos} min`;
  return 'ahora';
};

/**
 * Obtener emoji de categoría
 */
export const getCategoriaEmoji = (categoria: string): string => {
  const emojis: { [key: string]: string } = {
    general: '💬',
    plagas: '🐛',
    cultivos: '🌱',
    clima: '🌤️',
    mercado: '💰',
    ayuda: '❓',
  };
  return emojis[categoria] || '💬';
};

/**
 * Obtener color de categoría
 */
export const getCategoriaColor = (categoria: string): string => {
  const colores: { [key: string]: string } = {
    general: '#4A90E2',
    plagas: '#E74C3C',
    cultivos: '#27AE60',
    clima: '#F39C12',
    mercado: '#8E44AD',
    ayuda: '#95A5A6',
  };
  return colores[categoria] || '#4A90E2';
};
