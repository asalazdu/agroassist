const axios = require('axios');

class PestService {
  constructor() {
    // Base de datos de plagas común por cultivo (puede expandirse)
    this.pestDatabase = {
      'maiz': {
        nombre_cultivo: 'Maíz',
        plagas_comunes: [
          {
            nombre: 'Gusano cogollero (Spodoptera frugiperda)',
            descripcion: 'Larva que ataca las hojas tiernas del maíz, causando perforaciones características',
            sintomas: ['Hojas con perforaciones', 'Presencia de excremento granular', 'Plantas debilitadas'],
            control: ['Control biológico con Trichogramma', 'Aplicación de Bt (Bacillus thuringiensis)', 'Rotación de cultivos'],
            periodo_critico: 'Primeras 6 semanas después de la siembra',
            nivel_dano: 'Alto'
          },
          {
            nombre: 'Pulgón del maíz (Rhopalosiphum maidis)',
            descripcion: 'Insecto pequeño que se alimenta de la savia de las plantas',
            sintomas: ['Hojas amarillentas', 'Melaza pegajosa', 'Crecimiento retardado'],
            control: ['Insecticidas sistémicos', 'Control biológico con mariquitas', 'Eliminación de malezas'],
            periodo_critico: 'Durante la floración',
            nivel_dano: 'Medio'
          },
          {
            nombre: 'Barrenador del tallo (Diatraea saccharalis)',
            descripcion: 'Larva que perfora y se alimenta del interior del tallo',
            sintomas: ['Perforaciones en el tallo', 'Plantas quebradizas', 'Mazorcas mal formadas'],
            control: ['Liberación de parasitoides', 'Eliminación de rastrojos', 'Variedades resistentes'],
            periodo_critico: 'Desde V6 hasta R3',
            nivel_dano: 'Alto'
          }
        ]
      },
      'tomate': {
        nombre_cultivo: 'Tomate',
        plagas_comunes: [
          {
            nombre: 'Mosca blanca (Bemisia tabaci)',
            descripcion: 'Insecto pequeño que transmite virus y debilita las plantas',
            sintomas: ['Hojas amarillentas', 'Presencia de melaza', 'Transmisión de virus'],
            control: ['Trampas amarillas', 'Insecticidas específicos', 'Control biológico con Encarsia'],
            periodo_critico: 'Todo el ciclo del cultivo',
            nivel_dano: 'Alto'
          },
          {
            nombre: 'Gusano del fruto (Helicoverpa armigera)',
            descripcion: 'Larva que ataca los frutos del tomate',
            sintomas: ['Perforaciones en frutos', 'Frutos dañados', 'Pérdidas en cosecha'],
            control: ['Feromonas para monitoreo', 'Insecticidas específicos', 'Eliminación de frutos dañados'],
            periodo_critico: 'Durante la fructificación',
            nivel_dano: 'Alto'
          },
          {
            nombre: 'Minador de la hoja (Liriomyza sativae)',
            descripcion: 'Larva que crea galerías en las hojas',
            sintomas: ['Galerías serpenteantes en hojas', 'Reducción de fotosíntesis', 'Hojas secas'],
            control: ['Insecticidas sistémicos', 'Control biológico con parasitoides', 'Eliminación de hojas afectadas'],
            periodo_critico: 'Etapa vegetativa',
            nivel_dano: 'Medio'
          }
        ]
      },
      'arroz': {
        nombre_cultivo: 'Arroz',
        plagas_comunes: [
          {
            nombre: 'Barrenador del tallo (Scirpophaga incertulas)',
            descripcion: 'Larva que perfora el tallo del arroz',
            sintomas: ['Tallos perforados', 'Corazón muerto', 'Panículas blancas'],
            control: ['Manejo del agua', 'Insecticidas granulados', 'Variedades resistentes'],
            periodo_critico: 'Macollamiento y embuchamiento',
            nivel_dano: 'Alto'
          },
          {
            nombre: 'Saltahojas verde (Nephotettix virescens)',
            descripcion: 'Insecto que transmite virus del arroz',
            sintomas: ['Hojas con rayas amarillas', 'Enanismo', 'Virus del tungro'],
            control: ['Insecticidas sistémicos', 'Eliminación de malezas', 'Variedades resistentes'],
            periodo_critico: 'Primeras semanas del cultivo',
            nivel_dano: 'Alto'
          }
        ]
      },
      'papa': {
        nombre_cultivo: 'Papa',
        plagas_comunes: [
          {
            nombre: 'Escarabajo de la papa (Leptinotarsa decemlineata)',
            descripcion: 'Escarabajo que se alimenta de las hojas de papa',
            sintomas: ['Defoliación severa', 'Presencia de larvas', 'Reducción del rendimiento'],
            control: ['Insecticidas específicos', 'Control manual', 'Rotación de cultivos'],
            periodo_critico: 'Crecimiento vegetativo',
            nivel_dano: 'Alto'
          },
          {
            nombre: 'Polilla de la papa (Phthorimaea operculella)',
            descripcion: 'Larva que ataca tubérculos y hojas',
            sintomas: ['Galerías en tubérculos', 'Hojas minadas', 'Tubérculos no comerciales'],
            control: ['Aporque adecuado', 'Cosecha oportuna', 'Almacenamiento adecuado'],
            periodo_critico: 'Tuberización y post-cosecha',
            nivel_dano: 'Alto'
          }
        ]
      },
      'soja': {
        nombre_cultivo: 'Soja',
        plagas_comunes: [
          {
            nombre: 'Oruga de las leguminosas (Anticarsia gemmatalis)',
            descripcion: 'Larva defoliadora de la soja',
            sintomas: ['Defoliación', 'Reducción del área foliar', 'Menor rendimiento'],
            control: ['Insecticidas específicos', 'Control biológico con virus', 'Monitoreo de poblaciones'],
            periodo_critico: 'Floración y llenado de vainas',
            nivel_dano: 'Medio'
          },
          {
            nombre: 'Chinche verde (Nezara viridula)',
            descripcion: 'Insecto que succiona savia de vainas y granos',
            sintomas: ['Vainas deformadas', 'Granos arrugados', 'Pérdida de calidad'],
            control: ['Insecticidas de contacto', 'Monitoreo con feromona', 'Manejo de bordes'],
            periodo_critico: 'Llenado de granos',
            nivel_dano: 'Alto'
          }
        ]
      }
    };
  }

  /**
   * Obtiene información sobre plagas para un cultivo específico
   * @param {string} cultivo - Nombre del cultivo
   * @returns {Object} - Información de plagas del cultivo
   */
  async getPestsByCrop(cultivo) {
    try {
      const cultivoNormalizado = cultivo.toLowerCase().trim();
      
      // Mapear nombres alternativos
      const cultivoMapping = {
        'corn': 'maiz',
        'maize': 'maiz',
        'tomato': 'tomate',
        'rice': 'arroz',
        'potato': 'papa',
        'patata': 'papa',
        'soybean': 'soja',
        'soy': 'soja'
      };

      const cultivoBuscado = cultivoMapping[cultivoNormalizado] || cultivoNormalizado;

      if (!this.pestDatabase[cultivoBuscado]) {
        // Si no existe en la base local, intentar buscar información general
        return this.getGeneralPestInfo(cultivo);
      }

      const pestInfo = this.pestDatabase[cultivoBuscado];
      
      return {
        exito: true,
        cultivo: pestInfo.nombre_cultivo,
        total_plagas: pestInfo.plagas_comunes.length,
        plagas: pestInfo.plagas_comunes,
        recomendaciones_generales: this.getGeneralRecommendations(),
        fuente: 'Base de datos interna AgroAssist',
        consultado_en: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Error al obtener información de plagas: ${error.message}`);
    }
  }

  /**
   * Obtiene información general cuando el cultivo no está en la base de datos
   * @param {string} cultivo - Nombre del cultivo
   * @returns {Object} - Información general de plagas
   */
  getGeneralPestInfo(cultivo) {
    return {
      exito: true,
      cultivo: cultivo,
      mensaje: `No se encontró información específica para el cultivo "${cultivo}"`,
      cultivos_disponibles: Object.keys(this.pestDatabase),
      plagas_generales: [
        {
          nombre: 'Pulgones (Aphididae)',
          descripcion: 'Insectos pequeños que se alimentan de savia',
          sintomas: ['Hojas enrolladas', 'Melaza pegajosa', 'Transmisión de virus'],
          control: ['Insecticidas sistémicos', 'Control biológico', 'Eliminación de malezas'],
          nivel_dano: 'Medio a Alto'
        },
        {
          nombre: 'Trips (Thysanoptera)',
          descripcion: 'Insectos pequeños que causan daño en hojas y flores',
          sintomas: ['Manchas plateadas en hojas', 'Deformación de hojas', 'Transmisión de virus'],
          control: ['Trampas azules', 'Insecticidas específicos', 'Control biológico'],
          nivel_dano: 'Medio'
        },
        {
          nombre: 'Ácaros (Tetranychidae)',
          descripcion: 'Arácnidos microscópicos que se alimentan de células vegetales',
          sintomas: ['Punteado amarillo en hojas', 'Telarañas finas', 'Hojas bronceadas'],
          control: ['Acaricidas específicos', 'Aumento de humedad', 'Control biológico'],
          nivel_dano: 'Medio'
        }
      ],
      recomendaciones_generales: this.getGeneralRecommendations(),
      fuente: 'Información general AgroAssist',
      consultado_en: new Date().toISOString()
    };
  }

  /**
   * Obtiene recomendaciones generales para el manejo de plagas
   * @returns {Array} - Lista de recomendaciones
   */
  getGeneralRecommendations() {
    return [
      'Realizar monitoreo regular del cultivo',
      'Implementar manejo integrado de plagas (MIP)',
      'Mantener la biodiversidad en el agroecosistema',
      'Usar variedades resistentes cuando estén disponibles',
      'Rotar cultivos para romper ciclos de plagas',
      'Eliminar restos de cosecha y malezas hospederas',
      'Aplicar tratamientos solo cuando sea necesario',
      'Llevar registros de aplicaciones y resultados',
      'Consultar con un ingeniero agrónomo para casos específicos'
    ];
  }

  /**
   * Busca plagas por síntomas
   * @param {Array} sintomas - Lista de síntomas observados
   * @returns {Array} - Posibles plagas que causan esos síntomas
   */
  async getPestsBySymptoms(sintomas) {
    try {
      const sintomasNormalizados = sintomas.map(s => s.toLowerCase().trim());
      const posiblesPlagas = [];

      // Buscar en toda la base de datos
      Object.keys(this.pestDatabase).forEach(cultivo => {
        this.pestDatabase[cultivo].plagas_comunes.forEach(plaga => {
          const coincidencias = plaga.sintomas.filter(sintoma => 
            sintomasNormalizados.some(s => sintoma.toLowerCase().includes(s) || s.includes(sintoma.toLowerCase()))
          );

          if (coincidencias.length > 0) {
            posiblesPlagas.push({
              ...plaga,
              cultivo: this.pestDatabase[cultivo].nombre_cultivo,
              coincidencias: coincidencias,
              nivel_coincidencia: (coincidencias.length / plaga.sintomas.length) * 100
            });
          }
        });
      });

      // Ordenar por nivel de coincidencia
      posiblesPlagas.sort((a, b) => b.nivel_coincidencia - a.nivel_coincidencia);

      return {
        exito: true,
        sintomas_buscados: sintomas,
        posibles_plagas: posiblesPlagas.slice(0, 5), // Top 5 coincidencias
        total_encontradas: posiblesPlagas.length,
        consultado_en: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Error al buscar plagas por síntomas: ${error.message}`);
    }
  }

  /**
   * Obtiene lista de todos los cultivos disponibles
   * @returns {Array} - Lista de cultivos disponibles
   */
  getAvailableCrops() {
    return Object.keys(this.pestDatabase).map(key => ({
      codigo: key,
      nombre: this.pestDatabase[key].nombre_cultivo,
      total_plagas: this.pestDatabase[key].plagas_comunes.length
    }));
  }
}

module.exports = new PestService();
