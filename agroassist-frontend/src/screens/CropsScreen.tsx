import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import cultivoService, { Cultivo } from '../services/cultivoService';
import ChatbotModal from '../components/ChatbotModal';
import {
  getCropIcon,
  getCropColor,
  getHarvestBadgeColor,
  getCropProgress,
  getProgressColor,
  getGrowthStage,
} from '../utils/cropIcons';

const CropsScreen: React.FC = () => {
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [chatbotInitialMessage, setChatbotInitialMessage] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<Cultivo>>({
    nombre_cultivo: '',
    variedad: '',
    area_sembrada: undefined,
    unidad_area: 'hectáreas',
    fecha_siembra: '',
    fecha_cosecha_estimada: '',
    estado: 'activo',
    notas: '',
    lote: '',
  });

  useEffect(() => {
    loadCultivos();
  }, []);

  const loadCultivos = async () => {
    setIsLoading(true);
    try {
      const data = await cultivoService.getCultivos();
      setCultivos(data);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al cargar cultivos');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysUntilHarvest = (harvestDate?: string) => {
    if (!harvestDate) return null;
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCropPress = (cultivo: Cultivo) => {
    const daysUntilHarvest = cultivo.fecha_cosecha_estimada 
      ? getDaysUntilHarvest(cultivo.fecha_cosecha_estimada)
      : null;

    const daysSincePlanting = Math.floor(
      (new Date().getTime() - new Date(cultivo.fecha_siembra).getTime()) / (1000 * 60 * 60 * 24)
    );

    Alert.alert(
      `${cultivo.nombre_cultivo}`,
      `Detalles del cultivo:\n\n` +
      `${cultivo.variedad ? `🌾 Variedad: ${cultivo.variedad}\n` : ''}` +
      `📅 Fecha de siembra: ${new Date(cultivo.fecha_siembra).toLocaleDateString('es-ES')}\n` +
      `⏱️ Días desde siembra: ${daysSincePlanting} días\n` +
      `${cultivo.fecha_cosecha_estimada ? `🗓️ Cosecha esperada: ${new Date(cultivo.fecha_cosecha_estimada).toLocaleDateString('es-ES')}\n` : ''}` +
      `${cultivo.area_sembrada ? `📏 Área: ${cultivo.area_sembrada} ${cultivo.unidad_area}\n` : ''}` +
      `${cultivo.lote ? `📍 Lote: ${cultivo.lote}\n` : ''}` +
      `${daysUntilHarvest !== null ? `⏰ Días para cosecha: ${daysUntilHarvest} días\n` : ''}` +
      `${cultivo.notas ? `\n📝 Notas: ${cultivo.notas}` : ''}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: '🤖 Consultar IA',
          onPress: () => handleConsultAI(cultivo, daysSincePlanting, daysUntilHarvest),
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => handleDeleteCrop(cultivo.id!),
        },
      ]
    );
  };

  const handleConsultAI = (cultivo: Cultivo, daysSincePlanting: number, daysUntilHarvest: number | null) => {
    const contextMessage = `Tengo un cultivo de ${cultivo.nombre_cultivo}${cultivo.variedad ? ` variedad ${cultivo.variedad}` : ''} ` +
      `que sembré hace ${daysSincePlanting} días (el ${new Date(cultivo.fecha_siembra).toLocaleDateString('es-ES')}). ` +
      `${cultivo.area_sembrada ? `El área sembrada es de ${cultivo.area_sembrada} ${cultivo.unidad_area}. ` : ''}` +
      `${daysUntilHarvest !== null ? `Faltan aproximadamente ${daysUntilHarvest} días para la cosecha. ` : ''}` +
      `${cultivo.lote ? `Está en el ${cultivo.lote}. ` : ''}` +
      `${cultivo.notas ? `Notas adicionales: ${cultivo.notas}. ` : ''}` +
      `\n\n¿Qué recomendaciones me puedes dar sobre el cuidado y manejo de este cultivo en su etapa actual?`;
    
    setChatbotInitialMessage(contextMessage);
    setIsChatbotVisible(true);
  };

  const handleDeleteCrop = async (id: number) => {
    Alert.alert(
      'Eliminar Cultivo',
      '¿Estás seguro que deseas eliminar este cultivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cultivoService.deleteCultivo(id);
              Alert.alert('Éxito', 'Cultivo eliminado correctamente');
              loadCultivos();
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Error al eliminar cultivo');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      nombre_cultivo: '',
      variedad: '',
      area_sembrada: undefined,
      unidad_area: 'hectáreas',
      fecha_siembra: '',
      fecha_cosecha_estimada: '',
      estado: 'activo',
      notas: '',
      lote: '',
    });
  };

  const handleSaveCrop = async () => {
    if (!formData.nombre_cultivo || formData.nombre_cultivo.trim() === '') {
      Alert.alert('Error', 'El nombre del cultivo es obligatorio');
      return;
    }

    if (!formData.fecha_siembra || formData.fecha_siembra.trim() === '') {
      Alert.alert('Error', 'La fecha de siembra es obligatoria');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.fecha_siembra)) {
      Alert.alert('Error', 'La fecha de siembra debe tener el formato AAAA-MM-DD (ejemplo: 2024-10-16)');
      return;
    }

    if (formData.fecha_cosecha_estimada && !dateRegex.test(formData.fecha_cosecha_estimada)) {
      Alert.alert('Error', 'La fecha de cosecha debe tener el formato AAAA-MM-DD (ejemplo: 2024-12-16)');
      return;
    }

    setIsSaving(true);
    try {
      await cultivoService.createCultivo(formData as Cultivo);
      Alert.alert('Éxito', 'Cultivo creado correctamente');
      setIsModalVisible(false);
      resetForm();
      loadCultivos();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al crear cultivo');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: keyof Cultivo, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (isLoading && cultivos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando cultivos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🌱 Mis Cultivos</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Resumen</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{cultivos.filter(c => c.estado === 'activo').length}</Text>
              <Text style={styles.summaryLabel}>Cultivos activos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {cultivos.reduce((sum, c) => sum + (c.area_sembrada || 0), 0).toFixed(1)}
              </Text>
              <Text style={styles.summaryLabel}>Hectáreas totales</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {cultivos.filter(c => {
                  const days = c.fecha_cosecha_estimada ? getDaysUntilHarvest(c.fecha_cosecha_estimada) : null;
                  return days !== null && days <= 30 && days >= 0;
                }).length}
              </Text>
              <Text style={styles.summaryLabel}>Próximas cosechas</Text>
            </View>
          </View>
        </View>

        <View style={styles.cropsContainer}>
          <Text style={styles.sectionTitle}>🚜 Cultivos Activos</Text>
          
          {cultivos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🌾</Text>
              <Text style={styles.emptyStateText}>No tienes cultivos registrados</Text>
              <Text style={styles.emptyStateSubtext}>
                Presiona el botón "+ Agregar" para comenzar
              </Text>
            </View>
          ) : (
            cultivos.map((cultivo) => {
              const daysUntilHarvest = cultivo.fecha_cosecha_estimada 
                ? getDaysUntilHarvest(cultivo.fecha_cosecha_estimada)
                : null;
              const isNearHarvest = daysUntilHarvest !== null && daysUntilHarvest <= 30 && daysUntilHarvest >= 0;
              
              // Cálculos para el diseño mejorado
              const daysSincePlanting = Math.floor(
                (new Date().getTime() - new Date(cultivo.fecha_siembra).getTime()) / (1000 * 60 * 60 * 24)
              );
              const totalCycleDays = cultivo.fecha_cosecha_estimada 
                ? Math.floor(
                    (new Date(cultivo.fecha_cosecha_estimada).getTime() - new Date(cultivo.fecha_siembra).getTime()) / (1000 * 60 * 60 * 24)
                  )
                : 120; // Default 120 días si no hay fecha
              
              const cropIcon = getCropIcon(cultivo.nombre_cultivo);
              const cropColor = getCropColor(cultivo.nombre_cultivo);
              const progress = getCropProgress(daysSincePlanting, totalCycleDays);
              const progressColor = getProgressColor(progress);
              const growthStage = getGrowthStage(progress);
              const harvestBadge = getHarvestBadgeColor(daysUntilHarvest);
              
              return (
                <TouchableOpacity
                  key={cultivo.id}
                  style={[
                    styles.cropCard, 
                    isNearHarvest && styles.cropCardAlert,
                    { borderLeftColor: cropColor, borderLeftWidth: 4 }
                  ]}
                  onPress={() => handleCropPress(cultivo)}
                  activeOpacity={0.7}
                >
                  {/* Header con icono dinámico */}
                  <View style={styles.cropHeader}>
                    <View style={styles.cropIconContainer}>
                      <Text style={styles.cropIconLarge}>{cropIcon}</Text>
                    </View>
                    <View style={styles.cropTitleContainer}>
                      <View style={styles.cropNameRow}>
                        <Text style={styles.cropName}>{cultivo.nombre_cultivo}</Text>
                        {cultivo.variedad && (
                          <View style={[styles.varietyBadge, { backgroundColor: cropColor + '20' }]}>
                            <Text style={[styles.varietyText, { color: cropColor }]}>
                              {cultivo.variedad}
                            </Text>
                          </View>
                        )}
                      </View>
                      {cultivo.area_sembrada && (
                        <Text style={styles.cropArea}>
                          📏 {cultivo.area_sembrada} {cultivo.unidad_area}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Barra de progreso */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>
                        {growthStage.icon} {growthStage.name}
                      </Text>
                      <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar, 
                          { width: `${progress}%`, backgroundColor: progressColor }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressDays}>
                      {daysSincePlanting} días desde siembra
                    </Text>
                  </View>

                  {/* Detalles */}
                  <View style={styles.cropDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📅</Text>
                      <Text style={styles.detailText}>
                        Siembra: {new Date(cultivo.fecha_siembra).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                    {cultivo.fecha_cosecha_estimada && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>🗓️</Text>
                        <Text style={styles.detailText}>
                          Cosecha: {new Date(cultivo.fecha_cosecha_estimada).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                    )}
                    {cultivo.lote && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>📍</Text>
                        <Text style={styles.detailText}>Lote: {cultivo.lote}</Text>
                      </View>
                    )}
                  </View>

                  {/* Footer con badge de cosecha */}
                  {daysUntilHarvest !== null && (
                    <View style={[styles.harvestBadge, { backgroundColor: harvestBadge.bg }]}>
                      <Text style={[styles.harvestBadgeText, { color: harvestBadge.text }]}>
                        {daysUntilHarvest > 0 
                          ? `⏰ ${daysUntilHarvest} días para cosecha - ${harvestBadge.label}`
                          : daysUntilHarvest === 0
                          ? '🎉 ¡Listo para cosechar hoy!'
                          : `⚠️ Cosecha atrasada por ${Math.abs(daysUntilHarvest)} días`
                        }
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>🌱 Nuevo Cultivo</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre del Cultivo *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nombre_cultivo}
                  onChangeText={(text) => updateFormData('nombre_cultivo', text)}
                  placeholder="Ej: Maíz, Tomate, Frijol"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Variedad</Text>
                <TextInput
                  style={styles.input}
                  value={formData.variedad}
                  onChangeText={(text) => updateFormData('variedad', text)}
                  placeholder="Ej: Criolla, Híbrida"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Área Sembrada</Text>
                <TextInput
                  style={styles.input}
                  value={formData.area_sembrada?.toString() || ''}
                  onChangeText={(text) => updateFormData('area_sembrada', text ? parseFloat(text) : undefined)}
                  placeholder="Ej: 2.5"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fecha de Siembra * (AAAA-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fecha_siembra}
                  onChangeText={(text) => updateFormData('fecha_siembra', text)}
                  placeholder="2024-10-16"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fecha Cosecha Estimada (AAAA-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fecha_cosecha_estimada}
                  onChangeText={(text) => updateFormData('fecha_cosecha_estimada', text)}
                  placeholder="2024-12-16"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Lote</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lote}
                  onChangeText={(text) => updateFormData('lote', text)}
                  placeholder="Ej: Lote A, Parcela 1"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Notas</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notas}
                  onChangeText={(text) => updateFormData('notas', text)}
                  placeholder="Observaciones adicionales"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setIsModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, isSaving && styles.buttonDisabled]}
                  onPress={handleSaveCrop}
                  disabled={isSaving}
                >
                  <Text style={styles.saveButtonText}>
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Chatbot Modal para consultas sobre cultivos */}
      <ChatbotModal
        visible={isChatbotVisible}
        onClose={() => {
          setIsChatbotVisible(false);
          setChatbotInitialMessage('');
        }}
        initialMessage={chatbotInitialMessage}
      />
    </SafeAreaView>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  cropVariety: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  // ===== NUEVOS ESTILOS PARA DISEÑO MEJORADO =====
  cropIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropIconLarge: {
    fontSize: 32,
  },
  cropTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cropNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  varietyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  varietyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressSection: {
    marginVertical: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressDays: {
    fontSize: 11,
    color: '#999',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  harvestBadge: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  harvestBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CropsScreen;
