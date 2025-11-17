const cropRepository = require('../../infrastructure/database/supabase/cropRepository');

const updateCultivo = async (cultivoId, userId, cultivoData, { cultivoRepository }) => {
  // Verificar que el cultivo existe
  const cultivo = await cultivoRepository.findById(cultivoId);
  
  if (!cultivo) {
    throw new Error('Cultivo no encontrado');
  }

  // Validar que el cultivo pertenece al usuario
  if (cultivo.id_usuario !== userId) {
    throw new Error('No tienes permiso para actualizar este cultivo. Este cultivo pertenece a otro usuario.');
  }

  // Si se está actualizando el área sembrada, validar
  if (cultivoData.area_sembrada !== undefined) {
    const nuevaArea = parseFloat(cultivoData.area_sembrada) || 0;
    
    if (nuevaArea <= 0) {
      throw new Error('El área sembrada debe ser mayor a 0');
    }

    // Validar que el usuario tenga suficiente espacio (excluyendo el cultivo actual)
    const validacion = await cropRepository.validateUserArea(userId, nuevaArea, cultivoId);
    
    if (!validacion.valid) {
      throw new Error(validacion.message);
    }

    console.log(`✅ Validación de área exitosa. Quedarán ${validacion.data.areaRestante.toFixed(2)} hectáreas disponibles.`);
  }

  // Actualizar el cultivo
  const updatedCultivo = await cultivoRepository.update(cultivoId, cultivoData);

  return {
    message: 'Cultivo actualizado exitosamente',
    cultivo: updatedCultivo
  };
};

module.exports = updateCultivo;

