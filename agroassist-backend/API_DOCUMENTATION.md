# Documentación de APIs de AgroAssist

## Nuevas Funcionalidades Implementadas

### 1. API de Clima 🌤️

Esta API proporciona pronósticos del clima para los próximos 3 días, útiles para la planificación agrícola.

#### Configuración Requerida
```bash
# En tu archivo .env
WEATHER_API_KEY=tu_clave_de_openweathermap
```

**Obtener API Key Gratuita:**
1. Visita [OpenWeatherMap](https://openweathermap.org/api)
2. Regístrate gratuitamente
3. Confirma tu email
4. Ve a "API keys" en tu dashboard
5. Copia tu clave y agrégala al archivo .env

#### Endpoints Disponibles

**GET /api/weather/help**
- Información completa sobre la API del clima

**GET /api/weather/forecast**
- Parámetros:
  - `city` (requerido): Nombre de la ciudad
  - `country` (opcional): Código del país (2 letras)
- Ejemplo: `/api/weather/forecast?city=Bogota&country=CO`

**GET /api/weather/coordinates**
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
  }
}
```

---

### 2. API de Plagas 🐛

Esta API proporciona información sobre plagas comunes en diferentes cultivos agrícolas.

#### Endpoints Disponibles

**GET /api/pests/help**
- Información completa sobre la API de plagas

**GET /api/pests/crops**
- Lista todos los cultivos disponibles en la base de datos

**GET /api/pests/crop/:cultivo**
- Parámetros:
  - `cultivo`: Nombre del cultivo (maiz, tomate, arroz, papa, soja)
- Ejemplo: `/api/pests/crop/maiz`

**POST /api/pests/symptoms**
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

## Ejemplos de Uso

### Clima - Pronóstico por Ciudad
```bash
curl "http://localhost:3000/api/weather/forecast?city=Medellin&country=CO"
```

### Clima - Pronóstico por Coordenadas
```bash
curl "http://localhost:3000/api/weather/coordinates?lat=6.2442&lon=-75.5812"
```

### Plagas - Información por Cultivo
```bash
curl "http://localhost:3000/api/pests/crop/tomate"
```

### Plagas - Búsqueda por Síntomas
```bash
curl -X POST "http://localhost:3000/api/pests/symptoms" \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["hojas amarillas", "perforaciones"]}'
```

### Obtener Lista de Cultivos
```bash
curl "http://localhost:3000/api/pests/crops"
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
