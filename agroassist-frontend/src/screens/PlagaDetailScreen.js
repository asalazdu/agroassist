import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';

import {plagasService} from '../services/api';
import globalStyles, {colors, spacing, typography} from '../styles/globalStyles';

const PlagaDetailScreen = ({route, navigation}) => {
  const {plaga: initialPlaga, fromSearch = false} = route.params;
  const [plaga, setPlaga] = useState(initialPlaga);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    descripcion: true,
    sintomas: false,
    control: false,
    prevencion: false,
    cultivos: false,
  });

  useEffect(() => {
    if (fromSearch) {
      // Si viene de búsqueda, ya tenemos la información completa
      navigation.setOptions({
        title: plaga.nombre || 'Detalle de Plaga',
      });
    } else {
      // Si es de la lista, obtener información detallada
      loadDetailedInfo();
    }
  }, []);

  const loadDetailedInfo = async () => {
    if (!plaga.nombre) return;

    setLoading(true);
    try {
      const response = await plagasService.getPlagaInfo(plaga.nombre);
      if (response.success) {
        setPlaga(response.data);
        navigation.setOptions({
          title: response.data.nombre || 'Detalle de Plaga',
        });
      }
    } catch (error) {
      console.error('Error loading detailed info:', error);
      Toast.show({
        type: 'warning',
        text1: 'Información limitada',
        text2: 'Mostrando información básica disponible',
      });
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

  const handleExternalLink = (url) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudo abrir el enlace',
        });
      });
    }
  };

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

  const renderExpandableSection = (title, content, icon, sectionKey) => {
    const isExpanded = expandedSections[sectionKey];
    
    if (!content || (Array.isArray(content) && content.length === 0)) {
      return null;
    }

    return (
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
          activeOpacity={0.7}>
          <View style={styles.sectionTitleContainer}>
            <Icon name={icon} size={20} color={colors.primary} />
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

  const renderInfoCard = (title, value, icon, color = colors.primary) => {
    if (!value) return null;

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

  return (
    <ScrollView style={globalStyles.container}>
      {/* Header principal */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerContainer}>
        <View style={styles.plagaHeader}>
          <View style={styles.plagaMainInfo}>
            <Text style={styles.plagaName}>{plaga.nombre}</Text>
            {plaga.nombre_cientifico && (
              <Text style={styles.plagaScientificName}>
                <Text style={styles.italicText}>{plaga.nombre_cientifico}</Text>
              </Text>
            )}
          </View>
          
          {plaga.severidad && (
            <View style={[styles.severityBadge, { 
              backgroundColor: getSeverityColor(plaga.severidad) 
            }]}>
              <Text style={styles.severityText}>{plaga.severidad}</Text>
            </View>
          )}
        </View>

        {plaga.tipo && (
          <View style={styles.typeContainer}>
            <Icon name="category" size={16} color={colors.text.onPrimary} />
            <Text style={styles.typeText}>Tipo: {plaga.tipo}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Información básica */}
      <View style={styles.basicInfoContainer}>
        {renderInfoCard(
          'Clasificación',
          plaga.clasificacion || plaga.tipo,
          'category',
          colors.info
        )}
        
        {renderInfoCard(
          'Severidad',
          plaga.severidad,
          'warning',
          getSeverityColor(plaga.severidad)
        )}

        {plaga.origen && renderInfoCard(
          'Origen',
          plaga.origen,
          'public',
          colors.success
        )}

        {plaga.hospedero_principal && renderInfoCard(
          'Hospedero Principal',
          plaga.hospedero_principal,
          'eco',
          colors.warning
        )}
      </View>

      {/* Secciones expandibles */}
      <View style={styles.sectionsContainer}>
        {renderExpandableSection(
          'Descripción',
          plaga.descripcion || plaga.descripcion_corta,
          'description',
          'descripcion'
        )}

        {renderExpandableSection(
          'Síntomas y Daños',
          plaga.sintomas || plaga.danos,
          'healing',
          'sintomas'
        )}

        {renderExpandableSection(
          'Control y Tratamiento',
          plaga.control || plaga.tratamiento,
          'local-hospital',
          'control'
        )}

        {renderExpandableSection(
          'Prevención',
          plaga.prevencion || plaga.manejo_preventivo,
          'security',
          'prevencion'
        )}

        {renderExpandableSection(
          'Cultivos Afectados',
          plaga.cultivos_afectados,
          'eco',
          'cultivos'
        )}
      </View>

      {/* Información científica */}
      {(plaga.taxonomia || plaga.referencias) && (
        <View style={styles.scientificContainer}>
          <Text style={styles.scientificTitle}>Información Científica</Text>
          
          {plaga.taxonomia && (
            <View style={styles.taxonomyContainer}>
              <Text style={styles.taxonomyTitle}>Taxonomía:</Text>
              {Object.entries(plaga.taxonomia).map(([key, value]) => (
                <View key={key} style={styles.taxonomyItem}>
                  <Text style={styles.taxonomyKey}>{key}:</Text>
                  <Text style={styles.taxonomyValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {plaga.referencias && plaga.referencias.length > 0 && (
            <View style={styles.referencesContainer}>
              <Text style={styles.referencesTitle}>Referencias:</Text>
              {plaga.referencias.map((ref, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.referenceItem}
                  onPress={() => handleExternalLink(ref.url)}
                  activeOpacity={0.7}>
                  <Icon name="link" size={16} color={colors.primary} />
                  <Text style={styles.referenceText} numberOfLines={2}>
                    {ref.titulo || ref.fuente || ref.url}
                  </Text>
                  <Icon name="open-in-new" size={16} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Plan de manejo (botón para navegar) */}
      {plaga.nombre && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.planManejoButton}
            onPress={() => navigation.navigate('PlanManejo', { plaga })}
            activeOpacity={0.7}>
            <LinearGradient
              colors={[colors.success, colors.successDark]}
              style={styles.planManejoGradient}>
              <Icon name="assignment" size={24} color={colors.text.onPrimary} />
              <Text style={styles.planManejoText}>
                Generar Plan de Manejo
              </Text>
              <Icon name="arrow-forward" size={20} color={colors.text.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

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
  plagaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  plagaMainInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  plagaName: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
  },
  plagaScientificName: {
    fontSize: typography.body1,
    color: colors.text.onPrimary,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  italicText: {
    fontStyle: 'italic',
  },
  severityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  severityText: {
    fontSize: typography.body2,
    color: colors.text.onPrimary,
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  typeText: {
    fontSize: typography.body2,
    color: colors.text.onPrimary,
    marginLeft: spacing.xs,
    opacity: 0.9,
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
    backgroundColor: colors.primaryLight,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.primary,
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
    color: colors.primary,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: typography.body2,
    color: colors.text.primary,
    lineHeight: 18,
  },
  scientificContainer: {
    padding: spacing.lg,
  },
  scientificTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  taxonomyContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...globalStyles.card,
  },
  taxonomyTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  taxonomyItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  taxonomyKey: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    fontWeight: '600',
    minWidth: 80,
  },
  taxonomyValue: {
    fontSize: typography.body2,
    color: colors.text.primary,
    flex: 1,
  },
  referencesContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    ...globalStyles.card,
  },
  referencesTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  referenceText: {
    flex: 1,
    fontSize: typography.body2,
    color: colors.primary,
    marginHorizontal: spacing.sm,
  },
  actionContainer: {
    padding: spacing.lg,
  },
  planManejoButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  planManejoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  planManejoText: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.onPrimary,
    marginHorizontal: spacing.sm,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
};

export default PlagaDetailScreen;
