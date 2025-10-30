const deleteCultivo = async (cultivoId, userId, { cultivoRepository }) => {
  // Verificar que el cultivo existe
  const cultivo = await cultivoRepository.findById(cultivoId);
  
  if (!cultivo) {
    throw new Error('Cultivo no encontrado');
  }

  // Validar que el cultivo pertenece al usuario
  if (cultivo.id_usuario !== userId) {
    throw new Error('No tienes permiso para eliminar este cultivo. Este cultivo pertenece a otro usuario.');
  }

  // Eliminar el cultivo
  await cultivoRepository.remove(cultivoId);

  return {
    message: 'Cultivo eliminado exitosamente'
  };
};

module.exports = deleteCultivo;
