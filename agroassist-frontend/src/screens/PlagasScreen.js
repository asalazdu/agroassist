import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';

import {plagasService} from '../services/api';
import globalStyles, {colors, spacing, typography} from '../styles/globalStyles';

const PlagasScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [plagas, setPlagas] = useState([]);
  const [filteredPlagas, setFilteredPlagas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCultivo, setSelectedCultivo] = useState('');
  const [cultivos, setCultivos] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterPlagas();
  }, [searchText, plagas, selectedCultivo]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Cargar cultivos disponibles
      const cultivosResponse = await plagasService.testSystem();
      if (cultivosResponse.success && cultivosResponse.data.cultivos_soportados) {
        setCultivos(cultivosResponse.data.cultivos_soportados);
      }

      // Cargar plagas principales
      if (cultivosResponse.success && cultivosResponse.data.plagas_principales) {
        setPlagas(cultivosResponse.data.plagas_principales);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar la información de plagas',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const filterPlagas = () => {
    let filtered = plagas;

    // Filtrar por texto de búsqueda
    if (searchText) {
      filtered = filtered.filter(plaga =>
        plaga.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
        plaga.nombre_cientifico?.toLowerCase().includes(searchText.toLowerCase()) ||
        plaga.cultivos_afectados?.some(cultivo => 
          cultivo.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Filtrar por cultivo seleccionado
    if (selectedCultivo) {
      filtered = filtered.filter(plaga =>
        plaga.cultivos_afectados?.includes(selectedCultivo)
      );
    }

    setFilteredPlagas(filtered);
  };

  const searchPlagaByName = async (searchTerm) => {
    if (!searchTerm.trim()) {
      Toast.show({
        type: 'warning',
        text1: 'Búsqueda vacía',
        text2: 'Por favor ingresa el nombre de una plaga',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await plagasService.getPlagaInfo(searchTerm);
      if (response.success) {
        navigation.navigate('PlagaDetail', { 
          plaga: response.data,
          fromSearch: true 
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Plaga no encontrada',
          text2: response.message || 'No se encontró información de esta plaga',
        });
      }
    } catch (error) {
      console.error('Error searching plaga:', error);
      Toast.show({
        type: 'error',
        text1: 'Error de búsqueda',
        text2: 'No se pudo realizar la búsqueda',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlagaPress = (plaga) => {
    navigation.navigate('PlagaDetail', { plaga });
  };

  const renderPlagaItem = ({item}) => (
    <TouchableOpacity
      style={styles.plagaCard}
      onPress={() => handlePlagaPress(item)}
      activeOpacity={0.7}>
      <View style={styles.plagaHeader}>
        <View style={styles.plagaInfo}>
          <Text style={styles.plagaName}>{item.nombre}</Text>
          {item.nombre_cientifico && (
            <Text style={styles.plagaScientificName}>
              <Text style={styles.italicText}>{item.nombre_cientifico}</Text>
            </Text>
          )}
        </View>
        <View style={[styles.severityBadge, { 
          backgroundColor: getSeverityColor(item.severidad) 
        }]}>
          <Text style={styles.severityText}>
            {item.severidad || 'Media'}
          </Text>
        </View>
      </View>

      {item.cultivos_afectados && item.cultivos_afectados.length > 0 && (
        <View style={styles.cultivosSection}>
          <Icon name="eco" size={16} color={colors.success} />
          <Text style={styles.cultivosText}>
            Afecta: {item.cultivos_afectados.join(', ')}
          </Text>
        </View>
      )}

      {item.descripcion_corta && (
        <Text style={styles.plagaDescription} numberOfLines={2}>
          {item.descripcion_corta}
        </Text>
      )}

      <View style={styles.plagaFooter}>
        <Icon name="arrow-forward" size={20} color={colors.primary} />
        <Text style={styles.viewDetailsText}>Ver detalles</Text>
      </View>
    </TouchableOpacity>
  );

  const getSeverityColor = (severidad) => {
    switch (severidad?.toLowerCase()) {
      case 'alta':
      case 'high':
        return colors.error;
      case 'media':
      case 'medium':
        return colors.warning;
      case 'baja':
      case 'low':
        return colors.success;
      default:
        return colors.info;
    }
  };

  const FilterModal = () => (
    <Modal
      visible={filterModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setFilterModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar por Cultivo</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <TouchableOpacity
              style={[
                styles.cultivoOption,
                selectedCultivo === '' && styles.cultivoOptionSelected,
              ]}
              onPress={() => {
                setSelectedCultivo('');
                setFilterModalVisible(false);
              }}>
              <Text style={[
                styles.cultivoOptionText,
                selectedCultivo === '' && styles.cultivoOptionTextSelected,
              ]}>
                Todos los cultivos
              </Text>
            </TouchableOpacity>

            {cultivos.map((cultivo, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.cultivoOption,
                  selectedCultivo === cultivo && styles.cultivoOptionSelected,
                ]}
                onPress={() => {
                  setSelectedCultivo(cultivo);
                  setFilterModalVisible(false);
                }}>
                <Text style={[
                  styles.cultivoOptionText,
                  selectedCultivo === cultivo && styles.cultivoOptionTextSelected,
                ]}>
                  {cultivo}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={globalStyles.container}>
      {/* Header con búsqueda */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Información de Plagas</Text>
        <Text style={styles.headerSubtitle}>
          Consulta plagas que afectan cultivos colombianos
        </Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar plaga por nombre..."
              placeholderTextColor={colors.text.secondary}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => searchPlagaByName(searchText)}
            />
            {searchText !== '' && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.clearButton}>
                <Icon name="clear" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}>
            <Icon name="filter-list" size={24} color={colors.text.onPrimary} />
          </TouchableOpacity>
        </View>

        {/* Botón de búsqueda específica */}
        <TouchableOpacity
          style={styles.searchSpecificButton}
          onPress={() => searchPlagaByName(searchText)}
          disabled={loading}>
          <Icon name="search" size={20} color={colors.text.onPrimary} />
          <Text style={styles.searchSpecificText}>
            Búsqueda específica en APIs
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Filtro activo */}
      {selectedCultivo !== '' && (
        <View style={styles.activeFilterContainer}>
          <Text style={styles.activeFilterText}>
            Filtrando por: {selectedCultivo}
          </Text>
          <TouchableOpacity
            onPress={() => setSelectedCultivo('')}
            style={styles.removeFilterButton}>
            <Icon name="close" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de plagas */}
      <FlatList
        data={filteredPlagas}
        renderItem={renderPlagaItem}
        keyExtractor={(item, index) => `${item.nombre}-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bug-report" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>
              {searchText || selectedCultivo 
                ? 'No se encontraron plagas' 
                : 'Cargando plagas...'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchText || selectedCultivo
                ? 'Intenta con otros términos de búsqueda'
                : 'Espera mientras cargamos la información'}
            </Text>
          </View>
        }
      />

      <FilterModal />
    </View>
  );
};

const styles = {
  headerContainer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: typography.body2,
    color: colors.text.onPrimary,
    textAlign: 'center',
    opacity: 0.9,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    fontSize: typography.body1,
    color: colors.text.primary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSpecificButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  searchSpecificText: {
    color: colors.text.onPrimary,
    fontSize: typography.body2,
    marginLeft: spacing.xs,
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  activeFilterText: {
    flex: 1,
    fontSize: typography.body2,
    color: colors.primary,
  },
  removeFilterButton: {
    padding: spacing.xs,
  },
  listContainer: {
    padding: spacing.lg,
  },
  plagaCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...globalStyles.card,
  },
  plagaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  plagaInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  plagaName: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
  },
  plagaScientificName: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  italicText: {
    fontStyle: 'italic',
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  severityText: {
    fontSize: typography.caption,
    color: colors.text.onPrimary,
    fontWeight: '600',
  },
  cultivosSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cultivosText: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  plagaDescription: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  plagaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    fontSize: typography.body2,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.h6,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    maxHeight: 300,
  },
  cultivoOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cultivoOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  cultivoOptionText: {
    fontSize: typography.body1,
    color: colors.text.primary,
  },
  cultivoOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
};

export default PlagasScreen;
