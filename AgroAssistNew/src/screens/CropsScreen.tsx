import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Crop } from '../types';

const CropsScreen: React.FC = () => {
  const [crops] = useState<Crop[]>([
    {
      id: '1',
      name: 'Maíz',
      plantingDate: '2024-03-15',
      expectedHarvest: '2024-07-15',
      currentStage: 'Crecimiento',
      area: 2.5,
    },
    {
      id: '2',
      name: 'Frijol',
      plantingDate: '2024-04-01',
      expectedHarvest: '2024-06-30',
      currentStage: 'Floración',
      area: 1.8,
    },
    {
      id: '3',
      name: 'Tomate',
      plantingDate: '2024-02-20',
      expectedHarvest: '2024-05-20',
      currentStage: 'Fructificación',
      area: 0.5,
    },
  ]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Germinación': return '#FFC107';
      case 'Crecimiento': return '#4CAF50';
      case 'Floración': return '#9C27B0';
      case 'Fructificación': return '#FF5722';
      case 'Maduración': return '#FF9800';
      case 'Cosecha': return '#8BC34A';
      default: return '#666';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Germinación': return '🌱';
      case 'Crecimiento': return '🌿';
      case 'Floración': return '🌸';
      case 'Fructificación': return '🍅';
      case 'Maduración': return '🌾';
      case 'Cosecha': return '🚜';
      default: return '🌱';
    }
  };

  const getDaysUntilHarvest = (harvestDate: string) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCropPress = (crop: Crop) => {
    Alert.alert(
      `${crop.name}`,
      `Detalles del cultivo:\n\n` +
      `📅 Fecha de siembra: ${new Date(crop.plantingDate).toLocaleDateString('es-ES')}\n` +
      `🗓️ Cosecha esperada: ${new Date(crop.expectedHarvest).toLocaleDateString('es-ES')}\n` +
      `📏 Área: ${crop.area} hectáreas\n` +
      `⏰ Días para cosecha: ${getDaysUntilHarvest(crop.expectedHarvest)} días`
    );
  };

  const addNewCrop = () => {
    Alert.alert(
      'Nuevo Cultivo',
      'Esta funcionalidad estará disponible pronto. Podrás agregar nuevos cultivos con información detallada.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🌱 Mis Cultivos</Text>
          <TouchableOpacity style={styles.addButton} onPress={addNewCrop}>
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Resumen</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{crops.length}</Text>
              <Text style={styles.summaryLabel}>Cultivos activos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {crops.reduce((sum, crop) => sum + crop.area, 0).toFixed(1)}
              </Text>
              <Text style={styles.summaryLabel}>Hectáreas totales</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {crops.filter(crop => getDaysUntilHarvest(crop.expectedHarvest) <= 30).length}
              </Text>
              <Text style={styles.summaryLabel}>Próximas cosechas</Text>
            </View>
          </View>
        </View>

        <View style={styles.cropsContainer}>
          <Text style={styles.sectionTitle}>🚜 Cultivos Activos</Text>
          {crops.map((crop) => {
            const daysUntilHarvest = getDaysUntilHarvest(crop.expectedHarvest);
            const isNearHarvest = daysUntilHarvest <= 30;
            
            return (
              <TouchableOpacity
                key={crop.id}
                style={[styles.cropCard, isNearHarvest && styles.cropCardAlert]}
                onPress={() => handleCropPress(crop)}
              >
                <View style={styles.cropHeader}>
                  <View style={styles.cropTitle}>
                    <Text style={styles.cropName}>{crop.name}</Text>
                    <Text style={styles.cropArea}>{crop.area} ha</Text>
                  </View>
                  {isNearHarvest && (
                    <View style={styles.alertBadge}>
                      <Text style={styles.alertText}>🚨 Próxima cosecha</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cropDetails}>
                  <View style={styles.cropStage}>
                    <Text style={styles.stageIcon}>
                      {getStageIcon(crop.currentStage)}
                    </Text>
                    <Text style={[styles.stageText, { color: getStageColor(crop.currentStage) }]}>
                      {crop.currentStage}
                    </Text>
                  </View>
                  
                  <View style={styles.cropDates}>
                    <Text style={styles.dateText}>
                      📅 Siembra: {new Date(crop.plantingDate).toLocaleDateString('es-ES')}
                    </Text>
                    <Text style={styles.dateText}>
                      🗓️ Cosecha: {new Date(crop.expectedHarvest).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                </View>

                <View style={styles.cropFooter}>
                  <Text style={styles.harvestCountdown}>
                    {daysUntilHarvest > 0 
                      ? `⏰ ${daysUntilHarvest} días para cosecha`
                      : daysUntilHarvest === 0
                      ? '🎉 ¡Listo para cosechar!'
                      : `⚠️ Cosecha atrasada por ${Math.abs(daysUntilHarvest)} días`
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Consejos para tus cultivos</Text>
          <Text style={styles.tipText}>
            • Revisa regularmente el estado de tus cultivos
          </Text>
          <Text style={styles.tipText}>
            • Mantén un calendario de actividades agrícolas
          </Text>
          <Text style={styles.tipText}>
            • Monitorea las condiciones climáticas diariamente
          </Text>
          <Text style={styles.tipText}>
            • Planifica la rotación de cultivos para la próxima temporada
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
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
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  cropsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  cropCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cropCardAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cropTitle: {
    flex: 1,
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cropArea: {
    fontSize: 14,
    color: '#666',
  },
  alertBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  cropDetails: {
    marginBottom: 12,
  },
  cropStage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  stageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cropDates: {
    gap: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  cropFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  harvestCountdown: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  tipsCard: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 12,
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

export default CropsScreen;
