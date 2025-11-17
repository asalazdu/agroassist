# AgroAssist 🌱

Sistema inteligente de asistencia agrícola para Colombia, desarrollado con React Native (Expo) y Node.js.

## 📋 Descripción

AgroAssist es una aplicación móvil que ayuda a agricultores colombianos con:
- **Chatbot inteligente** con IA (OpenAI GPT-4o-mini) especializado en agricultura colombiana
- **Análisis de plagas** mediante imágenes usando OpenAI Vision (GPT-4o)
- **Precios de mercado** actualizados con análisis de tendencias
- **Alertas climáticas** personalizadas por ubicación

## 🚀 Características

### Chatbot Agrícola
- Consultas sobre cultivos colombianos (café, papa, tomate, maíz, etc.)
- Información sobre épocas de siembra y clima ideal
- Consejos de fertilización y control de plagas
- Protocolos de emergencia agrícola
- Contexto geográfico (ubicación del usuario)
- Optimizado con 5 mejoras de prompts

### Análisis de Imágenes
- Detección de plagas y enfermedades mediante IA
- Análisis con OpenAI Vision (gpt-4o)
- Soporte de imágenes hasta 50MB
- Recomendaciones específicas de tratamiento
- Nivel de severidad y confianza del diagnóstico

### Precios de Mercado
- Precios actualizados de productos agrícolas
- Integración con OpenAI para análisis
- Fallback a datos mock en caso de error
- Tendencias de precios (alza, baja, estable)
- Indicadores de cambio porcentual

### Navegación Mejorada
- Tabs de navegación en la parte superior (40px desde arriba)
- Padding superior de 90px en contenido
- Diseño optimizado para mejor experiencia de usuario

## 📁 Estructura del Proyecto

```
agroassist/
├── agroassist-backend/          # Servidor Node.js + Express
│   ├── src/
│   │   ├── application/
│   │   │   └── use-cases/       # Casos de uso (login, chatbot, etc.)
│   │   ├── domain/
│   │   │   └── entities/        # Entidades del dominio
│   │   ├── infrastructure/
│   │   │   ├── database/        # Conexión MySQL
│   │   │   ├── services/        # Servicios (OpenAI, Email, Weather)
│   │   │   └── shared/          # Utilidades (tokens, JWT)
│   │   ├── interfaces/
│   │   │   ├── controllers/     # Controladores de rutas
│   │   │   ├── middlewares/     # Validaciones y JWT
│   │   │   └── routes/          # Rutas de la API
│   │   └── index.js             # Punto de entrada
│   ├── tests/                   # Pruebas unitarias (35 tests)
│   │   ├── services/            # Tests de servicios
│   │   ├── controllers/         # Tests de controllers
│   │   └── setup.js             # Configuración de mocks
│   ├── package.json
│   └── jest.config.js
│
├── agroassist-frontend/         # App React Native (Expo)
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   ├── navigation/          # Navegación (tabs superiores)
│   │   ├── screens/             # Pantallas de la app
│   │   └── services/            # Servicios HTTP
│   ├── tests/                   # Pruebas unitarias (34 tests)
│   │   ├── services/            # Tests de lógica de negocio
│   │   └── setup.ts             # Configuración de mocks
│   ├── package.json
│   ├── jest.config.js
│   └── app.json
│
├── guia del proyecto/
│   └── Script/                  # Scripts SQL
│       ├── BaseDeDatosAgroassist.sql
│       ├── MejorasBaseDatos.sql
│       └── MigracionAlterTables.sql
│
├── TESTING_README.md            # Documentación de pruebas
├── supabase_setup.sql           # Configuración de Supabase
└── start-agroassist.ps1         # Script para iniciar la app
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express** - Servidor web
- **MySQL** - Base de datos
- **Supabase** - Autenticación y base de datos
- **OpenAI API** - GPT-4o-mini (chatbot) y GPT-4o (análisis de imágenes)
- **bcrypt** - Hash de contraseñas
- **JWT** - Autenticación con tokens
- **Nodemon** - Desarrollo con hot-reload
- **Jest** + **Supertest** - Testing (35 pruebas)

### Frontend
- **React Native** + **Expo 54** - Framework de desarrollo
- **React Navigation** - Navegación (Bottom Tabs en superior)
- **Axios** - Peticiones HTTP
- **AsyncStorage** - Almacenamiento local
- **Expo Image Picker** - Selector de imágenes
- **Expo Location** - Geolocalización
- **TypeScript** - Tipado estático
- **Jest** + **ts-jest** - Testing (34 pruebas)

### APIs y Servicios
- **OpenAI** - Chat (gpt-4o-mini) y Vision (gpt-4o)
- **Supabase** - Autenticación y almacenamiento
- **WeatherAPI** - Datos climáticos
- **GBIF, iNaturalist, USDA** - APIs gratuitas de respaldo

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- MySQL (local o remoto)
- Cuenta de Supabase
- OpenAI API Key
- Expo CLI (para desarrollo móvil)

### Backend

```bash
cd agroassist-backend
npm install
```

Crear archivo `.env`:
```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=agroassist
DB_PORT=3306

# API Keys
OPENAI_API_KEY=sk-proj-tu-api-key
WEATHER_API_KEY=tu-weather-api-key

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# JWT
JWT_SECRET=tu-secret-key-segura

# Email (Mailtrap para desarrollo)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=tu-mailtrap-user
MAILTRAP_PASS=tu-mailtrap-pass

# Servidor
APP_PORT=3000
```

Iniciar servidor:
```bash
npm start
# Servidor corriendo en http://localhost:3000
```

### Frontend

```bash
cd agroassist-frontend
npm install
```

Crear archivo `.env`:
```env
EXPO_PUBLIC_WEATHER_API_KEY=tu-weather-api-key
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-tu-api-key
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=tu-supabase-anon-key
```

Iniciar app:
```bash
npm start
# Escanea el QR con Expo Go o presiona 'a' para Android, 'i' para iOS
```

## 🧪 Pruebas

El proyecto cuenta con **69 pruebas unitarias** (100% pasando):

### Backend (35 tests)
```bash
cd agroassist-backend
npm test                  # Ejecutar todas las pruebas
npm run test:watch        # Modo watch
npm run test:coverage     # Con cobertura
```

**Cobertura:**
- HashService: 6 tests (hash y comparación de passwords)
- ChatbotService: 15 tests (clasificación, validación, contexto)
- MarketService: 9 tests (precios mock, estructuras de datos)
- PestController: 5 tests (análisis de imágenes, alertas)

### Frontend (34 tests)
```bash
cd agroassist-frontend
npm test                  # Ejecutar todas las pruebas
npm run test:watch        # Modo watch
npm run test:coverage     # Con cobertura
```

**Cobertura:**
- ChatbotService: 9 tests (validación de mensajes, URLs)
- MarketPriceService: 12 tests (precios, análisis, filtrado)
- PestAnalysisService: 13 tests (imágenes, alertas, coordenadas)

Ver más detalles en [TESTING_README.md](./TESTING_README.md)

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/recover-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Resetear contraseña

### Chatbot
- `POST /api/chatbot/query` - Consulta al chatbot agrícola
  - Body: `{ mensaje, contexto[] }`
  - Headers: `x-token` (JWT)

### Análisis de Plagas
- `POST /api/pests/analyze-image` - Analizar imagen de cultivo
  - Body: `{ imageBase64 }`
  - Response: `{ plaga_detectada, nivel_severidad, confianza, recomendaciones[] }`

- `POST /api/pests/weather-alerts` - Alertas climáticas
  - Body: `{ weatherData, cropType, location }`

### Precios de Mercado
- `GET /api/market/prices` - Obtener todos los precios
- `GET /api/market/prices/:productName` - Precio de producto específico
- `GET /api/market/analysis/:productName` - Análisis de producto

### Clima
- `GET /api/weather/forecast` - Pronóstico del tiempo
  - Query: `lat`, `lon`

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación:

1. **Registro**: `POST /api/auth/register` → Retorna token
2. **Login**: `POST /api/auth/login` → Retorna token
3. **Requests protegidos**: Incluir header `x-token: <jwt-token>`

El middleware `validateJWT` verifica automáticamente los tokens en rutas protegidas.

## 🌍 Base de Conocimiento Agrícola

El chatbot incluye información detallada sobre:

**Cultivos colombianos:**
- Café (arábica)
- Papa criolla
- Tomate
- Maíz
- Plátano hartón
- Aguacate Hass
- Arroz
- Caña de azúcar

**Información por cultivo:**
- Época de siembra ideal
- Clima y altitud recomendados
- Ciclo de cultivo
- Cuidados principales
- Plagas y enfermedades comunes
- Cosecha y postcosecha

## 🚨 Optimizaciones del Chatbot

El chatbot incluye 5 mejoras implementadas:

1. **Sistema de prompts estructurados** - Roles específicos según tipo de consulta
2. **Base de conocimiento de cultivos** - Información detallada precargada
3. **Escenarios climáticos** - Respuestas contextualizadas por clima
4. **Ejemplos de conversación** - Few-shot learning para mejorar respuestas
5. **Protocolos de emergencia** - Detección y respuesta prioritaria

## 📱 Características de la App

### Navegación
- **Tabs superiores** (40px desde arriba)
- Padding superior de 90px en contenido
- Navegación fluida entre secciones

### Pantallas
- **Login/Registro** - Autenticación de usuarios
- **Chatbot** - Asistente agrícola con IA
- **Análisis de Plagas** - Cámara + análisis con IA
- **Precios de Mercado** - Tendencias de precios
- **Perfil** - Información del usuario

### Almacenamiento
- Token JWT guardado en AsyncStorage
- Persistencia de sesión
- Caché de datos locales

## 🔧 Configuración de Supabase

El proyecto usa Supabase para:
- Autenticación de usuarios
- Almacenamiento de datos
- Row Level Security (RLS)

Ejecutar script de setup:
```sql
-- Ver supabase_setup.sql para configuración completa
```

## 📊 Base de Datos MySQL

**Tablas principales:**
- `usuarios` - Información de usuarios
- `cultivos` - Catálogo de cultivos
- `plagas` - Base de datos de plagas
- `precios_mercado` - Histórico de precios
- `consultas_chatbot` - Log de conversaciones

Ver scripts SQL en `guia del proyecto/Script/`

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

**Notas:**
- Seguir convenciones de código existentes
- Agregar pruebas para nuevas funcionalidades
- Actualizar documentación según sea necesario

## 📝 Scripts Útiles

### Iniciar ambos servicios
```powershell
# Windows PowerShell
.\start-agroassist.ps1
```

### Backend
```bash
npm start          # Iniciar servidor
npm test           # Ejecutar pruebas
npm run test:watch # Pruebas en modo watch
```

### Frontend
```bash
npm start          # Iniciar Expo
npm test           # Ejecutar pruebas
npm run android    # Abrir en Android
npm run ios        # Abrir en iOS
npm run web        # Abrir en navegador
```

## 🐛 Solución de Problemas

### Backend no inicia
- Verificar que MySQL esté corriendo
- Revisar credenciales en `.env`
- Verificar puerto 3000 disponible

### Frontend no conecta con backend
- Backend debe estar en `http://localhost:3000`
- Para emulador Android: usar `http://10.0.2.2:3000`
- Verificar CORS habilitado en backend

### Errores de OpenAI
- Verificar `OPENAI_API_KEY` válida
- Revisar límites de rate limiting
- Confirmar créditos disponibles

### Imágenes muy grandes
- El backend acepta hasta 50MB
- Timeout configurado en 30 segundos
- Considerar comprimir imágenes antes

## 📄 Licencia

Este proyecto es privado y desarrollado para fines educativos.

## 👥 Equipo

- **Juan Luis** - Desarrollo Full Stack
- **GitHub**: asalazdu
- **Repositorio**: agroassist (rama: feature/apis)

## 📞 Contacto

Para preguntas o soporte:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Última actualización:** Noviembre 11, 2025

**Versión:** 1.0.0

**Estado:** ✅ Producción - 69 pruebas pasando (100%)
