import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import pestAnalysisService, { WeatherAlert, PestAnalysisResult } from '../services/pestAnalysisService';
import weatherService from '../services/weatherService';
import authService from '../services/authService';
import pestService from '../services/pestService';
import { Pest } from '../types';

const PestsScreenWithAI: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PestAnalysisResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  
  // Estados para buscador de plagas
  const [pests, setPests] = useState<Pest[]>([]);
  const [filteredPests, setFilteredPests] = useState<Pest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPest, setSelectedPest] = useState<Pest | null>(null);
  const [pestDetailModalVisible, setPestDetailModalVisible] = useState(false);
  const [showPestList, setShowPestList] = useState(true); // Abierto por defecto

  useEffect(() => {
    loadWeatherAlerts();
    requestPermissions();
    loadPests();
  }, []);

  useEffect(() => {
    filterPests();
  }, [searchQuery, pests]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos acceso a tu cámara y galería para analizar imágenes de cultivos'
      );
    }
  };

  const loadPests = async () => {
    // Cargar datos locales primero (siempre funcionan)
    try {
      const pestsData = await pestService.getAllPests();
      setPests(pestsData);
      setFilteredPests(pestsData);
      console.log(`✅ ${pestsData.length} plagas cargadas (datos locales)`);
    } catch (error) {
      console.error('Error cargando datos locales:', error);
      return;
    }

    // Luego intentar cargar desde API en segundo plano (sin bloquear la UI)
    try {
      const apiResult = await pestService.getPestDatabaseFromAPI('', 1);
      
      if (apiResult && apiResult.plagas && apiResult.plagas.length > 0) {
        // Transformar datos de API al formato esperado
        const transformedPests = apiResult.plagas.map((pest: any) => ({
          id: pest.id.toString(),
          name: pest.nombre,
          scientificName: pest.nombreCientifico || 'Desconocido',
          description: pest.descripcion,
          symptoms: Array.isArray(pest.sintomas) ? pest.sintomas : [pest.sintomas],
          affectedCrops: Array.isArray(pest.cultivos) ? pest.cultivos : [pest.cultivos],
          treatment: typeof pest.tratamiento === 'string' ? [pest.tratamiento] : pest.tratamiento,
          prevention: Array.isArray(pest.prevencion) ? pest.prevencion : [pest.prevencion],
          severity: pest.gravedad || 'media',
          commonNames: Array.isArray(pest.nombresComunes) ? pest.nombresComunes : []
        }));
        
        // Actualizar con datos de la API
        setPests(transformedPests);
        setFilteredPests(transformedPests);
        console.log(`✅ ${transformedPests.length} plagas actualizadas desde Perenual API`);
      }
    } catch (error: any) {
      // Silenciar errores de API (ya tenemos datos locales)
      if (error.response?.status === 401) {
        console.log('ℹ️ API requiere autenticación, usando datos locales');
      } else if (error.response?.status === 404) {
        console.log('ℹ️ Endpoint de API no disponible, usando datos locales');
      } else {
        console.log('ℹ️ API no disponible, usando datos locales');
      }
    }
  };

  const filterPests = async () => {
    if (!searchQuery.trim()) {
      setFilteredPests(pests);
      return;
    }

    // Primero hacer búsqueda local (instantánea)
    const localFiltered = pests.filter(pest =>
      pest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pest.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pest.commonNames?.some((name: string) => name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredPests(localFiltered);

    // Luego intentar buscar en API (en segundo plano)
    try {
      const apiResult = await pestService.getPestDatabaseFromAPI(searchQuery, 1);
      
      if (apiResult && apiResult.plagas && apiResult.plagas.length > 0) {
        const transformedPests = apiResult.plagas.map((pest: any) => ({
          id: pest.id.toString(),
          name: pest.nombre,
          scientificName: pest.nombreCientifico || 'Desconocido',
          description: pest.descripcion,
          symptoms: Array.isArray(pest.sintomas) ? pest.sintomas : [pest.sintomas],
          affectedCrops: Array.isArray(pest.cultivos) ? pest.cultivos : [pest.cultivos],
          treatment: typeof pest.tratamiento === 'string' ? [pest.tratamiento] : pest.tratamiento,
          prevention: Array.isArray(pest.prevencion) ? pest.prevencion : [pest.prevencion],
          severity: pest.gravedad || 'media',
          commonNames: Array.isArray(pest.nombresComunes) ? pest.nombresComunes : []
        }));
        
        setFilteredPests(transformedPests);
        console.log(`🌐 ${transformedPests.length} resultados actualizados desde API`);
      }
    } catch (error: any) {
      // Silenciar errores (ya mostramos resultados locales)
      console.log('ℹ️ Mostrando resultados locales');
    }
  };

  const handlePestPress = (pest: Pest) => {
    setSelectedPest(pest);
    setPestDetailModalVisible(true);
  };

  const loadWeatherAlerts = async () => {
    try {
      setIsLoading(true);
      
      // Obtener ubicación del usuario
      const userData = await authService.getUserProfile();
      let city = 'Bogotá';
      
      if (userData && userData.ubicacion) {
        city = userData.ubicacion.split(',')[0].trim();
      }

      // Obtener clima actual
      const weather = await weatherService.getWeatherByCity(city);
      setCurrentWeather(weather);

      // Obtener alertas de plagas basadas en clima
      const alerts = await pestAnalysisService.getWeatherAlerts(weather);
      setWeatherAlerts(alerts.alertas || []);

      console.log(`✅ ${alerts.total_alertas} alertas de plagas cargadas`);
    } catch (error) {
      console.error('Error cargando alertas:', error);
      Alert.alert('Error', 'No se pudieron cargar las alertas de clima');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      '📸 Analizar Cultivo',
      'Selecciona una opción para analizar tu cultivo',
      [
        {
          text: '📷 Tomar Foto',
          onPress: takePhoto,
        },
        {
          text: '🖼️ Seleccionar de Galería',
          onPress: pickImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const analyzeImage = async (base64Image: string) => {
    try {
      setIsLoading(true);
      setModalVisible(true);
      
      console.log('🔍 Analizando imagen con IA...');
      
      const result = await pestAnalysisService.analyzeImage(base64Image);
      setAnalysisResult(result.analisis);
      
      console.log('✅ Análisis completado');
      
    } catch (error: any) {
      console.error('Error analizando imagen:', error);
      Alert.alert('Error', error.message || 'No se pudo analizar la imagen');
      setModalVisible(false);
      setSelectedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'alto': return '#F44336';
      case 'medio': return '#FF9800';
      case 'bajo': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severa': return '#F44336';
      case 'moderada': return '#FF9800';
      case 'leve': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'inmediata': return '#F44336';
      case 'alta': return '#FF5722';
      case 'media': return '#FF9800';
      case 'baja': return '#4CAF50';
      default: return '#757575';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🐛 Control de Plagas</Text>
          <Text style={styles.subtitle}>Análisis inteligente con IA</Text>
        </View>

        {/* Botón de análisis con cámara */}
        <TouchableOpacity style={styles.analyzeButton} onPress={showImageOptions}>
          <Text style={styles.analyzeButtonIcon}>📸</Text>
          <View style={styles.analyzeButtonContent}>
            <Text style={styles.analyzeButtonTitle}>Analizar Cultivo con IA</Text>
            <Text style={styles.analyzeButtonSubtitle}>
              Toma una foto y detecta plagas o enfermedades
            </Text>
          </View>
        </TouchableOpacity>

        {/* Información del clima actual */}
        {currentWeather && (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherTitle}>
              🌤️ Clima Actual - {currentWeather.location}
            </Text>
            <View style={styles.weatherInfo}>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Temperatura</Text>
                <Text style={styles.weatherValue}>
                  {Math.round(currentWeather.current.temperature)}°C
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Humedad</Text>
                <Text style={styles.weatherValue}>
                  {currentWeather.current.humidity}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Alertas de plagas basadas en clima */}
        {isLoading && weatherAlerts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Cargando alertas...</Text>
          </View>
        ) : (
          <View style={styles.alertsContainer}>
            <Text style={styles.sectionTitle}>
              ⚠️ Alertas Actuales ({weatherAlerts.length})
            </Text>
            {weatherAlerts.length === 0 ? (
              <View style={styles.noAlertsCard}>
                <Text style={styles.noAlertsIcon}>✅</Text>
                <Text style={styles.noAlertsText}>
                  No hay alertas de plagas en este momento
                </Text>
                <Text style={styles.noAlertsSubtext}>
                  Las condiciones climáticas son favorables
                </Text>
              </View>
            ) : (
              weatherAlerts.map((alert, index) => (
                <View
                  key={index}
                  style={[
                    styles.alertCard,
                    { borderLeftColor: getRiskLevelColor(alert.nivel_riesgo) },
                  ]}
                >
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertIcon}>{alert.icono}</Text>
                    <View style={styles.alertHeaderText}>
                      <Text style={styles.alertTitle}>{alert.titulo}</Text>
                      <Text
                        style={[
                          styles.alertRiskBadge,
                          { backgroundColor: getRiskLevelColor(alert.nivel_riesgo) },
                        ]}
                      >
                        Riesgo {alert.nivel_riesgo.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.alertDescription}>{alert.descripcion}</Text>
                  
                  <View style={styles.alertSection}>
                    <Text style={styles.alertSectionTitle}>🐛 Plagas en Riesgo:</Text>
                    {alert.plagas_riesgo.map((plaga, idx) => (
                      <Text key={idx} style={styles.alertListItem}>• {plaga}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.alertSection}>
                    <Text style={styles.alertSectionTitle}>💡 Recomendaciones:</Text>
                    {alert.recomendaciones.map((rec, idx) => (
                      <Text key={idx} style={styles.alertListItem}>• {rec}</Text>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Botón para recargar alertas */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadWeatherAlerts}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>
            {isLoading ? '⏳ Actualizando...' : '🔄 Actualizar Alertas'}
          </Text>
        </TouchableOpacity>

        {/* Sección de búsqueda de plagas */}
        <View style={styles.searchSection}>
          <TouchableOpacity
            style={styles.toggleSearchButton}
            onPress={() => setShowPestList(!showPestList)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Text style={styles.toggleSearchButtonText}>
                {showPestList ? '▼' : '▶'} 🔍 Base de Datos de Plagas ({pests.length})
              </Text>
              <Text style={{ fontSize: 12, color: pests.length > 5 ? '#4CAF50' : '#999', fontWeight: 'bold' }}>
                {pests.length > 5 ? '✓ API Perenual' : 'Datos locales'}
              </Text>
            </View>
          </TouchableOpacity>

          {showPestList && (
            <View style={styles.pestSearchContainer}>
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar plaga... (ej: rust, blight, fungi)"
                  placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {pests.length > 5 && (
                <View style={{ backgroundColor: '#E8F5E8', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <Text style={{ color: '#2E7D32', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
                    🌐 Conectado a Perenual API
                  </Text>
                  <Text style={{ color: '#666', fontSize: 12 }}>
                    Busca plagas en inglés: rust (roya), blight (tizón), fungi (hongos), coffee, tomato, etc.
                  </Text>
                </View>
              )}

              <Text style={styles.pestListTitle}>
                📋 {filteredPests.length} {filteredPests.length === 1 ? 'Plaga' : 'Plagas'} 
                {searchQuery ? ' encontradas' : ' disponibles'}
              </Text>

              {filteredPests.length === 0 ? (
                <View style={styles.noPestsCard}>
                  <Text style={styles.noPestsIcon}>🔍</Text>
                  <Text style={styles.noPestsText}>
                    No se encontraron plagas
                  </Text>
                  <Text style={styles.noPestsSubtext}>
                    Intenta con otro término de búsqueda
                  </Text>
                </View>
              ) : (
                filteredPests.map((pest, index) => (
                  <TouchableOpacity
                    key={pest.id || index}
                    style={[
                      styles.pestCard,
                      { borderLeftColor: getSeverityColor(pest.severity || 'media') },
                    ]}
                    onPress={() => handlePestPress(pest)}
                  >
                    <View style={styles.pestCardHeader}>
                      <Text style={styles.pestEmoji}>🐛</Text>
                      <View style={styles.pestCardInfo}>
                        <Text style={styles.pestName}>{pest.name}</Text>
                        <Text style={styles.pestScientificName}>
                          {pest.scientificName}
                        </Text>
                      </View>
                      <Text style={styles.pestCardArrow}>→</Text>
                    </View>
                    <Text style={styles.pestDescription} numberOfLines={2}>
                      {pest.description}
                    </Text>
                    <View style={styles.pestBadges}>
                      <Text
                        style={[
                          styles.pestSeverityBadge,
                          { backgroundColor: getSeverityColor(pest.severity || 'media') },
                        ]}
                      >
                        {pest.severity || 'Media'}
                      </Text>
                      {pest.affectedCrops && pest.affectedCrops.length > 0 && (
                        <Text style={styles.pestCropsBadge}>
                          🌱 {pest.affectedCrops.slice(0, 2).join(', ')}
                          {pest.affectedCrops.length > 2 ? '...' : ''}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de resultados del análisis */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedImage(null);
          setAnalysisResult(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🔍 Análisis de Cultivo</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedImage(null);
                    setAnalysisResult(null);
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              )}

              {isLoading ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.modalLoadingText}>
                    Analizando imagen con IA...
                  </Text>
                  <Text style={styles.modalLoadingSubtext}>
                    Esto puede tomar unos segundos
                  </Text>
                </View>
              ) : analysisResult ? (
                <View style={styles.analysisResults}>
                  {analysisResult.cultivo_identificado && (
                    <View style={styles.resultSection}>
                      <Text style={styles.resultTitle}>🌱 Cultivo Identificado</Text>
                      <Text style={styles.resultText}>
                        {analysisResult.cultivo_identificado}
                      </Text>
                    </View>
                  )}

                  {analysisResult.problemas && analysisResult.problemas.length > 0 ? (
                    <View style={styles.resultSection}>
                      <Text style={styles.resultTitle}>
                        ⚠️ Problemas Detectados ({analysisResult.problemas.length})
                      </Text>
                      {analysisResult.problemas.map((problema, index) => (
                        <View key={index} style={styles.problemCard}>
                          <View style={styles.problemHeader}>
                            <Text style={styles.problemName}>{problema.nombre}</Text>
                            <Text
                              style={[
                                styles.severityBadge,
                                { backgroundColor: getSeverityColor(problema.gravedad) },
                              ]}
                            >
                              {problema.gravedad}
                            </Text>
                          </View>
                          <Text style={styles.problemType}>
                            Tipo: {problema.tipo} | Confianza: {problema.confianza}
                          </Text>
                          <Text style={styles.problemDescription}>
                            {problema.descripcion}
                          </Text>
                          {problema.sintomas_visibles.length > 0 && (
                            <View>
                              <Text style={styles.problemSubtitle}>Síntomas visibles:</Text>
                              {problema.sintomas_visibles.map((sintoma, idx) => (
                                <Text key={idx} style={styles.problemListItem}>
                                  • {sintoma}
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.resultSection}>
                      <Text style={styles.noProblemsIcon}>✅</Text>
                      <Text style={styles.noProblemsText}>
                        ¡No se detectaron problemas graves!
                      </Text>
                      <Text style={styles.noProblemsSubtext}>
                        Tu cultivo parece estar en buenas condiciones
                      </Text>
                    </View>
                  )}

                  {analysisResult.recomendaciones && analysisResult.recomendaciones.length > 0 && (
                    <View style={styles.resultSection}>
                      <Text style={styles.resultTitle}>💡 Recomendaciones</Text>
                      {analysisResult.recomendaciones.map((rec, index) => (
                        <View key={index} style={styles.recommendationCard}>
                          <View style={styles.recommendationHeader}>
                            <Text style={styles.recommendationAction}>{rec.accion}</Text>
                            <Text
                              style={[
                                styles.priorityBadge,
                                { backgroundColor: getPriorityColor(rec.prioridad) },
                              ]}
                            >
                              {rec.prioridad}
                            </Text>
                          </View>
                          <Text style={styles.recommendationDescription}>
                            {rec.descripcion}
                          </Text>
                          {rec.productos_sugeridos && rec.productos_sugeridos.length > 0 && (
                            <View>
                              <Text style={styles.recommendationSubtitle}>
                                Productos sugeridos:
                              </Text>
                              {rec.productos_sugeridos.map((producto, idx) => (
                                <Text key={idx} style={styles.recommendationListItem}>
                                  • {producto}
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {analysisResult.prevencion && analysisResult.prevencion.length > 0 && (
                    <View style={styles.resultSection}>
                      <Text style={styles.resultTitle}>🛡️ Prevención</Text>
                      {analysisResult.prevencion.map((medida, index) => (
                        <Text key={index} style={styles.preventionItem}>
                          • {medida}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de detalles de plaga */}
      <Modal
        visible={pestDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setPestDetailModalVisible(false);
          setSelectedPest(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🐛 Información de Plaga</Text>
                <TouchableOpacity
                  onPress={() => {
                    setPestDetailModalVisible(false);
                    setSelectedPest(null);
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedPest && (
                <View style={styles.pestDetailContent}>
                  {/* Nombre y clasificación */}
                  <View style={styles.pestDetailSection}>
                    <Text style={styles.pestDetailName}>{selectedPest.name}</Text>
                    <Text style={styles.pestDetailScientific}>
                      {selectedPest.scientificName}
                    </Text>
                    {selectedPest.commonNames && selectedPest.commonNames.length > 0 && (
                      <Text style={styles.pestDetailCommon}>
                        También conocida como: {selectedPest.commonNames.join(', ')}
                      </Text>
                    )}
                  </View>

                  {/* Descripción */}
                  <View style={styles.pestDetailSection}>
                    <Text style={styles.pestDetailSectionTitle}>📝 Descripción</Text>
                    <Text style={styles.pestDetailText}>{selectedPest.description}</Text>
                  </View>

                  {/* Cultivos afectados */}
                  {selectedPest.affectedCrops && selectedPest.affectedCrops.length > 0 && (
                    <View style={styles.pestDetailSection}>
                      <Text style={styles.pestDetailSectionTitle}>
                        🌱 Cultivos Afectados
                      </Text>
                      <View style={styles.cropsContainer}>
                        {selectedPest.affectedCrops.map((crop, index) => (
                          <Text key={index} style={styles.cropBadge}>
                            {crop}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Síntomas */}
                  {selectedPest.symptoms && selectedPest.symptoms.length > 0 && (
                    <View style={styles.pestDetailSection}>
                      <Text style={styles.pestDetailSectionTitle}>⚠️ Síntomas</Text>
                      {selectedPest.symptoms.map((symptom, index) => (
                        <Text key={index} style={styles.pestDetailListItem}>
                          • {symptom}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Métodos de tratamiento */}
                  {selectedPest.treatment && selectedPest.treatment.length > 0 && (
                    <View style={styles.pestDetailSection}>
                      <Text style={styles.pestDetailSectionTitle}>
                        � Tratamiento y Control
                      </Text>
                      {selectedPest.treatment.map((method, index) => (
                        <Text key={index} style={styles.pestDetailListItem}>
                          • {method}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Prevención */}
                  {selectedPest.prevention && selectedPest.prevention.length > 0 && (
                    <View style={styles.pestDetailSection}>
                      <Text style={styles.pestDetailSectionTitle}>
                        🛡️ Prevención
                      </Text>
                      {selectedPest.prevention.map((measure, index) => (
                        <Text key={index} style={styles.pestDetailListItem}>
                          • {measure}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Severidad */}
                  <View style={styles.pestDetailSection}>
                    <Text style={styles.pestDetailSectionTitle}>📊 Nivel de Daño</Text>
                    <View style={styles.severityContainer}>
                      <Text
                        style={[
                          styles.severityBadgeLarge,
                          { backgroundColor: getSeverityColor(selectedPest.severity || 'media') },
                        ]}
                      >
                        {(selectedPest.severity || 'Media').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  analyzeButtonIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  analyzeButtonContent: {
    flex: 1,
  },
  analyzeButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  analyzeButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  weatherCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  weatherInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  alertsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  noAlertsCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  noAlertsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noAlertsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: '#666',
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  alertHeaderText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  alertRiskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  alertSection: {
    marginTop: 12,
  },
  alertSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  alertListItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
  refreshButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 20,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  selectedImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalLoadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  analysisResults: {
    padding: 20,
  },
  resultSection: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  noProblemsIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  noProblemsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  noProblemsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  problemCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  problemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  problemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  problemType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  problemDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  problemSubtitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  problemListItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    paddingLeft: 8,
  },
  recommendationCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationAction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  recommendationSubtitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  recommendationListItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    paddingLeft: 8,
  },
  preventionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 8,
  },
  // Estilos para búsqueda de plagas
  searchSection: {
    marginBottom: 20,
  },
  toggleSearchButton: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  toggleSearchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  pestSearchContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    fontSize: 20,
    color: '#999',
    padding: 4,
  },
  pestListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  noPestsCard: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  noPestsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noPestsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  noPestsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  pestCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  pestCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pestEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  pestCardInfo: {
    flex: 1,
  },
  pestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  pestScientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
  },
  pestCardArrow: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  pestDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  pestBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pestSeverityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  pestCropsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  // Estilos para modal de detalles de plaga
  pestDetailContent: {
    padding: 20,
  },
  pestDetailSection: {
    marginBottom: 24,
  },
  pestDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  pestDetailScientific: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 4,
  },
  pestDetailCommon: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  pestDetailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  pestDetailText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  pestDetailListItem: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 8,
    lineHeight: 22,
  },
  controlMethodCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  controlMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  controlMethodDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  controlMethodProductsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  controlMethodProduct: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
  severityContainer: {
    alignItems: 'flex-start',
  },
  severityBadgeLarge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default PestsScreenWithAI;
