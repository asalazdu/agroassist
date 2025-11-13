# Pruebas Unitarias - AgroAssist

Este proyecto cuenta con pruebas unitarias completas para backend y frontend.

## Backend

### Estructura de Pruebas

```
agroassist-backend/tests/
├── services/
│   ├── hashService.test.js           # Hash de contraseñas (6 tests)
│   ├── chatbot.logic.test.js         # Lógica de chatbot (15 tests)
│   └── market.logic.test.js          # Lógica de mercado (9 tests)
├── controllers/
│   └── pest.controller.test.js       # Controller de plagas (5 tests)
└── setup.js                          # Configuración de mocks
```

### Ejecutar Pruebas

```bash
cd agroassist-backend

# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas con detalles
npm run test:verbose
```

### Cobertura de Pruebas Backend

- ✅ **HashService**: Hash y comparación de contraseñas (6 tests)
  - Hasheo de contraseñas con bcrypt
  - Comparación de contraseñas correctas/incorrectas
  - Validación de strings vacíos y errores
  
- ✅ **ChatbotService (Lógica)**: Validación y procesamiento (15 tests)
  - Clasificación de consultas (clima, plagas, cultivos)
  - Validación de entrada de mensajes
  - Formato de respuestas exitosas y con error
  - Gestión de contexto e historial
  - Detección de emergencias
  - Extracción de información (cultivos, ubicación)
  - Construcción de prompts con contexto
  
- ✅ **MarketService**: Precios de mercado mock (9 tests)
  - Obtención de precios de productos colombianos
  - Validación de estructura de datos
  - Cálculo de cambios de precio
  - Verificación de IDs únicos y categorías
  - Validación de unidades (kg, lb, unidad, bulto)
  
- ✅ **PestController**: Análisis de imágenes y alertas (5 tests)
  - Análisis de imágenes base64
  - Generación de alertas climáticas
  - Validación de entrada (imagen/datos requeridos)
  - Limpieza de prefijos base64

**Total: 35 pruebas - 100% pasando ✅**

## Frontend

### Estructura de Pruebas

```
agroassist-frontend/tests/
├── services/
│   ├── chatbot.logic.test.ts         # Lógica de chatbot (9 tests)
│   ├── marketPrice.logic.test.ts     # Lógica de precios (12 tests)
│   └── pestAnalysis.logic.test.ts    # Lógica de análisis (13 tests)
└── setup.ts                          # Configuración de mocks
```

### Ejecutar Pruebas

```bash
cd agroassist-frontend

# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage
```

### Cobertura de Pruebas Frontend

- ✅ **ChatbotService (Lógica)**: Validación de mensajes (9 tests)
  - Validación de mensajes no vacíos
  - Limpieza de espacios en blanco
  - Formato de respuestas exitosas y con error
  - Manejo de contexto e historial
  - Validación de URLs y endpoints
  
- ✅ **MarketPriceService (Lógica)**: Gestión de precios (12 tests)
  - Validación y normalización de nombres de productos
  - Formato de precios en pesos colombianos
  - Validación de precios positivos
  - Estructura de análisis de mercado
  - Validación de tendencias (alza, baja, estable)
  - Filtrado y ordenamiento de productos
  - Manejo de respuestas de error
  
- ✅ **PestAnalysisService (Lógica)**: Análisis de plagas (13 tests)
  - Validación de tipos de archivo de imagen
  - Validación de URIs de imágenes
  - Estructura de análisis de plagas
  - Niveles de severidad (bajo, medio, alto, crítico)
  - Validación de rango de confianza (0-1)
  - Alertas climáticas (humedad_alta, temperatura_alta, lluvia_excesiva)
  - Generación y priorización de recomendaciones
  - Validación de coordenadas geográficas
  - Formato de coordenadas para API

**Total: 34 pruebas - 100% pasando ✅**

## Características de las Pruebas

### Backend
- **Tests de lógica pura** sin dependencias externas
- **Pruebas unitarias** aisladas para cada servicio y controlador
- **Validación de estructuras de datos** (precios, análisis, respuestas)
- **Manejo de errores** para casos edge
- **Regex para clasificación** de consultas (clima, plagas, cultivos)
- **Validación de bcrypt** para passwords

### Frontend
- **Tests de lógica de negocio** sin componentes React Native
- **Validaciones** de formatos y estructuras de datos
- **Pruebas de transformación** de datos (normalización, formateo)
- **Validación de coordenadas** geográficas
- **Testing de priorización** de recomendaciones
- **Cálculos matemáticos** (cambios de precio, porcentajes)

## Escenarios Cubiertos

### ✅ Autenticación y Seguridad
- Hash de contraseñas con bcrypt (10 salt rounds)
- Comparación segura de passwords
- Validación de strings vacíos
- Manejo de errores en operaciones de hash

### ✅ Chatbot - Lógica de Negocio
- Clasificación automática de consultas por tipo (clima/plagas/cultivos)
- Validación de mensajes no vacíos
- Limpieza de espacios extra
- Gestión de historial de conversación
- Limitación de tamaño de contexto
- Detección de situaciones de emergencia
- Extracción de cultivos y ubicación
- Construcción de prompts con contexto

### ✅ Análisis de Plagas
- Validación de tipos MIME de imágenes (jpeg, png, jpg)
- Validación de URIs de archivo
- Estructura de análisis (plaga, severidad, confianza, recomendaciones)
- Niveles de severidad: bajo, medio, alto, crítico
- Rango de confianza: 0.0 - 1.0
- Alertas climáticas por condiciones específicas
- Priorización de recomendaciones (alta, media, baja)
- Validación de coordenadas geográficas (-90/90, -180/180)

### ✅ Precios de Mercado
- Obtención de precios mock de productos colombianos
- Validación de estructura (productName, currentPrice, unit, market)
- Productos incluidos: Tomate, Papa Criolla, Cebolla, Plátano, Yuca, Café
- Cálculo automático de cambios de precio
- Validación de precios positivos
- Fecha actual en todos los registros
- IDs únicos para cada producto
- Categorías definidas (Hortalizas, Tubérculos, Frutas, Café)
- Unidades válidas: kg, lb, unidad, bulto
- Normalización de nombres
- Filtrado y ordenamiento de productos
- Análisis de tendencias (alza, baja, estable)

## Tecnologías Utilizadas

### Backend
- **Jest**: Framework de testing
- **Supertest**: Testing de APIs HTTP
- **@jest/globals**: Funciones globales de Jest

### Frontend
- **Jest**: Framework de testing
- **ts-jest**: Transformación de TypeScript para Jest
- **@testing-library/react-native**: Utilidades (instaladas pero no usadas en tests actuales)

## Configuración

### Backend (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

### Frontend (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      }
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  testTimeout: 10000
};
```

## Variables de Entorno para Testing

Las pruebas del backend usan variables de entorno mock configuradas en `tests/setup.js`:

```javascript
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.OPENAI_API_KEY = 'test-openai-api-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_KEY = 'test-supabase-key';
```

El frontend usa configuración mínima en `tests/setup.ts`:

```typescript
// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock básico de axios
jest.mock('axios');

// Suprimir warnings durante tests
global.console = { ...console, warn: jest.fn(), error: jest.fn() };
```

## Continuous Integration

Estas pruebas están listas para integrarse con CI/CD:

```yaml
# Ejemplo para GitHub Actions
- name: Run Backend Tests
  run: |
    cd agroassist-backend
    npm test

- name: Run Frontend Tests
  run: |
    cd agroassist-frontend
    npm test
```

## Contribuir

Para agregar nuevas pruebas:

1. Crear archivo `.test.js` (backend) o `.test.ts` (frontend) en la carpeta correspondiente
2. Seguir la estructura existente con describe/test/expect
3. Enfocarse en lógica de negocio pura sin dependencias externas
4. Evitar mocks complejos que puedan fallar fácilmente
5. Ejecutar `npm test` para verificar
6. Asegurar que todas las pruebas pasen (100%)

## Notas Importantes

- ✅ **Tests enfocados en lógica pura** - sin llamadas a APIs externas
- ✅ **Independientes y deterministas** - pueden ejecutarse en cualquier orden
- ✅ **Rápidos** - backend: ~1.2s, frontend: ~2.3s
- ✅ **Sin dependencias de servicios externos** - OpenAI, Supabase, React Native
- ✅ **Fáciles de mantener** - estructura simple y clara
- ⚠️ **Los mocks se limpian automáticamente** antes de cada test
- ⚠️ **Timeout configurado** en 10 segundos para operaciones async

## Reportes de Cobertura

Después de ejecutar `npm run test:coverage`, encontrarás:

- **Backend**: `agroassist-backend/coverage/`
- **Frontend**: `agroassist-frontend/coverage/`

Abre `coverage/lcov-report/index.html` en tu navegador para ver el reporte detallado.

## Resultados Actuales

### Última Ejecución (Nov 11, 2025)

**Backend:**
```
Test Suites: 4 passed, 4 total
Tests:       35 passed, 35 total
Time:        1.243 s
```

**Frontend:**
```
Test Suites: 3 passed, 3 total
Tests:       34 passed, 34 total
Time:        2.313 s
```

**Total: 69 pruebas pasando - 100% ✅**

Todas las pruebas son estables, rápidas y enfocadas en validar la lógica de negocio core de la aplicación sin depender de servicios externos o configuraciones complejas.
