# 🌱 AgroAssist - Guía de Simulación

¡Bienvenido a AgroAssist! Aquí tienes **3 formas diferentes** de probar la aplicación sin necesidad de configurar un entorno de desarrollo móvil completo.

## 📱 Opciones de Simulación

### 1. 🌐 Demo Web Instantáneo (RECOMENDADO)

La forma más rápida de ver AgroAssist funcionando en tu navegador:

```bash
# Opción A: Con Python (recomendado)
cd "agroassist-frontend"
python demo-server.py
```

```bash
# Opción B: Abrir directamente en el navegador
# Simplemente abre el archivo web-demo.html en tu navegador favorito
```

**✅ Ventajas:**
- ✨ Funciona inmediatamente
- 🎨 Interfaz completa de AgroAssist
- 📱 Diseño responsive (funciona en móvil y escritorio)
- 🐛 Catálogo de plagas colombianas
- 🌾 Información de cultivos
- 💰 Precios de referencia
- 👤 Perfil de usuario

### 2. 📋 Demo en Expo Snack (Online)

Prueba AgroAssist en el playground de React Native:

1. Ve a [snack.expo.dev](https://snack.expo.dev)
2. Copia el contenido del archivo `expo-demo.js`
3. Pégalo en el editor de Expo Snack
4. ¡Disfruta de la preview instantánea!

**✅ Ventajas:**
- 🚀 No requiere instalación
- 📱 Preview móvil real
- ⚡ Funciona en cualquier dispositivo
- 🔄 Editable en tiempo real

### 3. 💻 React Native completo (Para desarrolladores)

Si quieres probar la aplicación React Native completa:

#### Prerrequisitos:
- Node.js 16+ instalado
- Android Studio (para emulador Android) O iOS Simulator (para Mac)

#### Instalación:
```bash
cd "agroassist-frontend"

# Instalar dependencias
npm install --legacy-peer-deps

# Para Android
npm run android

# Para iOS (solo en Mac)
npm run ios

# Para ejecutar Metro Bundler
npm start
```

## 🚀 Funcionalidades Principales

### 🐛 Identificación de Plagas
- Catálogo de plagas comunes en Colombia
- Información detallada sobre cada plaga
- Métodos de control recomendados
- Imágenes y descripciones científicas

### 🌾 Información de Cultivos
- Cultivos principales de Colombia (café, maíz, plátano, arroz)
- Épocas de siembra recomendadas
- Regiones productoras
- Características específicas de cada cultivo

### 💰 Precios de Mercado
- Precios de referencia en pesos colombianos
- Información de mercados mayoristas
- Actualización basada en datos reales
- Diferentes unidades de medida

### 👤 Perfil de Usuario
- Gestión de información personal
- Configuración de notificaciones
- Estadísticas de uso
- Historial de consultas

## 🎨 Características de Diseño

- 📱 **Responsive Design:** Se adapta a cualquier tamaño de pantalla
- 🎨 **Colores Verdes:** Tema agrícola con gradientes atractivos
- 🧭 **Navegación Intuitiva:** Tabs inferiores fáciles de usar
- 💫 **Animaciones Suaves:** Transiciones y efectos visuales
- 🔍 **Modales Informativos:** Detalles completos de plagas
- 📊 **Cards Organizadas:** Información bien estructurada

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React Native:** Framework móvil multiplataforma
- **React Navigation:** Navegación entre pantallas
- **AsyncStorage:** Almacenamiento local persistente
- **React Native Vector Icons:** Iconografía moderna

### Backend
- **Node.js + Express:** Servidor API REST
- **MySQL:** Base de datos para usuarios
- **JWT:** Autenticación segura
- **APIs Externas:** GBIF, iNaturalist, USDA

### Web Demo
- **HTML5 + CSS3:** Estructura y estilos modernos
- **JavaScript Vanilla:** Interactividad sin frameworks
- **CSS Grid/Flexbox:** Layouts responsivos
- **Python SimpleHTTPServer:** Servidor local opcional

## 📈 Arquitectura del Sistema

```
AgroAssist/
├── agroassist-backend/          # API REST en Node.js
│   ├── src/application/         # Casos de uso
│   ├── src/domain/             # Entidades del dominio
│   ├── src/infrastructure/     # Servicios externos
│   └── src/interfaces/         # Controladores y rutas
├── agroassist-frontend/        # App React Native
│   ├── src/screens/           # Pantallas de la app
│   ├── src/components/        # Componentes reutilizables
│   ├── src/navigation/        # Configuración de navegación
│   ├── src/services/          # Servicios API
│   ├── web-demo.html          # Demo web instantáneo
│   ├── expo-demo.js           # Demo para Expo Snack
│   └── demo-server.py         # Servidor local
└── guia del proyecto/         # Base de datos y documentación
```

## 🌍 APIs Integradas

### 🇨🇴 APIs Colombianas
- **Servicio Agrícola Colombiano:** Datos locales de plagas y cultivos
- **Precios Mayoristas:** Información de mercados nacionales

### 🌎 APIs Internacionales
- **GBIF:** Base de datos global de biodiversidad
- **iNaturalist:** Comunidad científica mundial
- **USDA:** Departamento de Agricultura de Estados Unidos

## 🎯 Casos de Uso Principales

1. **🔍 Consulta de Plagas:**
   - Usuario selecciona plaga del catálogo
   - Sistema muestra información detallada
   - Incluye métodos de control específicos

2. **📊 Consulta de Precios:**
   - Usuario revisa precios actuales
   - Información por unidad de medida
   - Referencia de mercados mayoristas

3. **🌱 Información de Cultivos:**
   - Usuario explora cultivos colombianos
   - Detalles de siembra y regiones
   - Características específicas

4. **👤 Gestión de Perfil:**
   - Usuario configura sus preferencias
   - Mantiene historial de consultas
   - Personaliza notificaciones

## 📞 Soporte y Contacto

- 📧 **Email:** soporte@agroassist.co
- 🌐 **Web:** www.agroassist.co
- 📱 **WhatsApp:** +57 300 123 4567
- 🐦 **Twitter:** @AgroAssistCO

---

### 🎉 ¡Disfruta probando AgroAssist!

Esperamos que esta aplicación te sea útil para la gestión agrícola. Si tienes sugerencias o encuentras algún problema, no dudes en contactarnos.

**Desarrollado con ❤️ para la agricultura colombiana 🇨🇴**
