const createCultivo = require('../../application/use-cases/createCultivo');
const getCultivosByUser = require('../../application/use-cases/getCultivosByUser');
const updateCultivo = require('../../application/use-cases/updateCultivo');
const deleteCultivo = require('../../application/use-cases/deleteCultivo');
const cultivoRepository = require('../../infrastructure/database/supabase/cultivoRepository');

const getCultivos = async (req, res) => {
  try {
    const userId = req.uid; // Del middleware validateJWT
    
    console.log('📋 Obteniendo cultivos del usuario ID:', userId);
    
    const result = await getCultivosByUser(userId, { cultivoRepository });
    
    res.status(200).json({
      ok: true,
      msg: result.message,
      cultivos: result.cultivos
    });
  } catch (error) {
    console.error('❌ Error obteniendo cultivos:', error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener los cultivos'
    });
  }
};

const create = async (req, res) => {
  try {
    const userId = req.uid; // Del middleware validateJWT
    const cultivoData = req.body;
    
    console.log('🌱 Creando cultivo para usuario ID:', userId);
    console.log('   Datos:', JSON.stringify(cultivoData, null, 2));
    
    const result = await createCultivo(userId, cultivoData, { cultivoRepository });
    
    res.status(201).json({
      ok: true,
      msg: result.message,
      cultivo: result.cultivo
    });
  } catch (error) {
    console.error('❌ Error creando cultivo:', error.message);
    res.status(400).json({
      ok: false,
      msg: error.message
    });
  }
};

const update = async (req, res) => {
  try {
    const userId = req.uid; // Del middleware validateJWT
    const cultivoId = req.params.id;
    const cultivoData = req.body;
    
    console.log('✏️ Actualizando cultivo ID:', cultivoId);
    console.log('   Usuario ID:', userId);
    console.log('   Datos:', JSON.stringify(cultivoData, null, 2));
    
    const result = await updateCultivo(cultivoId, userId, cultivoData, { cultivoRepository });
    
    res.status(200).json({
      ok: true,
      msg: result.message,
      cultivo: result.cultivo
    });
  } catch (error) {
    console.error('❌ Error actualizando cultivo:', error.message);
    res.status(400).json({
      ok: false,
      msg: error.message
    });
  }
};

const remove = async (req, res) => {
  try {
    const userId = req.uid; // Del middleware validateJWT
    const cultivoId = req.params.id;
    
    console.log('🗑️ Eliminando cultivo ID:', cultivoId);
    console.log('   Usuario ID:', userId);
    
    const result = await deleteCultivo(cultivoId, userId, { cultivoRepository });
    
    res.status(200).json({
      ok: true,
      msg: result.message
    });
  } catch (error) {
    console.error('❌ Error eliminando cultivo:', error.message);
    res.status(400).json({
      ok: false,
      msg: error.message
    });
  }
};

module.exports = {
  getCultivos,
  create,
  update,
  remove
};
