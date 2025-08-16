# 🤖 AgroBot - Documentación del Chatbot Agrícola

## Descripción General

AgroBot es un asistente agrícola inteligente que combina datos climáticos, información de plagas y conocimiento agrícola para proporcionar recomendaciones personalizadas a usuarios de aplicaciones móviles agrícolas.

## 🌟 Características Principales

### 1. **Inteligencia Artificial Avanzada**
- Integración con OpenAI GPT-4 para respuestas inteligentes
- Funcionalidad de respaldo basada en reglas
- Análisis contextual de consultas

### 2. **Datos Integrados**
- **Clima**: Pronósticos de 3 días via OpenWeatherMap
- **Plagas**: Base de datos completa de plagas por cultivo
- **Cultivos**: Guías detalladas para 8+ cultivos colombianos
- **Calendario**: Recomendaciones estacionales

### 3. **Funcionalidades Inteligentes**
- Detección automática del tipo de consulta
- Sugerencias personalizadas
- Historial de conversaciones
- Sistema de feedback para mejora continua

## 🚀 Endpoints Disponibles

### **Información General**
```http
GET /api/chatbot/
```
Información básica sobre la API del chatbot.

### **Capacidades del Bot**
```http
GET /api/chatbot/capabilities
```
Obtiene información detallada sobre las funcionalidades disponibles.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "name": "AgroBot",
    "version": "1.0.0",
    "features": [
      {
        "name": "Pronósticos Climáticos",
        "description": "Análisis del clima y recomendaciones",
        "icon": "🌤️",
        "available": true
      }
    ],
    "supportedCrops": ["Maíz", "Tomate", "Arroz", "Papa", "Soja"],
    "supportedRegions": ["Bogotá", "Medellín", "Cali", "Barranquilla"]
  }
}
```

### **Estado de Salud**
```http
GET /api/chatbot/health
```
Verifica el estado de todos los servicios del chatbot.

### **Enviar Mensaje** 🔒
```http
POST /api/chatbot/message
Authorization: Bearer <token>
```

**Body:**
```json
{
  "message": "¿Cuál es el mejor momento para sembrar maíz?",
  "context": {
    "location": {
      "city": "Bogotá",
      "country": "CO"
    }
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "response": {
      "text": "🌱 **Guía para cultivar MAÍZ:**\n\n📅 **Mejor época:** Marzo-Abril y Septiembre-Octubre...",
      "type": "cultivo",
      "source": "ai",
      "confidence": "high"
    },
    "suggestions": [
      "Ver calendario de siembra",
      "Consultar clima para siembra",
      "Información de plagas del cultivo"
    ],
    "type": "cultivo",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### **Obtener Sugerencias** 🔒
```http
GET /api/chatbot/suggestions?location={"city":"Bogotá","country":"CO"}
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "¿Cuál es el pronóstico del clima para esta semana?",
      "¿Qué cultivos puedo sembrar este mes?",
      "¿Cómo identifico plagas en mis cultivos?"
    ],
    "categories": [
      {
        "name": "Clima",
        "icon": "🌤️",
        "description": "Pronósticos y recomendaciones climáticas"
      }
    ]
  }
}
```

### **Historial de Conversaciones** 🔒
```http
GET /api/chatbot/history?limit=10
Authorization: Bearer <token>
```

### **Enviar Feedback** 🔒
```http
POST /api/chatbot/feedback
Authorization: Bearer <token>
```

**Body:**
```json
{
  "conversationId": "conv_123456",
  "feedback": "helpful",
  "comment": "Muy útil la información sobre maíz"
}
```

## 🎯 Tipos de Consultas Soportadas

### 1. **Consultas sobre Clima** 🌤️
- Pronósticos meteorológicos
- Recomendaciones basadas en clima
- Alertas climáticas

**Ejemplos:**
- "¿Cómo estará el clima esta semana?"
- "¿Es buen momento para regar?"
- "¿Viene lluvia en los próximos días?"

### 2. **Consultas sobre Plagas** 🐛
- Identificación de síntomas
- Métodos de control
- Prevención

**Ejemplos:**
- "Las hojas de mi tomate están amarillas"
- "¿Cómo controlar la mosca blanca?"
- "¿Qué plagas afectan el maíz?"

### 3. **Consultas sobre Cultivos** 🌱
- Guías de siembra
- Cuidados específicos
- Momentos de cosecha

**Ejemplos:**
- "¿Cuándo sembrar papa?"
- "¿Cómo cuidar el cultivo de arroz?"
- "¿Qué fertilizante usar para soja?"

### 4. **Consultas de Calendario** 📅
- Épocas ideales de siembra
- Actividades por mes
- Planificación agrícola

**Ejemplos:**
- "¿Qué puedo sembrar en marzo?"
- "¿Cuál es el calendario de papa?"
- "¿Qué actividades hacer este mes?"

## 🧠 Inteligencia Artificial

### **Configuración con OpenAI**
Para funcionalidad completa de IA, configura la variable de entorno:
```bash
OPENAI_API_KEY=tu_clave_openai_aqui
```

### **Modo de Respaldo**
Sin OpenAI, el chatbot funciona con:
- Sistema de reglas predefinidas
- Base de conocimiento local
- Respuestas estructuradas

### **Prompts del Sistema**
El chatbot utiliza prompts especializados para cada tipo de consulta:
- **General**: Asistente agrícola amigable
- **Clima**: Análisis meteorológico especializado
- **Plagas**: Diagnóstico y control integrado
- **Cultivos**: Guías completas de cultivo

## 📱 Integración con App Móvil

### **Flujo Recomendado**
1. **Autenticación**: El usuario debe estar logueado
2. **Contexto**: Enviar ubicación si está disponible
3. **Mensaje**: Procesar consulta del usuario
4. **Respuesta**: Mostrar respuesta y sugerencias
5. **Feedback**: Permitir calificación de respuestas

### **Ejemplo de Integración React Native**
```javascript
// Enviar mensaje al chatbot
const sendMessage = async (message, userLocation) => {
  try {
    const response = await fetch('/api/chatbot/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        message: message,
        context: {
          location: userLocation
        }
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error enviando mensaje:', error);
  }
};
```

## 🔧 Configuración Técnica

### **Variables de Entorno Requeridas**
```bash
# Base de datos
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=password
DB_NAME=agroassist_db

# Autenticación
JWT_SECRET=clave_secreta

# APIs externas
WEATHER_API_KEY=clave_openweathermap  # Requerida
OPENAI_API_KEY=clave_openai          # Opcional
```

### **Dependencias del Proyecto**
```json
{
  "openai": "^4.20.1",
  "axios": "^1.4.0",
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.0",
  "express-validator": "^7.0.1"
}
```

## 🎨 Personalización

### **Agregar Nuevos Cultivos**
Edita `chatbotService.js` en la sección `knowledgeBase.cultivos`:
```javascript
'nuevo_cultivo': {
  mejor_epoca: 'Época de siembra',
  clima_ideal: 'Condiciones climáticas',
  ciclo: 'Duración del ciclo',
  cuidados: ['Cuidado 1', 'Cuidado 2']
}
```

### **Personalizar Respuestas**
Modifica los prompts del sistema en `systemPrompts` para ajustar el tono y estilo de las respuestas.

### **Agregar Nuevas Categorías**
Extiende el método `detectQueryType()` para reconocer nuevos tipos de consultas.

## 📊 Monitoreo y Analytics

### **Métricas Disponibles**
- Número de consultas por usuario
- Tipos de consultas más frecuentes
- Calificaciones de respuestas
- Uso de funcionalidades IA vs reglas

### **Logs del Sistema**
```javascript
console.log(`Conversación guardada - Usuario: ${userId}, Mensaje: ${message}`);
console.log(`Feedback recibido - Usuario: ${userId}, Tipo: ${feedback}`);
```

## 🛠️ Mantenimiento

### **Actualizar Base de Conocimiento**
1. Editar `knowledgeBase` en `chatbotService.js`
2. Agregar nuevas plagas en `pestService.js`
3. Actualizar prompts según feedback de usuarios

### **Optimización de Respuestas**
1. Analizar feedback negativo
2. Ajustar prompts de IA
3. Mejorar detección de tipos de consulta
4. Agregar nuevas sugerencias contextuales

## 🚨 Manejo de Errores

### **Errores Comunes**
- **Sin OpenAI**: Funciona con reglas predefinidas
- **API de clima no disponible**: Respuesta sin datos meteorológicos
- **Usuario no autenticado**: Error 401
- **Mensaje vacío**: Error de validación

### **Respuestas de Fallback**
```json
{
  "response": {
    "text": "Lo siento, tuve un problema procesando tu consulta...",
    "type": "error",
    "source": "fallback"
  },
  "suggestions": [
    "Intentar con una pregunta más específica",
    "Verificar conectividad"
  ]
}
```

## 📞 Soporte

Para más información sobre implementación o problemas técnicos:
- Revisa los logs del servidor
- Verifica configuración de variables de entorno
- Consulta la documentación de APIs externas (OpenWeatherMap, OpenAI)
- Valida conectividad de base de datos

---

**¡AgroBot está listo para ayudar a los agricultores con inteligencia artificial! 🚀🌾**
