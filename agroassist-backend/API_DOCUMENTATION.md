# Documentación de APIs de AgroAssist

## 🔐 Sistema de Autenticación

**IMPORTANTE**: Las APIs de clima y plagas requieren autenticación JWT. Solo las rutas `/help` son públicas.

### Flujo de Autenticación Requerido

1. **Registrarse** (si no tienes cuenta)
2. **Iniciar sesión** para obtener token JWT
3. **Incluir token** en cada petición a las APIs protegidas

---

## 🚀 Guía de Uso Completa

### Paso 1: Registro de Usuario
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_completo": "Juan Agricultor",
    "correo": "juan@email.com",
    "contrasena": "mipassword123"
  }'
```

### Paso 2: Iniciar Sesión
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "juan@email.com",
    "contrasena": "mipassword123"
  }'
```

**Respuesta:**
```json
{
  "ok": true,
  "msg": "Inicio de sesión exitoso",
  "message": "Inicio de sesión exitoso",
  "usuario": {
    "id": 1,
    "nombre": "Juan Agricultor",
    "correo": "juan@email.com",
    "rol": 2
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Paso 3: Usar las APIs con Token

**Guarda el token** recibido y úsalo en el header `Authorization` de todas las peticiones:

```bash
# Variable para el token (reemplaza con tu token real)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Consultar clima
curl "http://localhost:3000/api/weather/forecast?city=Bogota" \
  -H "Authorization: Bearer $TOKEN"

# Consultar plagas
curl "http://localhost:3000/api/pests/crop/maiz" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Nuevas Funcionalidades Implementadas

### 1. API de Clima 🌤️

Esta API proporciona pronósticos del clima para los próximos 3 días, útiles para la planificación agrícola.

**🔒 REQUIERE AUTENTICACIÓN JWT**

#### Configuración Requerida
```bash
# En tu archivo .env
WEATHER_API_KEY=tu_clave_de_openweathermap
JWT_SECRET=tu_jwt_secret_muy_seguro
```

**Obtener API Key Gratuita:**
1. Visita [OpenWeatherMap](https://openweathermap.org/api)
2. Regístrate gratuitamente
3. Confirma tu email
4. Ve a "API keys" en tu dashboard
5. Copia tu clave y agrégala al archivo .env

#### Endpoints Disponibles

**GET /api/weather/help** ✅ Público
- Información completa sobre la API del clima

**GET /api/weather/forecast** 🔒 Requiere Token
- Headers: `Authorization: Bearer <token>`
- Parámetros:
  - `city` (requerido): Nombre de la ciudad
  - `country` (opcional): Código del país (2 letras)
- Ejemplo: `/api/weather/forecast?city=Bogota&country=CO`

**GET /api/weather/coordinates** 🔒 Requiere Token
- Headers: `Authorization: Bearer <token>`
- Parámetros:
  - `lat` (requerido): Latitud (-90 a 90)
  - `lon` (requerido): Longitud (-180 a 180)
- Ejemplo: `/api/weather/coordinates?lat=4.711&lon=-74.0721`

#### Respuesta de Ejemplo
```json
{
  "success": true,
  "data": {
    "ubicacion": {
      "ciudad": "Bogotá",
      "pais": "CO",
      "coordenadas": {
        "latitud": 4.711,
        "longitud": -74.0721
      }
    },
    "pronostico_3_dias": [
      {
        "fecha": "2025-08-09",
        "fecha_legible": "viernes, 9 de agosto de 2025",
        "temperatura_maxima": 22,
        "temperatura_minima": 12,
        "temperatura_promedio": 17,
        "humedad_promedio": 75,
        "descripcion": "lluvia ligera",
        "viento_promedio": 8,
        "probabilidad_lluvia": 2
      }
    ]
  },
  "usuario_consulta": {
    "id": 1,
    "nombre": "Juan Agricultor",
    "correo": "juan@email.com"
  }
}
```

---

### 2. API de Plagas 🐛

Esta API proporciona información sobre plagas comunes en diferentes cultivos agrícolas.

**🔒 REQUIERE AUTENTICACIÓN JWT**

#### Endpoints Disponibles

**GET /api/pests/help** ✅ Público
- Información completa sobre la API de plagas

**GET /api/pests/crops** 🔒 Requiere Token
- Headers: `Authorization: Bearer <token>`
- Lista todos los cultivos disponibles en la base de datos

**GET /api/pests/crop/:cultivo** 🔒 Requiere Token
- Headers: `Authorization: Bearer <token>`
- Parámetros:
  - `cultivo`: Nombre del cultivo (maiz, tomate, arroz, papa, soja)
- Ejemplo: `/api/pests/crop/maiz`

**POST /api/pests/symptoms** 🔒 Requiere Token
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
```json
{
  "symptoms": ["hojas amarillas", "perforaciones", "plantas debilitadas"]
}
```

#### Cultivos Disponibles
- **maiz** (también acepta: corn, maize)
- **tomate** (también acepta: tomato)
- **arroz** (también acepta: rice)
- **papa** (también acepta: potato, patata)
- **soja** (también acepta: soybean, soy)

#### Respuesta de Ejemplo - Plagas por Cultivo
```json
{
  "success": true,
  "data": {
    "exito": true,
    "cultivo": "Maíz",
    "total_plagas": 3,
    "plagas": [
      {
        "nombre": "Gusano cogollero (Spodoptera frugiperda)",
        "descripcion": "Larva que ataca las hojas tiernas del maíz",
        "sintomas": ["Hojas con perforaciones", "Presencia de excremento granular"],
        "control": ["Control biológico con Trichogramma", "Aplicación de Bt"],
        "periodo_critico": "Primeras 6 semanas después de la siembra",
        "nivel_dano": "Alto"
      }
    ],
    "recomendaciones_generales": [
      "Realizar monitoreo regular del cultivo",
      "Implementar manejo integrado de plagas (MIP)"
    ]
  }
}
```

---

## Instalación y Configuración

### 1. Instalar Dependencias
```bash
cd agroassist-backend
npm install
```

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
# Edita el archivo .env con tus configuraciones
```

### 3. Ejecutar el Servidor
```bash
npm start
```

---

## Ejemplos de Uso Completos

### Clima - Pronóstico por Ciudad
```bash
# Con token obtenido del login
curl "http://localhost:3000/api/weather/forecast?city=Medellin&country=CO" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Clima - Pronóstico por Coordenadas
```bash
curl "http://localhost:3000/api/weather/coordinates?lat=6.2442&lon=-75.5812" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Plagas - Información por Cultivo
```bash
curl "http://localhost:3000/api/pests/crop/tomate" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Plagas - Búsqueda por Síntomas
```bash
curl -X POST "http://localhost:3000/api/pests/symptoms" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["hojas amarillas", "perforaciones"]}'
```

### Obtener Lista de Cultivos
```bash
curl "http://localhost:3000/api/pests/crops" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔒 Manejo de Errores de Autenticación

### Sin Token
```json
{
  "success": false,
  "message": "Token de acceso requerido",
  "error": "No se proporcionó token de autorización",
  "help": "Incluye el header: Authorization: Bearer <tu_token>"
}
```

### Token Inválido o Expirado
```json
{
  "success": false,
  "message": "Token inválido o expirado",
  "error": "Token invalido",
  "help": "Inicia sesión nuevamente para obtener un token válido"
}
```

### Cuenta Bloqueada
```json
{
  "success": false,
  "message": "Cuenta bloqueada temporalmente",
  "error": "La cuenta está bloqueada. Intente más tarde."
}
```

---

## Información General de la API

**GET /api**
- Proporciona información general sobre todas las APIs disponibles
- Incluye documentación básica y enlaces de ayuda

---

## Casos de Uso Agrícola

### Planificación de Riego
1. Consulta el pronóstico del clima para los próximos 3 días
2. Si hay probabilidad de lluvia alta, pospón el riego
3. Si hay temperaturas altas y baja humedad, aumenta la frecuencia de riego

### Manejo Preventivo de Plagas
1. Identifica el cultivo que estás manejando
2. Consulta las plagas comunes para ese cultivo
3. Implementa medidas preventivas según las recomendaciones
4. Si observas síntomas, usa la búsqueda por síntomas para identificar la plaga

### Toma de Decisiones Integrada
1. Combina información del clima y plagas
2. Si el clima es húmedo, estate alerta a plagas que prosperan en humedad
3. Si hay vientos fuertes previstos, considera tratamientos preventivos

---

## Notas Técnicas

- Todas las APIs siguen el patrón de respuesta estándar con `success`, `data` y `message`
- Los errores se manejan de forma consistente con códigos HTTP apropiados
- La validación de entrada se realiza usando express-validator
- La arquitectura sigue principios de Clean Architecture
- Los servicios están desacoplados y son fácilmente testeable
