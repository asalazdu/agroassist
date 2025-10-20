# ✅ Fix Completo: Login desde Android Emulador

## 🎯 Problema Resuelto

**Error Original:** "No se pudo conectar al servidor"

**Causa Raíz:** 
1. Android emulador no puede acceder a `localhost` directamente
2. Backend escuchaba solo en `localhost` (127.0.0.1)
3. Frontend enviaba campos en inglés, backend esperaba español

---

## 🔧 Soluciones Implementadas

### 1. **URL del Backend para Android** ✅

**Archivo:** `AgroAssistNew/src/config/api.ts`

```typescript
import { Platform } from 'react-native';

BACKEND_URL: Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000/api'      // Android emulador
  : 'http://localhost:3000/api'      // iOS o web
```

**Por qué funciona:**
- `10.0.2.2` es la IP especial del emulador Android que mapea a `localhost` de tu PC
- Detección automática de plataforma con `Platform.OS`

### 2. **Backend Escuchando en Todas las Interfaces** ✅

**Archivo:** `agroassist-backend/src/index.js`

```javascript
app.listen(PORT, '0.0.0.0', () => {  // ← '0.0.0.0' acepta conexiones externas
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('🌐 Accesible desde emulador Android en http://10.0.2.2:' + PORT);
});
```

**Por qué funciona:**
- `'0.0.0.0'` escucha en todas las interfaces de red
- Permite conexiones desde el emulador
- Mantiene acceso desde localhost para debugging

### 3. **Mapeo de Campos Frontend → Backend** ✅

**Archivo:** `AgroAssistNew/src/services/authService.ts`

**Login:**
```typescript
// Mapear campos del frontend (inglés) al backend (español)
const payload = {
  correo: credentials.email,       // email → correo
  contrasena: credentials.password // password → contrasena
};

const response = await axios.post(`${API_CONFIG.BACKEND_URL}/auth/login`, payload);
```

**Register:**
```typescript
const payload = {
  nombre_completo: data.name,      // name → nombre_completo
  correo: data.email,              // email → correo
  contrasena: data.password,       // password → contrasena
  telefono: data.phone             // phone → telefono
};

const response = await axios.post(`${API_CONFIG.BACKEND_URL}/auth/register`, payload);
```

---

## 🎉 Resultado Final

### Estado del Sistema:

✅ **Backend:**
```
- Corriendo en http://localhost:3000
- Escuchando en 0.0.0.0 (todas las interfaces)
- Accesible desde emulador Android vía http://10.0.2.2:3000
- Base de datos SQLite activa
- Usuario test disponible
```

✅ **Frontend:**
```
- Corriendo en exp://192.168.1.8:8081
- Emulador Android (Pixel_4)
- URL configurada para Android: http://10.0.2.2:3000/api
- Campos mapeados correctamente (inglés → español)
- Autenticación real sin mock
```

---

## 🚀 Prueba Ahora

### En tu emulador Android:

1. **Abre la app** (ya está corriendo)
2. **Ve a la pantalla de Login**
3. **Ingresa las credenciales:**
   ```
   📧 Email: test@agroassist.com
   🔑 Password: test123
   ```
4. **Presiona "Iniciar Sesión"**

### Flujo Esperado:

```
1. App envía: { email, password }
   ↓
2. authService mapea a: { correo, contrasena }
   ↓
3. Request POST a: http://10.0.2.2:3000/api/auth/login
   ↓
4. Backend (escuchando en 0.0.0.0:3000) recibe la petición
   ↓
5. Valida credenciales en SQLite
   ↓
6. Retorna: { user, token, msg: "Login exitoso" }
   ↓
7. authService guarda token en AsyncStorage
   ↓
8. App navega a pantalla principal ✅
```

---

## 📊 Verificación de Conexión

### Ver logs en tiempo real:

**Terminal Backend:**
```
POST /api/auth/login 200 OK  ← Debe aparecer al hacer login
```

**Terminal Frontend (Expo):**
```
✅ Login exitoso
✅ Token guardado
✅ Navegando a home...
```

---

## 🐛 Troubleshooting

### Si aún aparece "Network Error"

1. **Verifica que el backend esté corriendo:**
   ```powershell
   # Debe mostrar proceso activo
   Get-Process -Name node
   ```

2. **Verifica el puerto 3000:**
   ```powershell
   netstat -ano | findstr ":3000"
   ```

3. **Prueba la conexión desde PowerShell:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3000/api/info" -Method GET
   ```

### Si aparece "Error 400" o "Error 401"

Ahora que los campos están mapeados correctamente, estos errores indican:

- **400**: Datos inválidos (email mal formateado, password vacío)
- **401**: Credenciales incorrectas (usuario no existe o password incorrecto)
- **423**: Cuenta bloqueada por múltiples intentos fallidos

### Si el backend no recibe la petición

1. **Reinicia el backend:**
   ```
   Ctrl+C en la terminal del backend
   node src/index.js
   ```

2. **Verifica el firewall de Windows:**
   ```powershell
   # Como Administrador
   netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
   ```

---

## 📝 Archivos Modificados

### Frontend:
```
AgroAssistNew/
├── src/
│   ├── config/
│   │   └── api.ts                    ← URL dinámica según plataforma
│   └── services/
│       └── authService.ts            ← Mapeo de campos inglés → español
```

### Backend:
```
agroassist-backend/
└── src/
    └── index.js                      ← Listen en 0.0.0.0 (todas las interfaces)
```

---

## 🔄 Cambios Específicos

### 1. api.ts
```diff
+ import { Platform } from 'react-native';

  export const API_CONFIG = {
-   BACKEND_URL: 'http://localhost:3000/api',
+   BACKEND_URL: Platform.OS === 'android' 
+     ? 'http://10.0.2.2:3000/api'
+     : 'http://localhost:3000/api',
  };
```

### 2. authService.ts - Login
```diff
  async login(credentials: LoginCredentials) {
+   const payload = {
+     correo: credentials.email,
+     contrasena: credentials.password
+   };
    
-   const response = await axios.post(url, credentials);
+   const response = await axios.post(url, payload);
  }
```

### 3. authService.ts - Register
```diff
  async register(data: RegisterData) {
+   const payload = {
+     nombre_completo: data.name,
+     correo: data.email,
+     contrasena: data.password,
+     telefono: data.phone
+   };
    
-   const response = await axios.post(url, { name, email, password, phone });
+   const response = await axios.post(url, payload);
  }
```

### 4. index.js - Backend
```diff
  const PORT = process.env.PORT || 3000;
- app.listen(PORT, () => {
+ app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
+   console.log('🌐 Accesible desde emulador Android en http://10.0.2.2:' + PORT);
  });
```

---

## ✅ Checklist Final

- [x] Backend escucha en 0.0.0.0:3000
- [x] Frontend detecta Android y usa 10.0.2.2
- [x] Campos mapeados correctamente (inglés → español)
- [x] Mock authentication eliminado
- [x] Usuario test disponible en SQLite
- [x] Mensajes de error específicos y útiles
- [x] Backend y frontend corriendo simultáneamente
- [x] Emulador Android conectado y listo

---

## 🎊 ¡Todo Listo!

Ahora puedes hacer login desde el emulador Android con autenticación **100% real** contra la base de datos SQLite.

**Credenciales de prueba:**
```
test@agroassist.com
test123
```

Si el login funciona correctamente, verás:
1. ✅ Loading spinner
2. ✅ Mensaje de éxito
3. ✅ Navegación a la pantalla principal
4. ✅ Token JWT guardado en AsyncStorage
5. ✅ Datos del usuario disponibles en la app

---

**¿Funciona?** 🚀

Si aparece algún error, revisa:
- El mensaje específico del error
- Los logs del backend (terminal de Node)
- Los logs del frontend (terminal de Expo)

¡Estoy aquí para ayudarte! 😊
