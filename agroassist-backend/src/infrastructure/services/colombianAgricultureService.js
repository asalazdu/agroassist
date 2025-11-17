/**
 * Servicio especializado para agricultura colombiana
 * Incluye cultivos, plagas, métodos de control y terminología en español
 */

class ColombianAgricultureService {
  constructor() {
    this.colombianCrops = this._initializeColombiaCrops();
    this.colombianPests = this._initializeColombianPests();
    this.colombianRegions = this._initializeRegions();
    this.controlMethods = this._initializeControlMethods();
  }

  /**
   * Cultivos principales de Colombia organizados por región
   */
  _initializeColombiaCrops() {
    return {
      // Cultivos nacionales prioritarios
      cafe: {
        nombre: 'Café',
        nombreCientifico: 'Coffea arabica',
        regiones: ['Antioquia', 'Caldas', 'Risaralda', 'Quindío', 'Valle del Cauca', 'Cauca', 'Nariño', 'Huila', 'Tolima'],
        plagas_principales: ['broca_del_cafe', 'roya_del_cafe', 'cochinilla', 'minador_de_hoja'],
        epoca_siembra: 'Todo el año (según región)',
        epoca_cosecha: 'Abril-Junio y Octubre-Diciembre'
      },
      platano: {
        nombre: 'Plátano',
        nombreCientifico: 'Musa paradisiaca',
        regiones: ['Antioquia', 'Córdoba', 'Magdalena', 'La Guajira', 'Quindío', 'Caldas'],
        plagas_principales: ['sigatoka_negra', 'picudo_negro', 'nematodos', 'trips'],
        epoca_siembra: 'Todo el año',
        epoca_cosecha: '9-12 meses después de siembra'
      },
      arroz: {
        nombre: 'Arroz',
        nombreCientifico: 'Oryza sativa',
        regiones: ['Tolima', 'Huila', 'Casanare', 'Meta', 'Córdoba', 'Sucre'],
        plagas_principales: ['sogata', 'chinche_vaneadora', 'gusano_cogollero', 'piricularia'],
        epoca_siembra: 'Marzo-Mayo y Agosto-Octubre',
        epoca_cosecha: '4-5 meses después de siembra'
      },
      maiz: {
        nombre: 'Maíz',
        nombreCientifico: 'Zea mays',
        regiones: ['Córdoba', 'Sucre', 'Cesar', 'Meta', 'Valle del Cauca', 'Tolima'],
        plagas_principales: ['gusano_cogollero', 'gusano_elotero', 'gallina_ciega', 'trips'],
        epoca_siembra: 'Marzo-Mayo y Agosto-Octubre',
        epoca_cosecha: '4-6 meses después de siembra'
      },
      cacao: {
        nombre: 'Cacao',
        nombreCientifico: 'Theobroma cacao',
        regiones: ['Santander', 'Arauca', 'Huila', 'Tolima', 'Antioquia', 'Nariño'],
        plagas_principales: ['monilia', 'escoba_de_bruja', 'mazorca_negra', 'chinche_de_cacao'],
        epoca_siembra: 'Inicio de lluvias',
        epoca_cosecha: 'Todo el año (picos en Mayo-Junio y Octubre-Noviembre)'
      },
      yuca: {
        nombre: 'Yuca',
        nombreCientifico: 'Manihot esculenta',
        regiones: ['Costa Atlántica', 'Llanos Orientales', 'Valle del Cauca', 'Cauca'],
        plagas_principales: ['mosca_blanca', 'acaro_verde', 'trips', 'gusano_cachon'],
        epoca_siembra: 'Inicio de lluvias',
        epoca_cosecha: '8-12 meses después de siembra'
      },
      papa: {
        nombre: 'Papa',
        nombreCientifico: 'Solanum tuberosum',
        regiones: ['Boyacá', 'Cundinamarca', 'Nariño', 'Antioquia', 'Norte de Santander'],
        plagas_principales: ['gota', 'polilla_guatemalteca', 'gusano_blanco', 'pulguilla'],
        epoca_siembra: 'Febrero-Abril y Agosto-Octubre',
        epoca_cosecha: '4-6 meses después de siembra'
      },
      frijol: {
        nombre: 'Fríjol',
        nombreCientifico: 'Phaseolus vulgaris',
        regiones: ['Antioquia', 'Huila', 'Tolima', 'Valle del Cauca', 'Nariño'],
        plagas_principales: ['lorito_verde', 'mosca_blanca', 'trips', 'antracnosis'],
        epoca_siembra: 'Marzo-Mayo y Agosto-Octubre',
        epoca_cosecha: '3-4 meses después de siembra'
      },
      cana_azucar: {
        nombre: 'Caña de Azúcar',
        nombreCientifico: 'Saccharum officinarum',
        regiones: ['Valle del Cauca', 'Cauca', 'Risaralda', 'Caldas'],
        plagas_principales: ['barrenador', 'salivazo', 'gusano_cabrito', 'roya_naranja'],
        epoca_siembra: 'Todo el año',
        epoca_cosecha: '12-18 meses después de siembra'
      },
      flores: {
        nombre: 'Flores de Exportación',
        nombreCientifico: 'Diversos',
        regiones: ['Cundinamarca', 'Antioquia', 'Boyacá'],
        plagas_principales: ['trips', 'acaros', 'mosca_blanca', 'pulgones'],
        epoca_siembra: 'Todo el año (invernadero)',
        epoca_cosecha: 'Todo el año'
      }
    };
  }

  /**
   * Plagas específicas de Colombia con información detallada
   */
  _initializeColombianPests() {
    return {
      broca_del_cafe: {
        nombre: 'Broca del Café',
        nombreCientifico: 'Hypothenemus hampei',
        descripcion: 'Pequeño escarabajo que perfora los granos de café',
        cultivos_afectados: ['cafe'],
        regiones_problematicas: ['Eje Cafetero', 'Huila', 'Nariño', 'Tolima'],
        danos: 'Pérdida de calidad del grano, reducción del peso, caída prematura',
        sintomas: 'Perforaciones en los frutos, presencia de adultos, polvillo en el suelo',
        epoca_critica: 'Durante formación y maduración del fruto',
        control_biologico: ['Beauveria bassiana', 'Cephalonomia stephanoderis'],
        control_cultural: ['Recolección oportuna', 'Repase', 'Manejo de arvenses'],
        control_quimico: ['Endosulfán (restringido)', 'Clorpirifós', 'Imidacloprid']
      },
      roya_del_cafe: {
        nombre: 'Roya del Café',
        nombreCientifico: 'Hemileia vastatrix',
        descripcion: 'Hongo que ataca las hojas del café causando defoliación',
        cultivos_afectados: ['cafe'],
        regiones_problematicas: ['Todas las zonas cafeteras'],
        danos: 'Defoliación severa, reducción de la producción, debilitamiento de la planta',
        sintomas: 'Manchas amarillas en el envés de las hojas, polvillo naranja',
        epoca_critica: 'Épocas lluviosas y alta humedad',
        control_biologico: ['Trichoderma spp.', 'Bacillus subtilis'],
        control_cultural: ['Poda sanitaria', 'Manejo de sombra', 'Nutrición balanceada'],
        control_quimico: ['Fungicidas cúpricos', 'Triazoles', 'Estrobilurinas']
      },
      sigatoka_negra: {
        nombre: 'Sigatoka Negra',
        nombreCientifico: 'Mycosphaerella fijiensis',
        descripcion: 'Enfermedad foliar más destructiva del plátano y banano',
        cultivos_afectados: ['platano', 'banano'],
        regiones_problematicas: ['Urabá', 'Magdalena', 'La Guajira'],
        danos: 'Reducción del área foliar, disminución del peso del racimo',
        sintomas: 'Rayas y manchas negras en las hojas, necrosis',
        epoca_critica: 'Todo el año en zonas húmedas',
        control_biologico: ['Trichoderma harzianum', 'Pseudomonas fluorescens'],
        control_cultural: ['Deshoje sanitario', 'Drenaje', 'Espaciamiento adecuado'],
        control_quimico: ['Mancozeb', 'Propiconazol', 'Azoxistrobina']
      },
      gusano_cogollero: {
        nombre: 'Gusano Cogollero',
        nombreCientifico: 'Spodoptera frugiperda',
        descripcion: 'Larva que ataca el cogollo de gramíneas',
        cultivos_afectados: ['maiz', 'arroz', 'sorgo'],
        regiones_problematicas: ['Costa Atlántica', 'Llanos Orientales'],
        danos: 'Destrucción del cogollo, perforaciones en hojas',
        sintomas: 'Presencia de larvas en el cogollo, excrementos, raspado de hojas',
        epoca_critica: 'Primeras semanas después de germinación',
        control_biologico: ['Trichogramma spp.', 'Bacillus thuringiensis'],
        control_cultural: ['Rotación de cultivos', 'Eliminación de malezas'],
        control_quimico: ['Clorpirifós', 'Lufenuron', 'Emamectina']
      },
      sogata: {
        nombre: 'Sogata',
        nombreCientifico: 'Tagosodes orizicolus',
        descripcion: 'Insecto que transmite el virus de la hoja blanca del arroz',
        cultivos_afectados: ['arroz'],
        regiones_problematicas: ['Tolima', 'Huila', 'Llanos Orientales'],
        danos: 'Transmisión del virus hoja blanca, amarillamiento',
        sintomas: 'Plantas amarillas, enanismo, muerte de plantas',
        epoca_critica: 'Primeros 45 días del cultivo',
        control_biologico: ['Hongos entomopatógenos'],
        control_cultural: ['Variedades resistentes', 'Fechas de siembra'],
        control_quimico: ['Thiamethoxam', 'Imidacloprid', 'Buprofezin']
      }
    };
  }

  /**
   * Regiones agrícolas de Colombia
   */
  _initializeRegions() {
    return {
      'Caribe': {
        departamentos: ['Atlántico', 'Bolívar', 'Cesar', 'Córdoba', 'La Guajira', 'Magdalena', 'Sucre'],
        cultivos_principales: ['maiz', 'arroz', 'yuca', 'platano'],
        clima: 'Tropical seco y húmedo',
        epoca_lluvias: 'Abril-Noviembre'
      },
      'Andina': {
        departamentos: ['Antioquia', 'Boyacá', 'Caldas', 'Cundinamarca', 'Huila', 'Norte de Santander', 'Quindío', 'Risaralda', 'Santander', 'Tolima'],
        cultivos_principales: ['cafe', 'papa', 'flores', 'frijol'],
        clima: 'Templado y frío',
        epoca_lluvias: 'Abril-Mayo y Octubre-Noviembre'
      },
      'Pacifica': {
        departamentos: ['Cauca', 'Chocó', 'Nariño', 'Valle del Cauca'],
        cultivos_principales: ['cacao', 'platano', 'cana_azucar'],
        clima: 'Tropical húmedo',
        epoca_lluvias: 'Abril-Noviembre'
      },
      'Orinoquia': {
        departamentos: ['Arauca', 'Casanare', 'Meta', 'Vichada'],
        cultivos_principales: ['arroz', 'maiz', 'soja'],
        clima: 'Tropical de sabana',
        epoca_lluvias: 'Abril-Octubre'
      },
      'Amazonia': {
        departamentos: ['Amazonas', 'Caquetá', 'Guainía', 'Guaviare', 'Putumayo', 'Vaupés'],
        cultivos_principales: ['cacao', 'platano', 'yuca'],
        clima: 'Tropical húmedo',
        epoca_lluvias: 'Todo el año'
      }
    };
  }

  /**
   * Métodos de control adaptados a productos disponibles en Colombia
   */
  _initializeControlMethods() {
    return {
      control_biologico: {
        productos_comerciales: [
          'Trichodex (Trichoderma)',
          'Beauveria WP',
          'Bacillus Bio',
          'Verticillium lecanii',
          'Metarhizium anisopliae'
        ],
        proveedores: ['Biocultivos', 'Laverlam', 'Agrobacter', 'Biotropical']
      },
      control_quimico: {
        insecticidas: [
          'Lorsban (Clorpirifós)',
          'Confidor (Imidacloprid)',
          'Karate (Lambda cyhalotrina)',
          'Proclaim (Emamectina)',
          'Match (Lufenuron)'
        ],
        fungicidas: [
          'Antracol (Propineb)',
          'Tilt (Propiconazol)',
          'Amistar (Azoxistrobina)',
          'Score (Difenoconazol)',
          'Ridomil (Metalaxil)'
        ]
      },
      control_cultural: [
        'Rotación con leguminosas',
        'Uso de variedades resistentes',
        'Manejo integrado de arvenses',
        'Época de siembra apropiada',
        'Distancias de siembra adecuadas',
        'Nutrición balanceada'
      ]
    };
  }

  /**
   * Traducir términos técnicos al español
   */
  translateToSpanish(englishTerm) {
    const translations = {
      'aphid': 'pulgón',
      'aphids': 'pulgones',
      'armyworm': 'gusano cogollero',
      'borer': 'barrenador',
      'thrips': 'trips',
      'whitefly': 'mosca blanca',
      'spider mite': 'ácaro araña',
      'beetle': 'escarabajo',
      'caterpillar': 'oruga',
      'moth': 'polilla',
      'rust': 'roya',
      'blight': 'tizón',
      'wilt': 'marchitez',
      'spot': 'mancha',
      'corn': 'maíz',
      'rice': 'arroz',
      'coffee': 'café',
      'banana': 'plátano',
      'potato': 'papa',
      'bean': 'fríjol',
      'tomato': 'tomate',
      'cotton': 'algodón',
      'sugarcane': 'caña de azúcar',
      'soybean': 'soja'
    };

    return translations[englishTerm.toLowerCase()] || englishTerm;
  }

  /**
   * Obtener información de cultivo colombiano
   */
  getCropInfo(cropName) {
    const normalizedName = this._normalizeCropName(cropName);
    return this.colombianCrops[normalizedName] || null;
  }

  /**
   * Obtener plagas por cultivo colombiano
   */
  getPestsByCrop(cropName) {
    const cropInfo = this.getCropInfo(cropName);
    if (!cropInfo) return [];

    return cropInfo.plagas_principales.map(pestKey => ({
      ...this.colombianPests[pestKey],
      key: pestKey
    })).filter(pest => pest.nombre);
  }

  /**
   * Obtener información detallada de plaga colombiana
   */
  getPestInfo(pestName) {
    const normalizedName = this._normalizePestName(pestName);
    return this.colombianPests[normalizedName] || null;
  }

  /**
   * Obtener recomendaciones de control en español
   */
  getControlRecommendations(pestKey, cropKey) {
    const pest = this.colombianPests[pestKey];
    const crop = this.colombianCrops[cropKey];

    if (!pest) return [];

    return {
      control_biologico: pest.control_biologico || [],
      control_cultural: pest.control_cultural || [],
      control_quimico: pest.control_quimico || [],
      productos_recomendados: this._getRecommendedProducts(pestKey),
      momento_aplicacion: this._getApplicationTiming(pestKey, cropKey)
    };
  }

  /**
   * Normalizar nombres de cultivos
   */
  _normalizeCropName(name) {
    const normalizations = {
      'coffee': 'cafe',
      'corn': 'maiz',
      'maize': 'maiz',
      'rice': 'arroz',
      'banana': 'platano',
      'plantain': 'platano',
      'potato': 'papa',
      'bean': 'frijol',
      'beans': 'frijol',
      'sugarcane': 'cana_azucar',
      'sugar cane': 'cana_azucar',
      'cacao': 'cacao',
      'cocoa': 'cacao',
      'cassava': 'yuca',
      'flowers': 'flores'
    };

    return normalizations[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Normalizar nombres de plagas
   */
  _normalizePestName(name) {
    const normalizations = {
      'coffee borer': 'broca_del_cafe',
      'coffee berry borer': 'broca_del_cafe',
      'coffee rust': 'roya_del_cafe',
      'armyworm': 'gusano_cogollero',
      'fall armyworm': 'gusano_cogollero',
      'black sigatoka': 'sigatoka_negra',
      'rice planthopper': 'sogata'
    };

    return normalizations[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Obtener productos recomendados para Colombia
   */
  _getRecommendedProducts(pestKey) {
    const productMap = {
      broca_del_cafe: ['Beauveria bassiana', 'Cephalonomia stephanoderis', 'Trampas con alcohol'],
      roya_del_cafe: ['Oxicloruro de cobre', 'Triazoles sistémicos', 'Trichoderma'],
      gusano_cogollero: ['Bacillus thuringiensis', 'Lufenuron', 'Trichogramma'],
      sogata: ['Thiamethoxam', 'Variedades resistentes'],
      sigatoka_negra: ['Mancozeb', 'Propiconazol', 'Deshoje sanitario']
    };

    return productMap[pestKey] || ['Consultar con técnico agrícola local'];
  }

  /**
   * Obtener momento de aplicación
   */
  _getApplicationTiming(pestKey, cropKey) {
    const timingMap = {
      broca_del_cafe: 'Durante floración y desarrollo del fruto',
      roya_del_cafe: 'Inicio de época lluviosa',
      gusano_cogollero: 'Primeras 3 semanas después de germinación',
      sogata: 'Primeros 45 días del cultivo',
      sigatoka_negra: 'Monitoreo semanal, aplicación preventiva'
    };

    return timingMap[pestKey] || 'Según monitoreo y umbral económico';
  }
}

module.exports = new ColombianAgricultureService();
