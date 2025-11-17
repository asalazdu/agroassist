const cropRepository = require('../../infrastructure/database/supabase/cropRepository');

const createCultivo = async (userId, cultivoData, { cultivoRepository }) => {
  // Validaciones básicas
  if (!cultivoData.nombre_cultivo || cultivoData.nombre_cultivo.trim() === '') {
    throw new Error('El nombre del cultivo es obligatorio');
  }

  if (!cultivoData.fecha_siembra) {
    throw new Error('La fecha de siembra es obligatoria');
  }

  // Validar área sembrada
  const areaSembrada = parseFloat(cultivoData.area_sembrada) || 0;
  
  if (areaSembrada <= 0) {
    throw new Error('El área sembrada debe ser mayor a 0');
  }

  // Validar que el usuario tenga suficiente espacio en su finca
  const validacion = await cropRepository.validateUserArea(userId, areaSembrada);
  
  if (!validacion.valid) {
    throw new Error(validacion.message);
  }

  console.log(`✅ Validación de área exitosa. Quedarán ${validacion.data.areaRestante.toFixed(2)} hectáreas disponibles.`);

  // Crear el cultivo
  const newCultivo = await cultivoRepository.create({
    id_usuario: userId,
    ...cultivoData
  });

  return {
    message: 'Cultivo creado exitosamente',
    cultivo: newCultivo,
    areaInfo: {
      areaTotal: validacion.data.tamañoFinca,
      areaUsada: validacion.data.areaUsada + areaSembrada,
      areaDisponible: validacion.data.areaRestante
    }
  };
};

module.exports = createCultivo;

