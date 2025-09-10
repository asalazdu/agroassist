import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';

import {useAuth} from '../services/AuthContext';
import globalStyles, {colors, spacing, typography} from '../styles/globalStyles';
import LogoComponent from '../components/LogoComponent';

const PerfilScreen = ({navigation}) => {
  const {user, logout} = useAuth();
  const [notificaciones, setNotificaciones] = useState(true);
  const [ubicacionActiva, setUbicacionActiva] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Toast.show({
                type: 'success',
                text1: 'Sesión cerrada',
                text2: 'Has cerrado sesión correctamente',
              });
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo cerrar la sesión',
              });
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Toast.show({
      type: 'info',
      text1: 'Función en desarrollo',
      text2: 'Edición de perfil disponible pronto',
    });
  };

  const handleChangePassword = () => {
    Toast.show({
      type: 'info',
      text1: 'Función en desarrollo',
      text2: 'Cambio de contraseña disponible pronto',
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Función en desarrollo',
              text2: 'Eliminación de cuenta disponible pronto',
            });
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'edit',
      title: 'Editar Perfil',
      subtitle: 'Actualiza tu información personal',
      onPress: handleEditProfile,
      color: colors.primary,
    },
    {
      icon: 'lock',
      title: 'Cambiar Contraseña',
      subtitle: 'Modifica tu contraseña de acceso',
      onPress: handleChangePassword,
      color: colors.warning,
    },
    {
      icon: 'help',
      title: 'Ayuda y Soporte',
      subtitle: 'Obtén ayuda sobre el uso de la app',
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Función en desarrollo',
          text2: 'Centro de ayuda disponible pronto',
        });
      },
      color: colors.info,
    },
    {
      icon: 'info',
      title: 'Acerca de AgroAssist',
      subtitle: 'Información sobre la aplicación',
      onPress: () => {
        Alert.alert(
          'AgroAssist v1.0.0',
          'Asistente agrícola inteligente para Colombia\n\n' +
          'Desarrollado para ayudar a los agricultores colombianos con información ' +
          'especializada sobre plagas, cultivos y precios de mercado.\n\n' +
          'Utiliza APIs científicas gratuitas como GBIF, iNaturalist y USDA.',
          [{text: 'OK'}]
        );
      },
      color: colors.success,
    },
    {
      icon: 'privacy-tip',
      title: 'Política de Privacidad',
      subtitle: 'Revisa nuestra política de privacidad',
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Función en desarrollo',
          text2: 'Política de privacidad disponible pronto',
        });
      },
      color: colors.primary,
    },
  ];

  const settingsItems = [
    {
      icon: 'notifications',
      title: 'Notificaciones',
      subtitle: 'Recibe alertas sobre plagas y precios',
      value: notificaciones,
      onToggle: setNotificaciones,
    },
    {
      icon: 'location-on',
      title: 'Ubicación',
      subtitle: 'Información personalizada por región',
      value: ubicacionActiva,
      onToggle: setUbicacionActiva,
    },
    {
      icon: 'dark-mode',
      title: 'Modo Oscuro',
      subtitle: 'Cambia el tema de la aplicación',
      value: modoOscuro,
      onToggle: (value) => {
        setModoOscuro(value);
        Toast.show({
          type: 'info',
          text1: 'Función en desarrollo',
          text2: 'Modo oscuro disponible pronto',
        });
      },
    },
  ];

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={20} color={colors.text.onPrimary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Icon name="arrow-forward-ios" size={16} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  const renderSettingItem = (item, index) => (
    <View key={index} style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary }]}>
          <Icon name={item.icon} size={20} color={colors.text.onPrimary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Switch
        value={item.value}
        onValueChange={item.onToggle}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={item.value ? colors.primary : colors.text.secondary}
      />
    </View>
  );

  return (
    <ScrollView style={globalStyles.container}>
      {/* Header con información del usuario */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerContainer}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <LogoComponent size={80} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@ejemplo.com'}</Text>
            <Text style={styles.userType}>Agricultor Colombiano</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Estadísticas del usuario */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Consultas realizadas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Cultivos seguidos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Plagas consultadas</Text>
        </View>
      </View>

      {/* Configuraciones */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Configuraciones</Text>
        <View style={styles.settingsContainer}>
          {settingsItems.map(renderSettingItem)}
        </View>
      </View>

      {/* Menú de opciones */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Cuenta y Soporte</Text>
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      {/* Acciones peligrosas */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Acciones de Cuenta</Text>
        <View style={styles.dangerContainer}>
          <TouchableOpacity
            style={styles.dangerItem}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: colors.error }]}>
              <Icon name="delete-forever" size={20} color={colors.text.onPrimary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.error }]}>
                Eliminar Cuenta
              </Text>
              <Text style={styles.menuSubtitle}>
                Elimina permanentemente tu cuenta
              </Text>
            </View>
            <Icon name="arrow-forward-ios" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Botón de cerrar sesión */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <LinearGradient
            colors={[colors.error, colors.errorDark]}
            style={styles.logoutGradient}>
            <Icon name="logout" size={24} color={colors.text.onPrimary} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Información de la app */}
      <View style={styles.appInfoContainer}>
        <Text style={styles.appVersion}>AgroAssist v1.0.0</Text>
        <Text style={styles.appDescription}>
          Asistente agrícola inteligente para Colombia
        </Text>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
  },
  userEmail: {
    fontSize: typography.body1,
    color: colors.text.onPrimary,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  userType: {
    fontSize: typography.body2,
    color: colors.text.onPrimary,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  settingsContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  settingSubtitle: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuSubtitle: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  dangerContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  logoutContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoutButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  logoutText: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.onPrimary,
    marginLeft: spacing.sm,
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  appVersion: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  appDescription: {
    fontSize: typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
};

export default PerfilScreen;
