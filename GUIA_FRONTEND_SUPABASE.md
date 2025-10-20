# Guía de Conexión Frontend con Supabase

## 🎯 Cambios Realizados

### 1. Instalación de Dependencias
```bash
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
```

### 2. Configuración de Supabase
**Archivo:** `config/supabase.ts`
- Cliente Supabase configurado con ANON_KEY (pública)
- URL: https://endtgngduxyxdyponecx.supabase.co
- Modo: Frontend público (sin Auth de Supabase)

### 3. Actualización de API Config
**Archivo:** `config/api.ts`
- URL actualizada para Android Emulator: `http://10.0.2.2:3000/api`
- URL alternativa para web/iOS: `http://localhost:3000/api`
- Referencia de Supabase agregada

### 4. Actualización del Servicio de Autenticación
**Archivo:** `services/authService.ts`

**Cambios en interfaces:**
- `email` → `correo` (coincide con backend)
- `password` → `contrasena`
- `success` → `ok` (coincide con respuestas del backend)
- `message` → `msg`  (backend usa ambos)
- Usuario actualizado con campos de Supabase

**Métodos actualizados:**
- ✅ `login()` - Usa correo y contrasena
- ✅ `register()` - Usa nombre_completo, correo, contrasena
- ✅ `updateProfile()` - Compatible con estructura de Supabase

## 📱 Para Probar en Android Emulator

### 1. Asegúrate de que el backend esté corriendo:
```bash
cd agroassist-backend
node src/index.js
```

Deberías ver:
```
✅ Supabase client configurado
🔐 Modo: SERVICE_ROLE (Admin - RLS Bypass)
Servidor corriendo en http://localhost:3000
```

### 2. Inicia la aplicación móvil:
```bash
cd AgroAssistMobile
npm start
```

### 3. Presiona 'a' para abrir en Android Emulator

### 4. Prueba con el usuario migrado:
- **Email:** test@agroassist.com
- **Contraseña:** test123

## 🔧 Configuración para Diferentes Entornos

### Android Emulator
```typescript
BASE_URL: 'http://10.0.2.2:3000/api'
```

### iOS Simulator / Web
```typescript
BASE_URL: 'http://localhost:3000/api'
```

### Dispositivo Físico (misma red WiFi)
```typescript
BASE_URL: 'http://[TU_IP_LOCAL]:3000/api'
// Ejemplo: 'http://192.168.1.100:3000/api'
```

## 📊 Estructura de Datos Actualizada

### Login Request
```json
{
  "correo": "test@agroassist.com",
  "contrasena": "test123"
}
```

### Login Response
```json
{
  "ok": true,
  "msg": "Inicio de sesión exitoso",
  "token": "eyJhbGc...",
  "user": {
    "id": 2,
    "nombre": "Usuario Test",
    "correo": "test@agroassist.com",
    "rol": 2
  }
}
```

### Register Request
```json
{
  "nombre_completo": "Juan Pérez",
  "correo": "juan@example.com",
  "contrasena": "Password123!",
  "telefono": "+57 300 1234567",
  "ubicacion": "Bogotá, Colombia",
  "tamaño_finca": "5 hectáreas"
}
```

## 🚨 Troubleshooting

### Error: "No es posible conectar con el servidor remoto"
- ✅ Verifica que el backend esté corriendo en puerto 3000
- ✅ En Android Emulator, usa `10.0.2.2` en lugar de `localhost`
- ✅ Verifica que el firewall permita conexiones en puerto 3000

### Error: "Usuario no existe"
- ✅ Verifica que el usuario esté migrado a Supabase
- ✅ Revisa que estés usando `correo` en lugar de `email`

### Error: "Row Level Security policy"
- ✅ Verifica que el backend esté usando `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Revisa los logs del backend: debe decir "SERVICE_ROLE (Admin - RLS Bypass)"

## ✅ Verificación de Conexión

### Test desde el navegador:
```bash
# Ping al backend
curl http://localhost:3000/ping

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"test@agroassist.com","contrasena":"test123"}'
```

## 🎉 Estado Actual

- ✅ Backend funcionando con Supabase PostgreSQL
- ✅ Usuario de prueba migrado y verificado
- ✅ Frontend actualizado con interfaces correctas
- ✅ Supabase SDK instalado
- ✅ AsyncStorage configurado
- ⏳ Pendiente: Probar en emulador Android

## 📚 Próximos Pasos

1. **Probar Login/Register** en el emulador
2. **Implementar funcionalidades adicionales:**
   - Gestión de cultivos (tabla `cultivos_usuario`)
   - Historial de clima (tabla `registros_clima`)
   - Historial de chatbot (tabla `consultas_chatbot`)
   - Subida de fotos (tabla `fotos_cultivos` + Supabase Storage)
3. **Configurar el chatbot** con nueva BD
4. **Deploy a producción**

