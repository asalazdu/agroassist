# 📚 Documentación API con Swagger - AgroAssist

## 🎯 Acceso a la Documentación

Una vez que el backend esté corriendo, puedes acceder a la documentación interactiva de Swagger en:

### **URL Local:**
```
http://localhost:3000/api-docs
```

### **URL Red Local (desde dispositivo móvil):**
```
http://192.168.1.10:3000/api-docs
```

### **URL Emulador Android:**
```
http://10.0.2.2:3000/api-docs
```

---

## 🚀 Cómo Usar Swagger UI

### 1. **Iniciar el Backend**
```powershell
cd agroassist-backend
npm start
```

### 2. **Abrir el Navegador**
Ir a: http://localhost:3000/api-docs

### 3. **Explorar Endpoints**
- Verás todos los endpoints organizados por categorías (tags)
- Cada endpoint muestra:
  - Método HTTP (GET, POST, PUT, DELETE)
  - Ruta
  - Parámetros requeridos
  - Ejemplos de request/response
  - Códigos de estado

### 4. **Probar Endpoints (Try it out)**

#### Sin Autenticación:
```
POST /api/auth/register
POST /api/auth/login
```

#### Con Autenticación:
1. Primero haz login en: `POST /api/auth/login`
2. Copia el token de la respuesta
3. Click en **"Authorize"** (botón verde arriba a la derecha)
4. Pega el token en el campo `bearerAuth` o `xTokenAuth`
5. Click en **"Authorize"**
6. Ahora puedes probar endpoints protegidos

---

## 📋 Endpoints Documentados

### 🔐 **Autenticación** (`/api/auth`)
- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `POST /recover-password` - Recuperar contraseña
- `POST /reset-password` - Restablecer contraseña
- `GET /profile` 🔒 - Obtener perfil
- `PUT /profile` 🔒 - Actualizar perfil

### 🌾 **Cultivos** (`/api/cultivos`)
- `GET /cultivos` 🔒 - Listar cultivos
- `POST /cultivos` 🔒 - Crear cultivo
- `GET /cultivos/{id}` 🔒 - Ver cultivo específico
- `PUT /cultivos/{id}` 🔒 - Actualizar cultivo
- `DELETE /cultivos/{id}` 🔒 - Eliminar cultivo

### 🌦️ **Clima** (`/api/weather`)
- `GET /weather/city/{ciudad}` - Clima actual
- `GET /weather/forecast/{ciudad}` - Pronóstico 5 días

### 🐛 **Plagas** (`/api/plagas`)
- `POST /plagas/analyze` 🔒 - Analizar imagen con IA
- `GET /plagas/historial` 🔒 - Historial de análisis

### 💬 **Chatbot** (`/api/chatbot`)
- `POST /chatbot/query` 🔒 - Consultar chatbot
- `GET /chatbot/historial` 🔒 - Historial de conversaciones

🔒 = Requiere autenticación (JWT Token)

---

## 🔑 Autenticación en Swagger

### Método 1: Bearer Token (Recomendado)
```
1. Login: POST /api/auth/login
2. Copiar el "token" de la respuesta
3. Click "Authorize"
4. En "bearerAuth", ingresar: <tu_token>
5. Click "Authorize"
```

### Método 2: x-token Header
```
1. Login y copiar token
2. Click "Authorize"
3. En "xTokenAuth", ingresar: <tu_token>
4. Click "Authorize"
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Registro de Usuario

**Request:**
```json
POST /api/auth/register
{
  "nombre_completo": "Juan Pérez",
  "correo": "juan@example.com",
  "contrasena": "Segura123!",
  "telefono": "3001234567",
  "ubicacion": "Medellín, Antioquia",
  "tamaño_finca": 5.5
}
```

**Response (201):**
```json
{
  "ok": true,
  "msg": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "rol": 2
  }
}
```

### Ejemplo 2: Crear Cultivo (Requiere Token)

**Request:**
```json
POST /api/cultivos
Headers: {
  "Authorization": "Bearer <tu_token>"
}
Body: {
  "nombre": "Café Arábica",
  "tipo": "Perenne",
  "area": 2.5,
  "fecha_siembra": "2024-01-15",
  "estado": "activo"
}
```

**Response (201):**
```json
{
  "ok": true,
  "msg": "Cultivo creado exitosamente",
  "cultivo": {
    "id": 1,
    "nombre": "Café Arábica",
    "tipo": "Perenne",
    "area": 2.5,
    "estado": "activo",
    "id_usuario": 1
  }
}
```

### Ejemplo 3: Analizar Plaga con IA

**Request:**
```json
POST /api/plagas/analyze
Headers: {
  "Authorization": "Bearer <tu_token>"
}
Body: {
  "imagen": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "ubicacion": {
    "latitud": 6.2442,
    "longitud": -75.5812
  }
}
```

**Response (200):**
```json
{
  "ok": true,
  "analisis": {
    "identificacion": "Gusano Cogollero (Spodoptera frugiperda)",
    "confianza": 0.89,
    "severidad": "alta",
    "descripcion": "Plaga común en cultivos de maíz...",
    "tratamiento": [
      "Aplicar Bacillus thuringiensis",
      "Rotación de cultivos",
      "Control biológico con Trichogramma"
    ],
    "prevencion": [
      "Monitoreo constante",
      "Eliminación de malezas",
      "Uso de trampas con feromonas"
    ]
  }
}
```

---

## 🛠️ Personalización de Swagger

### Cambiar Título o Descripción

Editar: `src/config/swagger.js`

```javascript
info: {
  title: 'Tu Título Aquí',
  version: '2.0.0',
  description: 'Tu descripción personalizada'
}
```

### Agregar Servidor Adicional

```javascript
servers: [
  {
    url: 'https://tu-dominio.com/api',
    description: 'Servidor de Producción'
  }
]
```

### Documentar Nuevo Endpoint

En el archivo de rutas correspondiente, agregar:

```javascript
/**
 * @swagger
 * /ruta/nueva:
 *   post:
 *     summary: Descripción del endpoint
 *     tags: [NombreTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campo:
 *                 type: string
 *                 example: valor
 *     responses:
 *       200:
 *         description: Éxito
 */
router.post('/ruta/nueva', controller.metodo);
```

---

## 📊 Schemas Disponibles

### User
```json
{
  "id": 1,
  "nombre_completo": "Juan Pérez",
  "correo": "juan@example.com",
  "telefono": "3001234567",
  "ubicacion": "Medellín, Antioquia",
  "tamaño_finca": 5.5,
  "id_rol": 2,
  "activo": true
}
```

### Cultivo
```json
{
  "id": 1,
  "nombre": "Café Arábica",
  "tipo": "Perenne",
  "area": 2.5,
  "fecha_siembra": "2024-01-15",
  "estado": "activo",
  "id_usuario": 1
}
```

### WeatherData
```json
{
  "ciudad": "Medellín",
  "temperatura": 24,
  "sensacion_termica": 25,
  "humedad": 70,
  "descripcion": "Parcialmente nublado",
  "icono": "02d",
  "viento": 10,
  "presion": 1013
}
```

### PestAnalysis
```json
{
  "identificacion": "Roya del Café",
  "confianza": 0.92,
  "severidad": "media",
  "descripcion": "Enfermedad fúngica...",
  "tratamiento": ["Fungicidas", "Poda sanitaria"],
  "prevencion": ["Variedades resistentes", "Control de sombra"]
}
```

---

## 🔍 Tips para Usar Swagger Efectivamente

### 1. **Filtrar por Tag**
Click en un tag (ej: "Autenticación") para ver solo esos endpoints

### 2. **Buscar Endpoint**
Usa Ctrl+F en el navegador para buscar por nombre

### 3. **Ver JSON Schema**
Click en "Model" junto a "Example Value" para ver la estructura completa

### 4. **Copiar como cURL**
Después de "Try it out", puedes copiar el comando cURL generado

### 5. **Guardar Token**
Una vez autorizado, el token se guarda para toda la sesión

---

## 🚨 Códigos de Error Comunes

| Código | Significado | Solución |
|--------|-------------|----------|
| 400 | Bad Request | Revisar formato de datos enviados |
| 401 | Unauthorized | Verificar token o hacer login nuevamente |
| 404 | Not Found | Verificar que el recurso existe |
| 500 | Server Error | Revisar logs del backend |

---

## 📖 Documentación Adicional

- **Swagger/OpenAPI Spec:** https://swagger.io/specification/
- **Swagger UI Docs:** https://swagger.io/docs/open-source-tools/swagger-ui/
- **JSDoc para Swagger:** https://github.com/Surnet/swagger-jsdoc

---

## ✅ Checklist de Documentación

- [x] Swagger UI configurado
- [x] Autenticación documentada (JWT Bearer)
- [x] Endpoints de auth documentados
- [x] Schemas principales definidos
- [x] Ejemplos de request/response
- [x] Tags organizados por funcionalidad
- [x] Documentación accesible en http://localhost:3000/api-docs

---

**🎉 La documentación de tu API está lista!**

Accede a **http://localhost:3000/api-docs** para ver la interfaz interactiva completa.
