import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';

import {plagasService} from '../services/api';
import globalStyles, {colors, spacing, typography} from '../styles/globalStyles';

const CultivoDetailScreen = ({route, navigation}) => {
  const {cultivo} = route.params;
  const [expandedSections, setExpandedSections] = useState({
    descripcion: true,
    caracteristicas: false,
    siembra: false,
    cuidados: false,
    cosecha: false,
    plagas: false,
  });
  const [plagasRelacionadas, setPlagasRelacionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: cultivo.nombre,
    });
    loadPlagasRelacionadas();
  }, []);

  const loadPlagasRelacionadas = async () => {
    setLoading(true);
    try {
      const response = await plagasService.testSystem();
      if (response.success && response.data.plagas_principales) {
        const plagasFiltradas = response.data.plagas_principales.filter(plaga =>
          plaga.cultivos_afectados?.includes(cultivo.nombre)
        );
        setPlagasRelacionadas(plagasFiltradas);
      }
    } catch (error) {
      console.error('Error loading plagas relacionadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getCultivoExtendedInfo = (cultivo) => {
    const info = {
      'Papa': {
        caracteristicas: [
          'Tubérculo rico en carbohidratos y vitamina C',
          'Crece bien en clima frío (8-20°C)',
          'Requiere suelos bien drenados y ricos en materia orgánica',
          'Ciclo de cultivo: 90-120 días',
          'pH óptimo: 5.0-6.8',
        ],
        siembra: [
          'Preparar el terreno con buena labranza',
          'Distancia de siembra: 30-40 cm entre plantas',
          'Profundidad: 10-15 cm',
          'Época ideal: inicio de temporada seca',
          'Seleccionar semillas certificadas',
        ],
        cuidados: [
          'Riego moderado y constante',
          'Aporque cada 15-20 días',
          'Fertilización balanceada (NPK)',
          'Control de malezas',
          'Monitoreo de plagas y enfermedades',
        ],
        cosecha: [
          'Cosecha a los 90-120 días después de siembra',
          'Indicador: amarillamiento del follaje',
          'Cosechar en tiempo seco',
          'Curado al sol por 2-3 días',
          'Almacenar en lugar fresco y ventilado',
        ],
      },
      'Maíz': {
        caracteristicas: [
          'Cereal rico en carbohidratos y fibra',
          'Adaptado a diversos climas (15-30°C)',
          'Requiere suelos profundos y bien drenados',
          'Ciclo de cultivo: 90-150 días según variedad',
          'pH óptimo: 6.0-7.5',
        ],
        siembra: [
          'Preparación del terreno con surcos',
          'Distancia: 80 cm entre surcos, 25 cm entre plantas',
          'Profundidad: 3-5 cm',
          'Época: inicio de lluvias',
          'Densidad: 50,000-60,000 plantas/ha',
        ],
        cuidados: [
          'Riego abundante durante floración',
          'Fertilización en etapas (siembra, 30 días, 60 días)',
          'Control de malezas hasta los 60 días',
          'Vigilar presencia de cogollero',
          'Protección contra vientos fuertes',
        ],
        cosecha: [
          'Cosecha a los 90-150 días',
          'Mazorcas secas con granos duros',
          'Humedad del grano: 14-16%',
          'Desgrane y secado adicional',
          'Almacenamiento en silos ventilados',
        ],
      },
      'Café': {
        caracteristicas: [
          'Arbusto perenne de zonas montañosas',
          'Altitud óptima: 1,200-2,000 msnm',
          'Temperatura: 17-23°C',
          'Requiere sombra parcial',
          'Precipitación: 1,500-2,000 mm/año',
        ],
        siembra: [
          'Germinador para obtener plántulas',
          'Trasplante a bolsas a los 2-3 meses',
          'Distancia de siembra: 1.5-2 m entre plantas',
          'Época: inicio de lluvias',
          'Preparar hoyo de 40x40x40 cm',
        ],
        cuidados: [
          'Podas de formación y sanitarias',
          'Fertilización orgánica y química',
          'Manejo de sombra (30-40%)',
          'Control de broca y roya',
          'Conservación de suelos en laderas',
        ],
        cosecha: [
          'Primera cosecha a los 2-3 años',
          'Cosecha principal: octubre-enero',
          'Recolectar solo cerezas maduras (rojas)',
          'Beneficio húmedo o seco',
          'Secado hasta 10-12% humedad',
        ],
      },
    };

    return info[cultivo.nombre] || {
      caracteristicas: ['Información en desarrollo'],
      siembra: ['Información en desarrollo'],
      cuidados: ['Información en desarrollo'],
      cosecha: ['Información en desarrollo'],
    };
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

  const extendedInfo = getCultivoExtendedInfo(cultivo);

  const renderExpandableSection = (title, content, icon, sectionKey) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
          activeOpacity={0.7}>
          <View style={styles.sectionTitleContainer}>
            <Icon name={icon} size={20} color={colors.success} />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <Icon 
            name={isExpanded ? 'expand-less' : 'expand-more'} 
            size={24} 
            color={colors.text.secondary} 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            {Array.isArray(content) ? (
              content.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listBullet}>•</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.sectionText}>{content}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderInfoCard = (title, value, icon, color = colors.success) => {
    return (
      <View style={styles.infoCard}>
        <View style={[styles.infoIcon, { backgroundColor: color }]}>
          <Icon name={icon} size={20} color={colors.text.onPrimary} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    );
  };

  const renderPlagaItem = (plaga, index) => (
    <TouchableOpacity
      key={index}
      style={styles.plagaItem}
      onPress={() => navigation.navigate('PlagaDetail', { plaga })}
      activeOpacity={0.7}>
      <View style={styles.plagaInfo}>
        <Icon name="bug-report" size={20} color={colors.error} />
        <Text style={styles.plagaName}>{plaga.nombre}</Text>
      </View>
      <Icon name="arrow-forward" size={16} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={globalStyles.container}>
      {/* Header principal */}
      <LinearGradient
        colors={[colors.success, colors.successDark]}
        style={styles.headerContainer}>
        <View style={styles.cultivoHeader}>
          <View style={styles.cultivoMainInfo}>
            <View style={styles.cultivoTitleRow}>
              <Icon 
                name={getTipoIcon(cultivo.tipo)} 
                size={32} 
                color={colors.text.onPrimary} 
              />
              <Text style={styles.cultivoName}>{cultivo.nombre}</Text>
            </View>
            <Text style={styles.cultivoTipo}>{cultivo.tipo}</Text>
          </View>
          
          <View style={[styles.importanciaBadge, { 
            backgroundColor: getImportanciaColor(cultivo.importancia) 
          }]}>
            <Text style={styles.importanciaText}>{cultivo.importancia}</Text>
          </View>
        </View>

        <Text style={styles.cultivoDescription}>
          {cultivo.descripcion}
        </Text>
      </LinearGradient>

      {/* Información básica */}
      <View style={styles.basicInfoContainer}>
        {renderInfoCard(
          'Temporada de cultivo',
          cultivo.temporada,
          'schedule',
          colors.info
        )}
        
        {renderInfoCard(
          'Región principal',
          cultivo.region,
          'place',
          colors.primary
        )}

        {renderInfoCard(
          'Importancia económica',
          cultivo.importancia,
          'trending-up',
          getImportanciaColor(cultivo.importancia)
        )}
      </View>

      {/* Secciones expandibles */}
      <View style={styles.sectionsContainer}>
        {renderExpandableSection(
          'Descripción general',
          cultivo.descripcion,
          'description',
          'descripcion'
        )}

        {renderExpandableSection(
          'Características',
          extendedInfo.caracteristicas,
          'info',
          'caracteristicas'
        )}

        {renderExpandableSection(
          'Siembra y plantación',
          extendedInfo.siembra,
          'nature',
          'siembra'
        )}

        {renderExpandableSection(
          'Cuidados y manejo',
          extendedInfo.cuidados,
          'build',
          'cuidados'
        )}

        {renderExpandableSection(
          'Cosecha y postcosecha',
          extendedInfo.cosecha,
          'agriculture',
          'cosecha'
        )}

        {/* Sección de plagas */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('plagas')}
            activeOpacity={0.7}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="bug-report" size={20} color={colors.error} />
              <Text style={styles.sectionTitle}>
                Plagas principales ({plagasRelacionadas.length})
              </Text>
            </View>
            <Icon 
              name={expandedSections.plagas ? 'expand-less' : 'expand-more'} 
              size={24} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>

          {expandedSections.plagas && (
            <View style={styles.sectionContent}>
              {plagasRelacionadas.length > 0 ? (
                plagasRelacionadas.map((plaga, index) => 
                  renderPlagaItem(plaga, index)
                )
              ) : (
                <Text style={styles.noPlagasText}>
                  No se encontraron plagas específicas para este cultivo
                </Text>
              )}
              
              <TouchableOpacity
                style={styles.verTodasPlagasButton}
                onPress={() => navigation.navigate('Plagas', { 
                  cultivoFilter: cultivo.nombre 
                })}>
                <Text style={styles.verTodasPlagasText}>
                  Ver todas las plagas relacionadas
                </Text>
                <Icon name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Plagas', { 
            cultivoFilter: cultivo.nombre 
          })}>
          <LinearGradient
            colors={[colors.error, colors.errorDark]}
            style={styles.actionGradient}>
            <Icon name="bug-report" size={24} color={colors.text.onPrimary} />
            <Text style={styles.actionText}>Ver Plagas</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'Función en desarrollo',
              text2: 'Guía de cultivo estará disponible pronto',
            });
          }}>
          <LinearGradient
            colors={[colors.info, colors.infoDark]}
            style={styles.actionGradient}>
            <Icon name="menu-book" size={24} color={colors.text.onPrimary} />
            <Text style={styles.actionText}>Guía de Cultivo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Espaciado final */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = {
  headerContainer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  cultivoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cultivoMainInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  cultivoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cultivoName: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
    marginLeft: spacing.sm,
  },
  cultivoTipo: {
    fontSize: typography.body1,
    color: colors.text.onPrimary,
    opacity: 0.9,
    marginTop: spacing.xs,
    marginLeft: 40, // Alineado con el nombre
  },
  importanciaBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  importanciaText: {
    fontSize: typography.body2,
    color: colors.text.onPrimary,
    fontWeight: '600',
  },
  cultivoDescription: {
    fontSize: typography.body1,
    color: colors.text.onPrimary,
    opacity: 0.9,
    lineHeight: 20,
  },
  basicInfoContainer: {
    padding: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    ...globalStyles.card,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: typography.body1,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  sectionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  sectionContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...globalStyles.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.successLight,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.success,
    marginLeft: spacing.sm,
  },
  sectionContent: {
    padding: spacing.md,
  },
  sectionText: {
    fontSize: typography.body2,
    color: colors.text.primary,
    lineHeight: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  listBullet: {
    fontSize: typography.body1,
    color: colors.success,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: typography.body2,
    color: colors.text.primary,
    lineHeight: 18,
  },
  plagaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  plagaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plagaName: {
    fontSize: typography.body2,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  noPlagasText: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  verTodasPlagasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  verTodasPlagasText: {
    fontSize: typography.body2,
    color: colors.primary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  actionText: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.onPrimary,
    marginLeft: spacing.sm,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
};

export default CultivoDetailScreen;
