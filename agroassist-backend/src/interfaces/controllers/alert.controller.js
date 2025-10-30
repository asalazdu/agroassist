/**
 * Alert Controller - Manejo de alertas climáticas
 */

const alertService = require('../../infrastructure/services/alertService');
const cropRepository = require('../../infrastructure/database/supabase/cropRepository');
const userRepository = require('../../infrastructure/database/supabase/userRepository');

/**
 * GET /api/alerts
 * Obtener alertas climáticas del usuario basadas en sus cultivos
 */
const obtenerAlertas = async (req, res) => {
  try {
    const usuarioId = req.uid;

    console.log(`📊 Obteniendo alertas para usuario ${usuarioId}...`);

    // Obtener información del usuario (para su ubicación)
    const usuario = await userRepository.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado'
      });
    }

    const ubicacion = usuario.ubicacion || 'Pasto, Colombia';
    console.log(`📍 Ubicación: ${ubicacion}`);

    // Obtener cultivos del usuario
    const cultivos = await cropRepository.getCropsByUserId(usuarioId);
    
    if (!cultivos || cultivos.length === 0) {
      return res.status(200).json({
        ok: true,
        msg: 'No tienes cultivos registrados. Agrega cultivos para recibir alertas climáticas.',
        alertas: [],
        clima: null,
        resumen: { total: 0, danger: 0, warning: 0, info: 0, success: 0 }
      });
    }

    console.log(`🌱 ${cultivos.length} cultivos encontrados`);

    // Generar alertas (con userId para caché)
    const resultado = await alertService.generarAlertasPorCultivos(cultivos, ubicacion, usuarioId);

    if (!resultado.success) {
      return res.status(500).json({
        ok: false,
        msg: resultado.error || 'Error al generar alertas'
      });
    }

    const resumen = alertService.obtenerResumenAlertas(resultado.alertas);

    return res.status(200).json({
      ok: true,
      alertas: resultado.alertas,
      clima: resultado.clima,
      ubicacion: resultado.ubicacion,
      fecha: resultado.fecha,
      resumen,
      msg: `${resultado.alertas.length} alertas generadas`
    });

  } catch (error) {
    console.error('❌ Error en obtenerAlertas:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener alertas climáticas'
    });
  }
};

/**
 * GET /api/alerts/cultivo/:id
 * Obtener alertas de un cultivo específico
 */
const obtenerAlertasPorCultivo = async (req, res) => {
  try {
    const usuarioId = req.uid;
    const { id } = req.params;

    // Obtener información del usuario
    const usuario = await userRepository.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado'
      });
    }

    const ubicacion = usuario.ubicacion || 'Pasto, Colombia';

    // Obtener el cultivo específico
    const cultivo = await cropRepository.getCropById(parseInt(id));
    
    if (!cultivo || cultivo.id_usuario !== usuarioId) {
      return res.status(404).json({
        ok: false,
        msg: 'Cultivo no encontrado'
      });
    }

    // Generar alertas para este cultivo (sin caché porque es individual)
    const resultado = await alertService.generarAlertasPorCultivos([cultivo], ubicacion, null);

    if (!resultado.success) {
      return res.status(500).json({
        ok: false,
        msg: resultado.error || 'Error al generar alertas'
      });
    }

    return res.status(200).json({
      ok: true,
      alertas: resultado.alertas,
      clima: resultado.clima,
      cultivo: cultivo,
      ubicacion: resultado.ubicacion,
      fecha: resultado.fecha
    });

  } catch (error) {
    console.error('❌ Error en obtenerAlertasPorCultivo:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener alertas del cultivo'
    });
  }
};

module.exports = {
  obtenerAlertas,
  obtenerAlertasPorCultivo
};
