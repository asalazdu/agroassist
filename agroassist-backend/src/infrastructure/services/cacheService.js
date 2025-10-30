/**
 * Cache Service - Servicio centralizado de caché
 * Maneja la invalidación de caché cuando cambian datos críticos como ubicación
 */

class CacheService {
  constructor() {
    this.weatherCache = new Map(); // userId -> { data, timestamp }
    this.alertCache = new Map();   // userId -> { data, timestamp }
    this.ttl = 5 * 60 * 1000; // 5 minutos por defecto
  }

  /**
   * Invalidar todo el caché de un usuario
   */
  invalidateUserCache(userId) {
    console.log(`🗑️ Invalidando caché para usuario ${userId}`);
    this.weatherCache.delete(userId);
    this.alertCache.delete(userId);
  }

  /**
   * Invalidar caché de clima para un usuario
   */
  invalidateWeatherCache(userId) {
    console.log(`🌤️ Invalidando caché de clima para usuario ${userId}`);
    this.weatherCache.delete(userId);
  }

  /**
   * Invalidar caché de alertas para un usuario
   */
  invalidateAlertCache(userId) {
    console.log(`⚠️ Invalidando caché de alertas para usuario ${userId}`);
    this.alertCache.delete(userId);
  }

  /**
   * Guardar datos de clima en caché
   */
  setWeatherCache(userId, data) {
    this.weatherCache.set(userId, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Obtener datos de clima del caché
   */
  getWeatherCache(userId) {
    const cached = this.weatherCache.get(userId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      this.weatherCache.delete(userId);
      return null;
    }

    return cached.data;
  }

  /**
   * Guardar datos de alertas en caché
   */
  setAlertCache(userId, data) {
    this.alertCache.set(userId, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Obtener datos de alertas del caché
   */
  getAlertCache(userId) {
    const cached = this.alertCache.get(userId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      this.alertCache.delete(userId);
      return null;
    }

    return cached.data;
  }

  /**
   * Limpiar todo el caché (útil para mantenimiento)
   */
  clearAll() {
    console.log('🧹 Limpiando todo el caché');
    this.weatherCache.clear();
    this.alertCache.clear();
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    return {
      weatherCacheSize: this.weatherCache.size,
      alertCacheSize: this.alertCache.size,
      totalCached: this.weatherCache.size + this.alertCache.size
    };
  }
}

// Exportar instancia única (singleton)
module.exports = new CacheService();
