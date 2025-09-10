import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { weatherService, WeatherData, ForecastData } from '../services/weatherService';

interface WeatherScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialLocation?: string;
    };
  };
}

export const WeatherScreen: React.FC<WeatherScreenProps> = ({ navigation, route }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [useGPS, setUseGPS] = useState(true);
  const [searchMode, setSearchMode] = useState(false);

  useEffect(() => {
    const initialLocation = route?.params?.initialLocation;
    if (initialLocation) {
      setSearchQuery(initialLocation);
      setCurrentLocation(initialLocation);
      setUseGPS(false);
      loadWeatherByLocation(initialLocation);
    } else {
      loadWeatherData();
    }
  }, [route?.params]);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<{ lat: number; lon: number } | null> => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permisos de Ubicación',
          'Se necesita acceso a la ubicación para mostrar el clima local. Puedes buscar una ciudad manualmente.'
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      };
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
      return null;
    }
  };

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      if (useGPS) {
        const coords = await getCurrentLocation();
        if (coords) {
          await loadWeatherByCoordinates(coords.lat, coords.lon);
        } else {
          // Fallback a ubicación por defecto (Bogotá)
          await loadWeatherByLocation('Bogotá, Colombia');
          setUseGPS(false);
        }
      } else if (currentLocation) {
        await loadWeatherByLocation(currentLocation);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información del clima');
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherByCoordinates = async (lat: number, lon: number) => {
    try {
      const [weather, forecast] = await Promise.all([
        weatherService.getCurrentWeather(lat, lon),
        weatherService.getForecast(lat, lon),
      ]);

      if (weather.success && forecast.success) {
        setWeatherData(weather.data!);
        setForecastData(forecast.data!);
        setCurrentLocation(weather.data!.location);
      } else {
        throw new Error('Error al obtener datos del clima');
      }
    } catch (error) {
      console.error('Weather error:', error);
      Alert.alert('Error', 'No se pudo obtener el clima para esta ubicación');
    }
  };

  const loadWeatherByLocation = async (location: string) => {
    try {
      const [weather, forecast] = await Promise.all([
        weatherService.getWeatherByLocation(location),
        weatherService.getForecastByLocation(location),
      ]);

      if (weather.success && forecast.success) {
        setWeatherData(weather.data!);
        setForecastData(forecast.data!);
        setCurrentLocation(weather.data!.location);
      } else {
        throw new Error('Ubicación no encontrada');
      }
    } catch (error) {
      console.error('Weather error:', error);
      Alert.alert('Error', 'No se pudo encontrar la ubicación. Intenta con otra ciudad.');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Ingresa una ciudad para buscar');
      return;
    }

    setLoading(true);
    setUseGPS(false);
    setSearchMode(false);
    await loadWeatherByLocation(searchQuery.trim());
    setLoading(false);
  };

  const handleUseGPS = async () => {
    setUseGPS(true);
    setSearchMode(false);
    setCurrentLocation('');
    await loadWeatherData();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeatherData();
    setRefreshing(false);
  };

  const getWeatherIcon = (condition: string): 'rainy' | 'cloudy' | 'sunny' | 'thunderstorm' | 'partly-sunny' => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('lluvia')) return 'rainy';
    if (lowerCondition.includes('cloud') || lowerCondition.includes('nublado')) return 'cloudy';
    if (lowerCondition.includes('sun') || lowerCondition.includes('despejado')) return 'sunny';
    if (lowerCondition.includes('storm') || lowerCondition.includes('tormenta')) return 'thunderstorm';
    return 'partly-sunny';
  };

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  };

  if (loading && !weatherData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando información del clima...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Pronóstico del Clima</Text>
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => setSearchMode(!searchMode)}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      {searchMode && (
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar ciudad..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchButtonInline} onPress={handleSearch}>
              <Ionicons name="search" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.gpsButton} onPress={handleUseGPS}>
            <Ionicons name="location" size={16} color="#4CAF50" />
            <Text style={styles.gpsButtonText}>Usar mi ubicación</Text>
          </TouchableOpacity>
        </View>
      )}

      {weatherData && (
        <>
          {/* Current Weather */}
          <View style={styles.currentWeatherCard}>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.locationText}>{currentLocation}</Text>
              {useGPS && <Ionicons name="radio-button-on" size={12} color="#4CAF50" />}
            </View>
            
            <View style={styles.currentWeatherContent}>
              <View style={styles.weatherIconContainer}>
                <Ionicons 
                  name={getWeatherIcon(weatherData.condition)} 
                  size={80} 
                  color="#4CAF50" 
                />
              </View>
              
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>{Math.round(weatherData.temperature)}°C</Text>
                <Text style={styles.condition}>{weatherData.condition}</Text>
                <Text style={styles.feelsLike}>
                  Sensación térmica {Math.round(weatherData.feelsLike)}°C
                </Text>
              </View>
            </View>
            
            <View style={styles.weatherDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="water" size={16} color="#4CAF50" />
                <Text style={styles.detailLabel}>Humedad</Text>
                <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={16} color="#4CAF50" />
                <Text style={styles.detailLabel}>Viento</Text>
                <Text style={styles.detailValue}>{weatherData.windSpeed} km/h</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="eye" size={16} color="#4CAF50" />
                <Text style={styles.detailLabel}>Visibilidad</Text>
                <Text style={styles.detailValue}>{weatherData.visibility} km</Text>
              </View>
            </View>
          </View>

          {/* Agricultural Recommendations */}
          {weatherData.recommendations && weatherData.recommendations.length > 0 && (
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>
                <Ionicons name="leaf" size={18} color="#4CAF50" /> 
                {' '}Recomendaciones Agrícolas
              </Text>
              {weatherData.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 3-Day Forecast */}
          {forecastData && (
            <View style={styles.forecastCard}>
              <Text style={styles.forecastTitle}>
                <Ionicons name="calendar" size={18} color="#4CAF50" />
                {' '}Pronóstico 3 días
              </Text>
              
              {forecastData.map((forecast, index) => (
                <View key={index} style={styles.forecastItem}>
                  <View style={styles.forecastDay}>
                    <Text style={styles.dayName}>
                      {index === 0 ? 'Hoy' : getDayName(forecast.date)}
                    </Text>
                    <Text style={styles.forecastDate}>
                      {new Date(forecast.date).toLocaleDateString('es-CO', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.forecastWeather}>
                    <Ionicons 
                      name={getWeatherIcon(forecast.condition)} 
                      size={32} 
                      color="#4CAF50" 
                    />
                    <Text style={styles.forecastCondition}>{forecast.condition}</Text>
                  </View>
                  
                  <View style={styles.forecastTemps}>
                    <Text style={styles.maxTemp}>{Math.round(forecast.maxTemp)}°</Text>
                    <Text style={styles.minTemp}>{Math.round(forecast.minTemp)}°</Text>
                  </View>
                  
                  <View style={styles.forecastDetails}>
                    <View style={styles.forecastDetailItem}>
                      <Ionicons name="water" size={12} color="#666" />
                      <Text style={styles.forecastDetailText}>{forecast.humidity}%</Text>
                    </View>
                    <View style={styles.forecastDetailItem}>
                      <Ionicons name="rainy" size={12} color="#666" />
                      <Text style={styles.forecastDetailText}>{forecast.precipitationChance}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Update Info */}
          <View style={styles.updateInfo}>
            <Ionicons name="time" size={14} color="#999" />
            <Text style={styles.updateText}>
              Última actualización: {new Date(weatherData.timestamp).toLocaleTimeString('es-CO')}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    padding: 5,
  },
  searchSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    flex: 1,
    height: 45,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButtonInline: {
    padding: 12,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
  },
  gpsButtonText: {
    color: '#4CAF50',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  currentWeatherCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
    flex: 1,
  },
  currentWeatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherIconContainer: {
    marginRight: 20,
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  condition: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  feelsLike: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  recommendationsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  forecastCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  forecastDay: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  forecastDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  forecastWeather: {
    flex: 1,
    alignItems: 'center',
  },
  forecastCondition: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  forecastTemps: {
    flex: 1,
    alignItems: 'center',
  },
  maxTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  minTemp: {
    fontSize: 14,
    color: '#666',
  },
  forecastDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  forecastDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  forecastDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 20,
  },
  updateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 5,
  },
});
