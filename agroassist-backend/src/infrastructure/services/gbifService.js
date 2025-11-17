const axios = require('axios');

/**
 * Servicio para GBIF API (Global Biodiversity Information Facility)
 * API completamente GRATUITA - No requiere registro ni API key
 * Información sobre plagas, insectos y biodiversidad
 */
class GBIFService {
  constructor() {
    this.baseURL = 'https://api.gbif.org/v1';
  }

  /**
   * Buscar información de plagas por nombre científico o común
   * @param {string} query - Nombre de la plaga a buscar
   * @returns {Promise<Object>} - Información de la plaga
   */
  async searchPests(query) {
    try {
      const response = await axios.get(`${this.baseURL}/species/search`, {
        params: {
          q: query,
          rank: 'SPECIES',
          status: 'ACCEPTED',
          limit: 10
        }
      });

      return {
        success: true,
        data: response.data.results.map(species => ({
          key: species.key,
          scientificName: species.scientificName,
          commonName: species.vernacularName,
          kingdom: species.kingdom,
          phylum: species.phylum,
          class: species.class,
          order: species.order,
          family: species.family,
          genus: species.genus,
          rank: species.rank,
          taxonomicStatus: species.taxonomicStatus
        }))
      };
    } catch (error) {
      console.error('Error en GBIF Service:', error);
      return {
        success: false,
        error: 'Error al buscar información de plagas',
        details: error.message
      };
    }
  }

  /**
   * Obtener información detallada de una especie específica
   * @param {number} speciesKey - Clave única de la especie en GBIF
   * @returns {Promise<Object>} - Información detallada de la especie
   */
  async getSpeciesDetails(speciesKey) {
    try {
      const response = await axios.get(`${this.baseURL}/species/${speciesKey}`);
      
      return {
        success: true,
        data: {
          key: response.data.key,
          scientificName: response.data.scientificName,
          commonNames: response.data.vernacularNames || [],
          description: response.data.description,
          kingdom: response.data.kingdom,
          phylum: response.data.phylum,
          class: response.data.class,
          order: response.data.order,
          family: response.data.family,
          genus: response.data.genus,
          species: response.data.species,
          habitat: response.data.habitat,
          threatStatus: response.data.threatStatus
        }
      };
    } catch (error) {
      console.error('Error al obtener detalles de especie:', error);
      return {
        success: false,
        error: 'Error al obtener información detallada',
        details: error.message
      };
    }
  }

  /**
   * Buscar plagas por familia (útil para cultivos específicos)
   * @param {string} family - Familia de insectos (ej: "Aphididae" para pulgones)
   * @returns {Promise<Object>} - Lista de especies de esa familia
   */
  async searchPestsByFamily(family) {
    try {
      const response = await axios.get(`${this.baseURL}/species/search`, {
        params: {
          family: family,
          rank: 'SPECIES',
          limit: 20
        }
      });

      return {
        success: true,
        data: response.data.results.map(species => ({
          key: species.key,
          scientificName: species.scientificName,
          commonName: species.vernacularName,
          family: species.family,
          order: species.order
        }))
      };
    } catch (error) {
      console.error('Error al buscar por familia:', error);
      return {
        success: false,
        error: 'Error al buscar plagas por familia',
        details: error.message
      };
    }
  }

  /**
   * Obtener distribución geográfica de una plaga
   * @param {number} speciesKey - Clave de la especie
   * @param {string} country - Código del país (opcional)
   * @returns {Promise<Object>} - Distribución geográfica
   */
  async getSpeciesDistribution(speciesKey, country = null) {
    try {
      const params = {
        taxonKey: speciesKey,
        limit: 50
      };
      
      if (country) {
        params.country = country;
      }

      const response = await axios.get(`${this.baseURL}/occurrence/search`, {
        params
      });

      return {
        success: true,
        data: {
          totalRecords: response.data.count,
          occurrences: response.data.results.map(occurrence => ({
            country: occurrence.country,
            stateProvince: occurrence.stateProvince,
            locality: occurrence.locality,
            latitude: occurrence.decimalLatitude,
            longitude: occurrence.decimalLongitude,
            year: occurrence.year,
            month: occurrence.month
          }))
        }
      };
    } catch (error) {
      console.error('Error al obtener distribución:', error);
      return {
        success: false,
        error: 'Error al obtener distribución geográfica',
        details: error.message
      };
    }
  }
}

module.exports = new GBIFService();
