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

import globalStyles, {colors, spacing, typography} from '../styles/globalStyles';

const PreciosScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [precios, setPrecios] = useState([]);
  const [filteredPrecios, setFilteredPrecios] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    loadPrecios();
  }, []);

  useEffect(() => {
    filterPrecios();
  }, [searchText, precios, selectedCategory]);

  const loadPrecios = async () => {
    // Simulamos datos de precios del mercado colombiano
    const preciosSimulados = [
      {
        producto: 'Papa criolla',
        categoria: 'Tubérculos',
        precioActual: 2500,
        precioAnterior: 2300,
        unidad: 'kg',
        mercado: 'Corabastos',
        fecha: '2024-01-15',
        tendencia: 'subida',
        calidad: 'Primera',
      },
      {
        producto: 'Papa pastusa',
        categoria: 'Tubérculos',
        precioActual: 1800,
        precioAnterior: 1900,
        unidad: 'kg',
        mercado: 'Corabastos',
        fecha: '2024-01-15',
        tendencia: 'bajada',
        calidad: 'Primera',
      },
      {
        producto: 'Maíz amarillo',
        categoria: 'Cereales',
        precioActual: 1200,
        precioAnterior: 1150,
        unidad: 'kg',
        mercado: 'Corabastos',
        fecha: '2024-01-15',
        tendencia: 'subida',
        calidad: 'Primera',
      },
      {
        producto: 'Arroz paddy',
        categoria: 'Cereales',
        precioActual: 2800,
        precioAnterior: 2750,
        unidad: 'arroba',
        mercado: 'Ibagué',
        fecha: '2024-01-15',
        tendencia: 'estable',
        calidad: 'Primera',
      },
      {
        producto: 'Café pergamino',
        categoria: 'Bebidas',
        precioActual: 8500,
        precioAnterior: 8200,
        unidad: 'kg',
        mercado: 'Manizales',
        fecha: '2024-01-15',
        tendencia: 'subida',
        calidad: 'Excelso',
      },
      {
        producto: 'Plátano hartón',
        categoria: 'Frutas',
        precioActual: 1500,
        precioAnterior: 1400,
        unidad: 'kg',
        mercado: 'Urabá',
        fecha: '2024-01-15',
        tendencia: 'subida',
        calidad: 'Primera',
      },
      {
        producto: 'Banano',
        categoria: 'Frutas',
        precioActual: 2200,
        precioAnterior: 2100,
        unidad: 'caja 18kg',
        mercado: 'Santa Marta',
        fecha: '2024-01-15',
        tendencia: 'subida',
        calidad: 'Exportación',
      },
      {
        producto: 'Tomate chonto',
        categoria: 'Hortalizas',
        precioActual: 3200,
        precioAnterior: 3500,
        unidad: 'kg',
        mercado: 'Corabastos',
        fecha: '2024-01-15',
        tendencia: 'bajada',
        calidad: 'Primera',
      },
      {
        producto: 'Cebolla junca',
        categoria: 'Hortalizas',
        precioActual: 4500,
        precioAnterior: 4300,
        unidad: 'kg',
        mercado: 'Villa de Leyva',
        fecha: '2024-01-15',
        tendencia: 'subida',
        calidad: 'Primera',
      },
      {
        producto: 'Aguacate Hass',
        categoria: 'Frutas',
        precioActual: 5800,
        precioAnterior: 5600,
        unidad: 'kg',
        mercado: 'Rionegro',
        fecha: '2024-01-15',
        tendencia: 'subida',
        calidad: 'Exportación',
      },
    ];

    setPrecios(preciosSimulados);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular actualización de precios
    setTimeout(() => {
      loadPrecios();
      setRefreshing(false);
      Toast.show({
        type: 'success',
        text1: 'Precios actualizados',
        text2: 'Información actualizada correctamente',
      });
    }, 1500);
  };

  const filterPrecios = () => {
    let filtered = precios;

    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(precio => precio.categoria === selectedCategory);
    }

    // Filtrar por texto de búsqueda
    if (searchText) {
      filtered = filtered.filter(precio =>
        precio.producto.toLowerCase().includes(searchText.toLowerCase()) ||
        precio.mercado.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredPrecios(filtered);
  };

  const getTendenciaIcon = (tendencia) => {
    switch (tendencia) {
      case 'subida':
        return 'trending-up';
      case 'bajada':
        return 'trending-down';
      default:
        return 'trending-flat';
    }
  };

  const getTendenciaColor = (tendencia) => {
    switch (tendencia) {
      case 'subida':
        return colors.success;
      case 'bajada':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const calcularCambio = (actual, anterior) => {
    const cambio = ((actual - anterior) / anterior) * 100;
    return cambio.toFixed(1);
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const categorias = ['Todos', 'Tubérculos', 'Cereales', 'Frutas', 'Hortalizas', 'Bebidas'];

  const renderPrecioItem = ({item}) => {
    const cambio = calcularCambio(item.precioActual, item.precioAnterior);
    
    return (
      <TouchableOpacity
        style={styles.precioCard}
        activeOpacity={0.7}
        onPress={() => {
          Toast.show({
            type: 'info',
            text1: 'Función en desarrollo',
            text2: 'Detalles del precio próximamente',
          });
        }}>
        
        <View style={styles.precioHeader}>
          <View style={styles.productoInfo}>
            <Text style={styles.productoNombre}>{item.producto}</Text>
            <Text style={styles.categoriaText}>{item.categoria}</Text>
          </View>
          
          <View style={styles.tendenciaContainer}>
            <Icon 
              name={getTendenciaIcon(item.tendencia)} 
              size={24} 
              color={getTendenciaColor(item.tendencia)} 
            />
            <Text style={[styles.cambioText, { 
              color: getTendenciaColor(item.tendencia) 
            }]}>
              {cambio > 0 ? '+' : ''}{cambio}%
            </Text>
          </View>
        </View>

        <View style={styles.precioBody}>
          <View style={styles.precioActualContainer}>
            <Text style={styles.precioActual}>
              {formatearPrecio(item.precioActual)}
            </Text>
            <Text style={styles.unidadText}>por {item.unidad}</Text>
          </View>

          <View style={styles.precioAnteriorContainer}>
            <Text style={styles.precioAnteriorLabel}>Anterior:</Text>
            <Text style={styles.precioAnterior}>
              {formatearPrecio(item.precioAnterior)}
            </Text>
          </View>
        </View>

        <View style={styles.precioFooter}>
          <View style={styles.mercadoInfo}>
            <Icon name="place" size={16} color={colors.text.secondary} />
            <Text style={styles.mercadoText}>{item.mercado}</Text>
          </View>
          
          <View style={styles.calidadInfo}>
            <Icon name="star" size={16} color={colors.warning} />
            <Text style={styles.calidadText}>{item.calidad}</Text>
          </View>
          
          <Text style={styles.fechaText}>{item.fecha}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}>
      {categorias.map((categoria) => (
        <TouchableOpacity
          key={categoria}
          style={[
            styles.categoryButton,
            selectedCategory === categoria && styles.categoryButtonSelected,
          ]}
          onPress={() => setSelectedCategory(categoria)}>
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === categoria && styles.categoryButtonTextSelected,
          ]}>
            {categoria}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderEstadisticas = () => {
    const totalProductos = filteredPrecios.length;
    const subidas = filteredPrecios.filter(p => p.tendencia === 'subida').length;
    const bajadas = filteredPrecios.filter(p => p.tendencia === 'bajada').length;
    const estables = filteredPrecios.filter(p => p.tendencia === 'estable').length;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalProductos}</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{subidas}</Text>
          <Text style={styles.statLabel}>Subidas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.error }]}>{bajadas}</Text>
          <Text style={styles.statLabel}>Bajadas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{estables}</Text>
          <Text style={styles.statLabel}>Estables</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.warning, colors.warningDark]}
        style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Precios de Mercado</Text>
        <Text style={styles.headerSubtitle}>
          Precios actuales de productos agrícolas en Colombia
        </Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto o mercado..."
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

      {/* Filtros de categoría */}
      {renderCategoryFilter()}

      {/* Estadísticas */}
      {renderEstadisticas()}

      {/* Aviso de datos simulados */}
      <View style={styles.avisoContainer}>
        <Icon name="info" size={16} color={colors.info} />
        <Text style={styles.avisoText}>
          Datos simulados para demostración. Los precios reales pueden variar.
        </Text>
      </View>

      {/* Lista de precios */}
      <FlatList
        data={filteredPrecios}
        renderItem={renderPrecioItem}
        keyExtractor={(item, index) => `${item.producto}-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="attach-money" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>
              {searchText || selectedCategory !== 'Todos' 
                ? 'No se encontraron precios' 
                : 'Cargando precios...'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchText || selectedCategory !== 'Todos'
                ? 'Intenta con otros términos de búsqueda'
                : 'Espera mientras cargamos la información'}
            </Text>
          </View>
        }
      />
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
  categoryContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
  },
  categoryContent: {
    paddingHorizontal: spacing.lg,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
  },
  categoryButtonSelected: {
    backgroundColor: colors.warning,
  },
  categoryButtonText: {
    fontSize: typography.body2,
    color: colors.text.secondary,
  },
  categoryButtonTextSelected: {
    color: colors.text.onPrimary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  avisoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  avisoText: {
    fontSize: typography.caption,
    color: colors.info,
    marginLeft: spacing.xs,
    flex: 1,
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  precioCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...globalStyles.card,
  },
  precioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  productoInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  productoNombre: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoriaText: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  tendenciaContainer: {
    alignItems: 'center',
  },
  cambioText: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  precioBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  precioActualContainer: {
    alignItems: 'flex-start',
  },
  precioActual: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    color: colors.primary,
  },
  unidadText: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  precioAnteriorContainer: {
    alignItems: 'flex-end',
  },
  precioAnteriorLabel: {
    fontSize: typography.caption,
    color: colors.text.secondary,
  },
  precioAnterior: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  precioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mercadoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mercadoText: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  calidadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  calidadText: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  fechaText: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    flex: 1,
    textAlign: 'right',
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

export default PreciosScreen;
