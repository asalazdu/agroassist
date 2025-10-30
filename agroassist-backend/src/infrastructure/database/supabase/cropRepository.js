/**
 * Crop Repository - Supabase
 * Repositorio para operaciones con cultivos del usuario
 */

const supabase = require('./supabaseClient');

class CropRepository {
  /**
   * Obtener todos los cultivos de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de cultivos
   */
  async getCropsByUserId(userId) {
    try {
      console.log(`📊 Obteniendo cultivos del usuario ${userId}...`);
      
      const { data, error } = await supabase
        .from('cultivos_usuario')
        .select('*')
        .eq('id_usuario', userId)
        .eq('estado', 'activo')
        .order('fecha_siembra', { ascending: false });

      if (error) {
        console.error('Error al obtener cultivos:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} cultivos encontrados`);
      
      // Mapear a formato esperado por alertService
      return data.map(cultivo => ({
        id: cultivo.id,
        nombre: cultivo.nombre_cultivo,
        variedad: cultivo.variedad,
        area_sembrada: cultivo.area_sembrada,
        fecha_siembra: cultivo.fecha_siembra,
        fecha_cosecha_estimada: cultivo.fecha_cosecha_estimada,
        estado: cultivo.estado,
        lote: cultivo.lote,
        notas: cultivo.notas
      }));
    } catch (error) {
      console.error('Error en getCropsByUserId:', error);
      throw error;
    }
  }

  /**
   * Obtener un cultivo específico
   * @param {number} cropId - ID del cultivo
   * @returns {Promise<Object>} Datos del cultivo
   */
  async getCropById(cropId) {
    try {
      const { data, error } = await supabase
        .from('cultivos_usuario')
        .select('*')
        .eq('id', cropId)
        .single();

      if (error) {
        console.error('Error al obtener cultivo:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        nombre: data.nombre_cultivo,
        variedad: data.variedad,
        area_sembrada: data.area_sembrada,
        fecha_siembra: data.fecha_siembra,
        fecha_cosecha_estimada: data.fecha_cosecha_estimada,
        estado: data.estado,
        lote: data.lote,
        notas: data.notas,
        id_usuario: data.id_usuario
      };
    } catch (error) {
      console.error('Error en getCropById:', error);
      throw error;
    }
  }

  /**
   * Verificar si un cultivo pertenece a un usuario
   * @param {number} cropId - ID del cultivo
   * @param {number} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  async isCropOwnedByUser(cropId, userId) {
    try {
      const { data, error } = await supabase
        .from('cultivos_usuario')
        .select('id')
        .eq('id', cropId)
        .eq('id_usuario', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error en isCropOwnedByUser:', error);
      return false;
    }
  }

  /**
   * Calcular el área total sembrada por un usuario
   * @param {number} userId - ID del usuario
   * @param {number} excludeCropId - ID del cultivo a excluir (opcional, para ediciones)
   * @returns {Promise<number>} - Total de hectáreas sembradas
   */
  async getTotalAreaByUser(userId, excludeCropId = null) {
    try {
      let query = supabase
        .from('cultivos_usuario')
        .select('area_sembrada')
        .eq('id_usuario', userId)
        .eq('estado', 'activo');

      if (excludeCropId) {
        query = query.neq('id', excludeCropId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const total = data.reduce((sum, cultivo) => {
        return sum + (parseFloat(cultivo.area_sembrada) || 0);
      }, 0);

      return total;
    } catch (error) {
      console.error('Error en getTotalAreaByUser:', error);
      throw error;
    }
  }

  /**
   * Validar si el usuario puede agregar un cultivo con el área especificada
   * @param {number} userId - ID del usuario
   * @param {number} newArea - Área del nuevo cultivo
   * @param {number} excludeCropId - ID del cultivo a excluir (opcional)
   * @returns {Promise<{valid: boolean, message: string, data: object}>}
   */
  async validateUserArea(userId, newArea, excludeCropId = null) {
    try {
      // Obtener tamaño de finca del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('tamaño_finca, nombre_completo')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      const tamañoFinca = parseFloat(userData.tamaño_finca) || 0;

      if (tamañoFinca === 0) {
        return {
          valid: false,
          message: 'No has configurado el tamaño de tu finca. Por favor actualiza tu perfil.',
          data: { tamañoFinca: 0, areaUsada: 0, areaDisponible: 0 }
        };
      }

      // Calcular área total sembrada (excluyendo el cultivo actual si es edición)
      const areaUsada = await this.getTotalAreaByUser(userId, excludeCropId);
      const areaDisponible = tamañoFinca - areaUsada;
      const nuevaArea = parseFloat(newArea) || 0;

      if (nuevaArea <= 0) {
        return {
          valid: false,
          message: 'El área sembrada debe ser mayor a 0.',
          data: { tamañoFinca, areaUsada, areaDisponible }
        };
      }

      if (nuevaArea > areaDisponible) {
        return {
          valid: false,
          message: `No tienes suficiente espacio disponible. Tu finca tiene ${tamañoFinca} hectáreas, ya tienes ${areaUsada.toFixed(2)} hectáreas sembradas. Solo quedan ${areaDisponible.toFixed(2)} hectáreas disponibles.`,
          data: { tamañoFinca, areaUsada, areaDisponible, areaSolicitada: nuevaArea }
        };
      }

      return {
        valid: true,
        message: 'Área válida',
        data: { 
          tamañoFinca, 
          areaUsada, 
          areaDisponible, 
          areaSolicitada: nuevaArea,
          areaRestante: areaDisponible - nuevaArea 
        }
      };
    } catch (error) {
      console.error('Error en validateUserArea:', error);
      throw error;
    }
  }
}

module.exports = new CropRepository();
