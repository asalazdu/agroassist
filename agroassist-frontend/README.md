# AgroAssist Frontend - React Native

Una aplicación móvil React Native para asistencia agrícola inteligente en Colombia.

## 📱 Descripción

AgroAssist Frontend es una aplicación móvil desarrollada en React Native que proporciona:

- **Información de Plagas**: Consulta plagas que afectan cultivos colombianos
- **Cultivos Colombianos**: Información detallada sobre cultivos principales
- **Precios de Mercado**: Precios actuales de productos agrícolas
- **Autenticación**: Sistema de registro y login seguro
- **Planes de Manejo**: Generación de planes integrados para control de plagas

## 🚀 Instalación y Configuración

### Prerrequisitos

1. **Node.js** (versión 14 o superior)
   ```bash
   # Descargar desde: https://nodejs.org/
   node --version
   npm --version
   ```

2. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

3. **Para Android:**
   - Android Studio
   - Android SDK
   - Configurar variables de entorno ANDROID_HOME

4. **Para iOS (solo macOS):**
   - Xcode
   - CocoaPods

### Instalación del Proyecto

1. **Instalar dependencias**
   ```bash
   cd agroassist-frontend
   npm install
   ```

2. **Para iOS (solo macOS)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Configurar el backend**
   - Asegúrate de que el backend esté ejecutándose en `http://localhost:3000`
   - Modifica `src/services/api.js` si el backend está en otra URL

## 🏃‍♂️ Ejecución

### Modo de Desarrollo

1. **Iniciar Metro Bundler**
   ```bash
   npx react-native start
   ```

2. **Ejecutar en Android**
   ```bash
   npx react-native run-android
   ```

3. **Ejecutar en iOS (solo macOS)**
   ```bash
   npx react-native run-ios
   ```

### Problemas Comunes

1. **Error de Metro**: Limpiar caché
   ```bash
   npx react-native start --reset-cache
   ```

2. **Error de Android**: Limpiar proyecto
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. **Error de permisos**: Asegurar permisos en AndroidManifest.xml

## 📦 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── LogoComponent.js # Logo SVG de la aplicación
├── navigation/          # Configuración de navegación
│   └── AppNavigator.js  # Navegadores principal y de tabs
├── screens/            # Pantallas de la aplicación
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── RecoverPasswordScreen.js
│   ├── LoadingScreen.js
│   ├── HomeScreen.js
│   ├── PlagasScreen.js
│   ├── PlagaDetailScreen.js
│   ├── CultivosScreen.js
│   ├── CultivoDetailScreen.js
│   ├── PreciosScreen.js
│   ├── PerfilScreen.js
│   └── PlanManejoScreen.js
├── services/           # Servicios y APIs
│   ├── api.js         # Cliente HTTP para backend
│   └── AuthContext.js # Contexto de autenticación
└── styles/            # Estilos globales
    └── globalStyles.js # Sistema de diseño
```

## 🎨 Sistema de Diseño

### Colores
- **Primary**: Verde #4CAF50 (tema agrícola)
- **Success**: Verde #2E7D32
- **Warning**: Naranja #FF9800
- **Error**: Rojo #F44336
- **Info**: Azul #2196F3

### Tipografía
- Basada en dimensiones responsivas
- Jerarquía consistente (H1-H6, body, caption)

### Componentes
- Cards con elevación
- Botones con gradientes
- Navegación por tabs
- Modales y alertas

## 🔗 APIs Integradas

El frontend se conecta con:

1. **Backend AgroAssist** (`http://localhost:3000`)
   - Autenticación de usuarios
   - Información de plagas colombianas
   - Datos de cultivos
   - Sistema de precios (simulado)

2. **APIs Externas** (a través del backend)
   - GBIF: Información taxonómica
   - iNaturalist: Datos de biodiversidad
   - USDA: Base de datos de plagas

## 📱 Funcionalidades

### Autenticación
- [x] Login con email/contraseña
- [x] Registro de nuevos usuarios
- [x] Recuperación de contraseña
- [x] Persistencia de sesión
- [x] Logout seguro

### Plagas
- [x] Lista de plagas colombianas
- [x] Búsqueda por nombre
- [x] Filtro por cultivo
- [x] Información detallada
- [x] Planes de manejo integrado

### Cultivos
- [x] Lista de cultivos principales
- [x] Información por tipo
- [x] Temporadas de siembra
- [x] Plagas asociadas

### Precios
- [x] Precios de mercado simulados
- [x] Filtros por categoría
- [x] Tendencias de precios
- [x] Información de mercados

### Perfil
- [x] Información del usuario
- [x] Configuraciones
- [x] Estadísticas de uso
- [x] Soporte y ayuda

## 🛠️ Tecnologías Utilizadas

- **React Native** 0.73.x
- **React Navigation** 6.x (Stack + Bottom Tabs)
- **React Native Vector Icons** (MaterialIcons)
- **React Native Linear Gradient**
- **React Native SVG**
- **Axios** para peticiones HTTP
- **AsyncStorage** para persistencia
- **React Native Toast Message**

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```javascript
// En src/services/api.js
const API_BASE_URL = 'http://localhost:3000'; // Cambiar según entorno
```

### Depuración
- Usar React Native Debugger
- Flipper para debugging avanzado
- Console.log para desarrollo

### Testing
```bash
# Ejecutar tests (cuando estén configurados)
npm test
```

## 📄 Scripts Disponibles

```json
{
  "android": "react-native run-android",
  "ios": "react-native run-ios", 
  "start": "react-native start",
  "test": "jest",
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
}
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico:
- Revisar documentación de React Native
- Consultar issues comunes en GitHub
- Verificar configuración de entorno de desarrollo

## 📄 Licencia

Proyecto educativo para demostración de aplicación agrícola.

---

**Desarrollado para ayudar a los agricultores colombianos** 🇨🇴🌱
