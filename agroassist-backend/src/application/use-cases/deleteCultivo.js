const deleteCultivo = async (cultivoId, userId, { cultivoRepository }) => {
  // Verificar que el cultivo existe y pertenece al usuario
  const cultivo = await cultivoRepository.findById(cultivoId);
  
  if (!cultivo) {
    throw new Error('Cultivo no encontrado');
  }

  if (cultivo.id_usuario !== userId) {
    throw new Error('No tienes permiso para eliminar este cultivo');
  }

  // Eliminar el cultivo
  await cultivoRepository.remove(cultivoId);

  return {
    message: 'Cultivo eliminado exitosamente'
  };
};

module.exports = deleteCultivo;
