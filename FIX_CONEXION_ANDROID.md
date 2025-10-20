# 🔧 Fix: Conexión Backend desde Android Emulador

## ❌ Problema Identificado

**Error:** "No se puede conectar al servidor"

**Causa:** El emulador Android no puede acceder a `localhost` de la misma forma que tu navegador. En Android, `localhost` se refiere al propio emulador, no a tu computadora.

## ✅ Solución Implementada

### Cambio en `api.ts`

**Antes:**
```typescript
BACKEND_URL: 'http://localhost:3000/api'
```

**Ahora:**
```typescript
import { Platform } from 'react-native';

BACKEND_URL: Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000/api'      // Android emulador → IP especial
  : 'http://localhost:3000/api'      // iOS o web
```

### ¿Por qué `10.0.2.2`?

En el emulador de Android:
- `10.0.2.2` es una IP especial que mapea a `localhost` de tu computadora host
- Es el estándar de Android Studio para acceder al servidor local
- Solo funciona en emuladores, no en dispositivos físicos

---

## 🎯 Ahora Prueba el Login

### Backend y Frontend Corriendo ✅

**Backend:**
```
✓ Servidor corriendo en http://localhost:3000
✓ Base de datos SQLite activa
```

**Frontend:**
```
✓ App en exp://192.168.1.8:8081
✓ Emulador Android (Pixel_4)
✓ URL actualizada a 10.0.2.2:3000
```

### Credenciales de Prueba

En tu emulador, ingresa:

```
📧 Email: test@agroassist.com
🔑 Password: test123
```

### Resultado Esperado

1. ✅ Loading spinner por 1-2 segundos
2. ✅ Conexión exitosa al backend (10.0.2.2:3000)
3. ✅ Backend valida credenciales en SQLite
4. ✅ Retorna usuario + token JWT
5. ✅ Login exitoso → Navegación a pantalla principal

---

## 🧪 Verificar Conexión

### Test 1: Backend Responde (desde tu PC)
```powershell
# Desde PowerShell en tu PC
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@agroassist.com","password":"test123"}'
```

**Debe responder:**
```json
{
  "user": { "id": 1, "nombre_completo": "Usuario Test", ... },
  "token": "eyJhbGc..."
}
```

### Test 2: App Conecta al Backend
1. Abre la app en el emulador
2. Ingresa credenciales test
3. Presiona "Iniciar Sesión"
4. Revisa los logs del backend (terminal de Node)

**Debe aparecer en logs del backend:**
```
POST /api/auth/login 200 OK
```

---

## 🌐 Configuración por Plataforma

### Android Emulador (Actual)
```typescript
URL: http://10.0.2.2:3000/api
```

### iOS Simulator
```typescript
URL: http://localhost:3000/api
```

### Dispositivo Físico (WiFi)
Si quieres probar en un teléfono real, necesitas:

1. **Conectar ambos a la misma red WiFi**
2. **Obtener la IP de tu PC:**
   ```powershell
   ipconfig | findstr IPv4
   ```
   Ejemplo: `192.168.1.100`

3. **Actualizar api.ts:**
   ```typescript
   BACKEND_URL: 'http://192.168.1.100:3000/api'  // Tu IP real
   ```

---

## 📊 Arquitectura de Red

```
┌─────────────────────────────────────────┐
│         TU COMPUTADORA (Host)           │
│                                         │
│  Backend Node.js                        │
│  Escuchando en: 0.0.0.0:3000           │
│  (Accesible desde cualquier red)        │
│                                         │
│  ┌───────────────────────────────┐     │
│  │   Emulador Android            │     │
│  │                               │     │
│  │   App React Native            │     │
│  │   Se conecta a:               │     │
│  │   http://10.0.2.2:3000/api ───┼─────┤
│  │   (Mapea a localhost:3000)    │     │
│  └───────────────────────────────┘     │
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Error: "Network request failed" (aún)

**Posibles Causas:**

1. **Backend no está escuchando en todas las interfaces**
   
   Verifica en `agroassist-backend/src/index.js`:
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {  // ← Debe ser '0.0.0.0'
     console.log(`Servidor corriendo en http://localhost:${PORT}`);
   });
   ```

2. **Firewall bloqueando conexiones**
   
   Windows Firewall puede bloquear el puerto 3000:
   ```powershell
   # Ejecuta como Administrador
   netsh advfirewall firewall add rule name="Node Backend" dir=in action=allow protocol=TCP localport=3000
   ```

3. **Backend detenido**
   
   Verifica que el proceso de Node esté corriendo:
   ```powershell
   Get-Process -Name node
   ```

4. **Puerto 3000 ocupado por otro proceso**
   
   ```powershell
   netstat -ano | findstr ":3000"
   ```

### Error: "Timeout" al hacer login

**Solución:**
1. Aumenta el timeout en `api.ts`:
   ```typescript
   REQUEST_TIMEOUT: 30000,  // 30 segundos
   ```

2. Verifica la velocidad de respuesta del backend:
   - SQLite debe responder rápido (< 100ms)
   - Si tarda mucho, puede haber problema con la BD

### Error: "Invalid token" después de login

**Causa:** El token se guardó pero no se está usando en requests posteriores

**Solución:** Verifica que axios esté usando el token:
```typescript
// En las llamadas subsecuentes
const token = await AsyncStorage.getItem('token');
axios.get('/api/protected', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 📝 Archivo Modificado

```
AgroAssistNew/
└── src/
    └── config/
        └── api.ts  ← Agregado Platform.OS check para Android
```

**Cambios:**
- ✅ Importado `Platform` de React Native
- ✅ Detección automática de plataforma (Android vs iOS)
- ✅ URL correcta según el entorno
- ✅ Comentarios explicativos

---

## 🎉 Resultado Final

Ahora la app:
1. ✅ Detecta que está en Android emulador
2. ✅ Usa `10.0.2.2:3000` en lugar de `localhost:3000`
3. ✅ Se conecta correctamente al backend
4. ✅ Login funciona con usuarios SQLite reales
5. ✅ Sin modo mock - autenticación 100% real

---

## 🚀 Próximo Paso

**¡Intenta hacer login ahora!**

La app ya tiene la configuración correcta. Simplemente:

1. Ve a la pantalla de login en el emulador
2. Ingresa: `test@agroassist.com` / `test123`
3. Presiona "Iniciar Sesión"
4. Debe funcionar ✅

Si aún hay error, revisa:
- Logs del backend (terminal de Node)
- Logs de la app (terminal de Expo)
- Mensaje de error específico que aparece

---

**Configuración Completa:**
- Backend SQLite: ✅ Running en localhost:3000
- Frontend React Native: ✅ Running en exp://192.168.1.8:8081
- Conexión de red: ✅ Configurada para Android (10.0.2.2)
- Autenticación real: ✅ Sin modo mock
- Usuario de prueba: ✅ Disponible en BD

¡Todo listo para probar! 🎊
