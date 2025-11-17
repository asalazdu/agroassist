const OpenAI = require('openai');
const weatherService = require('./weatherService');
const pestService = require('./pestService');

class ChatbotService {
  constructor() {
    // Inicializar OpenAI (requerirá OPENAI_API_KEY en .env)
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;

    // Base de conocimiento agrícola colombiana optimizada
    this.knowledgeBase = {
      cultivos: [
        {
          cultivo: "Café (arábica)",
          epoca_siembra: "Preferir inicio de lluvias. Regiones bimodales (Andina centro): marzo–mayo y septiembre–noviembre. Regiones unimodales: abril–julio.",
          clima_ideal: {
            temperatura_C: { min: 18, max: 24 },
            humedad_relativa_pct: { min: 60, max: 85 },
            altitud_msnm: { min: 1200, max: 2000 },
            precipitacion_mm_anual: { min: 1200, max: 2500 },
            pH_suelo: { min: 5.0, max: 6.0 }
          },
          ciclo_cultivo: {
            tipo: "perenne",
            establecimiento_a_primera_cosecha_dias: { min: 540, max: 720 },
            intervalo_entre_cosechas_dias: { min: 180, max: 365 }
          },
          cuidados_principales: [
            "Usar sombra moderada y controlarla con podas.",
            "Manejo integrado de malezas y cobertura/mulch para conservar humedad.",
            "Monitoreo de broca y roya con trampas y alertas; podas sanitarias.",
            "Fertilización fraccionada según análisis de suelo y etapa fenológica."
          ],
          plagas_enfermedades: [
            "Broca del café (Hypothenemus hampei)",
            "Roya (Hemileia vastatrix)",
            "Ojo de gallo/Mancha de Cercospora (Cercospora coffeicola)"
          ],
          fertilizacion: {
            macro_NPK_kg_ha: { N: { min: 200, max: 300 }, P2O5: { min: 80, max: 120 }, K2O: { min: 200, max: 300 } },
            micros_sugeridos: ["Boro (B)", "Zinc (Zn)", "Magnesio (Mg)", "Azufre (S)"],
            observaciones: "Aplicar en 3–4 fracciones/año; complementar con Ca vía cal agrícola/yeso según saturación de bases."
          }
        },
        {
          cultivo: "Plátano",
          epoca_siembra: "Inicio de época lluviosa en cada zona. Caribe: abril–junio y septiembre–octubre; Andina baja/Pacífico: según primer pico de lluvias local.",
          clima_ideal: {
            temperatura_C: { min: 24, max: 30 },
            humedad_relativa_pct: { min: 70, max: 95 },
            altitud_msnm: { min: 0, max: 1200 },
            precipitacion_mm_anual: { min: 1500, max: 3000 },
            pH_suelo: { min: 5.5, max: 7.0 }
          },
          ciclo_cultivo: {
            tipo: "perenne",
            establecimiento_a_primera_cosecha_dias: { min: 300, max: 450 },
            intervalo_entre_cosechas_dias: { min: 210, max: 300 }
          },
          cuidados_principales: [
            "Buen drenaje; evitar encharcamientos (camellones/zanjillas).",
            "Deshoje y deshije oportunos; tutorado en racimos pesados.",
            "Monitoreo de Sigatoka y nemátodos; manejo integrado.",
            "Fertilización y riego suplementario en veranillos."
          ],
          plagas_enfermedades: [
            "Sigatoka negra (Mycosphaerella fijiensis)",
            "Moko/rastrero del banano (Ralstonia solanacearum R2)",
            "Picudo negro (Cosmopolites sordidus)"
          ],
          fertilizacion: {
            macro_NPK_kg_ha: { N: { min: 300, max: 400 }, P2O5: { min: 100, max: 200 }, K2O: { min: 600, max: 800 } },
            micros_sugeridos: ["Boro (B)", "Zinc (Zn)", "Magnesio (Mg)"],
            observaciones: "Fraccionar mensual/trimestral; K es clave para llenado de fruto; ajustar con análisis de suelo/hoja."
          }
        },
        {
          cultivo: "Cacao",
          epoca_siembra: "Al inicio de lluvias para asegurar establecimiento. Caribe húmedo: abril–junio; Andén/Pacífico: según primer pico lluvioso.",
          clima_ideal: {
            temperatura_C: { min: 22, max: 28 },
            humedad_relativa_pct: { min: 70, max: 90 },
            altitud_msnm: { min: 0, max: 1000 },
            precipitacion_mm_anual: { min: 1500, max: 2500 },
            pH_suelo: { min: 5.0, max: 6.5 }
          },
          ciclo_cultivo: {
            tipo: "perenne",
            establecimiento_a_primera_cosecha_dias: { min: 720, max: 1080 },
            intervalo_entre_cosechas_dias: { min: 180, max: 365 }
          },
          cuidados_principales: [
            "Sombra regulada (30–50%) y podas de formación/sanitarias.",
            "Manejo de drenaje superficial y cobertura viva/muerta.",
            "Monitoreo y manejo de moniliasis/escoba con podas y recolección sanitaria.",
            "Fertilización balanceada y control de hormigas cortadoras."
          ],
          plagas_enfermedades: [
            "Moniliasis (Moniliophthora roreri)",
            "Escoba de bruja (Moniliophthora perniciosa)",
            "Mazorca negra/Phytophthora (Phytophthora spp.)"
          ],
          fertilizacion: {
            macro_NPK_kg_ha: { N: { min: 100, max: 150 }, P2O5: { min: 60, max: 100 }, K2O: { min: 150, max: 200 } },
            micros_sugeridos: ["Boro (B)", "Zinc (Zn)"],
            observaciones: "Aplicar 2–3 veces/año; incorporar materia orgánica y cal/yeso según saturación de Ca/Mg."
          }
        },
        {
          cultivo: "Aguacate (Hass)",
          epoca_siembra: "Preferir transición seca→lluviosa para buen prendimiento. Andina: marzo–mayo o septiembre–noviembre según localidad.",
          clima_ideal: {
            temperatura_C: { min: 16, max: 24 },
            humedad_relativa_pct: { min: 60, max: 80 },
            altitud_msnm: { min: 1500, max: 2400 },
            precipitacion_mm_anual: { min: 1000, max: 1800 },
            pH_suelo: { min: 5.5, max: 6.5 }
          },
          ciclo_cultivo: {
            tipo: "perenne",
            establecimiento_a_primera_cosecha_dias: { min: 720, max: 1080 },
            intervalo_entre_cosechas_dias: { min: 240, max: 420 }
          },
          cuidados_principales: [
            "Drenaje excelente; evitar Phytophthora con camellones y riegos controlados.",
            "Podas de formación y ventilación; manejo de alternancia.",
            "Monitoreo de antracnosis y chinches/Trips; cosecha en madurez fisiológica.",
            "Fertilización fraccionada con énfasis en Ca, B y K para cuajado/calidad."
          ],
          plagas_enfermedades: [
            "Phytophthora de raíz/cuello (P. cinnamomi)",
            "Antracnosis (Colletotrichum spp.)",
            "Chinche Monalonion/Trips (Thysanoptera spp.)"
          ],
          fertilizacion: {
            macro_NPK_kg_ha: { N: { min: 150, max: 250 }, P2O5: { min: 60, max: 120 }, K2O: { min: 150, max: 300 } },
            micros_sugeridos: ["Boro (B)", "Zinc (Zn)", "Calcio (Ca)"],
            observaciones: "Dividir en 3–5 aplicaciones; Ca y B son críticos para floración/cuajado; usar yeso en suelos ácidos."
          }
        },
        {
          cultivo: "Arroz (riego o secano favorecido)",
          epoca_siembra: "Alineada con lluvias y disponibilidad de riego. Llanos: abril–junio y agosto–septiembre; Caribe: marzo–mayo y septiembre–octubre.",
          clima_ideal: {
            temperatura_C: { min: 22, max: 32 },
            humedad_relativa_pct: { min: 60, max: 85 },
            altitud_msnm: { min: 0, max: 1200 },
            precipitacion_mm_anual: { min: 1000, max: 1800 },
            pH_suelo: { min: 5.0, max: 7.0 }
          },
          ciclo_cultivo: {
            tipo: "anual",
            siembra_a_cosecha_dias: { min: 110, max: 150 }
          },
          cuidados_principales: [
            "Nivelación fina y lámina de agua adecuada según fase.",
            "Control oportuno de malezas (pre y postemergentes) según ventana crítica.",
            "Manejo de nitrógeno por etapas (perfilaje/embuche) y monitoreo de acame.",
            "Vigilancia de sogata y enfermedades con MIP y variedades tolerantes."
          ],
          plagas_enfermedades: [
            "Piricularia/quemazón (Pyricularia oryzae)",
            "Sogata (Tagosodes orizicolus)",
            "Añublo bacteriano/Tizón bacteriano (Xanthomonas oryzae pv. oryzae)"
          ],
          fertilizacion: {
            macro_NPK_kg_ha: { N: { min: 80, max: 120 }, P2O5: { min: 40, max: 60 }, K2O: { min: 40, max: 80 } },
            micros_sugeridos: ["Zinc (Zn)", "Azufre (S)"],
            observaciones: "Fraccionar N (ej. 30–40% siembra, 30–40% macollamiento, 20–30% embuche); ajustar a rendimiento meta y análisis de suelo."
          }
        }
      ],
      recomendaciones_clima: [
        {
          condicion: "Lluvia fuerte (>50mm/día)",
          acciones_inmediatas: [
            "Revisar drenajes, canales y zanjas para evitar encharcamientos.",
            "Suspender aplicaciones foliares y fertilización para evitar lavado de nutrientes.",
            "Proteger semilleros y plántulas jóvenes con coberturas o plásticos temporales.",
            "Evitar ingreso de maquinaria pesada para prevenir compactación del suelo."
          ],
          acciones_preventivas: [
            "Instalar drenajes permanentes o zanjas de infiltración en lotes propensos a inundarse.",
            "Aplicar materia orgánica o mulch para mejorar estructura y drenaje del suelo.",
            "Planificar siembras evitando los picos de lluvias intensas según la región.",
            "Verificar estabilidad de laderas o taludes en zonas montañosas."
          ],
          cultivos_afectados: ["Plátano", "Yuca", "Hortalizas", "Arroz de secano"]
        },
        {
          condicion: "Sequía (sin lluvia >15 días)",
          acciones_inmediatas: [
            "Implementar riego por goteo o microaspersión para reducir consumo de agua.",
            "Cubrir el suelo con mulch o residuos vegetales para conservar humedad.",
            "Reducir labores de poda o fertilización nitrogenada para evitar estrés adicional.",
            "Revisar fuentes de agua y priorizar cultivos más sensibles."
          ],
          acciones_preventivas: [
            "Instalar reservorios o sistemas de captación de agua lluvia.",
            "Elegir variedades tolerantes a sequía o de ciclo corto.",
            "Promover cobertura vegetal permanente o siembra de abonos verdes.",
            "Programar la siembra al inicio de la temporada lluviosa."
          ],
          cultivos_afectados: ["Maíz", "Fríjol", "Hortalizas", "Pastos"]
        },
        {
          condicion: "Vientos fuertes (>40 km/h)",
          acciones_inmediatas: [
            "Asegurar tutores o estacas en cultivos de tallo alto como plátano y tomate.",
            "Cubrir invernaderos o estructuras con lonas reforzadas o mallas rompe-viento.",
            "Evitar aplicaciones de productos foliares o pesticidas durante el evento.",
            "Revisar árboles o ramas que puedan caer sobre los cultivos."
          ],
          acciones_preventivas: [
            "Establecer barreras vivas o cortinas rompevientos (p. ej. leucaena, matarratón).",
            "Usar marcos de siembra más densos en zonas ventosas.",
            "Evitar podas excesivas que debiliten la estructura del cultivo.",
            "Instalar soportes permanentes en cultivos de porte alto."
          ],
          cultivos_afectados: ["Plátano", "Tomate", "Maíz", "Flores"]
        },
        {
          condicion: "Temperaturas altas (>35°C)",
          acciones_inmediatas: [
            "Aumentar la frecuencia de riego, preferiblemente en horas frescas (mañana/tarde).",
            "Aplicar acolchados o coberturas para reducir evaporación.",
            "Proveer sombra parcial (50–70%) en viveros y cultivos sensibles.",
            "Evitar labores fuertes o aplicaciones foliares en horas de mayor radiación."
          ],
          acciones_preventivas: [
            "Seleccionar variedades resistentes al calor y estrés hídrico.",
            "Implementar sistemas agroforestales o sombríos naturales.",
            "Monitorear temperatura del suelo y usar cobertura orgánica.",
            "Optimizar ventilación en invernaderos o túneles plásticos."
          ],
          cultivos_afectados: ["Café joven", "Lechuga", "Fresas", "Tomate"]
        },
        {
          condicion: "Heladas o temperaturas bajas (<5°C)",
          acciones_inmediatas: [
            "Regar ligeramente antes del amanecer para evitar daño por congelación.",
            "Cubrir plantas jóvenes con plásticos o telas antiheladas.",
            "Evitar podas o fertilización nitrogenada justo antes de la helada.",
            "Monitorear pronósticos para actuar con anticipación."
          ],
          acciones_preventivas: [
            "Establecer cortinas rompevientos o barreras naturales.",
            "Usar variedades o portainjertos tolerantes al frío.",
            "Programar siembras fuera de los meses con riesgo de heladas (ej. junio–agosto en altiplano).",
            "Aplicar bioestimulantes o aminoácidos antes de periodos fríos prolongados."
          ],
          cultivos_afectados: ["Papa", "Hortalizas de hoja", "Aguacate Hass", "Fresas"]
        },
        {
          condicion: "Alta humedad (>85%)",
          acciones_inmediatas: [
            "Suspender riegos y mejorar ventilación en invernaderos o túneles.",
            "Aplicar fungicidas preventivos o biocontroladores contra hongos.",
            "Evitar labores que lastimen plantas para prevenir infecciones.",
            "Eliminar hojas o frutos enfermos para reducir inóculo."
          ],
          acciones_preventivas: [
            "Mejorar drenaje y espaciamiento entre plantas para reducir condensación.",
            "Mantener podas sanitarias y ventilación adecuada.",
            "Usar variedades resistentes a hongos y bacterias.",
            "Monitorear diariamente síntomas de enfermedades foliares."
          ],
          cultivos_afectados: ["Tomate", "Cacao", "Café", "Hortalizas de hoja"]
        }
      ],
      ejemplos_conversaciones: [
        {
          titulo: "Época de siembra (café)",
          usuario: "¿Cuándo es mejor sembrar café en el Huila?",
          bot: "En el Huila, la siembra de café se recomienda al inicio de las lluvias, entre marzo y mayo o entre septiembre y noviembre, dependiendo del régimen bimodal de tu zona. Esto asegura buena humedad para el establecimiento de las plántulas.\n\nPrepara bien el terreno, aplica materia orgánica y verifica que las plantas tengan media sombra al principio. Evita sembrar en pleno verano, ya que el estrés hídrico puede afectar el prendimiento y crecimiento inicial."
        },
        {
          titulo: "Problema de plaga (plátano)",
          usuario: "Mis hojas de plátano se están manchando de negro, ¿qué puede ser?",
          bot: "Podría tratarse de **Sigatoka negra**, una enfermedad causada por un hongo que prospera con alta humedad. Retira las hojas muy afectadas, evita el exceso de sombra y mejora la ventilación.\n\nAplica fungicidas sistémicos o biocontroladores alternándolos para evitar resistencia, y realiza deshojes cada 15–20 días. También ayuda fertilizar bien con potasio para fortalecer la planta."
        },
        {
          titulo: "Consulta de clima (cacao)",
          usuario: "AgroBot, viene mucha lluvia esta semana, ¿qué hago con mi cacao?",
          bot: "Si se pronostican lluvias intensas, suspende las aplicaciones foliares y revisa los drenajes para evitar encharcamientos. Mantén la sombra regulada y recoge frutos enfermos para prevenir moniliasis.\n\nDespués de la lluvia, aplica un fungicida preventivo o caldo bordelés, y revisa el nivel de compactación del suelo. Así proteges tus raíces y evitas pérdidas por exceso de agua."
        },
        {
          titulo: "Fertilización (maíz)",
          usuario: "¿Qué fertilizante me recomienda para maíz en los Llanos?",
          bot: "En los Llanos Orientales, el maíz responde bien a una fórmula rica en nitrógeno y fósforo. Aplica entre 100–150 kg N/ha, 60 kg P₂O₅/ha y 60–80 kg K₂O/ha, ajustando con análisis de suelo.\n\nDivide el nitrógeno en dos: una parte al momento de la siembra y otra al macollamiento. Complementa con zinc si el suelo es ácido, y mantén cobertura vegetal para conservar humedad."
        },
        {
          titulo: "Control de plaga (café)",
          usuario: "Tengo broca en mi cafetal, ¿cómo la controlo sin tanto químico?",
          bot: "Lo mejor es un **manejo integrado**. Cosecha todos los frutos maduros y remanentes para cortar el ciclo de la plaga. Usa trampas con alcohol metílico para monitoreo y aplica **Beauveria bassiana**, un hongo entomopatógeno natural.\n\nMantén el cafetal limpio y con sombra moderada. Si el nivel de infestación supera el 5%, complementa con control químico autorizado por el ICA."
        },
        {
          titulo: "Recomendación de riego (hortalizas)",
          usuario: "Hace quince días no llueve, ¿cuánto debo regar mis lechugas?",
          bot: "Si llevas más de dos semanas sin lluvia, aplica riegos cortos y frecuentes (una o dos veces al día) para mantener la humedad sin encharcar. El riego por aspersión o goteo es ideal.\n\nCubre el suelo con mulch para conservar la humedad y evitar cambios bruscos de temperatura. También puedes aplicar bioestimulantes para reducir el estrés por sequía."
        },
        {
          titulo: "Daños por frío (aguacate)",
          usuario: "Mis aguacates amanecieron con hojas quemadas por el frío, ¿qué hago?",
          bot: "Es probable que hayan sufrido **daño por helada**. Riega temprano en la mañana para elevar la temperatura del suelo y ayudar a la recuperación. Evita podar inmediatamente.\n\nDurante los próximos días, aplica aminoácidos o extractos de algas para estimular la regeneración. Si estás en zona de heladas frecuentes, instala cortinas rompevientos y usa coberturas temporales."
        },
        {
          titulo: "Cosecha (arroz)",
          usuario: "¿Cómo sé si mi arroz ya está listo para cosechar?",
          bot: "El arroz está listo cuando el 85–90% de las espigas tienen granos duros y amarillos, y el tallo empieza a secarse. Si el grano al morderlo ya no deja marca, está en punto óptimo.\n\nEvita cosechar con humedad alta en el grano (>22%), ya que aumenta el riesgo de hongos. Si usas cosechadora, ajusta la velocidad del ventilador para minimizar pérdidas."
        },
        {
          titulo: "Humedad alta (tomate)",
          usuario: "Está haciendo mucha humedad en mi invernadero, ¿qué puedo hacer?",
          bot: "Abre ventilas o laterales para mejorar la circulación del aire. Suspende riegos por uno o dos días y evita aplicar productos foliares.\n\nAplica un fungicida preventivo contra **Botrytis** o **mildiu**, y retira hojas o frutos enfermos. Mantén un distanciamiento adecuado y desinfecta las herramientas con frecuencia."
        },
        {
          titulo: "Consulta general (cacao)",
          usuario: "Mis mazorcas de cacao se están pudriendo, ¿qué puedo hacer?",
          bot: "Probablemente tengas **moniliasis** o **mazorca negra**. Retira todas las mazorcas afectadas y entiérralas o destrúyelas fuera del cultivo. No las dejes en el suelo.\n\nPodar ramas bajas para mejorar la ventilación y aplicar fungicidas de contacto o biológicos en los brotes nuevos ayuda mucho. Mantén el control de sombra y fertiliza con potasio para fortalecer el árbol."
        }
      ],
      respuestas_emergencia: [
        {
          emergencia: "Plaga repentina en cultivo",
          diagnostico_rapido: "Presencia súbita de insectos, mordeduras, agujeros en hojas o frutos, residuos de baba o excremento, y daño foliar visible. Revisión con lupa o sacudida de hojas para identificar tipo de plaga.",
          accion_inmediata: [
            "Aislar el área afectada para evitar propagación.",
            "Identificar el tipo de plaga (masticadora, chupadora o minadora).",
            "Aplicar biocontroladores inmediatos (ej. extracto de neem o jabón potásico)."
          ],
          tratamiento: [
            "Monitorear diariamente con trampas amarillas o feromonales.",
            "Aplicar control biológico específico (Beauveria bassiana o Metarhizium anisopliae).",
            "Si el daño supera el 10–15%, usar insecticidas selectivos aprobados por el ICA."
          ],
          prevencion: [
            "Rotar cultivos y mantener limpieza de malezas.",
            "Fomentar enemigos naturales y evitar abuso de químicos.",
            "Revisar semanalmente el cultivo para detección temprana."
          ]
        },
        {
          emergencia: "Inundación del terreno",
          diagnostico_rapido: "Presencia de charcos persistentes, raíces asfixiadas, hojas amarillas o caída de plantas en zonas bajas.",
          accion_inmediata: [
            "Abrir canales de drenaje o zanjas para evacuar el exceso de agua.",
            "Suspender riegos y evitar el tránsito de maquinaria.",
            "Aplicar microorganismos benéficos o bioestimulantes radiculares para recuperación."
          ],
          tratamiento: [
            "Airear el suelo una vez drenado para mejorar oxigenación.",
            "Aplicar enmiendas orgánicas o yeso agrícola para restaurar estructura.",
            "Monitorear posibles enfermedades por hongos como Phytophthora o Pythium."
          ],
          prevencion: [
            "Construir drenajes permanentes o camellones elevados.",
            "Evitar siembras en zonas propensas a encharcamiento.",
            "Usar variedades tolerantes a humedad o con raíces profundas."
          ]
        },
        {
          emergencia: "Enfermedad fungal visible",
          diagnostico_rapido: "Manchas circulares, polvillo blanco o gris, moho o necrosis en hojas y tallos. Alta humedad ambiental favorece su desarrollo.",
          accion_inmediata: [
            "Retirar hojas o frutos infectados y destruirlos lejos del cultivo.",
            "Suspender riegos por aspersión.",
            "Aplicar fungicida de contacto o biocontrolador (Trichoderma spp., Bacillus subtilis)."
          ],
          tratamiento: [
            "Aplicar fungicidas sistémicos rotando principios activos.",
            "Aumentar la ventilación mediante podas o distanciamiento adecuado.",
            "Monitorear la humedad relativa y ajustar frecuencia de riego."
          ],
          prevencion: [
            "Usar semillas certificadas y desinfectadas.",
            "Evitar exceso de nitrógeno.",
            "Implementar rotación de cultivos y manejo integrado de humedad."
          ]
        },
        {
          emergencia: "Marchitamiento de plantas",
          diagnostico_rapido: "Plantas decaídas con hojas caídas o amarillentas. Revisar raíces para detectar podredumbre o presencia de insectos.",
          accion_inmediata: [
            "Verificar si hay exceso o falta de agua y ajustar riego.",
            "Eliminar plantas severamente afectadas si hay signos de patógenos.",
            "Aplicar bioestimulantes o extractos de algas para recuperación."
          ],
          tratamiento: [
            "Desinfectar el suelo o aplicar Trichoderma si hay hongos.",
            "Mejorar drenaje y aireación del suelo.",
            "Analizar pH y conductividad eléctrica del suelo para descartar toxicidad."
          ],
          prevencion: [
            "Evitar riegos pesados o suelos compactados.",
            "Usar variedades resistentes a Fusarium o Ralstonia.",
            "Rotar cultivos y mantener buena fertilidad orgánica."
          ]
        },
        {
          emergencia: "Problema con fertilización (sobre-fertilizado)",
          diagnostico_rapido: "Hojas quemadas o secas en los bordes, marchitamiento, alta conductividad eléctrica del suelo (>2 dS/m).",
          accion_inmediata: [
            "Realizar lavado del suelo con riego abundante para diluir sales.",
            "Suspender cualquier fertilización adicional.",
            "Evaluar pH y EC del suelo si es posible."
          ],
          tratamiento: [
            "Aplicar materia orgánica o compost para absorber el exceso de sales.",
            "Usar bioestimulantes o ácidos húmicos para recuperar raíces.",
            "Reanudar fertilización ligera solo tras 7–10 días y análisis previo."
          ],
          prevencion: [
            "Dividir las aplicaciones de fertilizante en dosis pequeñas y frecuentes.",
            "Realizar análisis de suelo y agua antes de cada ciclo.",
            "Usar fertilizantes balanceados y evitar sobredosificación nitrogenada."
          ]
        }
      ]
    };

    // Prompts del sistema para diferentes tipos de consulta
    this.systemPrompts = {
      general: `Eres AgroBot, un asistente agrícola inteligente especializado en los cultivos y condiciones de Colombia. Tu objetivo es apoyar a agricultores, técnicos y productores con información práctica, confiable y contextualizada.

Tu conocimiento abarca los principales cultivos colombianos (como café, arroz, maíz, cacao, banano, palma de aceite, papa, caña, hortalizas y frutales tropicales), las regiones agroclimáticas del país y las plagas y enfermedades más comunes. Utiliza lenguaje técnico pero claro, evitando jerga innecesaria.

Muestra empatía hacia el agricultor: reconoce sus desafíos, valida sus esfuerzos y ofrece soluciones realistas y sostenibles. Prioriza prácticas de manejo integrado, agricultura sostenible y adaptación al cambio climático.

Organiza tus respuestas siempre con esta estructura:

1. **Diagnóstico o contexto**: Explica brevemente la situación o el problema.
2. **Causas o factores**: Señala las posibles causas técnicas o ambientales.
3. **Recomendaciones prácticas**: Propón soluciones claras y aplicables, diferenciando entre corto y mediano plazo.
4. **Advertencias o notas**: Incluye precauciones, referencias climáticas o recordatorios sobre asesoría técnica local.

Cuando uses datos meteorológicos, plagas o cultivos, contextualiza siempre con el clima y las regiones agrícolas de Colombia.`,
      
      clima: `Analiza la información meteorológica proporcionada y genera recomendaciones agrícolas específicas para las condiciones climáticas de Colombia.

Considera: temperaturas, precipitación, humedad, viento y radiación solar. Relaciona estos factores con los cultivos específicos del usuario.

Estructura tu respuesta:
1. **Análisis del clima actual**: Resume las condiciones y su impacto en la agricultura.
2. **Cultivos más afectados**: Identifica qué cultivos están en mayor riesgo o beneficio.
3. **Acciones inmediatas**: Qué hacer hoy o en las próximas 24-48 horas.
4. **Medidas preventivas**: Preparación para los próximos días según el pronóstico.`,
      
      plagas: `Analiza los síntomas descritos o la imagen proporcionada para diagnosticar plagas o enfermedades comunes en cultivos colombianos.

Estructura tu respuesta:
1. **Diagnóstico probable**: Identifica la plaga o enfermedad más probable (nombre común y científico).
2. **Síntomas característicos**: Describe los signos típicos para confirmar el diagnóstico.
3. **Control integrado**: Propón métodos de manejo (biológico, cultural, químico) priorizando alternativas sostenibles.
4. **Prevención**: Medidas para evitar futuras infestaciones o reinfecciones.

Menciona productos o prácticas específicas disponibles en Colombia. Si el problema es grave, recomienda consultar un agrónomo certificado.`,
      
      cultivo: `Proporciona una guía completa y contextualizada para el cultivo solicitado, considerando las condiciones agroclimáticas de Colombia.

Estructura tu respuesta:
1. **Características del cultivo**: Variedades recomendadas, regiones aptas, altitud y clima ideal.
2. **Preparación y siembra**: Época de siembra, preparación del suelo, distancias de siembra, densidad.
3. **Manejo del cultivo**: Riego, fertilización, control de malezas, poda (si aplica).
4. **Plagas y enfermedades**: Problemas más comunes y su manejo preventivo.
5. **Cosecha y postcosecha**: Momento óptimo de cosecha, rendimientos esperados, almacenamiento.

Diferencia entre prácticas para pequeños productores y agricultura comercial cuando sea relevante.`
    };
  }

  /**
   * Procesa un mensaje del usuario y genera respuesta inteligente
   * @param {string} message - Mensaje del usuario
   * @param {Object} context - Contexto adicional (ubicación, historial, etc.)
   * @param {Object} user - Información del usuario
   * @returns {Promise<Object>} - Respuesta del chatbot
   */
  async processMessage(message, context = {}, user = {}) {
    try {
      // Determinar tipo de consulta
      const queryType = this.detectQueryType(message);
      
      // Obtener datos relevantes según el tipo de consulta
      const relevantData = await this.gatherRelevantData(message, queryType, context);
      
      // Generar respuesta
      let response;
      if (this.openai) {
        response = await this.generateAIResponse(message, queryType, relevantData, user);
      } else {
        response = await this.generateRuleBasedResponse(message, queryType, relevantData, user);
      }

      // Agregar sugerencias de acciones
      response.suggestions = this.generateSuggestions(queryType, relevantData);
      
      // Guardar en historial
      await this.saveConversation(user.id, message, response);

      return {
        success: true,
        response: response,
        type: queryType,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error en chatbot:', error);
      return {
        success: false,
        response: {
          text: "Lo siento, tuve un problema procesando tu consulta. ¿Podrías intentar de nuevo? 🤖",
          type: 'error'
        },
        error: error.message
      };
    }
  }

  /**
   * Detecta el tipo de consulta del usuario
   * @param {string} message - Mensaje del usuario
   * @returns {string} - Tipo de consulta
   */
  detectQueryType(message) {
    const msg = message.toLowerCase();
    
    // Palabras clave para cada tipo
    const keywords = {
      clima: ['clima', 'tiempo', 'temperatura', 'lluvia', 'pronóstico', 'helada', 'viento', 'sequia'],
      plagas: ['plaga', 'enfermedad', 'hoja', 'amarilla', 'manchas', 'insecto', 'gusano', 'hongo'],
      cultivo: ['sembrar', 'plantar', 'cultivar', 'cosecha', 'siembra', 'maíz', 'tomate', 'arroz', 'papa', 'soja'],
      calendario: ['cuándo', 'época', 'momento', 'fecha', 'mes', 'calendario'],
      general: ['hola', 'ayuda', 'consejos', 'recomendación']
    };

    // Contar coincidencias por categoría
    let maxScore = 0;
    let detectedType = 'general';

    Object.keys(keywords).forEach(type => {
      const score = keywords[type].reduce((count, keyword) => {
        return count + (msg.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedType = type;
      }
    });

    return detectedType;
  }

  /**
   * Recopila datos relevantes para la consulta
   * @param {string} message - Mensaje del usuario
   * @param {string} queryType - Tipo de consulta
   * @param {Object} context - Contexto adicional
   * @returns {Promise<Object>} - Datos relevantes
   */
  async gatherRelevantData(message, queryType, context) {
    const data = {};

    try {
      // Extraer ubicación del mensaje o contexto
      const location = this.extractLocation(message) || context.location;

      if (queryType === 'clima' || queryType === 'general') {
        if (location) {
          try {
            const weatherData = await weatherService.getWeatherForecast(location.city, location.country);
            data.weather = weatherData;
          } catch (error) {
            console.log('No se pudo obtener datos del clima:', error.message);
          }
        }
      }

      if (queryType === 'plagas' || queryType === 'cultivo') {
        const crop = this.extractCrop(message);
        if (crop) {
          try {
            const pestData = await pestService.getPestsByCrop(crop);
            data.pests = pestData;
            data.crop = crop;
          } catch (error) {
            console.log('No se pudo obtener datos de plagas:', error.message);
          }
        }
      }

      // Agregar conocimiento base
      data.knowledgeBase = this.knowledgeBase;
      data.location = location;

    } catch (error) {
      console.error('Error recopilando datos:', error);
    }

    return data;
  }

  /**
   * Genera respuesta usando IA (OpenAI)
   * @param {string} message - Mensaje del usuario
   * @param {string} queryType - Tipo de consulta
   * @param {Object} data - Datos relevantes
   * @param {Object} user - Usuario
   * @returns {Promise<Object>} - Respuesta generada
   */
  async generateAIResponse(message, queryType, data, user) {
    const systemPrompt = this.systemPrompts[queryType] || this.systemPrompts.general;
    
    const contextInfo = this.buildContextForAI(data, user);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nInformación de contexto disponible:\n${contextInfo}`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return {
      text: completion.choices[0].message.content,
      type: queryType,
      source: 'ai',
      confidence: 'high'
    };
  }

  /**
   * Genera respuesta basada en reglas (sin IA)
   * @param {string} message - Mensaje del usuario
   * @param {string} queryType - Tipo de consulta
   * @param {Object} data - Datos relevantes
   * @param {Object} user - Usuario
   * @returns {Promise<Object>} - Respuesta generada
   */
  async generateRuleBasedResponse(message, queryType, data, user) {
    let response = "";

    switch (queryType) {
      case 'clima':
        response = this.generateWeatherResponse(data);
        break;
      case 'plagas':
        response = this.generatePestResponse(data);
        break;
      case 'cultivo':
        response = this.generateCropResponse(data);
        break;
      case 'calendario':
        response = this.generateCalendarResponse(data);
        break;
      default:
        response = this.generateGeneralResponse(message);
    }

    return {
      text: response,
      type: queryType,
      source: 'rules',
      confidence: 'medium'
    };
  }

  /**
   * Construye contexto para la IA
   * @param {Object} data - Datos disponibles
   * @param {Object} user - Usuario
   * @returns {string} - Contexto formateado
   */
  buildContextForAI(data, user) {
    let context = [];

    if (data.weather) {
      context.push(`CLIMA ACTUAL: ${JSON.stringify(data.weather, null, 2)}`);
    }

    if (data.pests && data.crop) {
      context.push(`INFORMACIÓN DE PLAGAS PARA ${data.crop.toUpperCase()}: ${JSON.stringify(data.pests, null, 2)}`);
    }

    if (data.location) {
      context.push(`UBICACIÓN: ${data.location.city}, ${data.location.country}`);
    }

    if (user.nombre) {
      context.push(`USUARIO: ${user.nombre}`);
    }

    return context.join('\n\n');
  }

  /**
   * Extrae ubicación del mensaje
   * @param {string} message - Mensaje del usuario
   * @returns {Object|null} - Ubicación extraída
   */
  extractLocation(message) {
    const cities = ['bogotá', 'medellín', 'cali', 'barranquilla', 'cartagena', 'bucaramanga', 'pereira', 'manizales'];
    const msg = message.toLowerCase();
    
    for (const city of cities) {
      if (msg.includes(city)) {
        return { city: city, country: 'CO' };
      }
    }
    return null;
  }

  /**
   * Extrae cultivo del mensaje
   * @param {string} message - Mensaje del usuario
   * @returns {string|null} - Cultivo extraído
   */
  extractCrop(message) {
    const crops = ['maíz', 'maiz', 'tomate', 'arroz', 'papa', 'soja', 'frijol', 'café', 'cafe', 'plátano', 'platano'];
    const msg = message.toLowerCase();
    
    for (const crop of crops) {
      if (msg.includes(crop)) {
        return crop.replace('í', 'i').replace('é', 'e'); // Normalizar
      }
    }
    return null;
  }

  /**
   * Genera respuesta sobre clima
   * @param {Object} data - Datos disponibles
   * @returns {string} - Respuesta sobre clima
   */
  generateWeatherResponse(data) {
    if (!data.weather) {
      return "🌤️ Para darte información del clima específica, necesito que me digas tu ubicación. ¿En qué ciudad te encuentras?";
    }

    const weather = data.weather;
    let response = `🌤️ **Pronóstico para ${weather.ubicacion.ciudad}:**\n\n`;
    
    weather.pronostico_3_dias.forEach((day, index) => {
      const dayName = index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : day.fecha_legible.split(',')[0];
      response += `**${dayName}:** ${day.temperatura_maxima}°/${day.temperatura_minima}°C, ${day.descripcion}\n`;
    });

    response += "\n🌱 **Recomendaciones agrícolas:**\n";
    response += this.getWeatherRecommendations(weather.pronostico_3_dias[0]);

    return response;
  }

  /**
   * Genera recomendaciones basadas en clima
   * @param {Object} forecast - Pronóstico del día
   * @returns {string} - Recomendaciones
   */
  getWeatherRecommendations(forecast) {
    let recommendations = [];

    if (forecast.probabilidad_lluvia > 70) {
      recommendations.push("☔ Alta probabilidad de lluvia - Evita aplicaciones foliares");
      recommendations.push("🛡️ Protege cultivos sensibles con coberturas");
    } else if (forecast.probabilidad_lluvia < 20 && forecast.temperatura_maxima > 30) {
      recommendations.push("🌵 Clima seco y caluroso - Asegura riego adecuado");
      recommendations.push("🌿 Considera mulch para retener humedad");
    }

    if (forecast.viento_promedio > 20) {
      recommendations.push("💨 Vientos fuertes - Refuerza tutores de cultivos altos");
    }

    if (forecast.temperatura_minima < 15) {
      recommendations.push("🥶 Temperaturas bajas - Protege cultivos sensibles al frío");
    }

    return recommendations.length > 0 ? recommendations.join('\n') : "✅ Condiciones favorables para actividades agrícolas";
  }

  /**
   * Genera respuesta sobre plagas
   * @param {Object} data - Datos disponibles
   * @returns {string} - Respuesta sobre plagas
   */
  generatePestResponse(data) {
    if (!data.pests || !data.crop) {
      return "🐛 Para ayudarte con plagas, necesito saber qué cultivo tienes y qué síntomas observas. ¿Podrías ser más específico?";
    }

    const pestInfo = data.pests;
    let response = `🐛 **Plagas comunes en ${pestInfo.cultivo}:**\n\n`;
    
    pestInfo.plagas.slice(0, 3).forEach((pest, index) => {
      response += `**${index + 1}. ${pest.nombre}**\n`;
      response += `📍 Síntomas: ${pest.sintomas.join(', ')}\n`;
      response += `🛡️ Control: ${pest.control.slice(0, 2).join(', ')}\n\n`;
    });

    response += "💡 **Tip:** Implementa siempre manejo integrado de plagas (MIP) para mejores resultados.";

    return response;
  }

  /**
   * Genera respuesta sobre cultivos
   * @param {Object} data - Datos disponibles
   * @returns {string} - Respuesta sobre cultivos
   */
  generateCropResponse(data) {
    const crop = data.crop;
    if (!crop || !data.knowledgeBase.cultivos[crop]) {
      return "🌱 ¿Qué cultivo te interesa? Puedo ayudarte con maíz, tomate, arroz, papa, soja y más. ¡Dime cuál quieres cultivar!";
    }

    const cropInfo = data.knowledgeBase.cultivos[crop];
    let response = `🌱 **Guía para cultivar ${crop.toUpperCase()}:**\n\n`;
    response += `📅 **Mejor época:** ${cropInfo.mejor_epoca}\n`;
    response += `🌡️ **Clima ideal:** ${cropInfo.clima_ideal}\n`;
    response += `⏱️ **Ciclo:** ${cropInfo.ciclo}\n\n`;
    response += `✅ **Cuidados principales:**\n`;
    cropInfo.cuidados.forEach((care, index) => {
      response += `${index + 1}. ${care}\n`;
    });

    return response;
  }

  /**
   * Genera respuesta sobre calendario agrícola
   * @param {Object} data - Datos disponibles
   * @returns {string} - Respuesta sobre calendario
   */
  generateCalendarResponse(data) {
    const currentMonth = new Date().getMonth() + 1;
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    let response = `📅 **Calendario Agrícola - ${monthNames[currentMonth - 1]}:**\n\n`;
    
    // Actividades recomendadas por mes (simplificado)
    const activities = {
      1: ['Preparación de terrenos', 'Siembra de hortalizas de ciclo corto'],
      2: ['Siembra de papa en zona fría', 'Control de plagas en cultivos establecidos'],
      3: ['Siembra de maíz primer semestre', 'Preparación para época lluviosa'],
      4: ['Siembra de arroz', 'Fertilización de cultivos perennes'],
      5: ['Mantenimiento de cultivos', 'Control de malezas'],
      6: ['Cosecha de cultivos tempranos', 'Preparación para segundo semestre'],
      7: ['Preparación de terrenos segundo semestre', 'Siembra de hortalizas'],
      8: ['Siembra de papa segundo semestre', 'Siembra de maíz segundo semestre'],
      9: ['Fertilización y control fitosanitario', 'Siembra de cultivos de fin de año'],
      10: ['Siembra de soja', 'Preparación para época seca'],
      11: ['Cosecha de cultivos segundo semestre', 'Preparación de suelos'],
      12: ['Planificación año siguiente', 'Mantenimiento de infraestructura']
    };

    const currentActivities = activities[currentMonth] || ['Consulta con agrónomo local'];
    currentActivities.forEach((activity, index) => {
      response += `${index + 1}. ${activity}\n`;
    });

    return response;
  }

  /**
   * Genera respuesta general
   * @param {string} message - Mensaje del usuario
   * @returns {string} - Respuesta general
   */
  generateGeneralResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('hola') || msg.includes('ayuda')) {
      return `¡Hola! 👋 Soy AgroBot, tu asistente agrícola inteligente. 

Puedo ayudarte con:
🌤️ Pronósticos del clima y recomendaciones
🐛 Identificación y control de plagas
🌱 Guías de cultivos y mejores prácticas
📅 Calendario agrícola
🌾 Consejos personalizados para tu región

¿En qué puedo ayudarte hoy?`;
    }

    return "🤖 Estoy aquí para ayudarte con tus cultivos. Puedes preguntarme sobre clima, plagas, épocas de siembra, o cualquier tema agrícola. ¿Qué necesitas saber?";
  }

  /**
   * Genera sugerencias de acciones
   * @param {string} queryType - Tipo de consulta
   * @param {Object} data - Datos disponibles
   * @returns {Array} - Sugerencias
   */
  generateSuggestions(queryType, data) {
    const suggestions = [];

    switch (queryType) {
      case 'clima':
        suggestions.push('Ver pronóstico extendido');
        suggestions.push('Configurar alertas climáticas');
        suggestions.push('Consultar recomendaciones por cultivo');
        break;
      case 'plagas':
        suggestions.push('Ver más información de plagas');
        suggestions.push('Reportar nueva plaga');
        suggestions.push('Consultar métodos de control');
        break;
      case 'cultivo':
        suggestions.push('Ver calendario de siembra');
        suggestions.push('Consultar clima para siembra');
        suggestions.push('Información de plagas del cultivo');
        break;
      default:
        suggestions.push('Consultar clima de mi región');
        suggestions.push('Ver cultivos recomendados');
        suggestions.push('Identificar plagas');
    }

    return suggestions;
  }

  /**
   * Guarda conversación en historial
   * @param {number} userId - ID del usuario
   * @param {string} message - Mensaje del usuario
   * @param {Object} response - Respuesta del bot
   */
  async saveConversation(userId, message, response) {
    // Implementar según necesidad de guardar historial
    // Por ahora solo log
    console.log(`Conversación guardada - Usuario: ${userId}, Mensaje: ${message.substring(0, 50)}...`);
  }
}

module.exports = new ChatbotService();
