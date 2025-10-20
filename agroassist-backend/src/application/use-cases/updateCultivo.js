const updateCultivo = async (cultivoId, userId, cultivoData, { cultivoRepository }) => {
  // Verificar que el cultivo existe y pertenece al usuario
  const cultivo = await cultivoRepository.findById(cultivoId);
  
  if (!cultivo) {
    throw new Error('Cultivo no encontrado');
  }

  if (cultivo.id_usuario !== userId) {
    throw new Error('No tienes permiso para actualizar este cultivo');
  }

  // Actualizar el cultivo
  const updatedCultivo = await cultivoRepository.update(cultivoId, cultivoData);

  return {
    message: 'Cultivo actualizado exitosamente',
    cultivo: updatedCultivo
  };
};

module.exports = updateCultivo;
