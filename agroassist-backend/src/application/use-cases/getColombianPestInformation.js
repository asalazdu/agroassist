/**
 * Caso de uso para obtener información de plagas específicamente para Colombia
 * Todas las respuestas en español y enfocadas en la agricultura colombiana
 */

const pestInformationService = require('../../infrastructure/services/pestInformationService');
const colombianAgricultureService = require('../../infrastructure/services/colombianAgricultureService');

class GetColombianPestInformation {
  
  /**
   * Buscar información de plagas con enfoque colombiano
   * @param {string} pestName - Nombre de la plaga en español
   * @returns {Promise<Object>} - Información completa en español
   */
  async searchPest(pestName) {
    try {
      if (!pestName || typeof pestName !== 'string') {
        return {
          success: false,
          error: 'Debe proporcionar un nombre de plaga válido',
          ejemplo: 'broca del café, roya, gusano cogollero, trips'
        };
      }

      const pestInfo = await pestInformationService.getCompletePestInfo(pestName.trim());
      
      return {
        success: true,
        plaga_consultada: pestName,
        ...pestInfo,
        mensaje: 'Información de plagas para Colombia',
        fuentes: [
          'Base de datos científica GBIF',
          'Observaciones de iNaturalist',
          'Información específica de Colombia',
          'Recomendaciones adaptadas al país'
        ]
      };
    } catch (error) {
      console.error('Error en búsqueda de plaga colombiana:', error);
      return {
        success: false,
        error: 'Error al buscar información de la plaga',
        detalles: error.message,
        sugerencia: 'Intente con nombres como: broca, roya, cogollero, trips, pulgón'
      };
    }
  }

  /**
   * Obtener plagas de un cultivo colombiano específico
   * @param {string} cropName - Nombre del cultivo en español
   * @returns {Promise<Object>} - Plagas del cultivo en Colombia
   */
  async getCropPests(cropName) {
    try {
      if (!cropName || typeof cropName !== 'string') {
        return {
          success: false,
          error: 'Debe proporcionar un nombre de cultivo válido',
          cultivos_soportados: [
            'café', 'plátano', 'arroz', 'maíz', 'cacao', 
            'yuca', 'papa', 'fríjol', 'caña de azúcar', 'flores'
          ]
        };
      }

      const cropInfo = await pestInformationService.getCropPestInfo(cropName.trim());
      
      return {
        success: true,
        cultivo_consultado: cropName,
        ...cropInfo,
        mensaje: 'Información de plagas por cultivo en Colombia',
        nota: 'Esta información está específicamente adaptada para condiciones colombianas'
      };
    } catch (error) {
      console.error('Error en búsqueda de cultivo colombiano:', error);
      return {
        success: false,
        error: 'Error al obtener información del cultivo',
        detalles: error.message,
        sugerencia: 'Pruebe con cultivos como: café, maíz, arroz, plátano, papa'
      };
    }
  }

  /**
   * Buscar plagas por ubicación en Colombia
   * @param {number} latitude - Latitud
   * @param {number} longitude - Longitud  
   * @param {string} cropType - Tipo de cultivo (opcional)
   * @returns {Promise<Object>} - Plagas reportadas en la región
   */
  async getPestsByLocation(latitude, longitude, cropType = null) {
    try {
      // Validar coordenadas de Colombia
      if (!this._isValidColombianLocation(latitude, longitude)) {
        return {
          success: false,
          error: 'Las coordenadas deben estar dentro de Colombia',
          rango_valido: {
            latitud: 'Entre -4.2 y 15.9',
            longitud: 'Entre -84.8 y -66.8'
          },
          ejemplo: {
            bogota: { latitud: 4.7110, longitud: -74.0721 },
            medellin: { latitud: 6.2442, longitud: -75.5812 },
            cali: { latitud: 3.4516, longitud: -76.5320 }
          }
        };
      }

      const locationInfo = await pestInformationService.getPestsByLocation(latitude, longitude, cropType);
      const regionInfo = this._getColombianRegionInfo(latitude, longitude);

      return {
        success: true,
        ubicacion: {
          latitud: latitude,
          longitud: longitude,
          region_colombia: regionInfo
        },
        cultivo: cropType || 'General',
        ...locationInfo,
        mensaje: 'Plagas reportadas en su región de Colombia',
        recomendaciones_regionales: this._getRegionalRecommendations(regionInfo, cropType)
      };
    } catch (error) {
      console.error('Error en búsqueda por ubicación:', error);
      return {
        success: false,
        error: 'Error al buscar plagas por ubicación',
        detalles: error.message
      };
    }
  }

  /**
   * Obtener información detallada de control para Colombia
   * @param {string} pestName - Nombre de la plaga
   * @param {string} cropName - Nombre del cultivo (opcional)
   * @returns {Promise<Object>} - Plan de manejo específico para Colombia
   */
  async getControlPlan(pestName, cropName = null) {
    try {
      const colombianPest = colombianAgricultureService.getPestInfo(pestName);
      const controlMethods = colombianAgricultureService.getControlRecommendations(
        pestName.toLowerCase().replace(/\s+/g, '_'), 
        cropName?.toLowerCase().replace(/\s+/g, '_')
      );

      if (!colombianPest && !controlMethods) {
        return {
          success: false,
          error: 'No se encontró información específica para Colombia',
          sugerencia: 'Consulte con técnico agrícola local o ICA',
          contactos_utiles: {
            ica: 'Instituto Colombiano Agropecuario',
            agrosavia: 'Corporación Colombiana de Investigación Agropecuaria',
            umata: 'Unidad Municipal de Asistencia Técnica local'
          }
        };
      }

      return {
        success: true,
        plaga: pestName,
        cultivo: cropName || 'General',
        informacion_plaga: colombianPest,
        plan_de_manejo: controlMethods,
        productos_registrados_colombia: this._getRegisteredProducts(pestName),
        normatividad: {
          entidad_reguladora: 'ICA - Instituto Colombiano Agropecuario',
          consulta_registro: 'https://www.ica.gov.co',
          nota: 'Verifique siempre que los productos estén registrados en Colombia'
        },
        mensaje: 'Plan de manejo específico para condiciones colombianas'
      };
    } catch (error) {
      console.error('Error en plan de control:', error);
      return {
        success: false,
        error: 'Error al generar plan de control',
        detalles: error.message
      };
    }
  }

  /**
   * Obtener listado de cultivos soportados en Colombia
   * @returns {Object} - Lista de cultivos colombianos
   */
  getColombiaCropsList() {
    const crops = colombianAgricultureService.colombianCrops;
    
    return {
      success: true,
      cultivos_principales_colombia: Object.keys(crops).map(key => ({
        nombre: crops[key].nombre,
        nombre_cientifico: crops[key].nombreCientifico,
        regiones: crops[key].regiones,
        epoca_siembra: crops[key].epoca_siembra,
        epoca_cosecha: crops[key].epoca_cosecha
      })),
      total_cultivos: Object.keys(crops).length,
      mensaje: 'Cultivos principales de Colombia con información disponible'
    };
  }

  /**
   * Validar si las coordenadas están dentro de Colombia
   * @private
   */
  _isValidColombianLocation(lat, lng) {
    // Límites aproximados de Colombia
    const bounds = {
      north: 15.9,  // Península de la Guajira
      south: -4.2,  // Amazonas
      east: -66.8,  // Guainía
      west: -84.8   // Isla Malpelo
    };

    return lat >= bounds.south && lat <= bounds.north && 
           lng >= bounds.west && lng <= bounds.east;
  }

  /**
   * Determinar la región de Colombia basada en coordenadas
   * @private
   */
  _getColombianRegionInfo(lat, lng) {
    // Simplificado - en producción usar polígonos más precisos
    if (lat > 10) return { region: 'Caribe', clima: 'Tropical seco' };
    if (lat > 5 && lng > -77) return { region: 'Andina', clima: 'Templado' };
    if (lng < -77) return { region: 'Pacífica', clima: 'Tropical húmedo' };
    if (lng > -72) return { region: 'Orinoquía', clima: 'Tropical de sabana' };
    return { region: 'Amazonía', clima: 'Tropical húmedo' };
  }

  /**
   * Obtener recomendaciones específicas por región
   * @private
   */
  _getRegionalRecommendations(regionInfo, cropType) {
    const recommendations = {
      'Caribe': [
        'Época seca prolongada - riego frecuente necesario',
        'Vientos fuertes - protección de cultivos',
        'Plagas favorecidas por clima seco'
      ],
      'Andina': [
        'Variación de temperatura según altitud',
        'Dos épocas de lluvia - planificar siembras',
        'Riesgo de heladas en alturas mayores'
      ],
      'Pacífica': [
        'Alta humedad - riesgo de enfermedades fúngicas',
        'Lluvia constante - buen drenaje esencial',
        'Biodiversidad alta - más enemigos naturales'
      ],
      'Orinoquía': [
        'Época lluviosa intensa - preparar drenajes',
        'Época seca marcada - conservar humedad',
        'Suelos ácidos - encalar si es necesario'
      ],
      'Amazonía': [
        'Humedad constante - ventilación importante',
        'Suelos pobres - fertilización necesaria',
        'Alta diversidad de plagas y enfermedades'
      ]
    };

    return recommendations[regionInfo.region] || [
      'Consultar con técnico agrícola local',
      'Adaptar prácticas a condiciones específicas'
    ];
  }

  /**
   * Obtener productos registrados en Colombia (simulado)
   * @private
   */
  _getRegisteredProducts(pestName) {
    // En producción, esto consultaría la base de datos del ICA
    return {
      nota: 'Lista de productos registrados en ICA para ' + pestName,
      consulta_oficial: 'https://www.ica.gov.co/areas/agricola/servicios/fertilizantes-bio-insumos',
      recomendacion: 'Siempre verificar registro vigente antes de comprar'
    };
  }
}

module.exports = new GetColombianPestInformation();
