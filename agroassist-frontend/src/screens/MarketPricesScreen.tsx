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
import { MarketPrice, MarketAnalysis } from '../types';
import marketPriceService from '../services/marketPriceService';

const MarketPricesScreen: React.FC = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedRegion, setSelectedRegion] = useState('Todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Todos', ...marketPriceService.getCategories()];
  const regions = ['Todas', ...marketPriceService.getRegions()];

  useEffect(() => {
    loadPrices();
  }, []);

  useEffect(() => {
    filterPrices();
  }, [searchQuery, selectedCategory, selectedRegion, prices]);

  const loadPrices = async () => {
    try {
      setIsLoading(true);
      const pricesData = await marketPriceService.getAllPrices();
      setPrices(pricesData);
      setFilteredPrices(pricesData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los precios');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPrices = () => {
    let filtered = prices;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(price =>
        price.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        price.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(price => price.category === selectedCategory);
    }

    // Filtrar por región
    if (selectedRegion !== 'Todas') {
      filtered = filtered.filter(price => price.region === selectedRegion);
    }

    setFilteredPrices(filtered);
  };

  const handleProductPress = async (productName: string) => {
    try {
      setIsLoading(true);
      setSelectedProduct(productName);
      const analysisData = await marketPriceService.getMarketAnalysis(productName);
      setAnalysis(analysisData);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener el análisis del producto');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceChangeColor = (changePercent: number) => {
    if (changePercent > 0) return '#4CAF50';
    if (changePercent < 0) return '#F44336';
    return '#757575';
  };

  const getPriceChangeIcon = (changePercent: number) => {
    if (changePercent > 0) return '📈';
    if (changePercent < 0) return '📉';
    return '➡️';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'alcista': return '📈';
      case 'bajista': return '📉';
      case 'estable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'alcista': return '#4CAF50';
      case 'bajista': return '#F44336';
      case 'estable': return '#FF9800';
      default: return '#757575';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderPriceCard = (price: MarketPrice) => (
    <TouchableOpacity
      key={price.id}
      style={styles.priceCard}
      onPress={() => handleProductPress(price.productName)}
    >
      <View style={styles.priceHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{price.productName}</Text>
          <Text style={styles.category}>{price.category}</Text>
        </View>
        <View style={styles.qualityBadge}>
          <Text style={styles.qualityText}>{price.quality}</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.currentPrice}>
          {formatPrice(price.currentPrice)}/{price.unit}
        </Text>
        <View style={[styles.changeContainer, { backgroundColor: getPriceChangeColor(price.priceChangePercent) }]}>
          <Text style={styles.changeText}>
            {getPriceChangeIcon(price.priceChangePercent)} {price.priceChangePercent > 0 ? '+' : ''}{price.priceChangePercent.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.marketInfo}>
        <Text style={styles.marketText}>📍 {price.market} - {price.region}</Text>
        <Text style={styles.dateText}>📅 {price.date}</Text>
      </View>

      {price.priceChange !== 0 && (
        <Text style={styles.priceChangeText}>
          Cambio: {formatPrice(Math.abs(price.priceChange))} {price.priceChange > 0 ? 'más' : 'menos'} que ayer
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderFilterButtons = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterButton,
              selectedCategory === category && styles.activeFilterButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedCategory === category && styles.activeFilterButtonText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionScroll}>
        {regions.map(region => (
          <TouchableOpacity
            key={region}
            style={[
              styles.filterButton,
              selectedRegion === region && styles.activeFilterButton
            ]}
            onPress={() => setSelectedRegion(region)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedRegion === region && styles.activeFilterButtonText
            ]}>
              {region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAnalysisModal = () => (
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

          {analysis && (
            <>
              <Text style={styles.modalTitle}>📊 Análisis: {analysis.product}</Text>
              
              <View style={styles.analysisCard}>
                <Text style={styles.analysisSectionTitle}>Precio Promedio</Text>
                <Text style={styles.averagePrice}>{formatPrice(analysis.averagePrice)}</Text>
              </View>

              <View style={styles.analysisCard}>
                <Text style={styles.analysisSectionTitle}>Tendencia del Mercado</Text>
                <View style={styles.trendContainer}>
                  <Text style={[styles.trendText, { color: getTrendColor(analysis.trend) }]}>
                    {getTrendIcon(analysis.trend)} {analysis.trend.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.analysisCard}>
                <Text style={styles.analysisSectionTitle}>Pronóstico</Text>
                <Text style={styles.forecastText}>{analysis.forecast}</Text>
              </View>

              <View style={styles.analysisCard}>
                <Text style={styles.analysisSectionTitle}>Recomendaciones</Text>
                {analysis.recommendations.map((recommendation, index) => (
                  <Text key={index} style={styles.recommendationText}>
                    • {recommendation}
                  </Text>
                ))}
              </View>

              <View style={styles.analysisCard}>
                <Text style={styles.analysisSectionTitle}>Historial de Precios (30 días)</Text>
                <View style={styles.priceHistoryContainer}>
                  {analysis.priceHistory.slice(-7).map((history, index) => (
                    <View key={index} style={styles.historyItem}>
                      <Text style={styles.historyDate}>{history.date}</Text>
                      <Text style={styles.historyPrice}>{formatPrice(history.price)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Precios del Mercado</Text>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            {showFilters ? '🔼 Ocultar Filtros' : '🔽 Mostrar Filtros'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {showFilters && renderFilterButtons()}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Mostrando {filteredPrices.length} de {prices.length} productos
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : (
          filteredPrices.map(renderPriceCard)
        )}
      </ScrollView>

      {renderAnalysisModal()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  filterToggle: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  filterToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryScroll: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  regionScroll: {
    paddingHorizontal: 15,
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  priceCard: {
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
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  qualityBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  qualityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  changeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  changeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  marketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  marketText: {
    fontSize: 12,
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  priceChangeText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
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
    marginBottom: 20,
  },
  analysisCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  averagePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  trendContainer: {
    alignItems: 'center',
  },
  trendText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  forecastText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 5,
  },
  priceHistoryContainer: {
    marginTop: 10,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  historyPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B5E20',
  },
});

export default MarketPricesScreen;
