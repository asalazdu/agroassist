import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const menuItems = [
    {
      title: '🌤️ Clima',
      subtitle: 'Pronóstico y recomendaciones',
      screen: 'Weather' as keyof RootStackParamList,
      color: '#2196F3',
    },
    {
      title: '🌱 Mis Cultivos',
      subtitle: 'Gestión de cultivos',
      screen: 'Crops' as keyof RootStackParamList,
      color: '#8BC34A',
    },
    {
      title: '🐛 Control de Plagas',
      subtitle: 'Identificación y tratamiento',
      screen: 'Pests' as keyof RootStackParamList,
      color: '#FF5722',
    },
    {
      title: '💰 Precios del Mercado',
      subtitle: 'Cotizaciones y tendencias',
      screen: 'MarketPrices' as keyof RootStackParamList,
      color: '#4CAF50',
    },
    {
      title: '💡 Recomendaciones',
      subtitle: 'Consejos personalizados',
      screen: 'Recommendations' as keyof RootStackParamList,
      color: '#FF9800',
    },
    {
      title: '👤 Mi Perfil',
      subtitle: 'Información personal y finca',
      screen: 'Profile' as keyof RootStackParamList,
      color: '#9C27B0',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🌱 AgroAssist</Text>
          <Text style={styles.subtitle}>Tu asistente inteligente para agricultura</Text>
          <Text style={styles.welcome}>¡Bienvenido de vuelta!</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>25°C</Text>
            <Text style={styles.statLabel}>Temperatura</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>65%</Text>
            <Text style={styles.statLabel}>Humedad</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Cultivos</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>🚀 Funcionalidades</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderLeftColor: item.color }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Consejo del día</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              🌧️ Se pronostica lluvia para mañana. Es un buen momento para 
              revisar el drenaje de tus cultivos y reducir el riego programado.
            </Text>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  tipText: {
    fontSize: 16,
    color: '#2E7D32',
    lineHeight: 24,
  },
});

export default HomeScreen;
