import React from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LogoComponent from '../components/LogoComponent';
import globalStyles, {colors, spacing, typography} from '../styles/globalStyles';

const LoadingScreen = () => {
  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
      style={globalStyles.centerContainer}>
      <View style={styles.container}>
        <LogoComponent size={120} />
        <Text style={styles.appTitle}>AgroAssist IA</Text>
        <Text style={styles.appSubtitle}>Tu asistente inteligente</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={colors.text.onPrimary} 
          />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = {
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
    marginTop: spacing.md,
  },
  appSubtitle: {
    fontSize: typography.body1,
    color: colors.text.onPrimary,
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  loadingContainer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.body1,
    color: colors.text.onPrimary,
    marginTop: spacing.md,
    opacity: 0.8,
  },
};

export default LoadingScreen;
