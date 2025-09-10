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

import globalStyles, {colors, spacing, typography} from '../styles/globalStyles';

const PlanManejoScreen = ({route, navigation}) => {
  const {plaga} = route.params;
  const [planGenerado, setPlanGenerado] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    identificacion: true,
    prevencion: false,
    control: false,
    monitoreo: false,
    emergencia: false,
  });

  useEffect(() => {
    navigation.setOptions({
      title: `Plan de Manejo - ${plaga.nombre}`,
    });
    generarPlan();
  }, []);

  const generarPlan = () => {
    // Simular generación del plan
    setTimeout(() => {
      setPlanGenerado(true);
      Toast.show({
        type: 'success',
        text1: 'Plan generado',
        text2: 'Plan de manejo creado exitosamente',
      });
    }, 2000);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getPlanManejo = (nombrePlaga) => {
    const planes = {
      'Cogollero del maíz': {
        identificacion: [
          'Revisar plantas jóvenes (15-45 días después de siembra)',
          'Buscar orificios en hojas y presencia de larvas',
          'Identificar excremento granular oscuro',
          'Verificar daños en el cogollo de la planta',
          'Documentar nivel de infestación por lote',
        ],
        prevencion: [
          'Rotación de cultivos con leguminosas',
          'Eliminación de malezas hospederas',
          'Siembra escalonada para romper ciclo',
          'Uso de variedades resistentes o tolerantes',
          'Preparación adecuada del terreno',
          'Control de fechas de siembra según región',
        ],
        control: [
          'Control biológico con Trichogramma pretiosum',
          'Aplicación de Bacillus thuringiensis',
          'Uso de feromonas para captura masiva',
          'Insecticidas selectivos en caso severo',
          'Liberación de enemigos naturales',
          'Aplicación de extractos vegetales (nim)',
        ],
        monitoreo: [
          'Inspección semanal de cultivos',
          'Conteo de larvas por planta',
          'Uso de trampas de feromonas',
          'Registro de daños y niveles poblacionales',
          'Evaluación de efectividad de controles',
          'Monitoreo de enemigos naturales',
        ],
        emergencia: [
          'Aplicación inmediata de insecticida selectivo',
          'Aumento de frecuencia de monitoreo',
          'Contacto con técnico especializado',
          'Evaluación de pérdidas económicas',
          'Implementación de control biológico intensivo',
          'Coordinación con productores vecinos',
        ],
      },
      'Broca del café': {
        identificacion: [
          'Inspeccionar frutos en desarrollo',
          'Buscar orificios circulares en cerezas',
          'Verificar presencia de polvo blanco',
          'Revisar frutos caídos en el suelo',
          'Identificar adultos en vuelo matutino',
        ],
        prevencion: [
          'Cosecha oportuna y completa',
          'Recolección de frutos residuales',
          'Mantenimiento de sombrío adecuado',
          'Manejo integrado de malezas',
          'Calibración de fechas de cosecha',
          'Eliminación de focos de infestación',
        ],
        control: [
          'Control biológico con Beauveria bassiana',
          'Uso de trampas con alcohol metílico',
          'Aplicación de hongos entomopatógenos',
          'Manejo cultural intensivo',
          'Control químico selectivo si es necesario',
          'Re-pase de cosecha sistemático',
        ],
        monitoreo: [
          'Muestreo quincenal de frutos',
          'Evaluación de porcentaje de infestación',
          'Registro de vuelos de adultos',
          'Monitoreo de trampas alcoholadas',
          'Seguimiento a controles aplicados',
          'Evaluación de enemigos naturales',
        ],
        emergencia: [
          'Re-pase inmediato de cosecha',
          'Aplicación masiva de entomopatógenos',
          'Instalación de trampas adicionales',
          'Tratamiento de focos de alta infestación',
          'Coordinación regional de control',
          'Evaluación de impacto económico',
        ],
      },
    };

    return planes[nombrePlaga] || {
      identificacion: [
        'Inspección visual regular de cultivos',
        'Identificación de síntomas específicos',
        'Documentación de niveles de daño',
        'Registro fotográfico de evidencias',
      ],
      prevencion: [
        'Implementar prácticas de manejo integrado',
        'Mantener cultivos saludables',
        'Rotación de cultivos cuando sea posible',
        'Control de malezas hospederas',
      ],
      control: [
        'Aplicar métodos de control biológico',
        'Usar productos selectivos cuando sea necesario',
        'Implementar control cultural',
        'Monitorear efectividad de controles',
      ],
      monitoreo: [
        'Inspecciones regulares del cultivo',
        'Registro de poblaciones de la plaga',
        'Evaluación de daños',
        'Seguimiento a medidas de control',
      ],
      emergencia: [
        'Contactar asistencia técnica especializada',
        'Implementar medidas de control intensivas',
        'Coordinar con productores vecinos',
        'Evaluar impacto económico',
      ],
    };
  };

  const plan = getPlanManejo(plaga.nombre);

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

  const renderExpandableSection = (title, content, icon, sectionKey, color = colors.primary) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={[styles.sectionHeader, { backgroundColor: `${color}20` }]}
          onPress={() => toggleSection(sectionKey)}
          activeOpacity={0.7}>
          <View style={styles.sectionTitleContainer}>
            <Icon name={icon} size={20} color={color} />
            <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
          </View>
          <Icon 
            name={isExpanded ? 'expand-less' : 'expand-more'} 
            size={24} 
            color={colors.text.secondary} 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            {content.map((item, index) => (
              <View key={index} style={styles.planItem}>
                <View style={[styles.planBullet, { backgroundColor: color }]} />
                <Text style={styles.planText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleDescargarPlan = () => {
    Toast.show({
      type: 'info',
      text1: 'Función en desarrollo',
      text2: 'Descarga de planes disponible pronto',
    });
  };

  const handleCompartirPlan = () => {
    Toast.show({
      type: 'info',
      text1: 'Función en desarrollo',
      text2: 'Compartir planes disponible pronto',
    });
  };

  if (!planGenerado) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.loadingContent}>
          <Icon name="auto-awesome" size={64} color={colors.text.onPrimary} />
          <Text style={styles.loadingTitle}>Generando Plan de Manejo</Text>
          <Text style={styles.loadingSubtitle}>
            Creando plan personalizado para {plaga.nombre}
          </Text>
          <View style={styles.loadingDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      {/* Header del plan */}
      <LinearGradient
        colors={[colors.success, colors.successDark]}
        style={styles.headerContainer}>
        <View style={styles.planHeader}>
          <Icon name="assignment" size={32} color={colors.text.onPrimary} />
          <View style={styles.planHeaderText}>
            <Text style={styles.planTitle}>Plan de Manejo Integrado</Text>
            <Text style={styles.planSubtitle}>{plaga.nombre}</Text>
          </View>
        </View>

        {plaga.severidad && (
          <View style={[styles.severityIndicator, { 
            backgroundColor: getSeverityColor(plaga.severidad) 
          }]}>
            <Icon name="warning" size={16} color={colors.text.onPrimary} />
            <Text style={styles.severityText}>
              Nivel de riesgo: {plaga.severidad}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Información general */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color={colors.info} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Sobre este plan</Text>
            <Text style={styles.infoDescription}>
              Plan de manejo integrado basado en prácticas sostenibles y 
              específico para las condiciones de Colombia.
            </Text>
          </View>
        </View>
      </View>

      {/* Secciones del plan */}
      <View style={styles.sectionsContainer}>
        {renderExpandableSection(
          'Identificación y Diagnóstico',
          plan.identificacion,
          'search',
          'identificacion',
          colors.info
        )}

        {renderExpandableSection(
          'Medidas Preventivas',
          plan.prevencion,
          'security',
          'prevencion',
          colors.success
        )}

        {renderExpandableSection(
          'Estrategias de Control',
          plan.control,
          'build',
          'control',
          colors.warning
        )}

        {renderExpandableSection(
          'Monitoreo y Seguimiento',
          plan.monitoreo,
          'visibility',
          'monitoreo',
          colors.primary
        )}

        {renderExpandableSection(
          'Protocolo de Emergencia',
          plan.emergencia,
          'emergency',
          'emergencia',
          colors.error
        )}
      </View>

      {/* Recomendaciones adicionales */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>Recomendaciones Generales</Text>
        <View style={styles.recommendationCard}>
          <Icon name="eco" size={20} color={colors.success} />
          <Text style={styles.recommendationText}>
            Priorizar métodos de control biológico y cultural
          </Text>
        </View>
        <View style={styles.recommendationCard}>
          <Icon name="groups" size={20} color={colors.primary} />
          <Text style={styles.recommendationText}>
            Coordinar acciones con productores vecinos
          </Text>
        </View>
        <View style={styles.recommendationCard}>
          <Icon name="science" size={20} color={colors.warning} />
          <Text style={styles.recommendationText}>
            Consultar asistencia técnica especializada
          </Text>
        </View>
      </View>

      {/* Acciones del plan */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDescargarPlan}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.actionGradient}>
            <Icon name="download" size={20} color={colors.text.onPrimary} />
            <Text style={styles.actionText}>Descargar Plan</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCompartirPlan}>
          <LinearGradient
            colors={[colors.info, colors.infoDark]}
            style={styles.actionGradient}>
            <Icon name="share" size={20} color={colors.text.onPrimary} />
            <Text style={styles.actionText}>Compartir</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Icon name="warning" size={16} color={colors.warning} />
        <Text style={styles.disclaimerText}>
          Este plan es una guía general. Siempre consulte con un técnico 
          especializado antes de implementar medidas de control químico.
        </Text>
      </View>

      {/* Espaciado final */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingContent: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  loadingTitle: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  loadingSubtitle: {
    fontSize: typography.body2,
    color: colors.text.onPrimary,
    textAlign: 'center',
    opacity: 0.9,
    marginTop: spacing.sm,
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.onPrimary,
    marginHorizontal: spacing.xs,
  },
  headerContainer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planHeaderText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  planTitle: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
  },
  planSubtitle: {
    fontSize: typography.body1,
    color: colors.text.onPrimary,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  severityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: typography.body2,
    color: colors.text.onPrimary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  infoContainer: {
    padding: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    ...globalStyles.card,
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoDescription: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    lineHeight: 18,
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
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  sectionContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  planBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  planText: {
    flex: 1,
    fontSize: typography.body2,
    color: colors.text.primary,
    lineHeight: 18,
  },
  recommendationsContainer: {
    padding: spacing.lg,
  },
  recommendationsTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    ...globalStyles.card,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.body2,
    color: colors.text.primary,
    marginLeft: spacing.sm,
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
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  disclaimerText: {
    flex: 1,
    fontSize: typography.caption,
    color: colors.warning,
    marginLeft: spacing.sm,
    lineHeight: 16,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
};

export default PlanManejoScreen;
