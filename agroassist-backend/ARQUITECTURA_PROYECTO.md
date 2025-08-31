# 🏗️ Arquitectura del Proyecto AgroAssist

## 📊 Diagrama de Arquitectura (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                        🌐 FRONTEND CLIENT                       │
│                     (Futuro - Por implementar)                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP REST API
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    🚀 API GATEWAY - EXPRESS                     │
│                      Puerto 3000                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  🔒 CORS       │ │  📝 JSON Parser │ │  🔐 JWT Auth    │   │
│  │  Middleware    │ │  Middleware     │ │  Middleware     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌────────────────┐ ┌─────────────┐ ┌─────────────┐
│  🛣️ RUTAS      │ │ 🛣️ RUTAS    │ │ 🛣️ RUTAS    │
│  /api/auth     │ │ /api/pests  │ │ /api/plagas │
│  /api/weather  │ │ /api/market │ │ (español)   │
└────────┬───────┘ └──────┬──────┘ └──────┬──────┘
         │                │               │
         ▼                ▼               ▼
┌────────────────────────────────────────────────────────────────┐
│                    🎮 CONTROLLERS LAYER                        │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ 🔐 Auth      │ │ 🐛 Pest      │ │ 🇨🇴 Colombian │           │
│  │ Controller   │ │ Controller   │ │ Pest Ctrl    │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐                           │
│  │ 🌤️ Weather   │ │ 💰 Market    │                           │
│  │ Controller   │ │ Controller   │                           │
│  └──────────────┘ └──────────────┘                           │
└─────────────────────────┬─────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    📋 USE CASES LAYER                           │
│                   (Application Logic)                          │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ 👤 Login     │ │ 📝 Register  │ │ 🔑 Reset     │           │
│  │ User         │ │ User         │ │ Password     │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ 🐛 Get Pest  │ │ 🇨🇴 Colombian │ │ 🌤️ Weather   │           │
│  │ Information  │ │ Pest Info    │ │ Forecast     │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                               │
│  ┌──────────────┐                                            │
│  │ 💰 Colombian │                                            │
│  │ Market       │                                            │
│  │ Prices       │                                            │
│  └──────────────┘                                            │
└─────────────────────────┬─────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  🏗️ INFRASTRUCTURE LAYER                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  📦 SERVICES                            │   │
│  │                                                         │   │
│  │  🌍 APIS INTERNACIONALES     🇨🇴 APIS COLOMBIANAS      │   │
│  │  ┌─────────────────────┐     ┌─────────────────────┐   │   │
│  │  │ 🌿 GBIF Service     │     │ 🌱 Colombian        │   │   │
│  │  │ (Biodiversidad)     │     │ Agriculture Service │   │   │
│  │  └─────────────────────┘     └─────────────────────┘   │   │
│  │                                                         │   │
│  │  ┌─────────────────────┐     ┌─────────────────────┐   │   │
│  │  │ 🔬 iNaturalist      │     │ 💰 Colombian Prices │   │   │
│  │  │ Service             │     │ Service             │   │   │
│  │  └─────────────────────┘     └─────────────────────┘   │   │
│  │                                                         │   │
│  │  ┌─────────────────────┐                               │   │
│  │  │ 🇺🇸 USDA Service    │                               │   │
│  │  │ (Agricultura USA)   │                               │   │
│  │  └─────────────────────┘                               │   │
│  │                                                         │   │
│  │  ┌─────────────────────┐                               │   │
│  │  │ 🌤️ Weather Service  │                               │   │
│  │  │                     │                               │   │
│  │  └─────────────────────┘                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                🗄️ DATABASE LAYER                        │   │
│  │                                                         │   │
│  │  ┌─────────────────────┐ ┌─────────────────────┐       │   │
│  │  │ 🐬 MySQL Database   │ │ 👤 User Repository  │       │   │
│  │  │ - users             │ │ - CRUD Operations   │       │   │
│  │  │ - authentication    │ │ - User Management   │       │   │
│  │  └─────────────────────┘ └─────────────────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                🛠️ SHARED UTILITIES                       │   │
│  │                                                         │   │
│  │  ┌─────────────────────┐ ┌─────────────────────┐       │   │
│  │  │ 🔑 JWT Token        │ │ 🔐 Hash Service     │       │   │
│  │  │ Generator           │ │ (bcrypt)            │       │   │
│  │  └─────────────────────┘ └─────────────────────┘       │   │
│  │                                                         │   │
│  │  ┌─────────────────────┐ ┌─────────────────────┐       │   │
│  │  │ 📧 Email Service    │ │ ✅ Field Validator  │       │   │
│  │  │                     │ │                     │       │   │
│  │  └─────────────────────┘ └─────────────────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                🌍 EXTERNAL APIs (FREE)                          │
│                                                               │
│  🌿 GBIF API          🔬 iNaturalist API      🇺🇸 USDA API      │
│  (Biodiversidad      (Observaciones         (Agricultura       │
│   Global)             Científicas)          Estados Unidos)    │
│                                                               │
│  🇨🇴 DANE-SIPSA       🌾 Agronet-MADR       🌤️ Weather APIs    │
│  (Precios Colombia)   (Agricultura Col)     (Meteorología)     │
└─────────────────────────────────────────────────────────────────┘
```

## 📂 Estructura de Directorios

```
agroassist-backend/
├── 📄 package.json
├── 📄 .env
├── 📄 README.md
├── 📄 GUIA_PLAGAS_COLOMBIA.md
├── 📄 PEST_API_GUIDE.md
├── 📄 COLOMBIAN_MARKET_API_GUIDE.md
├── 🧪 testAPIs.js
├── 🧪 testColombianPests.js
├── 🧪 testColombianPrices.js
│
└── src/
    ├── 🚀 index.js (Servidor Principal)
    │
    ├── 📱 interfaces/
    │   ├── 🎮 controllers/
    │   │   ├── auth.controller.js
    │   │   ├── pest.controller.js
    │   │   ├── colombianPest.controller.js
    │   │   ├── weather.controller.js
    │   │   └── marketPrices.controller.js
    │   │
    │   ├── 🛣️ routes/
    │   │   ├── auth.routes.js
    │   │   ├── pest.routes.js
    │   │   ├── colombianPest.routes.js
    │   │   ├── weather.routes.js
    │   │   └── marketPrices.routes.js
    │   │
    │   └── 🛡️ middlewares/
    │       ├── validateJWT.js
    │       └── validateFields.js
    │
    ├── 📋 application/
    │   └── use-cases/
    │       ├── loginUser.js
    │       ├── registerUser.js
    │       ├── resetPassword.js
    │       ├── getPestInformation.js
    │       ├── getColombianPestInformation.js
    │       ├── getWeatherForecast.js
    │       └── getColombianMarketPrices.js
    │
    ├── 🏗️ infrastructure/
    │   ├── 📦 services/
    │   │   ├── 🌍 Internacional:
    │   │   │   ├── gbifService.js
    │   │   │   ├── iNaturalistService.js
    │   │   │   ├── usdaService.js
    │   │   │   └── pestInformationService.js
    │   │   │
    │   │   ├── 🇨🇴 Colombia:
    │   │   │   ├── colombianAgricultureService.js
    │   │   │   └── colombianPricesService.js
    │   │   │
    │   │   └── 🛠️ Utilities:
    │   │       ├── weatherService.js
    │   │       ├── emailService.js
    │   │       └── hash.service.js
    │   │
    │   ├── 🗄️ database/
    │   │   └── mysql/
    │   │       ├── db.js
    │   │       └── userRepository.js
    │   │
    │   └── 🔧 shared/
    │       └── utils/
    │           └── token.js
    │
    └── 🏛️ domain/
        └── entities/
            └── User.js
```

## 🔄 Flujo de Datos

### 1. 🔐 Autenticación
```
Usuario → Auth Routes → Auth Controller → Login UseCase → User Repository → MySQL
                                       ↓
                    JWT Token ← Hash Service ← Token Utils
```

### 2. 🐛 Información de Plagas (Internacional)
```
Cliente → /api/pests → Pest Controller → Get Pest Info UseCase
                                              ↓
                          GBIF API ← Pest Information Service → iNaturalist API
                                              ↓                      ↓
                                         USDA API              Respuesta JSON
```

### 3. 🇨🇴 Información de Plagas (Colombia)
```
Cliente → /api/plagas → Colombian Pest Controller → Colombian Pest UseCase
                                                          ↓
                      Colombian Agriculture Service → Base Datos Colombia
                                                          ↓
                                              + APIs Internacionales
                                                          ↓
                                                 Respuesta en Español
```

### 4. 💰 Precios de Mercado
```
Cliente → /api/market → Market Controller → Colombian Market UseCase
                                                 ↓
                         Colombian Prices Service → DANE-SIPSA API
                                                 ↓
                                            Agronet API
                                                 ↓
                                         Precios Colombia
```

## 🏛️ Patrones de Arquitectura Implementados

### 1. 🧅 **Clean Architecture**
- **Domain Layer**: Entidades de negocio (User)
- **Application Layer**: Casos de uso específicos
- **Infrastructure Layer**: Servicios externos y persistencia
- **Interface Layer**: Controllers y Routes

### 2. 🎯 **Repository Pattern**
- Abstracción de acceso a datos
- Separación entre lógica de negocio y persistencia

### 3. 🏭 **Service Layer Pattern**
- Servicios especializados para cada API externa
- Reutilización de código
- Separación de responsabilidades

### 4. 🎮 **MVC Pattern**
- **Models**: Entidades del dominio
- **Views**: Respuestas JSON
- **Controllers**: Lógica de presentación

### 5. 🔌 **Dependency Injection**
- Inyección de servicios en casos de uso
- Bajo acoplamiento entre componentes

## 🌟 Características Técnicas

### 🔒 **Seguridad**
- ✅ JWT Authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS configurado
- ✅ Validación de campos
- ✅ Middleware de autenticación

### 🌍 **APIs Externas Integradas**
- 🌿 **GBIF**: Biodiversidad global (GRATIS)
- 🔬 **iNaturalist**: Observaciones científicas (GRATIS)
- 🇺🇸 **USDA**: Agricultura Estados Unidos (GRATIS)
- 🇨🇴 **DANE-SIPSA**: Precios Colombia (GRATIS)
- 🌾 **Agronet**: Agricultura Colombia (GRATIS)

### 📊 **Base de Datos**
- 🐬 MySQL para usuarios y autenticación
- 🗄️ Repository pattern para acceso a datos

### 🌐 **Internacionalización**
- 🇺🇸 Sistema en inglés (/api/pests)
- 🇨🇴 Sistema en español (/api/plagas)
- 🌍 Soporte para múltiples idiomas

### 🧪 **Testing**
- ✅ Scripts de prueba automatizados
- ✅ Testing de endpoints
- ✅ Validación de respuestas

## 🚀 Escalabilidad

### 📈 **Horizontal**
- Servicios independientes
- APIs stateless
- Fácil replicación

### 📊 **Vertical**
- Caché en servicios
- Optimización de consultas
- Compresión de respuestas

### 🔄 **Mantenibilidad**
- Código modular
- Separación de responsabilidades
- Documentación completa
- Tests automatizados

## 🎯 Próximos Pasos

1. 🖥️ **Frontend Integration**
2. 📊 **Database Expansion**
3. 🔍 **Search Optimization**
4. 📱 **Mobile API**
5. 🌍 **Multi-language Support**
6. 📈 **Analytics Integration**

---

## 📝 Notas para Crear Imagen

Para crear una imagen visual de esta arquitectura, puedes usar:

1. **🎨 Draw.io / Lucidchart**: Copiar la estructura ASCII
2. **🖼️ Canva**: Para diagramas más visuales
3. **📊 PlantUML**: Para diagramas técnicos
4. **🎯 Figma**: Para diseños más detallados

La información aquí proporcionada te dará toda la base necesaria para crear el diagrama visual que necesites.
