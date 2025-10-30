/**
 * Perenual API Service
 * Servicio para consultar información real de plagas y enfermedades de plantas
 * API: https://perenual.com/docs/api
 */

const axios = require('axios');

const PERENUAL_API_KEY = process.env.PERENUAL_API_KEY;
const PERENUAL_BASE_URL = 'https://perenual.com/api';

/**
 * Obtiene lista de plagas y enfermedades desde Perenual API
 * @param {Object} options - Opciones de búsqueda
 * @param {string} options.query - Texto de búsqueda
 * @param {number} options.page - Número de página
 * @param {number} options.perPage - Resultados por página
 * @returns {Promise<Object>} Lista de plagas/enfermedades
 */
const getPestDiseaseList = async ({ query = '', page = 1, perPage = 30 } = {}) => {
  try {
    if (!PERENUAL_API_KEY) {
      console.warn('⚠️ PERENUAL_API_KEY no configurada, usando datos de respaldo');
      return getFallbackPests();
    }

    const params = {
      key: PERENUAL_API_KEY,
      page: page
    };

    if (query) {
      params.q = query;
    }

    const response = await axios.get(`${PERENUAL_BASE_URL}/pest-disease-list`, {
      params,
      timeout: 10000
    });

    console.log(`✅ Perenual API: ${response.data.data.length} plagas/enfermedades obtenidas`);

    // Transformar datos de Perenual al formato de AgroAssist
    const transformedData = response.data.data.map(pest => ({
      id: pest.id,
      nombre: pest.common_name || 'Desconocido',
      nombreCientifico: pest.scientific_name || '',
      nombresComunes: pest.other_name || [],
      tipo: categorizeType(pest.common_name, pest.description),
      descripcion: pest.description || 'Información no disponible',
      sintomas: extractSymptoms(pest.description),
      tratamiento: pest.solution || 'Consulte con un agrónomo especializado',
      prevencion: generatePrevention(pest),
      cultivos: pest.host || ['Varios cultivos'],
      imagenes: formatImages(pest.images),
      gravedad: 'media', // Por defecto, se puede mejorar con análisis de texto
      fuente: 'Perenual API'
    }));

    return {
      total: response.data.total,
      currentPage: response.data.current_page,
      lastPage: response.data.last_page,
      perPage: response.data.per_page,
      data: transformedData
    };

  } catch (error) {
    console.error('❌ Error en Perenual API:', error.message);
    
    // Si hay error de API, retornar datos de respaldo
    if (error.response?.status === 401) {
      console.error('❌ API Key inválida o expirada');
    } else if (error.response?.status === 429) {
      console.error('❌ Límite de requests alcanzado');
    }
    
    return getFallbackPests();
  }
};

/**
 * Obtiene detalles específicos de una plaga/enfermedad
 * @param {number} pestId - ID de la plaga en Perenual
 * @returns {Promise<Object>} Detalles de la plaga
 */
const getPestDiseaseDetails = async (pestId) => {
  try {
    if (!PERENUAL_API_KEY) {
      return getFallbackPestById(pestId);
    }

    const response = await axios.get(`${PERENUAL_BASE_URL}/pest-disease-list`, {
      params: {
        key: PERENUAL_API_KEY,
        id: pestId
      },
      timeout: 10000
    });

    if (response.data.data && response.data.data.length > 0) {
      const pest = response.data.data[0];
      return {
        id: pest.id,
        nombre: pest.common_name,
        nombreCientifico: pest.scientific_name,
        descripcion: pest.description,
        solucion: pest.solution,
        cultivos: pest.host,
        imagenes: formatImages(pest.images),
        fuente: 'Perenual API'
      };
    }

    return null;

  } catch (error) {
    console.error('❌ Error obteniendo detalles de plaga:', error.message);
    return getFallbackPestById(pestId);
  }
};

/**
 * Busca plagas específicas para un cultivo
 * @param {string} cropName - Nombre del cultivo
 * @returns {Promise<Array>} Lista de plagas comunes para ese cultivo
 */
const getPestsForCrop = async (cropName) => {
  try {
    // Mapeo de cultivos colombianos a términos de búsqueda
    const cropSearchTerms = {
      'tomate': ['tomato', 'early blight', 'late blight', 'whitefly'],
      'café': ['coffee', 'rust', 'berry borer', 'leaf miner'],
      'papa': ['potato', 'late blight', 'colorado beetle'],
      'maíz': ['corn', 'maize', 'earworm', 'stalk borer'],
      'arroz': ['rice', 'blast', 'brown planthopper'],
      'banano': ['banana', 'panama disease', 'sigatoka'],
      'cacao': ['cacao', 'cocoa', 'pod rot', 'witches broom']
    };

    const searchTerm = cropSearchTerms[cropName.toLowerCase()] || [cropName];
    
    // Buscar cada término y combinar resultados
    const allPests = [];
    for (const term of searchTerm.slice(0, 2)) { // Limitar a 2 términos para no exceder rate limit
      const result = await getPestDiseaseList({ query: term, perPage: 10 });
      if (result.data) {
        allPests.push(...result.data);
      }
    }

    // Eliminar duplicados por ID
    const uniquePests = Array.from(
      new Map(allPests.map(pest => [pest.id, pest])).values()
    );

    return uniquePests.slice(0, 20); // Limitar a 20 resultados

  } catch (error) {
    console.error('❌ Error buscando plagas para cultivo:', error.message);
    return [];
  }
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Categoriza el tipo de plaga/enfermedad basado en el nombre y descripción
 */
const categorizeType = (name, description) => {
  const nameAndDesc = (name + ' ' + (description || '')).toLowerCase();
  
  if (nameAndDesc.includes('fungi') || nameAndDesc.includes('rust') || nameAndDesc.includes('mildew') || nameAndDesc.includes('blight')) {
    return 'hongo';
  } else if (nameAndDesc.includes('bacteria') || nameAndDesc.includes('bacterial')) {
    return 'bacteria';
  } else if (nameAndDesc.includes('virus') || nameAndDesc.includes('viral')) {
    return 'virus';
  } else if (nameAndDesc.includes('insect') || nameAndDesc.includes('beetle') || nameAndDesc.includes('fly') || nameAndDesc.includes('moth')) {
    return 'insecto';
  } else if (nameAndDesc.includes('mite') || nameAndDesc.includes('nematode')) {
    return 'ácaro/nematodo';
  }
  
  return 'otro';
};

/**
 * Extrae síntomas de la descripción
 */
const extractSymptoms = (description) => {
  if (!description) return ['Consulte la descripción completa'];
  
  // Buscar frases que indiquen síntomas
  const symptoms = [];
  const descLower = description.toLowerCase();
  
  if (descLower.includes('spot') || descLower.includes('mancha')) symptoms.push('Manchas en hojas');
  if (descLower.includes('yellow') || descLower.includes('amarillo')) symptoms.push('Amarillamiento');
  if (descLower.includes('wilt') || descLower.includes('marchit')) symptoms.push('Marchitamiento');
  if (descLower.includes('rot') || descLower.includes('pudri')) symptoms.push('Pudrición');
  if (descLower.includes('mold') || descLower.includes('moho')) symptoms.push('Moho visible');
  
  return symptoms.length > 0 ? symptoms : ['Ver descripción completa'];
};

/**
 * Genera recomendaciones de prevención básicas
 */
const generatePrevention = (pest) => {
  const preventions = [
    'Mantener buena ventilación en el cultivo',
    'Realizar rotación de cultivos',
    'Eliminar plantas infectadas inmediatamente',
    'Monitoreo regular del cultivo'
  ];
  
  if (pest.common_name?.toLowerCase().includes('fungi')) {
    preventions.unshift('Evitar exceso de humedad');
    preventions.push('Aplicar fungicidas preventivos');
  } else if (pest.common_name?.toLowerCase().includes('insect')) {
    preventions.unshift('Usar trampas y barreras físicas');
    preventions.push('Control biológico con depredadores naturales');
  }
  
  return preventions.slice(0, 4);
};

/**
 * Formatea las imágenes de Perenual
 */
const formatImages = (images) => {
  if (!images || images.length === 0) return [];
  
  return images.map(img => ({
    thumbnail: img.thumbnail || img.small_url,
    regular: img.regular_url || img.medium_url,
    full: img.original_url,
    license: img.license_name
  }));
};

/**
 * Datos de respaldo cuando la API no está disponible
 */
const getFallbackPests = () => {
  const fallbackData = [
    {
      id: 1,
      nombre: 'Tizón Tardío',
      nombreCientifico: 'Phytophthora infestans',
      nombresComunes: ['Late Blight', 'Gota'],
      tipo: 'hongo',
      descripcion: 'Enfermedad fúngica devastadora que afecta principalmente a papa y tomate. Causa manchas oscuras en hojas y frutos.',
      sintomas: ['Manchas irregulares café-oscuro en hojas', 'Pudrición de frutos', 'Moho blanco en el envés de hojas', 'Muerte rápida de plantas'],
      tratamiento: 'Fungicidas a base de cobre o mancozeb. Eliminar plantas infectadas. Mejorar drenaje y ventilación.',
      prevencion: ['Evitar riego por aspersión', 'Uso de variedades resistentes', 'Espaciamiento adecuado', 'Aplicación preventiva de fungicidas'],
      cultivos: ['Papa', 'Tomate'],
      imagenes: [],
      gravedad: 'alta',
      fuente: 'Base de datos local'
    },
    {
      id: 2,
      nombre: 'Roya del Café',
      nombreCientifico: 'Hemileia vastatrix',
      nombresComunes: ['Coffee Rust', 'Roya Amarilla'],
      tipo: 'hongo',
      descripcion: 'Hongo que produce manchas amarillas-anaranjadas en las hojas del café, causando defoliación y reducción de producción.',
      sintomas: ['Manchas amarillas circulares en hojas', 'Polvo anaranjado en el envés', 'Caída prematura de hojas', 'Debilitamiento general'],
      tratamiento: 'Fungicidas sistémicos (triazoles). Poda sanitaria. Nutrición balanceada para fortalecer plantas.',
      prevencion: ['Manejo de sombra adecuado', 'Fertilización balanceada', 'Variedades resistentes', 'Monitoreo constante'],
      cultivos: ['Café'],
      imagenes: [],
      gravedad: 'alta',
      fuente: 'Base de datos local'
    },
    {
      id: 3,
      nombre: 'Mosca Blanca',
      nombreCientifico: 'Bemisia tabaci',
      nombresComunes: ['Whitefly', 'Mosca Blanca del Tabaco'],
      tipo: 'insecto',
      descripcion: 'Pequeño insecto chupador que se alimenta de la savia y transmite virus. Produce melaza que favorece fumagina.',
      sintomas: ['Insectos blancos pequeños en envés de hojas', 'Hojas amarillentas', 'Melaza y fumagina negra', 'Deformación de brotes'],
      tratamiento: 'Aceites agrícolas, jabón potásico, insecticidas específicos. Control biológico con Encarsia formosa.',
      prevencion: ['Mallas anti-insectos', 'Trampas amarillas pegajosas', 'Eliminación de malezas', 'Control biológico preventivo'],
      cultivos: ['Tomate', 'Pimiento', 'Berenjena', 'Frijol'],
      imagenes: [],
      gravedad: 'media',
      fuente: 'Base de datos local'
    },
    {
      id: 4,
      nombre: 'Broca del Café',
      nombreCientifico: 'Hypothenemus hampei',
      nombresComunes: ['Coffee Berry Borer'],
      tipo: 'insecto',
      descripcion: 'Escarabajo que perfora los granos de café, causando pérdidas económicas significativas.',
      sintomas: ['Orificios pequeños en frutos', 'Granos perforados', 'Caída prematura de frutos', 'Reducción de calidad del grano'],
      tratamiento: 'Recolección sanitaria de frutos. Trampas con alcohol. Control biológico con Beauveria bassiana.',
      prevencion: ['Cosecha oportuna y completa', 'Repase constante', 'Manejo de sombra', 'Control biológico'],
      cultivos: ['Café'],
      imagenes: [],
      gravedad: 'alta',
      fuente: 'Base de datos local'
    },
    {
      id: 5,
      nombre: 'Antracnosis',
      nombreCientifico: 'Colletotrichum spp.',
      nombresComunes: ['Anthracnose'],
      tipo: 'hongo',
      descripcion: 'Enfermedad fúngica que causa lesiones necróticas en hojas, tallos y frutos de diversos cultivos.',
      sintomas: ['Manchas circulares hundidas en frutos', 'Lesiones oscuras en hojas', 'Pudrición de frutos maduros', 'Muerte de ramas'],
      tratamiento: 'Fungicidas a base de cobre o azufre. Poda de partes afectadas. Mejorar ventilación.',
      prevencion: ['Evitar humedad excesiva', 'Rotación de cultivos', 'Desinfección de herramientas', 'Variedades resistentes'],
      cultivos: ['Aguacate', 'Mango', 'Frijol', 'Tomate'],
      imagenes: [],
      gravedad: 'media',
      fuente: 'Base de datos local'
    }
  ];

  return {
    total: fallbackData.length,
    currentPage: 1,
    lastPage: 1,
    perPage: 30,
    data: fallbackData
  };
};

/**
 * Obtiene plaga de respaldo por ID
 */
const getFallbackPestById = (pestId) => {
  const fallbackData = getFallbackPests().data;
  return fallbackData.find(pest => pest.id === pestId) || fallbackData[0];
};

module.exports = {
  getPestDiseaseList,
  getPestDiseaseDetails,
  getPestsForCrop
};
