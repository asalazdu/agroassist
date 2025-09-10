import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Pest, PestIdentification } from '../types';
import pestService from '../services/pestService';

const PestsScreen: React.FC = () => {
  const [pests, setPests] = useState<Pest[]>([]);
  const [filteredPests, setFilteredPests] = useState<Pest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPest, setSelectedPest] = useState<Pest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [identificationMode, setIdentificationMode] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [affectedCrop, setAffectedCrop] = useState('');
  const [identificationResults, setIdentificationResults] = useState<PestIdentification[]>([]);

  useEffect(() => {
    loadPests();
  }, []);

  useEffect(() => {
    filterPests();
  }, [searchQuery, pests]);

  const loadPests = async () => {
    try {
      setIsLoading(true);
      const pestsData = await pestService.getAllPests();
      setPests(pestsData);
      setFilteredPests(pestsData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las plagas');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPests = () => {
    if (!searchQuery.trim()) {
      setFilteredPests(pests);
      return;
    }

    const filtered = pests.filter(pest =>
      pest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pest.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pest.commonNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredPests(filtered);
  };

  const handlePestPress = (pest: Pest) => {
    setSelectedPest(pest);
    setModalVisible(true);
  };

  const handleIdentifyPest = async () => {
    if (!symptoms.trim()) {
      Alert.alert('Error', 'Por favor describe los síntomas observados');
      return;
    }

    try {
      setIsLoading(true);
      const symptomList = symptoms.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const results = await pestService.identifyPestBySymptoms(symptomList, affectedCrop);
      setIdentificationResults(results);
      
      if (results.length === 0) {
        Alert.alert('Sin resultados', 'No se encontraron plagas que coincidan con los síntomas descritos');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al identificar la plaga');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'baja': return '#4CAF50';
      case 'media': return '#FF9800';
      case 'alta': return '#FF5722';
      case 'crítica': return '#F44336';
      default: return '#757575';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'baja': return '🟢';
      case 'media': return '🟡';
      case 'alta': return '🟠';
      case 'crítica': return '🔴';
      default: return '⚪';
    }
  };

  const renderPestCard = (pest: Pest) => (
    <TouchableOpacity
      key={pest.id}
      style={styles.pestCard}
      onPress={() => handlePestPress(pest)}
    >
      <View style={styles.pestHeader}>
        <Text style={styles.pestName}>{pest.name}</Text>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(pest.severity) }]}>
          <Text style={styles.severityText}>
            {getSeverityIcon(pest.severity)} {pest.severity.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.scientificName}>{pest.scientificName}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {pest.description}
      </Text>
      <View style={styles.affectedCropsContainer}>
        <Text style={styles.affectedCropsLabel}>Cultivos afectados:</Text>
        <Text style={styles.affectedCrops} numberOfLines={1}>
          {pest.affectedCrops.join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderIdentificationResult = (result: PestIdentification) => (
    <TouchableOpacity
      key={result.pestId}
      style={[styles.pestCard, styles.identificationCard]}
      onPress={() => handlePestPress(result.pest)}
    >
      <View style={styles.identificationHeader}>
        <Text style={styles.pestName}>{result.pest.name}</Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>{Math.round(result.confidence)}%</Text>
        </View>
      </View>
      <Text style={styles.scientificName}>{result.pest.scientificName}</Text>
      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(result.pest.severity) }]}>
        <Text style={styles.severityText}>
          {getSeverityIcon(result.pest.severity)} {result.pest.severity.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPestModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕ Cerrar</Text>
            </TouchableOpacity>
          </View>

          {selectedPest && (
            <>
              <Text style={styles.modalTitle}>{selectedPest.name}</Text>
              <Text style={styles.modalScientificName}>{selectedPest.scientificName}</Text>
              
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(selectedPest.severity) }]}>
                <Text style={styles.severityText}>
                  {getSeverityIcon(selectedPest.severity)} SEVERIDAD: {selectedPest.severity.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.modalSectionTitle}>Descripción</Text>
              <Text style={styles.modalText}>{selectedPest.description}</Text>

              <Text style={styles.modalSectionTitle}>Síntomas</Text>
              {selectedPest.symptoms.map((symptom, index) => (
                <Text key={index} style={styles.modalListItem}>• {symptom}</Text>
              ))}

              <Text style={styles.modalSectionTitle}>Cultivos Afectados</Text>
              <Text style={styles.modalText}>{selectedPest.affectedCrops.join(', ')}</Text>

              <Text style={styles.modalSectionTitle}>Tratamiento</Text>
              {selectedPest.treatment.map((treatment, index) => (
                <Text key={index} style={styles.modalListItem}>• {treatment}</Text>
              ))}

              <Text style={styles.modalSectionTitle}>Prevención</Text>
              {selectedPest.prevention.map((prevention, index) => (
                <Text key={index} style={styles.modalListItem}>• {prevention}</Text>
              ))}

              {selectedPest.commonNames.length > 0 && (
                <>
                  <Text style={styles.modalSectionTitle}>Nombres Comunes</Text>
                  <Text style={styles.modalText}>{selectedPest.commonNames.join(', ')}</Text>
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐛 Control de Plagas</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.modeButton, !identificationMode && styles.activeModeButton]}
            onPress={() => {
              setIdentificationMode(false);
              setIdentificationResults([]);
              setSymptoms('');
              setAffectedCrop('');
            }}
          >
            <Text style={[styles.modeButtonText, !identificationMode && styles.activeModeButtonText]}>
              📋 Catálogo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, identificationMode && styles.activeModeButton]}
            onPress={() => setIdentificationMode(true)}
          >
            <Text style={[styles.modeButtonText, identificationMode && styles.activeModeButtonText]}>
              🔍 Identificar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!identificationMode ? (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar plagas por nombre o cultivo..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.content}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
            ) : (
              filteredPests.map(renderPestCard)
            )}
          </ScrollView>
        </>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.identificationForm}>
            <Text style={styles.formTitle}>🔬 Identificación de Plagas</Text>
            <Text style={styles.formDescription}>
              Describe los síntomas que observas en tus plantas para ayudarte a identificar la plaga.
            </Text>

            <Text style={styles.inputLabel}>Síntomas observados (separados por comas):</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Ej: hojas amarillas, manchas negras, agujeros en hojas..."
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Cultivo afectado (opcional):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: tomate, maíz, papa..."
              value={affectedCrop}
              onChangeText={setAffectedCrop}
            />

            <TouchableOpacity
              style={styles.identifyButton}
              onPress={handleIdentifyPest}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.identifyButtonText}>🔍 Identificar Plaga</Text>
              )}
            </TouchableOpacity>

            {identificationResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Posibles identificaciones:</Text>
                {identificationResults.map(renderIdentificationResult)}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {renderPestModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: '#4CAF50',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeModeButtonText: {
    color: '#fff',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  pestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  identificationCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  pestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  identificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  pestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    flex: 1,
  },
  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  affectedCropsContainer: {
    marginTop: 5,
  },
  affectedCropsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  affectedCrops: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  severityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  identificationForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 10,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  identifyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  identifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 25,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 15,
  },
  loader: {
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 5,
  },
  modalScientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 15,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  modalListItem: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 5,
    paddingLeft: 10,
  },
});

export default PestsScreen;
