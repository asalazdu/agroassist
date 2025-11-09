/**
 * Event Service - Sistema de eventos global para la aplicación
 * Permite notificar a diferentes partes de la app cuando ocurren eventos importantes
 */

type EventCallback = (data?: any) => void;

class EventService {
  private listeners: Map<string, EventCallback[]>;

  constructor() {
    this.listeners = new Map();
  }

  /**
   * Suscribirse a un evento
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const eventCallbacks = this.listeners.get(event)!;
    eventCallbacks.push(callback);

    // Retornar función para cancelar suscripción
    return () => {
      const index = eventCallbacks.indexOf(callback);
      if (index > -1) {
        eventCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Emitir un evento
   */
  emit(event: string, data?: any): void {
    const eventCallbacks = this.listeners.get(event);
    
    if (eventCallbacks) {
      console.log(`📢 Emitiendo evento: ${event}`, data ? `(con datos)` : '');
      eventCallbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Limpiar todos los listeners de un evento
   */
  clear(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Limpiar todos los listeners
   */
  clearAll(): void {
    this.listeners.clear();
  }
}

// Eventos disponibles
export const Events = {
  LOCATION_UPDATED: 'location_updated',
  PROFILE_UPDATED: 'profile_updated',
  CROPS_UPDATED: 'crops_updated',
  WEATHER_REFRESH_NEEDED: 'weather_refresh_needed',
};

export default new EventService();
