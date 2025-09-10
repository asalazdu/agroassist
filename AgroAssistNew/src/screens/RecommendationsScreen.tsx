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
import { Recommendation } from '../types';

const RecommendationsScreen: React.FC = () => {
  const [recommendations] = useState<Recommendation[]>([
    {
      id: '1',
      type: 'watering',
      title: 'Riego recomendado para maíz',
      description: 'Basado en las condiciones climáticas actuales, se recomienda regar el cultivo de maíz en las próximas 24 horas. La humedad del suelo está por debajo del nivel óptimo.',
      priority: 'high',
      date: '2024-09-06',
    },
    {
      id: '2',
      type: 'fertilizing',
      title: 'Fertilización de frijol',
      description: 'El cultivo de frijol está en etapa de floración. Aplica fertilizante rico en fósforo para mejorar el desarrollo de flores y vainas.',
      priority: 'medium',
      date: '2024-09-07',
    },
    {
      id: '3',
      type: 'pest_control',
      title: 'Monitoreo de plagas en tomate',
      description: 'Las condiciones de humedad alta pueden favorecer la aparición de hongos en el tomate. Revisa las plantas regularmente y aplica fungicida preventivo si es necesario.',
      priority: 'medium',
      date: '2024-09-05',
    },
    {
      id: '4',
      type: 'harvesting',
      title: 'Preparación para cosecha',
      description: 'El tomate estará listo para cosechar en aproximadamente 15 días. Prepara las herramientas y contenedores necesarios.',
      priority: 'low',
      date: '2024-09-04',
    },
  ]);

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'watering': return '💧';
      case 'fertilizing': return '🌿';
      case 'pest_control': return '🐛';
      case 'harvesting': return '🚜';
      default: return '📋';
    }
  };

  const getTypeLabel = (type: Recommendation['type']) => {
    switch (type) {
      case 'watering': return 'Riego';
      case 'fertilizing': return 'Fertilización';
      case 'pest_control': return 'Control de plagas';
      case 'harvesting': return 'Cosecha';
      default: return 'General';
    }
  };

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getPriorityLabel = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  const handleRecommendationPress = (recommendation: Recommendation) => {
    Alert.alert(
      `${getTypeIcon(recommendation.type)} ${recommendation.title}`,
      recommendation.description,
      [
        { text: 'Marcar como completada', style: 'default' },
        { text: 'Recordar más tarde', style: 'cancel' },
      ]
    );
  };

  const getRecommendationsByPriority = (priority: Recommendation['priority']) => {
    return recommendations.filter(rec => rec.priority === priority);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`;
    return `En ${diffDays} días`;
  };

  const renderRecommendationSection = (priority: Recommendation['priority'], title: string) => {
    const recs = getRecommendationsByPriority(priority);
    if (recs.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: getPriorityColor(priority) }]}>
          {title} ({recs.length})
        </Text>
        {recs.map((rec) => (
          <TouchableOpacity
            key={rec.id}
            style={[styles.recommendationCard, { borderLeftColor: getPriorityColor(priority) }]}
            onPress={() => handleRecommendationPress(rec)}
          >
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationTitleContainer}>
                <Text style={styles.recommendationIcon}>
                  {getTypeIcon(rec.type)}
                </Text>
                <View style={styles.recommendationTitleText}>
                  <Text style={styles.recommendationTitle}>{rec.title}</Text>
                  <Text style={styles.recommendationType}>{getTypeLabel(rec.type)}</Text>
                </View>
              </View>
              <View style={styles.recommendationMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(priority) }]}>
                    {getPriorityLabel(priority)}
                  </Text>
                </View>
                <Text style={styles.dateText}>{formatDate(rec.date)}</Text>
              </View>
            </View>
            <Text style={styles.recommendationDescription} numberOfLines={3}>
              {rec.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>💡 Recomendaciones</Text>
          <Text style={styles.subtitle}>Consejos personalizados para tus cultivos</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Resumen de tareas</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#f44336' }]}>
                {getRecommendationsByPriority('high').length}
              </Text>
              <Text style={styles.summaryLabel}>Prioridad alta</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#FF9800' }]}>
                {getRecommendationsByPriority('medium').length}
              </Text>
              <Text style={styles.summaryLabel}>Prioridad media</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>
                {getRecommendationsByPriority('low').length}
              </Text>
              <Text style={styles.summaryLabel}>Prioridad baja</Text>
            </View>
          </View>
        </View>

        {renderRecommendationSection('high', '🚨 Prioridad Alta')}
        {renderRecommendationSection('medium', '⚠️ Prioridad Media')}
        {renderRecommendationSection('low', '📝 Prioridad Baja')}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>🌟 Consejos generales</Text>
          <Text style={styles.tipText}>
            • Revisa tus recomendaciones diariamente para mantener tus cultivos saludables
          </Text>
          <Text style={styles.tipText}>
            • Las recomendaciones se actualizan basándose en el clima y el estado de tus cultivos
          </Text>
          <Text style={styles.tipText}>
            • Marca las tareas como completadas para un mejor seguimiento
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
    textTransform: 'uppercase',
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
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
