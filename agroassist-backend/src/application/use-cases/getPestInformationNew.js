const pestInformationService = require('../../infrastructure/services/pestInformationService');

/**
 * Caso de uso: Obtener información de plagas
 * Gestiona la obtención de información detallada sobre plagas en cultivos
 * Utiliza APIs gratuitas: GBIF, iNaturalist y USDA
 */
class GetPestInformation {
  /**
   * Búsqueda completa de información de una plaga específica
   * @param {string} pestName - Nombre de la plaga a buscar
   * @returns {Promise<Object>} - Información completa de la plaga
   */
  async searchPest(pestName) {
    try {
      if (!pestName || typeof pestName !== 'string') {
        return {
          success: false,
          error: 'Debe proporcionar un nombre válido de plaga'
        };
      }

      const result = await pestInformationService.getCompletePestInfo(pestName);
      
      if (result.success) {
        result.recommendations = this._generatePestRecommendations(result);
      }

      return result;

    } catch (error) {
      console.error('Error en búsqueda de plaga:', error);
      return {
        success: false,
        error: 'Error interno al buscar información de la plaga',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Obtener información de cultivo y sus plagas asociadas
   * @param {string} cropName - Nombre del cultivo
   * @returns {Promise<Object>} - Información del cultivo y plagas
   */
  async getCropPests(cropName) {
    try {
      if (!cropName || typeof cropName !== 'string') {
        return {
          success: false,
          error: 'Debe proporcionar un nombre válido de cultivo'
        };
      }

      const result = await pestInformationService.getCropPestInfo(cropName);
      
      if (result.success) {
        result.riskAssessment = this._assessCropRisk(result);
      }

      return result;

    } catch (error) {
      console.error('Error en información de cultivo:', error);
      return {
        success: false,
        error: 'Error interno al obtener información del cultivo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Buscar plagas por ubicación geográfica
   * @param {Object} params - Parámetros de ubicación
   * @param {number} params.latitude - Latitud
   * @param {number} params.longitude - Longitud
   * @param {string} params.cropType - Tipo de cultivo (opcional)
   * @returns {Promise<Object>} - Plagas en la ubicación
   */
  async getPestsByLocation(params) {
    try {
      const validation = this._validateLocationParams(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Parámetros de ubicación inválidos',
          details: validation.errors
        };
      }

      const result = await pestInformationService.getPestsByLocation(
        params.latitude,
        params.longitude,
        params.cropType
      );

      if (result.success) {
        result.actionPlan = this._generateActionPlan(result.riskAssessment);
      }

      return result;

    } catch (error) {
      console.error('Error en búsqueda por ubicación:', error);
      return {
        success: false,
        error: 'Error interno al buscar plagas por ubicación',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Obtener información detallada de una plaga específica
   * @param {Object} params - Parámetros de búsqueda detallada
   * @param {string} params.pestName - Nombre de la plaga
   * @param {number} params.speciesId - ID de la especie (opcional)
   * @returns {Promise<Object>} - Información detallada de la plaga
   */
  async getDetailedPestInfo(params) {
    try {
      if (!params.pestName) {
        return {
          success: false,
          error: 'Debe proporcionar el nombre de la plaga'
        };
      }

      const result = await pestInformationService.getDetailedPestInfo(
        params.pestName,
        params.speciesId
      );

      if (result.success) {
        result.managementPlan = this._createManagementPlan(result);
      }

      return result;

    } catch (error) {
      console.error('Error en información detallada:', error);
      return {
        success: false,
        error: 'Error interno al obtener información detallada',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  // Métodos auxiliares privados

  /**
   * Generar recomendaciones específicas para una plaga
   * @private
   */
  _generatePestRecommendations(pestResult) {
    const recommendations = [];
    
    if (pestResult.summary?.totalResults > 0) {
      recommendations.push('Información encontrada en múltiples bases de datos científicas');
      
      if (pestResult.summary.scientificMatches?.length > 0) {
        recommendations.push('Hay coincidencias científicas confirmadas');
      }
      
      recommendations.push('Consulte con especialistas locales para medidas específicas');
      recommendations.push('Implemente monitoreo regular en sus cultivos');
    } else {
      recommendations.push('No se encontró información específica');
      recommendations.push('Consulte con expertos agrícolas locales');
    }

    return recommendations;
  }

  /**
   * Evaluar riesgo del cultivo
   * @private
   */
  _assessCropRisk(cropResult) {
    let riskLevel = 'LOW';
    const factors = [];

    if (cropResult.commonPests?.length > 3) {
      riskLevel = 'MEDIUM';
      factors.push('Múltiples plagas conocidas para este cultivo');
    }

    if (cropResult.commonPests?.length > 5) {
      riskLevel = 'HIGH';
      factors.push('Alto número de plagas asociadas');
    }

    return {
      level: riskLevel,
      factors: factors,
      recommendations: this._getRiskRecommendations(riskLevel)
    };
  }

  /**
   * Generar plan de acción basado en evaluación de riesgo
   * @private
   */
  _generateActionPlan(riskAssessment) {
    if (!riskAssessment) return [];

    const actionPlan = [];

    switch (riskAssessment.level) {
      case 'HIGH':
        actionPlan.push('ACCIÓN INMEDIATA: Implementar medidas de control preventivas');
        actionPlan.push('Monitoreo diario recomendado');
        actionPlan.push('Contactar especialista en manejo integrado de plagas');
        break;
      case 'MEDIUM':
        actionPlan.push('Incrementar frecuencia de monitoreo a 2-3 veces por semana');
        actionPlan.push('Preparar medidas de control para implementación rápida');
        actionPlan.push('Revisar umbrales económicos de daño');
        break;
      default:
        actionPlan.push('Mantener monitoreo de rutina semanal');
        actionPlan.push('Registrar observaciones para análisis de tendencias');
    }

    return actionPlan;
  }

  /**
   * Crear plan de manejo para plaga específica
   * @private
   */
  _createManagementPlan(detailedResult) {
    const plan = {
      prevention: [
        'Implementar buenas prácticas agrícolas',
        'Mantener campos limpios de malezas',
        'Rotar cultivos cuando sea posible'
      ],
      monitoring: [
        'Inspeccionar cultivos regularmente',
        'Usar trampas de monitoreo si están disponibles',
        'Registrar observaciones y niveles de población'
      ],
      control: detailedResult.controlMethods || [
        'Consultar con especialista agrícola',
        'Considerar control biológico cuando sea posible',
        'Aplicar tratamientos solo cuando sea necesario'
      ],
      followUp: [
        'Evaluar efectividad de medidas implementadas',
        'Ajustar estrategias basadas en resultados',
        'Mantener registros para futuras temporadas'
      ]
    };

    return plan;
  }

  /**
   * Obtener recomendaciones por nivel de riesgo
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
        'Preparar medidas de control preventivas'
      ],
      'HIGH': [
        'Monitoreo diario recomendado',
        'Implementar medidas de control inmediatas',
        'Consultar especialista'
      ]
    };

    return recommendations[riskLevel] || recommendations['LOW'];
  }

  /**
   * Validar parámetros de ubicación
   * @private
   */
  _validateLocationParams(params) {
    const errors = [];

    if (!params.latitude || typeof params.latitude !== 'number') {
      errors.push('Latitud requerida y debe ser un número');
    } else if (params.latitude < -90 || params.latitude > 90) {
      errors.push('Latitud debe estar entre -90 y 90');
    }

    if (!params.longitude || typeof params.longitude !== 'number') {
      errors.push('Longitud requerida y debe ser un número');
    } else if (params.longitude < -180 || params.longitude > 180) {
      errors.push('Longitud debe estar entre -180 y 180');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = GetPestInformation;
