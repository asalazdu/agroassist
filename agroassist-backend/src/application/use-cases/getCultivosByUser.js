const getCultivosByUser = async (userId, { cultivoRepository }) => {
  const cultivos = await cultivoRepository.findByUserId(userId);
  
  return {
    message: 'Cultivos obtenidos exitosamente',
    cultivos
  };
};

module.exports = getCultivosByUser;
