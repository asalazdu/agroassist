const createCultivo = async (userId, cultivoData, { cultivoRepository }) => {
  // Validaciones
  if (!cultivoData.nombre_cultivo || cultivoData.nombre_cultivo.trim() === '') {
    throw new Error('El nombre del cultivo es obligatorio');
  }

  if (!cultivoData.fecha_siembra) {
    throw new Error('La fecha de siembra es obligatoria');
  }

  // Crear el cultivo
  const newCultivo = await cultivoRepository.create({
    id_usuario: userId,
    ...cultivoData
  });

  return {
    message: 'Cultivo creado exitosamente',
    cultivo: newCultivo
  };
};

module.exports = createCultivo;
