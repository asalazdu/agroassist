# 🔐 Autenticación Real - Sin Mock

## ✅ Cambios Realizados

Se eliminó completamente el **modo mock/demo** del `authService.ts`. Ahora la aplicación **SOLO** funciona con usuarios registrados en el backend SQLite.

### Antes ❌
- Intentaba backend → Si fallaba, usaba usuario mock
- Permitía login con cualquier email/contraseña
- Útil para desarrollo pero inseguro

### Ahora ✅
- Intentaba backend → Si falla, muestra error claro
- **REQUIERE** usuario registrado en la base de datos
- Mensajes de error específicos y útiles

---

## 🎯 Cómo Funciona Ahora

### 1. **Login** (`authService.login()`)

**Flujo:**
1. Envía credenciales a `http://localhost:3000/api/auth/login`
2. Backend valida en base de datos SQLite
3. Si es correcto: Retorna usuario + token JWT
4. Si falla: Lanza error específico

**Errores Posibles:**
- `401`: "Credenciales incorrectas. Verifica tu email y contraseña."
- `423`: "Cuenta bloqueada por múltiples intentos fallidos. Intenta más tarde."
- **Red**: "No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3000"
- Otros: Mensaje del servidor o error genérico

### 2. **Registro** (`authService.register()`)

**Flujo:**
1. Envía datos a `http://localhost:3000/api/auth/register`
2. Backend crea usuario en SQLite con contraseña hasheada
3. Si es correcto: Retorna usuario + token JWT
4. Si falla: Lanza error específico

**Errores Posibles:**
- `409/400`: "El email ya está registrado o los datos son inválidos."
- **Red**: "No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3000"
- Otros: Mensaje del servidor o error genérico

---

## 🚀 Cómo Usar

### Paso 1: Iniciar Backend
```powershell
cd "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend"
node src/index.js
```

Debes ver:
```
✅ Tablas de SQLite inicializadas correctamente
Servidor corriendo en http://localhost:3000
```

### Paso 2: Iniciar App
```powershell
cd "c:\Users\juanl\Documents\final Login\agroassist\AgroAssistNew"
npx expo start
```

### Paso 3: Usar la App

#### **Primera vez - Registrar Usuario:**
1. Abre la app en tu dispositivo/emulador
2. Ve a la pantalla de **Registro**
3. Completa el formulario:
   - Nombre completo
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Teléfono (opcional)
4. Presiona "Registrar"
5. Si todo está bien → Login automático

#### **Login con Usuario Existente:**
1. Abre la app
2. Ingresa tus credenciales
3. Presiona "Iniciar Sesión"
4. Si todo está bien → Acceso a la app

---

## 👤 Usuario de Prueba

Ya existe un usuario en la base de datos SQLite:

```
Email: test@agroassist.com
Password: test123
```

Puedes usar este usuario para hacer pruebas inmediatas.

---

## 🔧 Verificar que Funciona

### Test 1: Backend Respondiendo
```powershell
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@agroassist.com","password":"test123"}'
```

**Respuesta esperada:**
```json
{
  "user": {
    "id": 1,
    "nombre_completo": "Usuario Test",
    "correo": "test@agroassist.com",
    "id_rol": 2
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test 2: Login en la App
1. Backend corriendo ✅
2. App corriendo ✅
3. Ingresar credenciales del usuario test
4. Verificar que:
   - Se muestre mensaje de carga
   - No aparezca error
   - Navegue a la pantalla principal

### Test 3: Credenciales Incorrectas
1. Ingresar email o password incorrecto
2. Debe aparecer error: "Credenciales incorrectas. Verifica tu email y contraseña."

### Test 4: Backend Apagado
1. Detener el servidor backend (Ctrl+C)
2. Intentar login en la app
3. Debe aparecer error: "No se pudo conectar al servidor..."

---

## 🛡️ Seguridad Implementada

### Backend (SQLite)
- ✅ Contraseñas hasheadas con `bcrypt`
- ✅ Tokens JWT con expiración
- ✅ Protección contra fuerza bruta (intentos fallidos)
- ✅ Bloqueo temporal de cuentas
- ✅ Índices en columnas críticas (correo, reset_token)

### Frontend (React Native)
- ✅ Tokens guardados en `AsyncStorage`
- ✅ Validación de campos antes de enviar
- ✅ Mensajes de error claros y útiles
- ✅ No guarda contraseñas en local
- ✅ Logout limpia todos los datos

---

## 📊 Base de Datos SQLite

**Ubicación:**
```
agroassist-backend/database/agroassist.db
```

**Tablas:**

### `roles`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | PK autoincremental |
| nombre | TEXT | admin / usuario |
| descripcion | TEXT | Descripción del rol |
| creado_en | DATETIME | Timestamp de creación |

**Registros:**
- `1 - admin - Administrador del sistema`
- `2 - usuario - Usuario regular`

### `usuarios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | PK autoincremental |
| nombre_completo | TEXT | Nombre del usuario |
| correo | TEXT | Email único |
| contrasena | TEXT | Hash bcrypt |
| id_rol | INTEGER | FK a roles (default: 2) |
| intentos_fallidos | INTEGER | Contador de intentos |
| bloqueado_hasta | DATETIME | Timestamp de desbloqueo |
| reset_token | TEXT | Token para recuperar password |
| reset_token_expiration | DATETIME | Expiración del token |
| ultimo_acceso | DATETIME | Último login exitoso |
| creado_en | DATETIME | Timestamp de creación |
| actualizado_en | DATETIME | Última actualización |

---

## 🐛 Troubleshooting

### Error: "No se pudo conectar al servidor"
**Causa:** Backend no está corriendo
**Solución:**
```powershell
cd "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend"
node src/index.js
```

### Error: "Credenciales incorrectas"
**Causa:** Email o contraseña incorrectos
**Solución:** Verifica los datos o crea un nuevo usuario

### Error: "Cuenta bloqueada por múltiples intentos fallidos"
**Causa:** Demasiados intentos de login fallidos
**Solución:** Espera 15 minutos o consulta la BD para desbloquear manualmente

### Error: "El email ya está registrado"
**Causa:** Ya existe un usuario con ese email
**Solución:** Usa otro email o haz login con el existente

---

## 📝 Notas Importantes

1. **Backend debe estar corriendo:** Sin backend, la app NO funciona (ya no hay modo mock)
2. **Usuarios deben registrarse:** No hay usuarios por defecto excepto `test@agroassist.com`
3. **Tokens expiran:** Si un token expira, debes hacer login nuevamente
4. **SQLite es local:** La base de datos está en tu computadora, no en la nube

---

## 🔄 Próximos Pasos (Opcional)

Si quieres mejorar aún más la autenticación:

1. **Recuperación de contraseña por email**
   - Ya está el endpoint en backend
   - Falta UI en el frontend

2. **Validación de email**
   - Enviar código de verificación al registrarse
   - Confirmar email antes de activar cuenta

3. **Autenticación biométrica**
   - Face ID / Touch ID
   - Usar `expo-local-authentication`

4. **Refresh tokens**
   - Tokens de larga duración
   - Renovar automáticamente sin pedir login

5. **Logout en todos los dispositivos**
   - Invalidar todos los tokens de un usuario
   - Útil si se pierde un dispositivo

---

## 📚 Archivos Modificados

```
AgroAssistNew/
├── src/
│   └── services/
│       └── authService.ts  ← Mock eliminado, errores mejorados
└── AUTENTICACION_REAL.md   ← Este documento
```

---

¡Listo! Ahora tienes autenticación **real y segura** sin modo mock. 🎉
