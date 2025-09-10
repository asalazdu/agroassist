import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';

import {useAuth} from '../services/AuthContext';
import {plagasService} from '../services/api';
import globalStyles, {colors, spacing, typography} from '../styles/globalStyles';
import LogoComponent from '../components/LogoComponent';

const HomeScreen = ({navigation}) => {
  const {user} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const result = await plagasService.testSystem();
      if (result.success) {
        setSystemInfo(result.data);
      }
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSystemInfo();
    setRefreshing(false);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'plagas':
        navigation.navigate('Plagas');
        break;
      case 'cultivos':
        navigation.navigate('Cultivos');
        break;
      case 'precios':
        navigation.navigate('Precios');
        break;
      case 'buscar_plaga':
        navigation.navigate('Plagas', { screen: 'BuscarPlaga' });
        break;
      default:
        Toast.show({
          type: 'info',
          text1: 'Función en desarrollo',
          text2: 'Esta característica estará disponible pronto',
        });
    }
  };

  const quickActions = [
    {
      id: 'plagas',
      title: 'Consultar Plagas',
      subtitle: 'Información de plagas colombianas',
      icon: 'bug-report',
      color: colors.error,
    },
    {
      id: 'cultivos',
      title: 'Ver Cultivos',
      subtitle: 'Cultivos principales de Colombia',
      icon: 'eco',
      color: colors.success,
    },
    {
      id: 'precios',
      title: 'Precios de Mercado',
      subtitle: 'Precios actuales en Colombia',
      icon: 'attach-money',
      color: colors.warning,
    },
    {
      id: 'buscar_plaga',
      title: 'Búsqueda Rápida',
      subtitle: 'Buscar plaga específica',
      icon: 'search',
      color: colors.info,
    },
  ];

  const systemStats = systemInfo ? [
    {
      label: 'Cultivos Disponibles',
      value: systemInfo.cultivos_soportados?.length || 0,
      icon: 'eco',
    },
    {
      label: 'Plagas Principales',
      value: systemInfo.plagas_principales?.length || 0,
      icon: 'bug-report',
    },
    {
      label: 'Sistema',
      value: 'Activo',
      icon: 'check-circle',
    },
  ] : [];

  return (
    <ScrollView
      style={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      
      {/* Header con saludo */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              ¡Hola, {user?.name || 'Agricultor'}!
            </Text>
            <Text style={styles.welcomeSubtext}>
              Bienvenido a tu asistente agrícola inteligente
            </Text>
          </View>
          <LogoComponent size={60} />
        </View>
      </LinearGradient>

      {/* Estadísticas del sistema */}
      {systemStats.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estado del Sistema</Text>
          <View style={styles.statsGrid}>
            {systemStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Icon 
                  name={stat.icon} 
                  size={24} 
                  color={colors.primary} 
                  style={styles.statIcon}
                />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Acciones rápidas */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => handleQuickAction(action.id)}
              activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Icon name={action.icon} size={28} color={colors.text.onPrimary} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Información destacada */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>¿Sabías que?</Text>
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color={colors.info} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Sistema Especializado</Text>
            <Text style={styles.infoDescription}>
              AgroAssist está específicamente diseñado para la agricultura colombiana, 
              con información de cultivos y plagas adaptada a nuestras condiciones.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Icon name="public" size={24} color={colors.success} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>APIs Gratuitas</Text>
            <Text style={styles.infoDescription}>
              Utilizamos APIs científicas gratuitas como GBIF, iNaturalist y USDA 
              para brindarte información precisa y actualizada.
            </Text>
          </View>
        </View>
      </View>

      {/* Espaciado final */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = {
  headerContainer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
  },
  welcomeSubtext: {
    fontSize: typography.body1,
    color: colors.text.onPrimary,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  statsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: 12,
    alignItems: 'center',
    ...globalStyles.card,
    margin: 0,
  },
  statIcon: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  quickActionsContainer: {
    padding: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...globalStyles.card,
    margin: 0,
    marginBottom: spacing.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  infoContainer: {
    padding: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    ...globalStyles.card,
    margin: 0,
    marginBottom: spacing.md,
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
  bottomSpacing: {
    height: spacing.xl,
  },
};

export default HomeScreen;
