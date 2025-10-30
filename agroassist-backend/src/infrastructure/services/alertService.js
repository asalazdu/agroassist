/**
 * Alert Service - Generación de alertas climáticas para cultivos
 * Analiza condiciones climáticas y genera recomendaciones específicas por cultivo
 */

const weatherService = require('./weatherService');
const cacheService = require('./cacheService');

class AlertService {
  /**
   * Generar alertas climáticas para los cultivos del usuario
   * @param {Array} cultivos - Lista de cultivos del usuario
   * @param {string} ubicacion - Ubicación del usuario (ciudad, país)
   * @param {number} userId - ID del usuario (para caché)
   * @returns {Promise<Array>} - Lista de alertas generadas
   */
  async generarAlertasPorCultivos(cultivos, ubicacion, userId = null) {
    try {
      // Verificar si hay datos en caché para este usuario
      if (userId) {
        const cached = cacheService.getAlertCache(userId);
        if (cached) {
          console.log(`📦 Usando alertas en caché para usuario ${userId}`);
          return cached;
        }
      }

      console.log(`🌤️ Obteniendo clima para: ${ubicacion}`);
      
      // Obtener clima actual
      const climaActual = await weatherService.getCurrentWeather(ubicacion);
      
      if (!climaActual || !climaActual.current) {
        throw new Error('No se pudo obtener el clima actual');
      }

      const alertas = [];
      
      // Analizar cada cultivo
      for (const cultivo of cultivos) {
        const alertasCultivo = this.analizarCultivo(cultivo, climaActual);
        alertas.push(...alertasCultivo);
      }

      console.log(`✅ ${alertas.length} alertas generadas`);
      
      const result = {
        success: true,
        alertas,
        clima: {
          temperatura: climaActual.current.temp,
          sensacion_termica: climaActual.current.feels_like,
          humedad: climaActual.current.humidity,
          descripcion: climaActual.current.weather[0].description,
          icono: climaActual.current.weather[0].icon,
          viento: climaActual.current.wind_speed,
          precipitacion: climaActual.hourly?.[0]?.pop || 0,
          uvi: climaActual.current.uvi,
        },
        ubicacion: ubicacion,
        fecha: new Date().toISOString()
      };

      // Guardar en caché si tenemos userId
      if (userId) {
        cacheService.setAlertCache(userId, result);
      }

      return result;
    } catch (error) {
      console.error('❌ Error generando alertas:', error);
      return {
        success: false,
        error: error.message,
        alertas: []
      };
    }
  }

  /**
   * Analizar un cultivo específico según condiciones climáticas
   */
  analizarCultivo(cultivo, climaActual) {
    const alertas = [];
    const clima = climaActual.current;
    const temp = clima.temp;
    const humedad = clima.humidity;
    const viento = clima.wind_speed;
    const precipitacion = climaActual.hourly?.[0]?.pop * 100 || 0;
    const uvi = clima.uvi;

    // ALERTAS DE TEMPERATURA
    if (temp > 35) {
      alertas.push({
        cultivo_id: cultivo.id,
        cultivo_nombre: cultivo.nombre,
        tipo: 'temperatura_alta',
        severidad: 'danger',
        titulo: `⚠️ Temperatura extrema para ${cultivo.nombre}`,
        mensaje: `La temperatura actual (${temp.toFixed(1)}°C) es muy alta. Riesgo de estrés térmico y deshidratación.`,
        recomendaciones: [
          'Aumentar la frecuencia de riego, preferiblemente en las primeras horas de la mañana',
          'Considerar uso de mallas de sombreo o cobertura vegetal',
          'Monitorear signos de marchitez en hojas',
          'Aplicar mulch para mantener humedad del suelo'
        ],
        icono: '🌡️',
        fecha: new Date().toISOString()
      });
    } else if (temp > 30) {
      alertas.push({
        cultivo_id: cultivo.id,
        cultivo_nombre: cultivo.nombre,
        tipo: 'temperatura_alta',
        severidad: 'warning',
        titulo: `🌡️ Temperatura elevada para ${cultivo.nombre}`,
        mensaje: `La temperatura (${temp.toFixed(1)}°C) está alta. Monitorear el cultivo.`,
        recomendaciones: [
          'Regar en horas de menor temperatura',
          'Revisar la humedad del suelo regularmente',
          'Observar el desarrollo de las plantas'
        ],
        icono: '☀️',
        fecha: new Date().toISOString()
      });
    }

    if (temp < 5) {
      alertas.push({
        cultivo_id: cultivo.id,
        cultivo_nombre: cultivo.nombre,
        tipo: 'temperatura_baja',
        severidad: 'danger',
        titulo: `❄️ Alerta de helada para ${cultivo.nombre}`,
        mensaje: `Temperatura muy baja (${temp.toFixed(1)}°C). Alto riesgo de daño por heladas.`,
        recomendaciones: [
          'Proteger plantas sensibles con coberturas térmicas',
          'Considerar uso de calefactores o velas anti-heladas',
          'Regar antes del anochecer para aprovechar el calor latente',
          'Evitar podar o fertilizar en estos días'
        ],
        icono: '❄️',
        fecha: new Date().toISOString()
      });
    } else if (temp < 10) {
      alertas.push({
        cultivo_id: cultivo.id,
        cultivo_nombre: cultivo.nombre,
        tipo: 'temperatura_baja',
        severidad: 'warning',
        titulo: `🌡️ Temperatura baja para ${cultivo.nombre}`,
        mensaje: `Temperatura fresca (${temp.toFixed(1)}°C). Puede afectar el crecimiento.`,
        recomendaciones: [
          'Reducir la frecuencia de riego',
          'Proteger cultivos sensibles al frío',
          'Monitorear desarrollo de las plantas'
        ],
        icono: '🌡️',
        fecha: new Date().toISOString()
      });
    }

    // ALERTAS DE HUMEDAD
    if (humedad > 85) {
      alertas.push({
        cultivo_id: cultivo.id,
        cultivo_nombre: cultivo.nombre,
        tipo: 'humedad_alta',
        severidad: 'warning',
        titulo: `💧 Humedad muy alta para ${cultivo.nombre}`,
        mensaje: `La humedad (${humedad}%) favorece el desarrollo de enfermedades fúngicas.`,
        recomendaciones: [
          'Evitar riego por aspersión, preferir riego por goteo',
          'Mejorar la ventilación entre plantas mediante podas',
          'Aplicar fungicidas preventivos si es necesario',
          'Monitorear aparición de hongos (mildiu, oídio, etc.)',
          'Evitar trabajar en el cultivo cuando está mojado'
        ],
        icono: '💧',
        fecha: new Date().toISOString()
      });
    }

    if (humedad < 30) {
      alertas.push({
        cultivo_id: cultivo.id,
        cultivo_nombre: cultivo.nombre,
        tipo: 'humedad_baja',
        severidad: 'warning',
        titulo: `🏜️ Ambiente muy seco para ${cultivo.nombre}`,
        mensaje: `La humedad ambiental (${humedad}%) está muy baja.`,
        recomendaciones: [
          'Aumentar frecuencia de riego',
          'Considerar instalar sistemas de nebulización',
          'Aplicar mulch para retener humedad',
          'Monitorear bordes de hojas por quemaduras'
        ],
        icono: '🏜️',
        fecha: new Date().toISOString()
      });
    }

    // ALERTAS DE LLUVIA
    if (precipitacion > 70) {
      alertas.push({
        cultivo_id: cultivo.id,
        cultivo_nombre: cultivo.nombre,
        tipo: 'lluvia',
        severidad: 'warning',
        titulo: `🌧️ Alta probabilidad de lluvia (${precipitacion.toFixed(0)}%)`,
        mensaje: `Se esperan lluvias que pueden afectar ${cultivo.nombre}.`,
        recomendaciones: [
          'Suspender riego programado',
          'Asegurar buen drenaje en el terreno',
          'Proteger cultivos susceptibles al exceso de agua',
          'Posponer aplicación de fertilizantes y pesticidas',
          'Monitorear nivel de agua en suelo'
        ],
        icono: '🌧️',
        fecha: new Date().toISOString()
      });
    }

    // ALERTAS DE VIENTO
    if (viento > 10) {
      alertas.push({
        cultivo_id: cultivo.id,
        cultivo_nombre: cultivo.nombre,
        tipo: 'viento',
        severidad: viento > 15 ? 'danger' : 'warning',
        titulo: `💨 Vientos fuertes (${viento.toFixed(1)} m/s)`,
        mensaje: `Los vientos pueden dañar ${cultivo.nombre}.`,
        recomendaciones: [
          'Revisar y reforzar tutores y soportes',
          'Proteger plantas jóvenes o recién trasplantadas',
          'Considerar barreras cortavientos',
          'Posponer aplicación de productos foliares',
          'Inspeccionar daños físicos después del viento'
        ],
        icono: '💨',
        fecha: new Date().toISOString()
      });
    }

    // ALERTAS DE RADIACIÓN UV
    if (uvi > 8) {
      alertas.push({
        cultivo_id: cultivo.id,
        cultivo_nombre: cultivo.nombre,
        tipo: 'uv_alto',
        severidad: 'info',
        titulo: `☀️ Radiación UV muy alta (${uvi})`,
        mensaje: `Alta radiación solar puede estresar ${cultivo.nombre}.`,
        recomendaciones: [
          'Considerar mallas de sombreo para cultivos sensibles',
          'Regar en las horas de menor radiación',
          'Monitorear signos de quemaduras solares en hojas',
          'Aplicar protectores solares agrícolas si es necesario'
        ],
        icono: '☀️',
        fecha: new Date().toISOString()
      });
    }

    // CONDICIONES ÓPTIMAS
    if (alertas.length === 0 && temp >= 15 && temp <= 28 && humedad >= 40 && humedad <= 70) {
      alertas.push({
        cultivo_id: cultivo.id,
        cultivo_nombre: cultivo.nombre,
        tipo: 'optimo',
        severidad: 'success',
        titulo: `✅ Condiciones óptimas para ${cultivo.nombre}`,
        mensaje: `El clima actual es favorable para el desarrollo del cultivo.`,
        recomendaciones: [
          'Mantener el programa de riego establecido',
          'Buen momento para aplicar fertilizantes',
          'Realizar podas y mantenimiento preventivo',
          'Monitorear el crecimiento y desarrollo normal'
        ],
        icono: '✅',
        fecha: new Date().toISOString()
      });
    }

    return alertas;
  }

  /**
   * Obtener resumen de alertas por severidad
   */
  obtenerResumenAlertas(alertas) {
    const resumen = {
      total: alertas.length,
      danger: alertas.filter(a => a.severidad === 'danger').length,
      warning: alertas.filter(a => a.severidad === 'warning').length,
      info: alertas.filter(a => a.severidad === 'info').length,
      success: alertas.filter(a => a.severidad === 'success').length,
    };

    return resumen;
  }
}

module.exports = new AlertService();
