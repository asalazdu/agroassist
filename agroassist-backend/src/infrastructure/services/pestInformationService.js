const gbifService = require('./gbifService');
const iNaturalistService = require('./iNaturalistService');
const usdaService = require('./usdaService');
const colombianAgricultureService = require('./colombianAgricultureService');

/**
 * Servicio integrador para información de plagas y cultivos
 * Combina datos de GBIF, iNaturalist, USDA + información especializada de Colombia
 * TODAS LAS APIs SON COMPLETAMENTE GRATUITAS
 */
class PestInformationService {
  constructor() {
    this.services = {
      gbif: gbifService,
      iNaturalist: iNaturalistService,
      usda: usdaService
    };
    this.colombianService = colombianAgricultureService;
  }

  /**
   * Búsqueda completa de información sobre una plaga con enfoque colombiano
   * @param {string} pestName - Nombre de la plaga en español o inglés
   * @returns {Promise<Object>} - Información completa de múltiples fuentes + info colombiana
   */
  async getCompletePestInfo(pestName) {
    try {
      // Traducir al inglés para APIs internacionales
      const englishName = this._translateToEnglish(pestName);
      
      // Buscar en base de datos colombiana primero
      const colombianInfo = this.colombianService.getPestInfo(pestName);
      
      // Búsqueda paralela en APIs internacionales
      const [gbifResults, iNatResults] = await Promise.all([
        this.services.gbif.searchPests(englishName),
        this.services.iNaturalist.searchInsectPests(englishName)
      ]);

      // Traducir resultados al español
      const translatedResults = this._translateResults(gbifResults, iNatResults);

      return {
        success: true,
        consulta: pestName,
        informacion_colombiana: colombianInfo || null,
        fuentes_internacionales: {
          gbif: translatedResults.gbif,
          iNaturalist: translatedResults.iNaturalist
        },
        resumen: {
          total_resultados: (gbifResults.data?.length || 0) + (iNatResults.data?.length || 0),
          coincidencias_cientificas: this._findCommonSpecies(gbifResults.data, iNatResults.data),
          informacion_local_disponible: !!colombianInfo
        },
        recomendaciones: this._generateColombianRecommendations(pestName, colombianInfo)
      };
    } catch (error) {
      console.error('Error en búsqueda completa de plagas:', error);
      return {
        success: false,
        error: 'Error al obtener información completa de la plaga',
        detalles: error.message
      };
    }
  }

  /**
   * Obtener información específica de cultivos colombianos y sus plagas
   * @param {string} cropName - Nombre del cultivo en español
   * @returns {Promise<Object>} - Información del cultivo y plagas asociadas en Colombia
   */
  async getCropPestInfo(cropName) {
    try {
      // Información del cultivo en Colombia
      const cropInfo = this.colombianService.getCropInfo(cropName);
      
      // Plagas específicas del cultivo en Colombia
      const colombianPests = this.colombianService.getPestsByCrop(cropName);
      
      // Traducir nombre del cultivo para APIs internacionales
      const englishCropName = this._translateCropToEnglish(cropName);
      
      // Buscar información adicional en USDA
      const cropData = await this.services.usda.getCropProduction(englishCropName);
      
      // Buscar plagas comunes en APIs internacionales
      const commonPests = await this._getCommonCropPests(englishCropName);

      return {
        success: true,
        cultivo: cropName,
        informacion_cultivo_colombia: cropInfo,
        plagas_principales_colombia: colombianPests,
        datos_produccion_internacional: cropData,
        plagas_internacionales: commonPests,
        recomendaciones: this._generateColombianCropRecommendations(cropName, cropInfo, colombianPests)
      };
    } catch (error) {
      console.error('Error al obtener información de cultivo:', error);
      return {
        success: false,
        error: 'Error al obtener información del cultivo',
        detalles: error.message
      };
    }
  }

  /**
   * Identificar plagas por ubicación geográfica
   * @param {number} latitude - Latitud
   * @param {number} longitude - Longitud
   * @param {string} cropType - Tipo de cultivo (opcional)
   * @returns {Promise<Object>} - Plagas comunes en la zona
   */
  async getPestsByLocation(latitude, longitude, cropType = null) {
    try {
      // Buscar observaciones de insectos en la zona usando iNaturalist
      const nearbyPests = await this._findNearbyPests(latitude, longitude);
      
      let cropSpecificPests = null;
      if (cropType) {
        cropSpecificPests = await this._getCommonCropPests(cropType);
      }

      return {
        success: true,
        location: { latitude, longitude },
        cropType: cropType,
        nearbyPests: nearbyPests,
        cropSpecificPests: cropSpecificPests,
        riskAssessment: this._assessPestRisk(nearbyPests, cropSpecificPests)
      };
    } catch (error) {
      console.error('Error al buscar plagas por ubicación:', error);
      return {
        success: false,
        error: 'Error al buscar plagas en la ubicación',
        details: error.message
      };
    }
  }

  /**
   * Obtener detalles completos de una plaga específica
   * @param {string} pestName - Nombre de la plaga
   * @param {number} speciesId - ID opcional de iNaturalist o GBIF
   * @returns {Promise<Object>} - Información detallada
   */
  async getDetailedPestInfo(pestName, speciesId = null) {
    try {
      let detailedInfo = {};

      if (speciesId) {
        // Si tenemos un ID específico, obtener detalles de iNaturalist
        const iNatDetails = await this.services.iNaturalist.getTaxonDetails(speciesId);
        detailedInfo.iNaturalist = iNatDetails;
      }

      // Buscar en GBIF para información científica adicional
      const gbifInfo = await this.services.gbif.searchPests(pestName);
      if (gbifInfo.success && gbifInfo.data.length > 0) {
        const firstResult = gbifInfo.data[0];
        const gbifDetails = await this.services.gbif.getSpeciesDetails(firstResult.key);
        detailedInfo.gbif = gbifDetails;
      }

      return {
        success: true,
        pestName: pestName,
        detailedInfo: detailedInfo,
        controlMethods: this._getControlMethods(pestName),
        affectedCrops: this._getAffectedCrops(pestName)
      };
    } catch (error) {
      console.error('Error al obtener información detallada:', error);
      return {
        success: false,
        error: 'Error al obtener información detallada',
        details: error.message
      };
    }
  }

  // Métodos auxiliares privados

  /**
   * Encontrar especies comunes entre GBIF e iNaturalist
   * @private
   */
  _findCommonSpecies(gbifData, iNatData) {
    if (!gbifData || !iNatData) return [];
    
    return gbifData.filter(gbifSpecies => 
      iNatData.some(iNatSpecies => 
        gbifSpecies.scientificName?.toLowerCase() === iNatSpecies.scientificName?.toLowerCase()
      )
    );
  }

  /**
   * Obtener plagas comunes de un cultivo específico
   * @private
   */
  async _getCommonCropPests(cropName) {
    const pestMapping = {
      'corn': ['corn borer', 'armyworm', 'corn rootworm', 'aphid'],
      'soybeans': ['soybean aphid', 'bean leaf beetle', 'stink bug'],
      'wheat': ['hessian fly', 'wheat midge', 'armyworm'],
      'rice': ['rice stem borer', 'brown planthopper', 'rice water weevil'],
      'cotton': ['bollworm', 'boll weevil', 'thrips'],
      'tomato': ['tomato hornworm', 'whitefly', 'aphid']
    };

    const commonPests = pestMapping[cropName.toLowerCase()] || [];
    const pestInfo = [];

    for (const pest of commonPests) {
      try {
        const info = await this.services.iNaturalist.searchInsectPests(pest);
        if (info.success && info.data.length > 0) {
          pestInfo.push(info.data[0]);
        }
      } catch (error) {
        console.log(`Error buscando ${pest}:`, error.message);
      }
    }

    return pestInfo;
  }

  /**
   * Buscar plagas cercanas a una ubicación
   * @private
   */
  async _findNearbyPests(latitude, longitude) {
    try {
      // Buscar observaciones de insectos en general
      const insects = await this.services.iNaturalist.searchSpecies('pest', 'Insecta');
      
      if (!insects.success || !insects.data.length) return [];

      // Para los primeros 5 insectos, buscar observaciones cercanas
      const nearbyObservations = [];
      for (let i = 0; i < Math.min(5, insects.data.length); i++) {
        const insect = insects.data[i];
        try {
          const observations = await this.services.iNaturalist.getObservationsNearLocation(
            insect.id, latitude, longitude, 20
          );
          if (observations.success && observations.data.length > 0) {
            nearbyObservations.push({
              species: insect,
              nearbyCount: observations.data.length,
              recentObservations: observations.data.slice(0, 3)
            });
          }
        } catch (error) {
          console.log(`Error buscando observaciones para ${insect.name}:`, error.message);
        }
      }

      return nearbyObservations;
    } catch (error) {
      console.error('Error buscando plagas cercanas:', error);
      return [];
    }
  }

  /**
   * Evaluar riesgo de plagas
   * @private
   */
  _assessPestRisk(nearbyPests, cropPests) {
    let riskLevel = 'LOW';
    let riskFactors = [];

    if (nearbyPests && nearbyPests.length > 3) {
      riskLevel = 'MEDIUM';
      riskFactors.push('Alta actividad de insectos en la zona');
    }

    if (cropPests && cropPests.length > 2) {
      riskLevel = 'MEDIUM';
      riskFactors.push('Múltiples plagas conocidas para este cultivo');
    }

    if (nearbyPests && cropPests && nearbyPests.length > 3 && cropPests.length > 2) {
      riskLevel = 'HIGH';
      riskFactors.push('Combinación de alta actividad de plagas y cultivo susceptible');
    }

    return {
      level: riskLevel,
      factors: riskFactors,
      recommendations: this._getRiskRecommendations(riskLevel)
    };
  }

  /**
   * Generar recomendaciones basadas en las plagas encontradas
   * @private
   */
  _generatePestRecommendations(cropName, pests) {
    const recommendations = [
      'Realizar monitoreo regular de cultivos',
      'Implementar medidas de control integrado de plagas (IPM)',
      'Mantener registros de observaciones de plagas'
    ];

    if (pests && pests.length > 0) {
      recommendations.push(`Estar alerta a ${pests.length} especies de plagas comunes en ${cropName}`);
    }

    return recommendations;
  }

  /**
   * Obtener métodos de control para una plaga específica
   * @private
   */
  _getControlMethods(pestName) {
    // Base de conocimiento básica - en un sistema real esto vendría de una base de datos
    const controlMethods = {
      'aphid': ['Control biológico con mariquitas', 'Jabón insecticida', 'Aceite de neem'],
      'armyworm': ['Bacillus thuringiensis', 'Feromonas', 'Control cultural'],
      'borer': ['Variedades resistentes', 'Control biológico', 'Rotación de cultivos']
    };

    const pestKey = Object.keys(controlMethods).find(key => 
      pestName.toLowerCase().includes(key)
    );

    return pestKey ? controlMethods[pestKey] : [
      'Consultar con especialista agrícola',
      'Implementar control integrado de plagas',
      'Monitoreo regular'
    ];
  }

  /**
   * Obtener cultivos afectados por una plaga
   * @private
   */
  _getAffectedCrops(pestName) {
    const affectedCrops = {
      'aphid': ['maíz', 'soja', 'trigo', 'algodón'],
      'armyworm': ['maíz', 'arroz', 'sorgo'],
      'borer': ['maíz', 'arroz', 'caña de azúcar']
    };

    const pestKey = Object.keys(affectedCrops).find(key => 
      pestName.toLowerCase().includes(key)
    );

    return pestKey ? affectedCrops[pestKey] : ['Consultar literatura especializada'];
  }

  /**
   * Obtener recomendaciones basadas en nivel de riesgo
   * @private
   */
  _getRiskRecommendations(riskLevel) {
    const recommendations = {
      'LOW': [
        'Mantener monitoreo de rutina',
        'Registrar observaciones semanales'
      ],
      'MEDIUM': [
        'Incrementar frecuencia de monitoreo',
        'Preparar medidas de control preventivas',
        'Revisar umbrales económicos de daño'
      ],
      'HIGH': [
        'Monitoreo diario recomendado',
        'Implementar medidas de control inmediatas',
        'Consultar con especialista en manejo de plagas',
        'Considerar tratamientos preventivos'
      ]
    };

    return recommendations[riskLevel] || recommendations['LOW'];
  }

  /**
   * Traducir términos de plagas del español al inglés
   * @private
   */
  _translateToEnglish(spanishTerm) {
    const translations = {
      'broca del cafe': 'coffee borer',
      'broca': 'borer',
      'roya del cafe': 'coffee rust',
      'roya': 'rust',
      'gusano cogollero': 'armyworm',
      'cogollero': 'armyworm',
      'sigatoka negra': 'black sigatoka',
      'sigatoka': 'sigatoka',
      'sogata': 'rice planthopper',
      'pulgon': 'aphid',
      'pulgones': 'aphids',
      'trips': 'thrips',
      'mosca blanca': 'whitefly',
      'acaro': 'spider mite',
      'chinche': 'bug',
      'barrenador': 'borer',
      'polilla': 'moth',
      'escoba de bruja': 'witches broom',
      'monilia': 'monilia',
      'mazorca negra': 'black pod'
    };

    return translations[spanishTerm.toLowerCase()] || spanishTerm;
  }

  /**
   * Traducir nombres de cultivos del español al inglés
   * @private
   */
  _translateCropToEnglish(spanishCrop) {
    const translations = {
      'cafe': 'coffee',
      'maiz': 'corn',
      'arroz': 'rice',
      'platano': 'banana',
      'papa': 'potato',
      'frijol': 'bean',
      'cacao': 'cacao',
      'yuca': 'cassava',
      'cana de azucar': 'sugarcane',
      'flores': 'flowers'
    };

    return translations[spanishCrop.toLowerCase()] || spanishCrop;
  }

  /**
   * Traducir resultados de APIs al español
   * @private
   */
  _translateResults(gbifResults, iNatResults) {
    const translateSpeciesData = (data) => {
      if (!data || !Array.isArray(data)) return data;

      return data.map(item => ({
        ...item,
        nombre_comun: this.colombianService.translateToSpanish(item.commonName || ''),
        reino: item.kingdom === 'Animalia' ? 'Animal' : item.kingdom,
        filo: item.phylum,
        clase: item.class,
        orden: item.order,
        familia: item.family
      }));
    };

    return {
      gbif: {
        ...gbifResults,
        data: translateSpeciesData(gbifResults.data)
      },
      iNaturalist: {
        ...iNatResults,
        data: translateSpeciesData(iNatResults.data)
      }
    };
  }

  /**
   * Generar recomendaciones específicas para Colombia
   * @private
   */
  _generateColombianRecommendations(pestName, colombianInfo) {
    const recommendations = [];

    if (colombianInfo) {
      recommendations.push('✅ Información específica de Colombia disponible');
      recommendations.push(`📍 Regiones problemáticas: ${colombianInfo.regiones_problematicas?.join(', ')}`);
      recommendations.push(`🌱 Cultivos afectados: ${colombianInfo.cultivos_afectados?.join(', ')}`);
      recommendations.push(`⏰ Época crítica: ${colombianInfo.epoca_critica}`);
      
      if (colombianInfo.control_biologico?.length > 0) {
        recommendations.push(`🦠 Control biológico: ${colombianInfo.control_biologico.join(', ')}`);
      }
      
      if (colombianInfo.control_cultural?.length > 0) {
        recommendations.push(`🌾 Control cultural: ${colombianInfo.control_cultural.join(', ')}`);
      }
    } else {
      recommendations.push('ℹ️ Consultar con técnico agrícola local para información específica de Colombia');
      recommendations.push('📞 Contactar al ICA (Instituto Colombiano Agropecuario) para asesoría');
      recommendations.push('🏢 Visitar oficina de AGROSAVIA más cercana');
    }

    recommendations.push('📖 Verificar productos registrados en ICA antes de aplicar');
    recommendations.push('⚠️ Respetar períodos de carencia según normativa colombiana');

    return recommendations;
  }

  /**
   * Generar recomendaciones específicas para cultivos colombianos
   * @private
   */
  _generateColombianCropRecommendations(cropName, cropInfo, pests) {
    const recommendations = [];

    if (cropInfo) {
      recommendations.push(`🌱 Cultivo: ${cropInfo.nombre} (${cropInfo.nombreCientifico})`);
      recommendations.push(`📍 Principales regiones: ${cropInfo.regiones?.join(', ')}`);
      recommendations.push(`🌧️ Época de siembra: ${cropInfo.epoca_siembra}`);
      recommendations.push(`🌾 Época de cosecha: ${cropInfo.epoca_cosecha}`);
      
      if (pests && pests.length > 0) {
        recommendations.push(`🐛 Plagas principales en Colombia:`);
        pests.forEach(pest => {
          if (pest.nombre) {
            recommendations.push(`   • ${pest.nombre} (${pest.nombreCientifico})`);
          }
        });
      }
      
      recommendations.push('💡 Recomendaciones generales:');
      recommendations.push('   • Implementar manejo integrado de plagas (MIP)');
      recommendations.push('   • Usar variedades resistentes cuando estén disponibles');
      recommendations.push('   • Mantener monitoreo regular según época crítica');
      recommendations.push('   • Consultar asistencia técnica local');
    } else {
      recommendations.push(`❓ No se encontró información específica para ${cropName} en Colombia`);
      recommendations.push('📞 Consultar con:');
      recommendations.push('   • ICA - Instituto Colombiano Agropecuario');
      recommendations.push('   • AGROSAVIA - Corporación Colombiana de Investigación Agropecuaria');
      recommendations.push('   • UMATA local (Unidad Municipal de Asistencia Técnica)');
    }

    return recommendations;
  }
}

module.exports = new PestInformationService();
