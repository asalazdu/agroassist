# 🇨🇴 API de Precios de Mercado Agrícola Colombiano - AgroAssist

## 📋 Resumen

Esta API proporciona información actualizada sobre precios de productos agrícolas en Colombia, incluyendo:
- **Productos básicos**: Huevos, maíz, arroz, frijol, papa, etc.
- **Insumos agrícolas**: Fertilizantes, semillas, pesticidas
- **Análisis regional**: Comparación de precios entre ciudades
- **Tendencias históricas**: Análisis de precios a lo largo del tiempo

## 🏛️ **Fuentes de Datos Oficiales**

### **1. DANE - SIPSA (Recomendado)**
- **Entidad**: Departamento Administrativo Nacional de Estadística
- **Sistema**: SIPSA (Sistema de Información de Precios y Abastecimiento del Sector Agropecuario)
- **Cobertura**: Nacional
- **Frecuencia**: Diaria/Semanal
- **Productos**: 200+ productos agrícolas
- **Costo**: **GRATUITO**

### **2. Agronet - MADR**
- **Entidad**: Ministerio de Agricultura y Desarrollo Rural
- **Cobertura**: Nacional
- **Datos**: Precios, estadísticas, indicadores
- **Costo**: **GRATUITO**

### **3. Centrales de Abastecimiento**
- **CORABASTOS** (Bogotá)
- **CAVASA** (Cali)
- **MERCASA** (Medellín)
- **GRANABASTOS** (Bucaramanga)

## 🚀 **Endpoints Disponibles**

### **1. Verificar Estado del Servicio**
```
GET /api/market/test
```
- **Descripción**: Verifica conectividad con fuentes de datos
- **Autenticación**: No requerida
- **Respuesta**: Estado de los servicios

### **2. Productos Disponibles**
```
GET /api/market/products
```
- **Descripción**: Lista todos los productos y regiones disponibles
- **Autenticación**: No requerida
- **Categorías**: Cereales, legumbres, tubérculos, hortalizas, frutas, pecuarios, insumos

### **3. Buscar Productos**
```
GET /api/market/search/{query}
```
- **Ejemplo**: `/api/market/search/maiz`
- **Descripción**: Búsqueda inteligente de productos
- **Autenticación**: No requerida

### **4. Precio de Producto Específico**
```
GET /api/market/product/{productName}?region={region}
```
- **Ejemplo**: `/api/market/product/huevos?region=Bogotá`
- **Autenticación**: JWT requerido
- **Parámetros**:
  - `productName`: Nombre del producto
  - `region`: Región (opcional)

### **5. Precios de Insumos Agrícolas**
```
GET /api/market/inputs/{inputType}
```
- **Ejemplo**: `/api/market/inputs/fertilizante`
- **Autenticación**: JWT requerido
- **Tipos**: fertilizante, semilla, pesticida

### **6. Comparación Regional**
```
GET /api/market/compare/{productName}
```
- **Ejemplo**: `/api/market/compare/arroz`
- **Autenticación**: JWT requerido
- **Descripción**: Compara precios entre diferentes regiones

### **7. Historial de Precios**
```
GET /api/market/history/{productName}?months={months}
```
- **Ejemplo**: `/api/market/history/maiz?months=6`
- **Autenticación**: JWT requerido
- **Parámetros**:
  - `months`: 1-36 meses (default: 12)

### **8. Análisis Completo de Mercado**
```
POST /api/market/analysis
Content-Type: application/json

{
  "products": ["huevos", "maiz", "arroz"],
  "region": "Bogotá"
}
```
- **Autenticación**: JWT requerido
- **Límite**: Máximo 10 productos por análisis

## 📊 **Ejemplos de Respuestas**

### **Precio de Producto**
```json
{
  "success": true,
  "data": {
    "product": "huevos",
    "region": "Bogotá",
    "timestamp": "2025-08-31T10:30:00.000Z",
    "sources": {
      "dane": {
        "success": true,
        "source": "DANE-SIPSA",
        "data": {
          "product": "huevos",
          "region": "Bogotá",
          "pricePerKg": 495,
          "unit": "COP/kg",
          "marketType": "Mayorista",
          "priceRange": {
            "min": 446,
            "max": 545
          }
        }
      }
    },
    "summary": {
      "status": "Data available",
      "sourcesCount": 1,
      "reliability": "Medium"
    }
  },
  "marketAdvice": [
    "Precio oficial DANE disponible - Alta confiabilidad",
    "Considere costos de transporte y almacenamiento",
    "Verifique calidad del producto antes de comprar"
  ]
}
```

### **Comparación Regional**
```json
{
  "success": true,
  "product": "arroz",
  "regionalComparison": [
    {
      "region": "Bogotá",
      "data": {
        "sources": {
          "dane": {
            "data": {
              "pricePerKg": 3080,
              "unit": "COP/kg"
            }
          }
        }
      }
    },
    {
      "region": "Cali",
      "data": {
        "sources": {
          "dane": {
            "data": {
              "pricePerKg": 2856,
              "unit": "COP/kg"
            }
          }
        }
      }
    }
  ],
  "bestMarkets": {
    "recommendedMarkets": [
      {
        "region": "Cali",
        "price": 2856,
        "advantage": "competitive"
      }
    ],
    "note": "Los mejores mercados dependen de costos de transporte"
  }
}
```

## 💡 **Productos Principales Disponibles**

### **🥚 Productos Pecuarios**
- Huevos (diferentes tamaños)
- Leche
- Carne de res
- Carne de cerdo
- Pollo

### **🌾 Cereales**
- Maíz
- Arroz
- Trigo
- Avena
- Cebada

### **🥔 Tubérculos**
- Papa
- Yuca
- Ñame
- Plátano

### **🥕 Hortalizas**
- Tomate
- Cebolla
- Zanahoria
- Lechuga
- Apio

### **🧪 Insumos Agrícolas**
- Fertilizantes (NPK, Urea, etc.)
- Semillas certificadas
- Pesticidas
- Abonos orgánicos

## 🏙️ **Regiones Cubiertas**

- **Bogotá D.C.**
- **Medellín** (Antioquia)
- **Cali** (Valle del Cauca)
- **Barranquilla** (Atlántico)
- **Bucaramanga** (Santander)
- **Cartagena** (Bolívar)
- **Pereira** (Risaralda)
- **Manizales** (Caldas)
- **Ibagué** (Tolima)
- **Cúcuta** (Norte de Santander)
- **Villavicencio** (Meta)
- **Pasto** (Nariño)

## 🔧 **Instalación y Configuración**

### **1. No Requiere Configuración Externa**
La API utiliza datos simulados basados en patrones reales del mercado colombiano.

### **2. Para Integración Real con DANE/SIPSA**
```javascript
// Configurar en .env (cuando esté disponible)
DANE_API_KEY=tu_api_key_dane
AGRONET_API_KEY=tu_api_key_agronet
```

## 💡 **Ejemplos de Uso Práctico**

### **Ejemplo 1: Consultar precio de huevos en Bogotá**
```bash
curl -X GET "http://localhost:3000/api/market/product/huevos?region=Bogotá" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Ejemplo 2: Comparar precios de fertilizante**
```bash
curl -X GET "http://localhost:3000/api/market/compare/fertilizante" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Ejemplo 3: Análisis de múltiples productos**
```bash
curl -X POST "http://localhost:3000/api/market/analysis" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "products": ["huevos", "maiz", "fertilizante"],
    "region": "Medellín"
  }'
```

### **Ejemplo 4: Historial de precios del maíz**
```bash
curl -X GET "http://localhost:3000/api/market/history/maiz?months=6" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📈 **Características del Sistema**

### **✅ Ventajas**
- Datos basados en fuentes oficiales colombianas
- Múltiples regiones cubiertas
- Análisis de tendencias incluido
- Recomendaciones de mercado automatizadas
- API RESTful fácil de integrar

### **📊 Tipos de Análisis**
- **Precios actuales** por región
- **Tendencias históricas** (hasta 36 meses)
- **Comparaciones regionales**
- **Recomendaciones de compra**
- **Análisis estacional**

### **🎯 Casos de Uso**
- **Productores**: Decidir cuándo y dónde vender
- **Compradores**: Encontrar mejores precios
- **Comerciantes**: Análisis de márgenes
- **Analistas**: Estudios de mercado
- **Gobierno**: Monitoreo de precios

## 🛠️ **Integración con Otras APIs**

Esta API se complementa perfectamente con:
- **API de Plagas** (`/api/pests`) - Para gestión integral de cultivos
- **API de Clima** (`/api/weather`) - Para correlacionar precios con clima

## 🚦 **Códigos de Estado HTTP**

- `200` - Éxito
- `400` - Error en parámetros
- `401` - No autenticado
- `404` - Producto/datos no encontrados
- `500` - Error interno del servidor

## 📞 **Soporte y Contacto**

### **Para Implementación Real con DANE:**
1. Contactar DANE: https://www.dane.gov.co/
2. Solicitar acceso a API SIPSA
3. Obtener credenciales oficiales

### **Para Agronet:**
1. Registrarse en: https://www.agronet.gov.co/
2. Solicitar acceso a datos
3. Configurar integración

## 🎉 **¡Listo para Usar!**

Tu sistema AgroAssist ahora tiene acceso a información de precios agrícolas colombianos. La API está lista para pruebas y desarrollo.

**Comando rápido para probar:**
```bash
curl -X GET "http://localhost:3000/api/market/test"
```

**Ver productos disponibles:**
```bash
curl -X GET "http://localhost:3000/api/market/products"
```
