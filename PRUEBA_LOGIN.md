# 🧪 Prueba de Login - Autenticación Real

## ✅ Estado Actual

### Backend (SQLite)
```
✓ Servidor corriendo en http://localhost:3000
✓ Base de datos SQLite inicializada
✓ Tablas: roles y usuarios creadas
✓ Usuario de prueba disponible
```

### Frontend (React Native)
```
✓ App corriendo en exp://192.168.1.8:8081
✓ Metro Bundler activo
✓ Abierto en emulador Android (Pixel_4)
✓ Mock authentication ELIMINADO
```

---

## 🎯 Pasos para Probar el Login

### 1. **Verificar la Pantalla de Login**
La app debería mostrarte la pantalla de inicio con:
- Campo de email/correo
- Campo de contraseña
- Botón "Iniciar Sesión"
- Link a "Registrarse"

### 2. **Probar con Usuario de Prueba**

Ingresa estas credenciales:

```
📧 Email: test@agroassist.com
🔑 Password: test123
```

### 3. **Presionar "Iniciar Sesión"**

**Resultado Esperado ✅:**
- Loading spinner por 1-2 segundos
- Login exitoso
- Navegación a la pantalla principal
- Usuario guardado en AsyncStorage

**Si hay Error ❌:**
- Debería mostrar mensaje específico:
  * "No se pudo conectar al servidor..." → Backend apagado
  * "Credenciales incorrectas..." → Usuario o password incorrecto

### 4. **Verificar Token en Backend**

Puedes ver los logs del servidor Node para confirmar:
- Terminal donde corre `node src/index.js`
- Debe aparecer: `POST /api/auth/login 200` (exitoso)

---

## 🧪 Casos de Prueba

### ✅ Caso 1: Login Exitoso
```
Email: test@agroassist.com
Password: test123
Resultado: Debe entrar a la app
```

### ❌ Caso 2: Credenciales Incorrectas
```
Email: test@agroassist.com
Password: wrongpassword
Resultado: "Credenciales incorrectas. Verifica tu email y contraseña."
```

### ❌ Caso 3: Usuario No Existe
```
Email: noexiste@example.com
Password: cualquiera
Resultado: "Credenciales incorrectas. Verifica tu email y contraseña."
```

### ❌ Caso 4: Backend Apagado
```
1. Detén el servidor backend (Ctrl+C)
2. Intenta login
Resultado: "No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3000"
```

---

## 🔄 Probar Registro (Opcional)

Si quieres probar el registro de un nuevo usuario:

### Paso 1: Ir a "Registrarse"
- Presiona el link de registro en la pantalla de login

### Paso 2: Completar Formulario
```
📝 Nombre: Tu Nombre
📧 Email: tunombre@example.com
🔑 Password: tupassword123
📱 Teléfono: +57 300 123 4567 (opcional)
```

### Paso 3: Enviar
- Presiona "Registrar"
- Debe crear el usuario en SQLite
- Login automático
- Navegar a la app

### Paso 4: Verificar en Base de Datos (Opcional)
Puedes verificar que el usuario fue creado:

```powershell
cd "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend"
node -e "const db = require('./src/infrastructure/database/sqlite/db.js'); const users = db.query('SELECT * FROM usuarios', []); console.log(users);"
```

---

## 🐛 Troubleshooting

### Problema: "Cannot connect to Metro"
**Solución:**
1. Verifica que el comando `npm start` esté corriendo
2. Reload la app en el emulador (presiona `r` en la terminal de Expo)

### Problema: Pantalla en blanco
**Solución:**
1. Presiona `r` en la terminal de Expo para reload
2. O sacude el dispositivo y presiona "Reload"

### Problema: "Network request failed"
**Solución:**
1. Verifica que el backend esté corriendo en `localhost:3000`
2. Si estás en emulador, puede necesitar usar `10.0.2.2:3000` en lugar de `localhost:3000`
3. Para Android, el emulador puede necesitar configuración especial:
   ```javascript
   // En AgroAssistNew/src/config/api.ts
   BACKEND_URL: Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api'
   ```

### Problema: Error 401 Unauthorized
**Solución:**
1. Verifica que el email y password sean correctos
2. Asegúrate de que el usuario existe en la BD
3. El usuario test es: `test@agroassist.com / test123`

---

## 📊 Verificar Estado del Sistema

### Backend Running?
```powershell
# En terminal backend, debe mostrar:
✅ Tablas de SQLite inicializadas correctamente
Servidor corriendo en http://localhost:3000
```

### Frontend Running?
```powershell
# En terminal de Expo, debe mostrar:
› Metro waiting on exp://192.168.1.8:8081
› Scan the QR code above with Expo Go
```

### Database OK?
```powershell
# Verifica que el archivo exista:
ls "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend\database\agroassist.db"
```

---

## 🎉 Resultados Esperados

### Login Exitoso Completo:
1. ✅ Ingresa credenciales del usuario test
2. ✅ Presiona "Iniciar Sesión"
3. ✅ Loading por 1-2 segundos
4. ✅ Backend responde con usuario + token JWT
5. ✅ Token guardado en AsyncStorage
6. ✅ Navegación a pantalla principal
7. ✅ Puedes ver tu perfil con datos del usuario

### Ventajas de la Autenticación Real:
- 🔐 **Seguridad**: Contraseñas hasheadas con bcrypt
- 🎫 **Tokens JWT**: Autenticación stateless
- 🚫 **No mock data**: Solo usuarios reales
- 📊 **Trazabilidad**: Logs de login en backend
- 🔒 **Protección**: Bloqueo tras intentos fallidos
- 💾 **Persistencia**: Usuarios guardados en SQLite

---

## 📝 Notas Finales

1. **El modo mock fue eliminado completamente**
   - Ya no hay usuarios ficticios
   - Todas las credenciales deben estar en SQLite

2. **Usuario de prueba disponible**
   - Email: `test@agroassist.com`
   - Password: `test123`
   - Puedes crear más usuarios vía registro

3. **Errores claros y útiles**
   - Cada error tiene un mensaje específico
   - Te indica qué hacer para solucionarlo

4. **Backend debe estar corriendo**
   - Sin backend = app no funciona
   - Verifica siempre que `localhost:3000` esté activo

---

¡Ahora puedes probar el login! 🚀

Si encuentras algún problema, revisa la sección de Troubleshooting o consulta los logs del backend.
