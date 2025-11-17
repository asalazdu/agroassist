import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Text, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';

// Importar servicios
import authService from './src/services/authService';

// Importar componentes
import FloatingChatButton from './src/components/FloatingChatButton';
import ChatbotModal from './src/components/ChatbotModal';

// Importar pantallas
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import CropsScreen from './src/screens/CropsScreen';
import PestsScreenWithAI from './src/screens/PestsScreenWithAI'; // Nueva pantalla con análisis de IA
import MarketPricesScreen from './src/screens/MarketPricesScreen';
import RecommendationsScreen from './src/screens/RecommendationsScreen';
import ForumScreen from './src/screens/ForumScreen'; // Foro Comunitario

// Importar tipos
import { RootStackParamList, User } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Wrapper para agregar padding superior por el menú
const ScreenWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 90, backgroundColor: '#f5f5f5' }}>
      {children}
    </SafeAreaView>
  );
}

// Navegador de autenticación con Welcome
function AuthStack({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#f5f5f5' }
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => <RegisterScreen {...props} onRegisterSuccess={onLoginSuccess} />}
      </Stack.Screen>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Navegador principal con tabs
function MainTabs({ onLogout }: { onLogout: () => void }) {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          position: 'absolute',
          top: 40,
          left: 0,
          right: 0,
          height: 50,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: size ? size - 4 : 20, color }}>🏠</Text>
            </View>
          ),
          headerTitle: '🌱 AgroAssist',
        }}
      >
        {(props) => <ScreenWrapper><HomeScreen {...props} /></ScreenWrapper>}
      </Tab.Screen>
      <Tab.Screen 
        name="Weather" 
        options={{
          title: 'Clima',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: size ? size - 4 : 20, color }}>🌤️</Text>
            </View>
          ),
          headerTitle: 'Clima Agrícola',
        }}
      >
        {() => <ScreenWrapper><WeatherScreen /></ScreenWrapper>}
      </Tab.Screen>
      <Tab.Screen 
        name="Crops" 
        options={{
          title: 'Cultivos',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: size ? size - 4 : 20, color }}>🌱</Text>
            </View>
          ),
          headerTitle: 'Mis Cultivos',
        }}
      >
        {() => <ScreenWrapper><CropsScreen /></ScreenWrapper>}
      </Tab.Screen>
      <Tab.Screen 
        name="Forum" 
        options={{
          title: 'Foro',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: size ? size - 4 : 20, color }}>💬</Text>
            </View>
          ),
          headerTitle: 'Foro Comunitario',
          headerShown: false,
        }}
      >
        {() => <ScreenWrapper><ForumScreen /></ScreenWrapper>}
      </Tab.Screen>
      <Tab.Screen 
        name="Pests" 
        options={{
          title: 'Plagas',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: size ? size - 4 : 20, color }}>🐛</Text>
            </View>
          ),
          headerTitle: 'Control de Plagas con IA',
        }}
      >
        {() => <ScreenWrapper><PestsScreenWithAI /></ScreenWrapper>}
      </Tab.Screen>
      <Tab.Screen 
        name="MarketPrices" 
        options={{
          title: 'Precios',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: size ? size - 4 : 20, color }}>💰</Text>
            </View>
          ),
          headerTitle: 'Precios del Mercado',
        }}
      >
        {() => <ScreenWrapper><MarketPricesScreen /></ScreenWrapper>}
      </Tab.Screen>
      <Tab.Screen 
        name="Recommendations" 
        options={{
          title: 'Consejos',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: size ? size - 4 : 20, color }}>💡</Text>
            </View>
          ),
          headerTitle: 'Recomendaciones',
        }}
      >
        {() => <ScreenWrapper><RecommendationsScreen /></ScreenWrapper>}
      </Tab.Screen>
      <Tab.Screen 
        name="Profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: size ? size - 4 : 20, color }}>👤</Text>
            </View>
          ),
          headerTitle: 'Mi Perfil',
        }}
      >
        {() => <ScreenWrapper><ProfileScreen onLogout={onLogout} /></ScreenWrapper>}
      </Tab.Screen>
    </Tab.Navigator>
    
    {/* Chatbot flotante */}
    <FloatingChatButton onPress={() => setIsChatbotVisible(true)} />
    <ChatbotModal
      visible={isChatbotVisible}
      onClose={() => setIsChatbotVisible(false)}
    />
    </>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Verificar si es el primer lanzamiento
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }

      // Verificar autenticación
      const token = await authService.getStoredToken();
      const userData = await authService.getStoredUser();
      
      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    const userData = await authService.getStoredUser();
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
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
    <NavigationContainer>
      <StatusBar style="auto" />
      {isAuthenticated ? (
        <MainTabs onLogout={handleLogout} />
      ) : (
        <AuthStack onLoginSuccess={handleLoginSuccess} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
