# 📱 Guía de Prueba - Actualización de Perfil

## Estado Actual
✅ Backend corriendo en: `http://10.0.2.2:3000`  
✅ Frontend corriendo en: `exp://192.168.1.8:8082`  
✅ Endpoint implementado: `PUT /api/auth/profile`

## 🧪 Pasos para Probar la Actualización de Perfil

### 1️⃣ Asegúrate de estar logueado

Si no has iniciado sesión, usa estas credenciales:
- **Email**: `test@agroassist.com`
- **Contraseña**: `test123`

### 2️⃣ Ir a la Pantalla de Perfil

1. En el menú inferior, toca el ícono de **Perfil** (última opción)
2. Verás tu información actual:
   - Email (bloqueado, no editable)
   - Nombre completo
   - Teléfono
   - Ubicación
   - Tamaño de finca

### 3️⃣ Editar el Perfil

1. Toca el botón **"Editar"** en la esquina superior derecha
2. Notarás que:
   - ✅ El campo **Email está deshabilitado** (gris)
   - ✅ Puedes editar: **Nombre, Teléfono, Ubicación, Tamaño de finca**
3. Modifica uno o más campos, por ejemplo:
   ```
   Nombre: Juan Pérez López
   Teléfono: 3001234567
   Ubicación: Bogotá, Cundinamarca
   Tamaño de finca: 25.5
   ```

### 4️⃣ Guardar los Cambios

1. Toca el botón **"Guardar"**
2. Deberías ver un mensaje de confirmación
3. Los campos volverán a modo solo lectura

### 5️⃣ Verificar Persistencia

Para verificar que los datos se guardaron en la base de datos:

**Opción A: Cerrar y abrir la app**
1. Cierra completamente la app (no solo minimizar)
2. Vuelve a abrirla
3. Inicia sesión de nuevo
4. Ve a Perfil
5. ✅ **Deberías ver los cambios que hiciste**

**Opción B: Verificar en la base de datos**
```powershell
# Abrir SQLite
sqlite3 "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend\database\agroassist.db"

# Ver el usuario actualizado
SELECT id, nombre_completo, correo, telefono, ubicacion, tamaño_finca 
FROM usuarios 
WHERE correo = 'test@agroassist.com';

# Salir
.exit
```

## 📊 Qué Esperar

### ✅ Comportamiento Correcto

**Durante la edición:**
- Email aparece deshabilitado con texto gris
- Mensaje: "El email no puede ser modificado"
- Puedes editar los otros 4 campos libremente

**Al guardar:**
- Mensaje de éxito (toast o alert)
- Los campos vuelven a solo lectura
- La información se actualiza en la pantalla

**En el backend (logs):**
```
📝 Actualizando perfil usuario ID: 3
   Datos: {
     "nombre_completo": "Juan Pérez López",
     "telefono": "3001234567",
     "ubicacion": "Bogotá, Cundinamarca",
     "tamaño_finca": "25.5"
   }
```

**Después de cerrar/abrir app:**
- Los cambios persisten
- Los datos vienen de la base de datos, no de AsyncStorage

### ❌ Posibles Errores

**Error 401 - Token no válido:**
- Solución: Cierra sesión y vuelve a iniciar sesión

**Error 404 - Ruta no encontrada:**
- Solución: Verifica que el backend esté corriendo
- Reinicia el backend si es necesario

**Error 400 - Validación fallida:**
- Nombre debe tener al menos 3 caracteres
- Teléfono debe tener al menos 7 caracteres
- Ubicación debe tener al menos 3 caracteres
- Tamaño de finca debe ser un número

**Network Error:**
- Verifica que el backend esté en `http://10.0.2.2:3000`
- Verifica que no haya firewall bloqueando

## 🔍 Debugging

### Ver logs del backend
Observa la terminal del backend mientras guardas cambios. Deberías ver:
```
📝 Actualizando perfil usuario ID: 3
   Datos: { ... }
```

### Ver logs del frontend
En Expo, observa la terminal. Si hay errores, aparecerán aquí.

### Verificar el token
```typescript
// En la app, puedes verificar si tienes token:
import authService from './src/services/authService';
const token = await authService.getStoredToken();
console.log('Token:', token ? 'Existe' : 'No existe');
```

## 🎯 Casos de Prueba

### Caso 1: Actualizar solo el nombre
```
Nombre: María García Rodríguez
(Dejar los demás campos sin cambios)
```
✅ Resultado esperado: Solo el nombre se actualiza en BD

### Caso 2: Actualizar todos los campos
```
Nombre: Carlos López Martínez
Teléfono: 3009876543
Ubicación: Medellín, Antioquia
Tamaño de finca: 50.75
```
✅ Resultado esperado: Todos los campos se actualizan

### Caso 3: Intentar actualizar el email
```
(Intentar editar el campo email)
```
✅ Resultado esperado: El campo NO se puede editar (está bloqueado)

### Caso 4: Validación - Nombre muy corto
```
Nombre: Ab
```
❌ Resultado esperado: Error - "El nombre debe tener al menos 3 caracteres"

### Caso 5: Validación - Teléfono muy corto
```
Teléfono: 123
```
❌ Resultado esperado: Error - "El teléfono debe tener al menos 7 caracteres"

## 🔐 Seguridad Verificada

✅ **JWT requerido**: Sin token, no se puede actualizar  
✅ **Email protegido**: No se puede cambiar el email  
✅ **Contraseña protegida**: No se puede cambiar por esta ruta  
✅ **Usuario correcto**: Solo puedes actualizar tu propio perfil  
✅ **Validaciones**: Tipos y longitudes validadas  

## 📝 Comandos Útiles

### Reiniciar Backend
```powershell
cd "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend"
node src/index.js
```

### Reiniciar Frontend
```powershell
cd "c:\Users\juanl\Documents\final Login\agroassist\AgroAssistNew"
npx expo start --port 8082
```

### Ver base de datos
```powershell
sqlite3 "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend\database\agroassist.db"
SELECT * FROM usuarios;
.exit
```

### Limpiar datos de la app (si necesitas)
En el emulador Android:
1. Settings → Apps → Expo Go
2. Storage → Clear Data

## 🎉 Resultado Final

Después de seguir estos pasos, deberías poder:
- ✅ Editar tu perfil (nombre, teléfono, ubicación, tamaño de finca)
- ✅ Ver que el email NO se puede editar
- ✅ Guardar los cambios
- ✅ Cerrar y abrir la app
- ✅ **Ver que los cambios persisten** (guardados en SQLite)

Si todo funciona, ¡la implementación está completa! 🎊

---

**Fecha de prueba**: Octubre 1, 2025  
**Backend**: SQLite con endpoint PUT /api/auth/profile  
**Frontend**: React Native con autenticación JWT  
