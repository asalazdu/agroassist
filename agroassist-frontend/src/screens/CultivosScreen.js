import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';

import {plagasService} from '../services/api';
import globalStyles, {colors, spacing, typography} from '../styles/globalStyles';

const CultivosScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [cultivos, setCultivos] = useState([]);
  const [filteredCultivos, setFilteredCultivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCultivos();
  }, []);

  useEffect(() => {
    filterCultivos();
  }, [searchText, cultivos]);

  const loadCultivos = async () => {
    setLoading(true);
    try {
      const response = await plagasService.testSystem();
      if (response.success && response.data.cultivos_soportados) {
        // Crear información detallada para cada cultivo
        const cultivosDetallados = response.data.cultivos_soportados.map(cultivo => ({
          nombre: cultivo,
          descripcion: getCultivoDescription(cultivo),
          temporada: getCultivoTemporada(cultivo),
          region: 'Colombia',
          tipo: getCultivoTipo(cultivo),
          importancia: getCultivoImportancia(cultivo),
        }));
        setCultivos(cultivosDetallados);
      }
    } catch (error) {
      console.error('Error loading cultivos:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar la información de cultivos',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCultivos();
    setRefreshing(false);
  };

  const filterCultivos = () => {
    if (!searchText) {
      setFilteredCultivos(cultivos);
    } else {
      const filtered = cultivos.filter(cultivo =>
        cultivo.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
        cultivo.descripcion.toLowerCase().includes(searchText.toLowerCase()) ||
        cultivo.tipo.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCultivos(filtered);
    }
  };

  const getCultivoDescription = (cultivo) => {
    const descriptions = {
      'Papa': 'Tubérculo base de la alimentación colombiana, cultivado principalmente en clima frío.',
      'Maíz': 'Cereal fundamental para la alimentación y la economía rural colombiana.',
      'Arroz': 'Cereal básico en la dieta colombiana, cultivado en diversas regiones del país.',
      'Café': 'Producto emblemático de Colombia, reconocido mundialmente por su calidad.',
      'Plátano': 'Fruto tropical importante para la alimentación y exportación.',
      'Banano': 'Fruta tropical de exportación, principalmente cultivada en Urabá y Magdalena.',
      'Tomate': 'Hortaliza esencial en la cocina colombiana, cultivada en diversas regiones.',
      'Cebolla': 'Hortaliza aromática fundamental en la gastronomía colombiana.',
      'Fríjol': 'Leguminosa rica en proteínas, parte esencial de la dieta colombiana.',
      'Yuca': 'Tubérculo tropical resistente, importante para la seguridad alimentaria.',
      'Aguacate': 'Fruto nutritivo con alta demanda nacional e internacional.',
      'Cacao': 'Materia prima del chocolate, cultivo tradicional colombiano.',
    };
    return descriptions[cultivo] || `Cultivo importante en la agricultura colombiana.`;
  };

  const getCultivoTemporada = (cultivo) => {
    const temporadas = {
      'Papa': 'Todo el año (clima frío)',
      'Maíz': 'Marzo-Julio, Agosto-Diciembre',
      'Arroz': 'Enero-Abril, Agosto-Noviembre',
      'Café': 'Todo el año (cosecha principal Octubre-Enero)',
      'Plátano': 'Todo el año',
      'Banano': 'Todo el año',
      'Tomate': 'Todo el año (según región)',
      'Cebolla': 'Marzo-Julio, Septiembre-Diciembre',
      'Fríjol': 'Marzo-Junio, Agosto-Noviembre',
      'Yuca': 'Todo el año',
      'Aguacate': 'Todo el año (picos según variedad)',
      'Cacao': 'Todo el año (cosecha principal Octubre-Enero)',
    };
    return temporadas[cultivo] || 'Variable según región';
  };

  const getCultivoTipo = (cultivo) => {
    const tipos = {
      'Papa': 'Tubérculo',
      'Maíz': 'Cereal',
      'Arroz': 'Cereal',
      'Café': 'Arbusto/Bebida',
      'Plátano': 'Fruta tropical',
      'Banano': 'Fruta tropical',
      'Tomate': 'Hortaliza',
      'Cebolla': 'Hortaliza',
      'Fríjol': 'Leguminosa',
      'Yuca': 'Tubérculo',
      'Aguacate': 'Fruta',
      'Cacao': 'Arbusto/Industrial',
    };
    return tipos[cultivo] || 'Cultivo agrícola';
  };

  const getCultivoImportancia = (cultivo) => {
    const importantes = ['Café', 'Banano', 'Maíz', 'Arroz', 'Papa'];
    const medios = ['Plátano', 'Cacao', 'Aguacate'];
    
    if (importantes.includes(cultivo)) return 'Alta';
    if (medios.includes(cultivo)) return 'Media-Alta';
    return 'Media';
  };

  const getImportanciaColor = (importancia) => {
    switch (importancia) {
      case 'Alta':
        return colors.error;
      case 'Media-Alta':
        return colors.warning;
      case 'Media':
        return colors.info;
      default:
        return colors.success;
    }
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      'Tubérculo': 'grass',
      'Cereal': 'grain',
      'Arbusto/Bebida': 'local-cafe',
      'Fruta tropical': 'eco',
      'Fruta': 'eco',
      'Hortaliza': 'local-florist',
      'Leguminosa': 'nature',
      'Arbusto/Industrial': 'factory',
    };
    return icons[tipo] || 'eco';
  };

  const handleCultivoPress = (cultivo) => {
    navigation.navigate('CultivoDetail', { cultivo });
  };

  const renderCultivoItem = ({item}) => (
    <TouchableOpacity
      style={styles.cultivoCard}
      onPress={() => handleCultivoPress(item)}
      activeOpacity={0.7}>
      
      <View style={styles.cultivoHeader}>
        <View style={styles.cultivoMainInfo}>
          <View style={styles.cultivoTitleRow}>
            <Icon 
              name={getTipoIcon(item.tipo)} 
              size={24} 
              color={colors.success} 
              style={styles.cultivoIcon}
            />
            <Text style={styles.cultivoName}>{item.nombre}</Text>
          </View>
          <Text style={styles.cultivoTipo}>{item.tipo}</Text>
        </View>

        <View style={[styles.importanciaBadge, { 
          backgroundColor: getImportanciaColor(item.importancia) 
        }]}>
          <Text style={styles.importanciaText}>{item.importancia}</Text>
        </View>
      </View>

      <Text style={styles.cultivoDescription} numberOfLines={2}>
        {item.descripcion}
      </Text>

      <View style={styles.cultivoDetails}>
        <View style={styles.detailItem}>
          <Icon name="schedule" size={16} color={colors.info} />
          <Text style={styles.detailText}>{item.temporada}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Icon name="place" size={16} color={colors.primary} />
          <Text style={styles.detailText}>{item.region}</Text>
        </View>
      </View>

      <View style={styles.cultivoFooter}>
        <TouchableOpacity
          style={styles.plagasButton}
          onPress={() => navigation.navigate('Plagas', { 
            cultivoFilter: item.nombre 
          })}>
          <Icon name="bug-report" size={16} color={colors.error} />
          <Text style={styles.plagasButtonText}>Ver plagas</Text>
        </TouchableOpacity>

        <View style={styles.viewDetailsContainer}>
          <Icon name="arrow-forward" size={20} color={colors.primary} />
          <Text style={styles.viewDetailsText}>Ver detalles</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Cultivos en Colombia</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{cultivos.length}</Text>
          <Text style={styles.statLabel}>Cultivos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {cultivos.filter(c => c.importancia === 'Alta').length}
          </Text>
          <Text style={styles.statLabel}>Prioritarios</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Regiones</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.success, colors.successDark]}
        style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Cultivos Colombianos</Text>
        <Text style={styles.headerSubtitle}>
          Información sobre los principales cultivos del país
        </Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cultivo..."
            placeholderTextColor={colors.text.secondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={styles.clearButton}>
              <Icon name="clear" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Estadísticas */}
      <View style={styles.contentContainer}>
        {renderStatsCard()}

        {/* Lista de cultivos */}
        <FlatList
          data={filteredCultivos}
          renderItem={renderCultivoItem}
          keyExtractor={(item, index) => `${item.nombre}-${index}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="eco" size={64} color={colors.text.secondary} />
              <Text style={styles.emptyTitle}>
                {searchText ? 'No se encontraron cultivos' : 'Cargando cultivos...'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchText
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Espera mientras cargamos la información'}
              </Text>
            </View>
          }
        />
      </View>
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
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
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
  contentContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...globalStyles.card,
  },
  statsTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.success,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  cultivoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...globalStyles.card,
  },
  cultivoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cultivoMainInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  cultivoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cultivoIcon: {
    marginRight: spacing.sm,
  },
  cultivoName: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cultivoTipo: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginLeft: 32, // Alineado con el nombre
  },
  importanciaBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  importanciaText: {
    fontSize: typography.caption,
    color: colors.text.onPrimary,
    fontWeight: '600',
  },
  cultivoDescription: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  cultivoDetails: {
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  cultivoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plagasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  plagasButtonText: {
    fontSize: typography.caption,
    color: colors.error,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
};

export default CultivosScreen;
