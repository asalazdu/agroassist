import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import Toast from 'react-native-toast-message';
import AppNavigator from './navigation/AppNavigator';
import {AuthProvider} from './services/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#4CAF50" 
          translucent={false}
        />
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
