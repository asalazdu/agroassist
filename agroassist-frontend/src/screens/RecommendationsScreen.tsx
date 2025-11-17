import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import * as alertService from '../../services/alertService';
import type { Alerta, Clima, ResumenAlertas } from '../../services/alertService';
import eventService, { Events } from '../services/eventService';

const RecommendationsScreen: React.FC = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [clima, setClima] = useState<Clima | null>(null);
  const [ubicacion, setUbicacion] = useState<string>('');
  const [resumen, setResumen] = useState<ResumenAlertas>({
    total: 0,
    danger: 0,
    warning: 0,
    info: 0,
    success: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());

  useEffect(() => {
    cargarAlertas();
    
    // Actualizar cada 5 minutos
    const intervalo = setInterval(() => {
      cargarAlertas();
    }, 5 * 60 * 1000);

    // Suscribirse a eventos de cambio de ubicación
    const unsubscribe = eventService.subscribe(Events.LOCATION_UPDATED, (data) => {
      console.log('📍 Evento recibido: Ubicación actualizada', data);
      console.log('🔄 Recargando alertas con nueva ubicación...');
      cargarAlertas();
    });

    return () => {
      clearInterval(intervalo);
      unsubscribe();
    };
  }, []);

  const cargarAlertas = async () => {
    try {
      console.log('🔄 Cargando alertas climáticas...');
      const response = await alertService.obtenerAlertas();
      
      if (response.ok) {
        setAlertas(response.alertas);
        setClima(response.clima);
        setUbicacion(response.ubicacion);
        setResumen(response.resumen);
        setUltimaActualizacion(new Date());
        console.log(`✅ ${response.alertas.length} alertas cargadas`);
      } else {
        console.error('Error:', response.error);
        if (response.error?.includes('cultivos')) {
          // Usuario sin cultivos
          setAlertas([]);
          setClima(null);
        } else {
          Alert.alert('Error', response.error || 'No se pudieron cargar las alertas');
        }
      }
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      Alert.alert('Error', 'Error de conexión al cargar alertas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarAlertas();
  };

  const handleAlertPress = (alerta: Alerta) => {
    const recomendacionesTexto = alerta.recomendaciones.length > 0
      ? '\n\nRecomendaciones:\n' + alerta.recomendaciones.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n')
      : '';
    
    Alert.alert(
      `${alerta.icono} ${alerta.titulo}`,
      `${alerta.mensaje}${recomendacionesTexto}`,
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const getAlertasPorSeveridad = (severidad: 'danger' | 'warning' | 'info' | 'success') => {
    return alertas.filter(alerta => alerta.severidad === severidad);
  };

  const getSeveridadLabel = (severidad: string) => {
    switch (severidad) {
      case 'danger': return 'Crítica';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      case 'success': return 'Óptima';
      default: return 'Alerta';
    }
  };

  const renderAlertSection = (severidad: 'danger' | 'warning' | 'info' | 'success', title: string) => {
    const alertasFiltradas = getAlertasPorSeveridad(severidad);
    if (alertasFiltradas.length === 0) return null;

    const severidadColor = alertService.getSeverityColor(severidad);
    const severidadBgColor = alertService.getSeverityBackgroundColor(severidad);

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: severidadColor }]}>
          {title} ({alertasFiltradas.length})
        </Text>
        {alertasFiltradas.map((alerta, index) => (
          <TouchableOpacity
            key={`${alerta.cultivo_id}-${index}`}
            style={[styles.recommendationCard, { borderLeftColor: severidadColor }]}
            onPress={() => handleAlertPress(alerta)}
          >
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationTitleContainer}>
                <Text style={styles.recommendationIcon}>
                  {alerta.icono}
                </Text>
                <View style={styles.recommendationTitleText}>
                  <Text style={styles.recommendationTitle}>{alerta.titulo}</Text>
                  <Text style={styles.recommendationType}>{alerta.cultivo_nombre}</Text>
                </View>
              </View>
              <View style={styles.recommendationMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: severidadBgColor }]}>
                  <Text style={[styles.priorityText, { color: severidadColor }]}>
                    {getSeveridadLabel(alerta.severidad)}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.recommendationDescription} numberOfLines={3}>
              {alerta.mensaje}
            </Text>
            {alerta.recomendaciones.length > 0 && (
              <Text style={styles.recommendationsCount}>
                📋 {alerta.recomendaciones.length} recomendación(es)
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando alertas climáticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>🌤️ Alertas Climáticas</Text>
          <Text style={styles.subtitle}>Recomendaciones basadas en el clima actual</Text>
          {ubicacion && (
            <Text style={styles.locationText}>📍 {ubicacion}</Text>
          )}
          <Text style={styles.updateText}>
            Última actualización: {alertService.formatearFechaRelativa(ultimaActualizacion.toISOString())}
          </Text>
        </View>

        {clima && (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherTitle}>☀️ Clima Actual</Text>
            <View style={styles.weatherInfo}>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherIcon}>🌡️</Text>
                <Text style={styles.weatherValue}>{clima.temperatura}°C</Text>
                <Text style={styles.weatherLabel}>Temperatura</Text>
              </View>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherIcon}>💧</Text>
                <Text style={styles.weatherValue}>{clima.humedad}%</Text>
                <Text style={styles.weatherLabel}>Humedad</Text>
              </View>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherIcon}>💨</Text>
                <Text style={styles.weatherValue}>{clima.viento} m/s</Text>
                <Text style={styles.weatherLabel}>Viento</Text>
              </View>
            </View>
            {clima.precipitacion && clima.precipitacion > 1 && (
              <Text style={styles.rainAlert}>
                🌧️ Precipitación actual: {clima.precipitacion} mm
              </Text>
            )}
          </View>
        )}

        {alertas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>Sin alertas activas</Text>
            <Text style={styles.emptyText}>
              {clima 
                ? 'Tus cultivos están en condiciones óptimas. ¡Sigue así!'
                : 'Agrega cultivos para recibir recomendaciones personalizadas.'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📊 Resumen de Alertas</Text>
              <View style={styles.summaryStats}>
                {resumen.danger > 0 && (
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, { color: alertService.getSeverityColor('danger') }]}>
                      {resumen.danger}
                    </Text>
                    <Text style={styles.summaryLabel}>Críticas</Text>
                  </View>
                )}
                {resumen.warning > 0 && (
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, { color: alertService.getSeverityColor('warning') }]}>
                      {resumen.warning}
                    </Text>
                    <Text style={styles.summaryLabel}>Advertencias</Text>
                  </View>
                )}
                {resumen.info > 0 && (
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, { color: alertService.getSeverityColor('info') }]}>
                      {resumen.info}
                    </Text>
                    <Text style={styles.summaryLabel}>Información</Text>
                  </View>
                )}
                {resumen.success > 0 && (
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, { color: alertService.getSeverityColor('success') }]}>
                      {resumen.success}
                    </Text>
                    <Text style={styles.summaryLabel}>Óptimas</Text>
                  </View>
                )}
              </View>
            </View>

            {renderAlertSection('danger', '🚨 Alertas Críticas')}
            {renderAlertSection('warning', '⚠️ Advertencias')}
            {renderAlertSection('info', 'ℹ️ Información')}
            {renderAlertSection('success', '✅ Condiciones Óptimas')}
          </>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>🌟 Consejos</Text>
          <Text style={styles.tipText}>
            • Las alertas se actualizan automáticamente cada 5 minutos
          </Text>
          <Text style={styles.tipText}>
            • Desliza hacia abajo para actualizar manualmente
          </Text>
          <Text style={styles.tipText}>
            • Toca una alerta para ver las recomendaciones detalladas
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  updateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  weatherCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  weatherInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  weatherValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  weatherLabel: {
    fontSize: 12,
    color: '#666',
  },
  rainAlert: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: '22%',
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  recommendationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recommendationTitleText: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  recommendationType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  recommendationMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationsCount: {
    marginTop: 8,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default RecommendationsScreen;
