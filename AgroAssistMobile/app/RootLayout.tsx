import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { authService } from '../services/authService';

// Importar pantallas
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WeatherScreen } from '../screens/WeatherScreen';

// Importar la pantalla principal existente
import TabLayout from './(tabs)/_layout';

const Stack = createStackNavigator();

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Pantallas para usuarios autenticados
          <>
            <Stack.Screen name="MainTabs" component={TabLayout} />
            <Stack.Screen 
              name="Profile" 
              children={(props) => (
                <ProfileScreen {...props} onLogout={handleLogout} />
              )}
            />
            <Stack.Screen name="Weather" component={WeatherScreen} />
          </>
        ) : (
          // Pantallas de autenticación
          <>
            <Stack.Screen 
              name="Login" 
              children={(props) => (
                <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
              )}
            />
            <Stack.Screen 
              name="Register" 
              children={(props) => (
                <RegisterScreen {...props} onRegisterSuccess={handleLoginSuccess} />
              )}
            />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
