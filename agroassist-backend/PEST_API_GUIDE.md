# 🌱 APIs Gratuitas para Información de Plagas y Cultivos - AgroAssist

## 📋 Resumen de APIs Implementadas

### ✅ APIs COMPLETAMENTE GRATUITAS (Sin registro necesario)

1. **GBIF API** - Global Biodiversity Information Facility
2. **iNaturalist API** - Identificación de especies y observaciones
3. **USDA NASS API** - Datos agrícolas del Departamento de Agricultura de EE.UU.

## 🚀 Cómo Comenzar

### **NO NECESITAS REGISTRARTE EN NINGUNA PARTE**
Todas las APIs implementadas son 100% gratuitas y no requieren API keys.

## 📚 Endpoints Disponibles

### 1. Verificar APIs (Público)
```
GET /api/pests/test
```
- **Descripción**: Verifica que todas las APIs estén funcionando
- **Sin autenticación requerida**
- **Respuesta**: Estado de cada API

### 2. Buscar Plaga Específica
```
GET /api/pests/search/{pestName}
```
- **Autenticación**: JWT requerido
- **Ejemplo**: `/api/pests/search/aphid`
- **Descripción**: Busca información completa sobre una plaga

### 3. Plagas por Cultivo
```
GET /api/pests/crop/{cropName}
```
- **Autenticación**: JWT requerido
- **Ejemplo**: `/api/pests/crop/corn`
- **Descripción**: Obtiene plagas comunes para un cultivo específico

### 4. Plagas por Ubicación
```
POST /api/pests/location
Content-Type: application/json

{
  "latitude": -34.6037,
  "longitude": -58.3816,
  "cropType": "corn" // opcional
}
```
- **Autenticación**: JWT requerido
- **Descripción**: Busca plagas reportadas cerca de una ubicación

### 5. Información Detallada de Plaga
```
POST /api/pests/details
Content-Type: application/json

{
  "pestName": "corn borer",
  "speciesId": 123456 // opcional
}
```
- **Autenticación**: JWT requerido
- **Descripción**: Información científica detallada y plan de manejo

## 🔧 Instalación y Configuración

### 1. Instalar Dependencias
```bash
npm install axios
```

### 2. No se requiere configuración adicional
Las APIs no necesitan API keys ni registros.

## 💡 Ejemplos de Uso

### Ejemplo 1: Verificar APIs
```bash
curl -X GET "http://localhost:3000/api/pests/test"
```

### Ejemplo 2: Buscar información de pulgones
```bash
curl -X GET "http://localhost:3000/api/pests/search/aphid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Ejemplo 3: Plagas del maíz
```bash
curl -X GET "http://localhost:3000/api/pests/crop/corn" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Ejemplo 4: Plagas cerca de Buenos Aires
```bash
curl -X POST "http://localhost:3000/api/pests/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "latitude": -34.6037,
    "longitude": -58.3816,
    "cropType": "soybean"
  }'
```

## 📊 Respuestas de Ejemplo

### Búsqueda de Plaga
```json
{
  "success": true,
  "query": "aphid",
  "sources": {
    "gbif": {
      "success": true,
      "data": [
        {
          "key": 1234567,
          "scientificName": "Aphis gossypii",
          "commonName": "Cotton aphid",
          "kingdom": "Animalia",
          "phylum": "Arthropoda",
          "class": "Insecta",
          "order": "Hemiptera",
          "family": "Aphididae"
        }
      ]
    },
    "iNaturalist": {
      "success": true,
      "data": [
        {
          "id": 567890,
          "scientificName": "Aphis gossypii",
          "commonName": "Cotton aphid",
          "observationsCount": 15420,
          "photoUrl": "https://example.com/photo.jpg"
        }
      ]
    }
  },
  "summary": {
    "totalResults": 2,
    "scientificMatches": [...]
  },
  "recommendations": [
    "Información encontrada en múltiples bases de datos científicas",
    "Hay coincidencias científicas confirmadas",
    "Consulte con especialistas locales para medidas específicas"
  ]
}
```

## 🎯 Funcionalidades Principales

### 1. **Identificación de Plagas**
- Búsqueda por nombre común o científico
- Información taxonómica completa
- Enlaces a recursos adicionales

### 2. **Análisis por Cultivo**
- Plagas comunes por tipo de cultivo
- Evaluación de riesgo
- Recomendaciones preventivas

### 3. **Información Geográfica**
- Distribución de plagas por región
- Observaciones cercanas a ubicaciones específicas
- Análisis de riesgo local

### 4. **Planes de Manejo**
- Métodos de control recomendados
- Estrategias de prevención
- Planes de monitoreo

## 🔒 Autenticación

Para usar los endpoints (excepto `/test`), necesitas:

1. **Registrarte** en el sistema: `POST /api/auth/register`
2. **Iniciar sesión**: `POST /api/auth/login`
3. **Usar el token JWT** en el header Authorization

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚦 Códigos de Estado

- `200` - Éxito
- `400` - Error en parámetros de entrada
- `401` - No autenticado
- `404` - Información no encontrada
- `500` - Error interno del servidor

## 🌍 Cultivos Soportados

**Principales cultivos con información disponible:**
- Maíz (corn)
- Soja (soybeans/soybean)
- Trigo (wheat)
- Arroz (rice)
- Algodón (cotton)
- Tomate (tomato)
- Y muchos más...

## 🐛 Plagas Comunes en Base de Datos

**Ejemplos de plagas con información detallada:**
- Pulgones (aphid)
- Gusano cogollero (armyworm)
- Barrenador (borer)
- Trips (thrips)
- Mosca blanca (whitefly)
- Chinche (stink bug)

## 📈 Límites y Rendimiento

### **Ventajas de las APIs Gratuitas:**
- ✅ Sin límites de requests
- ✅ Sin costos
- ✅ Sin registro requerido
- ✅ Datos científicos confiables
- ✅ Actualizaciones constantes

### **Consideraciones:**
- Las APIs pueden tener latencia variable
- Algunos datos pueden estar en inglés
- La disponibilidad depende de los proveedores

## 🛠️ Solución de Problemas

### Problema: "API no responde"
**Solución**: Usar endpoint `/api/pests/test` para verificar estado

### Problema: "No se encuentran resultados"
**Solución**: Probar con nombres en inglés o nombres científicos

### Problema: "Error de autenticación"
**Solución**: Verificar que el token JWT esté incluido y sea válido

## 📞 Contacto y Soporte

Si tienes problemas o preguntas:
1. Verifica la documentación
2. Usa el endpoint de prueba
3. Revisa los logs del servidor
4. Consulta con el equipo de desarrollo

## 🎉 ¡Listo para Usar!

Tu sistema AgroAssist ahora tiene acceso a información gratuita y confiable sobre plagas y cultivos. ¡No necesitas registrarte en ningún servicio externo!

**Comando rápido para probar:**
```bash
curl -X GET "http://localhost:3000/api/pests/test"
```
