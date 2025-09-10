import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Simulamos algunos datos
const plagasData = [
  {
    id: 1,
    nombre: 'Cogollero del maíz',
    nombreCientifico: 'Spodoptera frugiperda',
    cultivos: ['Maíz', 'Sorgo'],
    severidad: 'Alta',
    descripcion: 'Larva que ataca el cogollo de plantas jóvenes de maíz'
  },
  {
    id: 2,
    nombre: 'Broca del café',
    nombreCientifico: 'Hypothenemus hampei',
    cultivos: ['Café'],
    severidad: 'Alta',
    descripcion: 'Insecto que perfora los frutos del café'
  },
  {
    id: 3,
    nombre: 'Trips',
    nombreCientifico: 'Thrips tabaci',
    cultivos: ['Tomate', 'Cebolla'],
    severidad: 'Media',
    descripcion: 'Pequeños insectos que causan daño en hojas'
  }
];

const cultivosData = [
  { nombre: 'Papa', tipo: 'Tubérculo', temporada: 'Todo el año', region: 'Cundinamarca' },
  { nombre: 'Maíz', tipo: 'Cereal', temporada: 'Marzo-Junio', region: 'Valle del Cauca' },
  { nombre: 'Café', tipo: 'Arbusto', temporada: 'Octubre-Enero', region: 'Eje Cafetero' }
];

// Componente principal
export default function AgroAssistDemo() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlaga, setSelectedPlaga] = useState<any>(null);

  const colors = {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    success: '#2E7D32',
    warning: '#FF9800',
    error: '#F44336',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    text: {
      primary: '#212121',
      secondary: '#757575',
      onPrimary: '#FFFFFF'
    }
  };

  // Pantalla de Inicio
  const HomeScreen = () => (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { color: colors.text.onPrimary }]}>
          🌱 AgroAssist Colombia
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text.onPrimary }]}>
          Tu asistente agrícola inteligente
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        
        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: colors.error }]}
          onPress={() => setActiveTab('plagas')}>
          <MaterialIcons name="bug-report" size={32} color="white" />
          <Text style={styles.actionText}>Consultar Plagas</Text>
          <Text style={styles.actionSubtext}>Información de plagas colombianas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: colors.success }]}
          onPress={() => setActiveTab('cultivos')}>
          <MaterialIcons name="eco" size={32} color="white" />
          <Text style={styles.actionText}>Ver Cultivos</Text>
          <Text style={styles.actionSubtext}>Cultivos principales de Colombia</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: colors.warning }]}
          onPress={() => Alert.alert('Precios', 'Función de precios en desarrollo')}>
          <MaterialIcons name="attach-money" size={32} color="white" />
          <Text style={styles.actionText}>Precios de Mercado</Text>
          <Text style={styles.actionSubtext}>Precios actuales en Colombia</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: '#2196F3' }]}
          onPress={() => Alert.alert('Clima', 'Abriendo pronóstico del clima...')}>
          <MaterialIcons name="cloud" size={32} color="white" />
          <Text style={styles.actionText}>Clima Agrícola</Text>
          <Text style={styles.actionSubtext}>Pronóstico de 3 días con recomendaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: '#FF5722' }]}
          onPress={() => Alert.alert('Perfil', 'Abriendo perfil de usuario...')}>
          <MaterialIcons name="person" size={32} color="white" />
          <Text style={styles.actionText}>Mi Perfil</Text>
          <Text style={styles.actionSubtext}>Gestiona tu información y cultivos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Pantalla de Plagas
  const PlagasScreen = () => (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.error }]}>
        <Text style={[styles.headerTitle, { color: colors.text.onPrimary }]}>
          🐛 Plagas Colombianas
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text.onPrimary }]}>
          Información especializada para Colombia
        </Text>
      </View>

      <View style={styles.content}>
        {plagasData.map((plaga) => (
          <TouchableOpacity 
            key={plaga.id}
            style={styles.plagaCard}
            onPress={() => setSelectedPlaga(plaga)}>
            <View style={styles.plagaHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.plagaName}>{plaga.nombre}</Text>
                <Text style={styles.plagaScientific}>{plaga.nombreCientifico}</Text>
              </View>
              <View style={[
                styles.severityBadge, 
                { backgroundColor: plaga.severidad === 'Alta' ? colors.error : colors.warning }
              ]}>
                <Text style={{ color: 'white', fontSize: 12 }}>{plaga.severidad}</Text>
              </View>
            </View>
            <Text style={styles.plagaDescription}>{plaga.descripcion}</Text>
            <Text style={styles.plagaCultivos}>
              Afecta: {plaga.cultivos.join(', ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // Pantalla de Cultivos
  const CultivosScreen = () => (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.success }]}>
        <Text style={[styles.headerTitle, { color: colors.text.onPrimary }]}>
          🌾 Cultivos de Colombia
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text.onPrimary }]}>
          Información de cultivos principales
        </Text>
      </View>

      <View style={styles.content}>
        {cultivosData.map((cultivo, index) => (
          <View key={index} style={styles.cultivoCard}>
            <View style={styles.cultivoHeader}>
              <MaterialIcons name="eco" size={24} color={colors.success} />
              <Text style={styles.cultivoName}>{cultivo.nombre}</Text>
            </View>
            <Text style={styles.cultivoInfo}>Tipo: {cultivo.tipo}</Text>
            <Text style={styles.cultivoInfo}>Temporada: {cultivo.temporada}</Text>
            <Text style={styles.cultivoInfo}>Región: {cultivo.region}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // Modal de detalle de plaga
  const PlagaDetailModal = () => {
    if (!selectedPlaga) return null;

    return (
      <View style={styles.modal}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedPlaga.nombre}</Text>
            <TouchableOpacity onPress={() => setSelectedPlaga(null)}>
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalScientific}>{selectedPlaga.nombreCientifico}</Text>
          <Text style={styles.modalDescription}>{selectedPlaga.descripcion}</Text>
          
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Cultivos afectados:</Text>
            {selectedPlaga.cultivos.map((cultivo: string, index: number) => (
              <Text key={index} style={styles.modalListItem}>• {cultivo}</Text>
            ))}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Recomendaciones:</Text>
            <Text style={styles.modalListItem}>• Monitoreo regular del cultivo</Text>
            <Text style={styles.modalListItem}>• Control biológico preferible</Text>
            <Text style={styles.modalListItem}>• Consultar técnico especializado</Text>
          </View>

          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => Alert.alert('Plan de Manejo', 'Función en desarrollo')}>
            <Text style={styles.modalButtonText}>Generar Plan de Manejo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.app}>
      {/* Contenido principal */}
      {activeTab === 'home' && <HomeScreen />}
      {activeTab === 'plagas' && <PlagasScreen />}
      {activeTab === 'cultivos' && <CultivosScreen />}

      {/* Modal de detalle */}
      <PlagaDetailModal />

      {/* Navegación inferior */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}>
          <MaterialIcons 
            name="home" 
            size={24} 
            color={activeTab === 'home' ? colors.primary : colors.text.secondary} 
          />
          <Text style={[
            styles.tabLabel, 
            { color: activeTab === 'home' ? colors.primary : colors.text.secondary }
          ]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'plagas' && styles.activeTab]}
          onPress={() => setActiveTab('plagas')}>
          <MaterialIcons 
            name="bug-report" 
            size={24} 
            color={activeTab === 'plagas' ? colors.primary : colors.text.secondary} 
          />
          <Text style={[
            styles.tabLabel, 
            { color: activeTab === 'plagas' ? colors.primary : colors.text.secondary }
          ]}>Plagas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'cultivos' && styles.activeTab]}
          onPress={() => setActiveTab('cultivos')}>
          <MaterialIcons 
            name="eco" 
            size={24} 
            color={activeTab === 'cultivos' ? colors.primary : colors.text.secondary} 
          />
          <Text style={[
            styles.tabLabel, 
            { color: activeTab === 'cultivos' ? colors.primary : colors.text.secondary }
          ]}>Cultivos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  actionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  actionSubtext: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  plagaCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  plagaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plagaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  plagaScientific: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#757575',
    marginTop: 4,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  plagaDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  plagaCultivos: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  cultivoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cultivoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cultivoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 8,
  },
  cultivoInfo: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    backgroundColor: '#E8F5E8',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
  },
  modalScientific: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#757575',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 16,
    lineHeight: 24,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  modalListItem: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  modalButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
