const axios = require('axios');

/**
 * Servicio para iNaturalist API
 * API completamente GRATUITA - No requiere registro ni API key
 * Identificación de especies, insectos y observaciones de biodiversidad
 */
class INaturalistService {
  constructor() {
    this.baseURL = 'https://api.inaturalist.org/v1';
  }

  /**
   * Buscar especies por nombre (plagas, insectos, plantas)
   * @param {string} query - Nombre a buscar
   * @param {string} category - Categoría: 'Insecta', 'Plantae', etc.
   * @returns {Promise<Object>} - Resultados de la búsqueda
   */
  async searchSpecies(query, category = null) {
    try {
      const params = {
        q: query,
        per_page: 10,
        order: 'desc',
        order_by: 'observations_count'
      };

      if (category) {
        params.iconic_taxa = category;
      }

      const response = await axios.get(`${this.baseURL}/taxa`, { params });

      return {
        success: true,
        data: response.data.results.map(taxon => ({
          id: taxon.id,
          name: taxon.name,
          commonName: taxon.preferred_common_name,
          rank: taxon.rank,
          iconicTaxonName: taxon.iconic_taxon_name,
          observationsCount: taxon.observations_count,
          photoUrl: taxon.default_photo ? taxon.default_photo.medium_url : null,
          wikipediaUrl: taxon.wikipedia_url,
          ancestry: taxon.ancestry
        }))
      };
    } catch (error) {
      console.error('Error en iNaturalist Service:', error);
      return {
        success: false,
        error: 'Error al buscar especies',
        details: error.message
      };
    }
  }

  /**
   * Buscar específicamente insectos plagas
   * @param {string} query - Nombre de la plaga
   * @returns {Promise<Object>} - Información de insectos
   */
  async searchInsectPests(query) {
    try {
      const response = await axios.get(`${this.baseURL}/taxa`, {
        params: {
          q: query,
          iconic_taxa: 'Insecta',
          per_page: 15,
          order: 'desc',
          order_by: 'observations_count'
        }
      });

      return {
        success: true,
        data: response.data.results.map(insect => ({
          id: insect.id,
          scientificName: insect.name,
          commonName: insect.preferred_common_name,
          rank: insect.rank,
          observationsCount: insect.observations_count,
          photoUrl: insect.default_photo ? insect.default_photo.medium_url : null,
          taxonomy: {
            kingdom: insect.kingdom,
            phylum: insect.phylum,
            class: insect.class,
            order: insect.order,
            family: insect.family,
            genus: insect.genus
          }
        }))
      };
    } catch (error) {
      console.error('Error al buscar insectos:', error);
      return {
        success: false,
        error: 'Error al buscar insectos plagas',
        details: error.message
      };
    }
  }

  /**
   * Obtener observaciones de una especie en una ubicación específica
   * @param {number} taxonId - ID del taxón
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud  
   * @param {number} radius - Radio en km (máximo 50)
   * @returns {Promise<Object>} - Observaciones en la zona
   */
  async getObservationsNearLocation(taxonId, lat, lng, radius = 10) {
    try {
      const response = await axios.get(`${this.baseURL}/observations`, {
        params: {
          taxon_id: taxonId,
          lat: lat,
          lng: lng,
          radius: Math.min(radius, 50), // Máximo 50km
          per_page: 20,
          order: 'desc',
          order_by: 'observed_on'
        }
      });

      return {
        success: true,
        data: response.data.results.map(observation => ({
          id: observation.id,
          observedOn: observation.observed_on,
          location: {
            latitude: observation.location ? observation.location[1] : null,
            longitude: observation.location ? observation.location[0] : null,
            place: observation.place_guess
          },
          photos: observation.photos.map(photo => photo.url),
          user: observation.user ? observation.user.login : 'Anonymous',
          qualityGrade: observation.quality_grade,
          description: observation.description
        }))
      };
    } catch (error) {
      console.error('Error al obtener observaciones:', error);
      return {
        success: false,
        error: 'Error al obtener observaciones cercanas',
        details: error.message
      };
    }
  }

  /**
   * Obtener información detallada de un taxón específico
   * @param {number} taxonId - ID del taxón
   * @returns {Promise<Object>} - Información detallada
   */
  async getTaxonDetails(taxonId) {
    try {
      const response = await axios.get(`${this.baseURL}/taxa/${taxonId}`);
      const taxon = response.data.results[0];

      return {
        success: true,
        data: {
          id: taxon.id,
          name: taxon.name,
          commonName: taxon.preferred_common_name,
          rank: taxon.rank,
          isActive: taxon.is_active,
          observationsCount: taxon.observations_count,
          description: taxon.wikipedia_summary,
          photos: taxon.taxon_photos ? taxon.taxon_photos.map(photo => photo.photo.medium_url) : [],
          conservationStatus: taxon.conservation_status,
          taxonomy: {
            kingdom: taxon.kingdom,
            phylum: taxon.phylum,
            class: taxon.class,
            order: taxon.order,
            family: taxon.family,
            genus: taxon.genus,
            species: taxon.species
          },
          links: {
            wikipedia: taxon.wikipedia_url,
            iNaturalist: `https://www.inaturalist.org/taxa/${taxon.id}`
          }
        }
      };
    } catch (error) {
      console.error('Error al obtener detalles del taxón:', error);
      return {
        success: false,
        error: 'Error al obtener información detallada',
        details: error.message
      };
    }
  }

  /**
   * Buscar plantas hospederas para plagas específicas
   * @param {string} query - Nombre de la planta
   * @returns {Promise<Object>} - Información de plantas
   */
  async searchHostPlants(query) {
    try {
      const response = await axios.get(`${this.baseURL}/taxa`, {
        params: {
          q: query,
          iconic_taxa: 'Plantae',
          per_page: 10,
          order: 'desc',
          order_by: 'observations_count'
        }
      });

      return {
        success: true,
        data: response.data.results.map(plant => ({
          id: plant.id,
          scientificName: plant.name,
          commonName: plant.preferred_common_name,
          rank: plant.rank,
          observationsCount: plant.observations_count,
          photoUrl: plant.default_photo ? plant.default_photo.medium_url : null,
          family: plant.family,
          genus: plant.genus
        }))
      };
    } catch (error) {
      console.error('Error al buscar plantas:', error);
      return {
        success: false,
        error: 'Error al buscar plantas hospederas',
        details: error.message
      };
    }
  }
}

module.exports = new INaturalistService();
