import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { WeatherData } from '../types';
import weatherService from '../services/weatherService';

const WeatherScreen: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // Cargar clima por defecto (Bogotá)
    loadWeatherByCity('Bogotá');
  }, []);

  const loadWeatherByCity = async (cityName: string) => {
    setIsLoading(true);
    try {
      const data = await weatherService.getWeatherByCity(cityName);
      setWeatherData(data);
      setRecommendations(weatherService.getAgriculturalRecommendations(data));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al obtener clima');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      // Simular coordenadas de Bogotá para demo
      // En una app real, usarías react-native-geolocation-service
      const data = await weatherService.getCurrentWeather(4.7110, -74.0721);
      setWeatherData(data);
      setRecommendations(weatherService.getAgriculturalRecommendations(data));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al obtener ubicación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySearch = () => {
    if (!cityInput.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre de una ciudad');
      return;
    }
    loadWeatherByCity(cityInput.trim());
  };

  const getWeatherIcon = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[icon] || '🌤️';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🌤️ Clima Agrícola</Text>
        </View>

        {/* Búsqueda de ciudad */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={cityInput}
            onChangeText={setCityInput}
            placeholder="Buscar ciudad..."
            returnKeyType="search"
            onSubmitEditing={handleCitySearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleCitySearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
            <Text style={styles.locationButtonText}>📍</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Cargando información del clima...</Text>
          </View>
        ) : weatherData ? (
          <>
            {/* Clima actual */}
            <View style={styles.currentWeatherCard}>
              <View style={styles.currentWeatherHeader}>
                <Text style={styles.location}>{weatherData.location}</Text>
                <Text style={styles.temperature}>{weatherData.current.temperature}°C</Text>
              </View>
              <View style={styles.currentWeatherDetails}>
                <Text style={styles.weatherIcon}>
                  {getWeatherIcon(weatherData.current.icon)}
                </Text>
                <Text style={styles.description}>
                  {weatherData.current.description}
                </Text>
              </View>
              <View style={styles.weatherStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Humedad</Text>
                  <Text style={styles.statValue}>{weatherData.current.humidity}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Viento</Text>
                  <Text style={styles.statValue}>{weatherData.current.windSpeed} km/h</Text>
                </View>
              </View>
            </View>

            {/* Pronóstico */}
            <View style={styles.forecastCard}>
              <Text style={styles.sectionTitle}>📅 Pronóstico 5 días</Text>
              {weatherData.forecast.map((day, index) => (
                <View key={index} style={styles.forecastItem}>
                  <Text style={styles.forecastDate}>{day.date}</Text>
                  <Text style={styles.forecastIcon}>
                    {getWeatherIcon(day.icon)}
                  </Text>
                  <Text style={styles.forecastDescription}>{day.description}</Text>
                  <Text style={styles.forecastTemp}>
                    {day.temperature.max}°/{day.temperature.min}°
                  </Text>
                </View>
              ))}
            </View>

            {/* Recomendaciones agrícolas */}
            <View style={styles.recommendationsCard}>
              <Text style={styles.sectionTitle}>🌱 Recomendaciones Agrícolas</Text>
              {recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No hay información del clima disponible
            </Text>
          </View>
        )}
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  searchButtonText: {
    fontSize: 18,
  },
  locationButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  locationButtonText: {
    fontSize: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  currentWeatherCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  currentWeatherDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  description: {
    fontSize: 18,
    color: '#666',
    textTransform: 'capitalize',
  },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  forecastCard: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  forecastDate: {
    flex: 2,
    fontSize: 14,
    color: '#666',
  },
  forecastIcon: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  forecastDescription: {
    flex: 3,
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  forecastTemp: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'right',
  },
  recommendationsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationItem: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default WeatherScreen;
