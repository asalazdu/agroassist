import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './package.json';

// Configuración para React Native Web
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('app-root'),
});
