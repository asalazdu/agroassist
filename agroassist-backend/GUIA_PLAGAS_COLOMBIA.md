# 🇨🇴 Guía del Sistema de Plagas para Colombia - AgroAssist

## 📋 Resumen

**¡NUEVO!** Sistema especializado para la agricultura colombiana con todas las respuestas en español y enfocado específicamente en las condiciones, cultivos y plagas de Colombia.

### ✨ Características Principales

- 🗣️ **Completamente en español**
- 🇨🇴 **Enfocado en Colombia** - cultivos, plagas y regiones específicas
- 🌱 **10 cultivos principales** de Colombia incluidos
- 🐛 **Base de datos de plagas** específicas del país
- 📍 **5 regiones colombianas** con recomendaciones específicas
- 🏢 **Integración con instituciones** colombianas (ICA, AGROSAVIA)
- 💊 **Métodos de control** adaptados a productos disponibles en Colombia

## 🌱 Cultivos Incluidos

| Cultivo | Nombre Científico | Regiones Principales |
|---------|-------------------|---------------------|
| ☕ Café | *Coffea arabica* | Eje Cafetero, Huila, Nariño, Tolima |
| 🍌 Plátano | *Musa paradisiaca* | Antioquia, Córdoba, Magdalena |
| 🌾 Arroz | *Oryza sativa* | Tolima, Huila, Casanare, Meta |
| 🌽 Maíz | *Zea mays* | Córdoba, Sucre, Cesar, Meta |
| 🍫 Cacao | *Theobroma cacao* | Santander, Arauca, Huila |
| 🍠 Yuca | *Manihot esculenta* | Costa Atlántica, Llanos |
| 🥔 Papa | *Solanum tuberosum* | Boyacá, Cundinamarca, Nariño |
| 🫘 Fríjol | *Phaseolus vulgaris* | Antioquia, Huila, Tolima |
| 🎋 Caña | *Saccharum officinarum* | Valle del Cauca, Cauca |
| 🌸 Flores | Diversos | Cundinamarca, Antioquia |

## 🐛 Plagas Principales de Colombia

### Café ☕
- **Broca del café** (*Hypothenemus hampei*)
- **Roya del café** (*Hemileia vastatrix*)
- **Cochinilla** (*Planococcus citri*)
- **Minador de hoja** (*Leucoptera coffeella*)

### Plátano 🍌
- **Sigatoka negra** (*Mycosphaerella fijiensis*)
- **Picudo negro** (*Cosmopolites sordidus*)
- **Nematodos** (*Radopholus similis*)

### Maíz 🌽
- **Gusano cogollero** (*Spodoptera frugiperda*)
- **Gusano elotero** (*Helicoverpa zea*)
- **Gallina ciega** (*Phyllophaga spp.*)

## 🚀 Cómo Usar el Sistema

### **Endpoints Disponibles (Todos en Español)**

#### 1. **Información del Sistema** (Público)
```
GET /api/plagas/info-sistema
```
- 📖 Información completa del sistema
- 🏢 Instituciones de referencia
- 🗺️ Regiones de Colombia

#### 2. **Prueba del Sistema** (Público)
```
GET /api/plagas/test-colombia
```
- 🧪 Verificar funcionamiento
- 📋 Lista de endpoints disponibles
- 📊 Estadísticas del sistema

#### 3. **Lista de Cultivos** (Público)
```
GET /api/plagas/cultivos-colombia
```
- 🌱 Todos los cultivos disponibles
- 📍 Regiones por cultivo
- 📅 Épocas de siembra y cosecha

### **Endpoints Protegidos (Requieren JWT)**

#### 4. **Buscar Plaga Específica**
```
GET /api/plagas/buscar/{nombre-plaga}
```

**Ejemplos:**
```bash
GET /api/plagas/buscar/broca del café
GET /api/plagas/buscar/roya
GET /api/plagas/buscar/gusano cogollero
```

**Respuesta:**
```json
{
  "success": true,
  "plaga_consultada": "broca del café",
  "informacion_colombiana": {
    "nombre": "Broca del Café",
    "nombreCientifico": "Hypothenemus hampei",
    "regiones_problematicas": ["Eje Cafetero", "Huila", "Nariño"],
    "epoca_critica": "Durante formación y maduración del fruto",
    "control_biologico": ["Beauveria bassiana", "Cephalonomia stephanoderis"],
    "control_cultural": ["Recolección oportuna", "Repase"]
  },
  "recomendaciones": [
    "✅ Información específica de Colombia disponible",
    "📍 Regiones problemáticas: Eje Cafetero, Huila, Nariño",
    "🦠 Control biológico: Beauveria bassiana, Cephalonomia stephanoderis"
  ]
}
```

#### 5. **Plagas por Cultivo**
```
GET /api/plagas/cultivo/{nombre-cultivo}
```

**Ejemplos:**
```bash
GET /api/plagas/cultivo/café
GET /api/plagas/cultivo/maíz
GET /api/plagas/cultivo/arroz
```

#### 6. **Plagas por Ubicación en Colombia**
```
POST /api/plagas/ubicacion
```

**Cuerpo de la petición:**
```json
{
  "latitud": 4.7110,
  "longitud": -74.0721,
  "tipoCultivo": "café"
}
```

**Ubicaciones de ejemplo:**
- **Bogotá:** `{ "latitud": 4.7110, "longitud": -74.0721 }`
- **Medellín:** `{ "latitud": 6.2442, "longitud": -75.5812 }`
- **Cali:** `{ "latitud": 3.4516, "longitud": -76.5320 }`
- **Barranquilla:** `{ "latitud": 10.9639, "longitud": -74.7964 }`

#### 7. **Plan de Manejo Específico**
```
POST /api/plagas/plan-manejo
```

**Cuerpo de la petición:**
```json
{
  "nombrePlaga": "broca del café",
  "nombreCultivo": "café"
}
```

**Respuesta:**
```json
{
  "success": true,
  "plan_de_manejo": {
    "control_biologico": ["Beauveria bassiana", "Cephalonomia stephanoderis"],
    "control_cultural": ["Recolección oportuna", "Repase", "Manejo de arvenses"],
    "control_quimico": ["Endosulfán (restringido)", "Clorpirifós"],
    "momento_aplicacion": "Durante floración y desarrollo del fruto"
  },
  "normatividad": {
    "entidad_reguladora": "ICA - Instituto Colombiano Agropecuario",
    "consulta_registro": "https://www.ica.gov.co",
    "nota": "Verifique siempre que los productos estén registrados en Colombia"
  }
}
```

## 🔒 Autenticación

### 1. **Registrarse**
```bash
POST /api/auth/register
{
  "name": "Juan Agricultor",
  "email": "juan@agroassist.co",
  "password": "mipassword123"
}
```

### 2. **Iniciar Sesión**
```bash
POST /api/auth/login
{
  "email": "juan@agroassist.co",
  "password": "mipassword123"
}
```

### 3. **Usar Token**
```bash
Authorization: Bearer tu_token_aqui
```

## 🗺️ Regiones de Colombia

| Región | Departamentos | Clima Principal | Cultivos Principales |
|--------|---------------|-----------------|---------------------|
| 🏖️ **Caribe** | Atlántico, Bolívar, Cesar, Córdoba, La Guajira, Magdalena, Sucre | Tropical seco/húmedo | Maíz, arroz, yuca, plátano |
| ⛰️ **Andina** | Antioquia, Boyacá, Caldas, Cundinamarca, Huila, etc. | Templado/frío | Café, papa, flores, fríjol |
| 🌊 **Pacífica** | Cauca, Chocó, Nariño, Valle del Cauca | Tropical húmedo | Cacao, plátano, caña |
| 🌾 **Orinoquía** | Arauca, Casanare, Meta, Vichada | Tropical sabana | Arroz, maíz, soja |
| 🌳 **Amazonía** | Amazonas, Caquetá, Guainía, etc. | Tropical húmedo | Cacao, plátano, yuca |

## 💡 Ejemplos de Uso con cURL

### **Buscar información de broca del café:**
```bash
curl -X GET "http://localhost:3000/api/plagas/buscar/broca%20del%20café" \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json"
```

### **Plagas del maíz:**
```bash
curl -X GET "http://localhost:3000/api/plagas/cultivo/maíz" \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json"
```

### **Plagas cerca de Bogotá:**
```bash
curl -X POST "http://localhost:3000/api/plagas/ubicacion" \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "latitud": 4.7110,
    "longitud": -74.0721,
    "tipoCultivo": "café"
  }'
```

### **Plan de manejo para gusano cogollero:**
```bash
curl -X POST "http://localhost:3000/api/plagas/plan-manejo" \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "nombrePlaga": "gusano cogollero",
    "nombreCultivo": "maíz"
  }'
```

## 🧪 Cómo Probar el Sistema

### **1. Ejecutar el script de pruebas automático:**
```bash
node testColombianPests.js
```

### **2. Pruebas manuales paso a paso:**

1. **Verificar sistema:**
   ```bash
   curl http://localhost:3000/api/plagas/test-colombia
   ```

2. **Ver cultivos disponibles:**
   ```bash
   curl http://localhost:3000/api/plagas/cultivos-colombia
   ```

3. **Registrarse y obtener token:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@test.com","password":"password123"}'
   ```

4. **Usar endpoints protegidos con el token obtenido**

## 🏢 Instituciones de Referencia Colombia

- **🏛️ ICA** - Instituto Colombiano Agropecuario
  - Registro de productos fitosanitarios
  - Normatividad agrícola

- **🔬 AGROSAVIA** - Corporación Colombiana de Investigación Agropecuaria
  - Investigación y desarrollo
  - Asistencia técnica

- **🏘️ UMATA** - Unidades Municipales de Asistencia Técnica
  - Asistencia técnica local
  - Programas municipales

## 📊 Ventajas del Sistema Colombiano

### ✅ **Completamente en Español**
- Todas las respuestas en idioma español
- Terminología agrícola colombiana
- Nombres comunes locales de plagas

### 🇨🇴 **Específico para Colombia**
- Cultivos principales del país
- Plagas específicas de cada región
- Métodos de control adaptados

### 🌍 **Información Regional**
- 5 regiones naturales de Colombia
- Recomendaciones por clima
- Épocas de siembra específicas

### 🏢 **Integración Institucional**
- Referencias a ICA y AGROSAVIA
- Normatividad colombiana
- Productos registrados en el país

### 📱 **Fácil Integración**
- API REST estándar
- Respuestas JSON estructuradas
- Documentación completa

## ⚠️ Códigos de Estado

- `200` - ✅ Éxito
- `400` - ❌ Error en parámetros
- `401` - 🔒 No autenticado
- `404` - 🔍 No encontrado
- `500` - 💥 Error del servidor

## 🔗 URLs del Sistema

- **Información:** `GET /api/plagas/info-sistema`
- **Prueba:** `GET /api/plagas/test-colombia`
- **Cultivos:** `GET /api/plagas/cultivos-colombia`
- **Buscar plaga:** `GET /api/plagas/buscar/:nombrePlaga`
- **Cultivo:** `GET /api/plagas/cultivo/:nombreCultivo`
- **Ubicación:** `POST /api/plagas/ubicacion`
- **Plan manejo:** `POST /api/plagas/plan-manejo`

---

## 🎯 ¡Listo para usar!

El sistema está completamente configurado y listo para proveer información de plagas específicamente adaptada para la agricultura colombiana, con todas las respuestas en español y enfocadas en las condiciones locales del país.

**Para soporte técnico:** Consulte la documentación del sistema o contacte al equipo de desarrollo de AgroAssist.
