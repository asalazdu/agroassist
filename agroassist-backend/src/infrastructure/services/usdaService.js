const axios = require('axios');

/**
 * Servicio para USDA NASS API (United States Department of Agriculture)
 * API completamente GRATUITA - No requiere registro ni API key
 * Datos estadísticos de cultivos, producción agrícola y manejo de plagas
 */
class USDAService {
  constructor() {
    this.baseURL = 'https://quickstats.nass.usda.gov/api';
  }

  /**
   * Obtener datos de producción de cultivos
   * @param {string} commodity - Nombre del cultivo (ej: "CORN", "SOYBEANS", "WHEAT")
   * @param {string} year - Año de los datos (opcional)
   * @param {string} state - Estado (opcional)
   * @returns {Promise<Object>} - Datos de producción
   */
  async getCropProduction(commodity, year = null, state = null) {
    try {
      const params = {
        source_desc: 'SURVEY',
        commodity_desc: commodity.toUpperCase(),
        statisticcat_desc: 'PRODUCTION',
        unit_desc: 'ACRES',
        format: 'JSON'
      };

      if (year) {
        params.year = year;
      }

      if (state) {
        params.state_name = state.toUpperCase();
      }

      const response = await axios.get(`${this.baseURL}/api_GET`, { params });

      return {
        success: true,
        data: response.data.data ? response.data.data.map(item => ({
          year: item.year,
          state: item.state_name,
          county: item.county_name,
          commodity: item.commodity_desc,
          value: item.Value,
          unit: item.unit_desc,
          domain: item.domain_desc,
          category: item.domaincat_desc
        })) : []
      };
    } catch (error) {
      console.error('Error en USDA Service:', error);
      return {
        success: false,
        error: 'Error al obtener datos de producción',
        details: error.message
      };
    }
  }

  /**
   * Obtener información sobre manejo de plagas en cultivos
   * @param {string} commodity - Cultivo
   * @param {string} practice - Práctica agrícola relacionada con plagas
   * @returns {Promise<Object>} - Datos sobre manejo de plagas
   */
  async getPestManagementData(commodity, practice = 'TREATED') {
    try {
      const params = {
        source_desc: 'SURVEY',
        commodity_desc: commodity.toUpperCase(),
        domain_desc: 'CHEMICAL',
        domaincat_desc: practice.toUpperCase(),
        format: 'JSON'
      };

      const response = await axios.get(`${this.baseURL}/api_GET`, { params });

      return {
        success: true,
        data: response.data.data ? response.data.data.map(item => ({
          year: item.year,
          state: item.state_name,
          commodity: item.commodity_desc,
          treatment: item.domaincat_desc,
          chemical: item.class_desc,
          acres: item.Value,
          unit: item.unit_desc
        })) : []
      };
    } catch (error) {
      console.error('Error al obtener datos de manejo de plagas:', error);
      return {
        success: false,
        error: 'Error al obtener información de manejo de plagas',
        details: error.message
      };
    }
  }

  /**
   * Obtener lista de cultivos disponibles
   * @returns {Promise<Object>} - Lista de cultivos
   */
  async getAvailableCrops() {
    try {
      const params = {
        param: 'commodity_desc',
        format: 'JSON'
      };

      const response = await axios.get(`${this.baseURL}/get_param_values`, { params });

      return {
        success: true,
        data: response.data.commodity_desc ? response.data.commodity_desc.slice(0, 50) : []
      };
    } catch (error) {
      console.error('Error al obtener cultivos disponibles:', error);
      return {
        success: false,
        error: 'Error al obtener lista de cultivos',
        details: error.message
      };
    }
  }

  /**
   * Obtener datos de área plantada por cultivo
   * @param {string} commodity - Cultivo
   * @param {string} year - Año
   * @returns {Promise<Object>} - Datos de área plantada
   */
  async getPlantedArea(commodity, year = '2023') {
    try {
      const params = {
        source_desc: 'SURVEY',
        commodity_desc: commodity.toUpperCase(),
        statisticcat_desc: 'AREA PLANTED',
        unit_desc: 'ACRES',
        year: year,
        format: 'JSON'
      };

      const response = await axios.get(`${this.baseURL}/api_GET`, { params });

      return {
        success: true,
        data: response.data.data ? response.data.data.map(item => ({
          year: item.year,
          state: item.state_name,
          county: item.county_name,
          commodity: item.commodity_desc,
          areaPlanted: item.Value,
          unit: item.unit_desc
        })) : []
      };
    } catch (error) {
      console.error('Error al obtener área plantada:', error);
      return {
        success: false,
        error: 'Error al obtener datos de área plantada',
        details: error.message
      };
    }
  }

  /**
   * Obtener datos de rendimiento por cultivo
   * @param {string} commodity - Cultivo
   * @param {string} year - Año
   * @returns {Promise<Object>} - Datos de rendimiento
   */
  async getCropYield(commodity, year = '2023') {
    try {
      const params = {
        source_desc: 'SURVEY',
        commodity_desc: commodity.toUpperCase(),
        statisticcat_desc: 'YIELD',
        year: year,
        format: 'JSON'
      };

      const response = await axios.get(`${this.baseURL}/api_GET`, { params });

      return {
        success: true,
        data: response.data.data ? response.data.data.map(item => ({
          year: item.year,
          state: item.state_name,
          county: item.county_name,
          commodity: item.commodity_desc,
          yield: item.Value,
          unit: item.unit_desc
        })) : []
      };
    } catch (error) {
      console.error('Error al obtener rendimiento:', error);
      return {
        success: false,
        error: 'Error al obtener datos de rendimiento',
        details: error.message
      };
    }
  }

  /**
   * Buscar información específica sobre pérdidas por plagas
   * @param {string} commodity - Cultivo
   * @param {string} year - Año
   * @returns {Promise<Object>} - Datos sobre pérdidas
   */
  async getPestLossData(commodity, year = '2023') {
    try {
      const params = {
        source_desc: 'SURVEY',
        commodity_desc: commodity.toUpperCase(),
        domain_desc: 'LOSS',
        year: year,
        format: 'JSON'
      };

      const response = await axios.get(`${this.baseURL}/api_GET`, { params });

      return {
        success: true,
        data: response.data.data ? response.data.data.map(item => ({
          year: item.year,
          state: item.state_name,
          commodity: item.commodity_desc,
          lossType: item.domaincat_desc,
          value: item.Value,
          unit: item.unit_desc
        })) : []
      };
    } catch (error) {
      console.error('Error al obtener datos de pérdidas:', error);
      return {
        success: false,
        error: 'Error al obtener datos de pérdidas por plagas',
        details: error.message
      };
    }
  }
}

module.exports = new USDAService();
