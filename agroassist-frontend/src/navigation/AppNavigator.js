import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useAuth} from '../services/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';

// Pantallas de autenticación
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecoverPasswordScreen from '../screens/RecoverPasswordScreen';

// Pantallas principales
import HomeScreen from '../screens/HomeScreen';
import PlagasScreen from '../screens/PlagasScreen';
import CultivosScreen from '../screens/CultivosScreen';
import PreciosScreen from '../screens/PreciosScreen';
import PerfilScreen from '../screens/PerfilScreen';

// Pantallas de detalles
import PlagaDetailScreen from '../screens/PlagaDetailScreen';
import CultivoDetailScreen from '../screens/CultivoDetailScreen';
import PlanManejoScreen from '../screens/PlanManejoScreen';

import {colors} from '../styles/globalStyles';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de pestañas principales
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Plagas':
              iconName = 'bug-report';
              break;
            case 'Cultivos':
              iconName = 'eco';
              break;
            case 'Precios':
              iconName = 'attach-money';
              break;
            case 'Perfil':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.text.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Inicio',
          headerTitle: 'AgroAssist IA',
        }}
      />
      <Tab.Screen 
        name="Plagas" 
        component={PlagasScreen} 
        options={{
          title: 'Plagas',
          headerTitle: 'Información de Plagas',
        }}
      />
      <Tab.Screen 
        name="Cultivos" 
        component={CultivosScreen} 
        options={{
          title: 'Cultivos',
          headerTitle: 'Cultivos de Colombia',
        }}
      />
      <Tab.Screen 
        name="Precios" 
        component={PreciosScreen} 
        options={{
          title: 'Precios',
          headerTitle: 'Precios de Mercado',
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen} 
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador de autenticación
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} />
    </Stack.Navigator>
  );
};

// Navegador principal de la aplicación
const AppStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.text.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PlagaDetail" 
        component={PlagaDetailScreen}
        options={{
          title: 'Detalle de Plaga',
          headerBackTitle: 'Volver',
        }}
      />
      <Stack.Screen 
        name="CultivoDetail" 
        component={CultivoDetailScreen}
        options={{
          title: 'Detalle de Cultivo',
          headerBackTitle: 'Volver',
        }}
      />
      <Stack.Screen 
        name="PlanManejo" 
        component={PlanManejoScreen}
        options={{
          title: 'Plan de Manejo',
          headerBackTitle: 'Volver',
        }}
      />
    </Stack.Navigator>
  );
};

// Navegador principal que maneja la autenticación
const AppNavigator = () => {
  const {isAuthenticated, loading} = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <AppStackNavigator /> : <AuthNavigator />;
};

export default AppNavigator;
