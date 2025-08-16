# 🚀 Guía de Postman - AgroBot Chatbot API

## Configuración Inicial

### 1. Variables de Entorno en Postman
Crea una colección y agrega estas variables:
- `base_url`: `http://localhost:3000`
- `auth_token`: (se llenará después del login)

### 2. Colección de Requests

## 📋 Requests Básicos

### **1. Información del Chatbot**
```http
GET {{base_url}}/api/chatbot/
```
**Headers:** Ninguno
**Respuesta esperada:** Información general del chatbot

---

### **2. Verificar Capacidades**
```http
GET {{base_url}}/api/chatbot/capabilities
```
**Headers:** Ninguno
**Respuesta esperada:** Lista de funcionalidades disponibles

---

### **3. Estado de Salud**
```http
GET {{base_url}}/api/chatbot/health
```
**Headers:** Ninguno
**Respuesta esperada:** Estado de servicios (clima, IA, etc.)

---

## 🔐 Autenticación Requerida

### **4. Login (Prerequisito)**
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "tu_email@ejemplo.com",
  "password": "tu_password"
}
```
**Nota:** Copia el token de la respuesta y úsalo en el header Authorization

---

### **5. Consulta Simple al Chatbot**
```http
POST {{base_url}}/api/chatbot/message
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "message": "Hola, ¿cómo estás?"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "response": {
      "text": "¡Hola! 👋 Soy AgroBot, tu asistente agrícola inteligente...",
      "type": "general",
      "source": "rules",
      "confidence": "medium"
    },
    "suggestions": [
      "Consultar clima de mi región",
      "Ver cultivos recomendados",
      "Identificar plagas"
    ]
  }
}
```

---

### **6. Consulta sobre Clima**
```http
POST {{base_url}}/api/chatbot/message
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "message": "¿Cómo estará el clima en Bogotá esta semana?",
  "context": {
    "location": {
      "city": "Bogotá",
      "country": "CO"
    }
  }
}
```

**Respuesta esperada:**
- Pronóstico de 3 días
- Recomendaciones agrícolas
- Sugerencias de acciones

---

### **7. Consulta sobre Cultivos**
```http
POST {{base_url}}/api/chatbot/message
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "message": "¿Cuándo es el mejor momento para sembrar maíz?"
}
```

**Respuesta esperada:**
- Épocas ideales de siembra
- Condiciones climáticas
- Cuidados principales

---

### **8. Consulta sobre Plagas**
```http
POST {{base_url}}/api/chatbot/message
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "message": "Las hojas de mi tomate tienen manchas amarillas"
}
```

**Respuesta esperada:**
- Posibles diagnósticos
- Métodos de control
- Recomendaciones preventivas

---

### **9. Obtener Sugerencias**
```http
GET {{base_url}}/api/chatbot/suggestions
Authorization: Bearer {{auth_token}}
```

**Con ubicación:**
```http
GET {{base_url}}/api/chatbot/suggestions?location={"city":"Medellín","country":"CO"}
Authorization: Bearer {{auth_token}}
```

---

### **10. Historial de Conversaciones**
```http
GET {{base_url}}/api/chatbot/history?limit=5
Authorization: Bearer {{auth_token}}
```

---

### **11. Enviar Feedback**
```http
POST {{base_url}}/api/chatbot/feedback
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "conversationId": "conv_12345",
  "feedback": "helpful",
  "comment": "Muy útil la información sobre plagas"
}
```

**Tipos de feedback válidos:**
- `helpful`
- `not_helpful`
- `incorrect`
- `excellent`

---

## 🧪 Tests Avanzados

### **12. Consulta Compleja con Contexto**
```http
POST {{base_url}}/api/chatbot/message
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "message": "Estoy en Medellín y quiero sembrar papa. ¿Es buen momento? ¿Cómo estará el clima?",
  "context": {
    "location": {
      "city": "Medellín",
      "country": "CO"
    },
    "userPreferences": {
      "experience": "beginner",
      "farmSize": "small"
    }
  }
}
```

---

### **13. Consulta sobre Calendario Agrícola**
```http
POST {{base_url}}/api/chatbot/message
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "message": "¿Qué actividades agrícolas recomiendas para este mes?"
}
```

---

### **14. Mensaje con Múltiples Temas**
```http
POST {{base_url}}/api/chatbot/message
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "message": "Tengo un cultivo de arroz con problemas de plagas y necesito saber si lloverá esta semana para decidir el tratamiento"
}
```

---

## 🔍 Casos de Error

### **15. Mensaje Vacío (Error 400)**
```http
POST {{base_url}}/api/chatbot/message
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "message": ""
}
```

---

### **16. Sin Token de Autenticación (Error 401)**
```http
POST {{base_url}}/api/chatbot/message
Content-Type: application/json

{
  "message": "¿Cómo sembrar maíz?"
}
```

---

### **17. Feedback Inválido (Error 400)**
```http
POST {{base_url}}/api/chatbot/feedback
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "conversationId": "conv_123",
  "feedback": "invalid_type"
}
```

---

## 📊 Scripts de Postman

### **Script para Guardar Token Automáticamente**
Agrega este script en el tab "Tests" del request de login:

```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    
    const response = pm.response.json();
    if (response.success && response.data.token) {
        pm.environment.set("auth_token", response.data.token);
        console.log("Token guardado automáticamente");
    }
});
```

### **Script para Validar Respuestas del Chatbot**
Agrega este script en los requests del chatbot:

```javascript
pm.test("Chatbot response structure", function () {
    const response = pm.response.json();
    
    pm.expect(response).to.have.property('success');
    pm.expect(response).to.have.property('data');
    pm.expect(response.data).to.have.property('response');
    pm.expect(response.data.response).to.have.property('text');
    pm.expect(response.data.response).to.have.property('type');
});

pm.test("Response has suggestions", function () {
    const response = pm.response.json();
    pm.expect(response.data).to.have.property('suggestions');
    pm.expect(response.data.suggestions).to.be.an('array');
});
```

---

## 🎯 Ejemplos de Mensajes por Categoría

### **Clima** 🌤️
- "¿Cómo estará el tiempo mañana?"
- "¿Es buena época para riego?"
- "¿Viene temporal esta semana?"
- "El clima está muy seco, ¿qué hago?"

### **Cultivos** 🌱
- "¿Cuándo sembrar tomate?"
- "¿Cómo cuidar el maíz?"
- "¿Qué fertilizante usar para papa?"
- "¿Cuánto dura el ciclo del arroz?"

### **Plagas** 🐛
- "Mi planta tiene hojas amarillas"
- "¿Cómo controlar la mosca blanca?"
- "¿Qué plagas atacan el frijol?"
- "Veo gusanos en el maíz"

### **Calendario** 📅
- "¿Qué sembrar en marzo?"
- "¿Es época de cosecha?"
- "¿Cuándo fertilizar?"
- "¿Qué hacer en invierno?"

### **General** 💬
- "Hola"
- "¿En qué me puedes ayudar?"
- "Soy nuevo en agricultura"
- "¿Qué cultivo es más rentable?"

---

## 🔧 Tips de Testing

1. **Orden recomendado:** Siempre hacer login primero
2. **Variables:** Usa variables de entorno para base_url y token
3. **Contexto:** Incluye ubicación para mejores respuestas
4. **Feedback:** Prueba todos los tipos de feedback
5. **Errores:** Valida que los errores devuelvan estructura correcta

---

**¡Listo para probar AgroBot! 🚀🤖**
