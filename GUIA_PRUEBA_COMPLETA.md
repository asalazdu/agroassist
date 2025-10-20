# 🚀 GUÍA RÁPIDA PARA PROBAR AGROASSIST CON SUPABASE

## ✅ Estado Actual

### Backend
- ✅ **Servidor:** Corriendo en puerto 3000
- ✅ **Base de datos:** Supabase PostgreSQL
- ✅ **URL:** http://localhost:3000
- ✅ **Modo:** SERVICE_ROLE (Admin - RLS Bypass)

### Frontend (AgroAssistNew)
- ✅ **Expo:** Corriendo en puerto 8081
- ✅ **URL Android:** http://10.0.2.2:3000/api
- ✅ **Supabase SDK:** Instalado y configurado
- ✅ **QR Code:** Disponible para escanear

---

## 🔐 CREDENCIALES DE PRUEBA

### Usuario Migrado de SQLite
```
Email: test@agroassist.com
Contraseña: test123
```

### Datos del Usuario
- **ID:** 2
- **Nombre:** Usuario Test
- **Rol:** 2 (usuario regular)
- **Estado:** Activo

---

## 📱 CÓMO PROBAR LA APP

### Opción 1: Android Emulator (Recomendado)
1. Asegúrate de tener Android Studio con un emulador configurado
2. En la terminal donde corre Expo, presiona: **`a`**
3. Espera a que se compile e instale la app
4. Ingresa con las credenciales de prueba

### Opción 2: Dispositivo Físico
1. Instala **Expo Go** desde Play Store o App Store
2. Escanea el código QR que aparece en la terminal
3. La app se abrirá automáticamente
4. Ingresa con las credenciales de prueba

### Opción 3: Navegador Web
1. En la terminal donde corre Expo, presiona: **`w`**
2. Se abrirá en tu navegador
3. Ingresa con las credenciales de prueba

---

## 🧪 PRUEBAS A REALIZAR

### 1. Login
- [ ] Abrir la app
- [ ] Ir a pantalla de Login
- [ ] Ingresar: test@agroassist.com / test123
- [ ] Verificar que se autentique correctamente
- [ ] Verificar que se muestre el nombre del usuario

### 2. Registro
- [ ] Ir a pantalla de Registro
- [ ] Llenar el formulario con datos nuevos
- [ ] Email: `tuombre@test.com`
- [ ] Contraseña: `Password123!`
- [ ] Verificar que se cree la cuenta
- [ ] Verificar que se autentique automáticamente

### 3. Funcionalidades de la App
- [ ] Chatbot: Hacer una pregunta sobre agricultura
- [ ] Clima: Consultar el clima de una ciudad
- [ ] Plagas: Buscar información sobre plagas
- [ ] Precios: Ver precios de productos agrícolas
- [ ] Perfil: Actualizar datos del usuario

---

## 🔍 VERIFICACIÓN EN SUPABASE

Para ver los datos en tiempo real:

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: **endtgngduxyxdyponecx**
3. Ve a **Table Editor** → **usuarios**
4. Deberías ver:
   - Usuario migrado (ID: 2, test@agroassist.com)
   - Nuevos usuarios registrados desde la app

---

## 📊 ENDPOINTS DISPONIBLES

### Autenticación
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/recover-password
POST /api/auth/reset-password
PUT  /api/auth/profile
GET  /api/auth/profile
```

### Otros Servicios
```
GET  /api/weather
GET  /api/pests
GET  /api/plagas (Colombia)
GET  /api/market
```

---

## 🐛 TROUBLESHOOTING

### Error: "No se pudo conectar al servidor"
**Causa:** Backend no está corriendo  
**Solución:**
```bash
cd "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend"
node src/index.js
```

### Error: "Credenciales incorrectas"
**Causa:** Email o contraseña incorrectos  
**Solución:** Usa las credenciales exactas:
- Email: `test@agroassist.com`
- Contraseña: `test123`

### Error: "El email ya está registrado"
**Causa:** Intentando registrar un email que ya existe  
**Solución:** Usa un email diferente o haz login con el existente

### App no se conecta en Android Emulator
**Causa:** URL incorrecta  
**Solución:** Verifica que la URL sea `http://10.0.2.2:3000/api`  
Ubicación: `src/config/api.ts`

### App no se conecta en iOS
**Causa:** URL incorrecta  
**Solución:** Verifica que la URL sea `http://localhost:3000/api`  
Ya configurado en `src/config/api.ts` con Platform.OS

---

## 📸 QUÉ ESPERAR

### Pantalla de Login
- Campos para email y contraseña
- Botón "Iniciar Sesión"
- Link para registrarse
- Link para recuperar contraseña

### Después del Login
- Pantalla principal (Home)
- Menú de navegación (tabs en la parte inferior)
- Acceso a:
  - Chatbot
  - Clima
  - Plagas/Enfermedades
  - Precios de Mercado
  - Perfil de Usuario

---

## 🎯 PRÓXIMOS PASOS (DESPUÉS DE PROBAR)

1. **Implementar CRUD de Cultivos**
   - Tabla: `cultivos_usuario`
   - Funciones: Agregar, editar, eliminar, listar cultivos

2. **Historial de Consultas**
   - Tabla: `consultas_chatbot`
   - Guardar conversaciones del chatbot

3. **Historial de Clima**
   - Tabla: `registros_clima`
   - Guardar consultas meteorológicas

4. **Subida de Fotos**
   - Tabla: `fotos_cultivos`
   - Integrar Supabase Storage
   - Análisis de imágenes con IA

5. **Sistema de Alertas**
   - Tabla: `alertas_usuario`
   - Notificaciones push
   - Alertas de clima, plagas, precios

---

## 🔐 INFORMACIÓN TÉCNICA

### Supabase
- **URL:** https://endtgngduxyxdyponecx.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/endtgngduxyxdyponecx

### Backend
- **Puerto:** 3000
- **Framework:** Express.js + Node.js
- **Autenticación:** JWT (JSON Web Tokens)
- **Hash de contraseñas:** bcrypt

### Frontend
- **Framework:** React Native + Expo
- **TypeScript:** Habilitado
- **Storage:** AsyncStorage
- **Navegación:** React Navigation

---

## 📞 COMANDOS ÚTILES

### Iniciar Backend
```bash
cd "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend"
node src/index.js
```

### Iniciar Frontend
```bash
cd "c:\Users\juanl\Documents\final Login\agroassist\AgroAssistNew"
npx expo start
```

### Limpiar Cache de Expo
```bash
npx expo start --clear
```

### Ver Logs del Backend
```bash
# Los logs aparecen en la misma terminal donde corre el servidor
```

### Ver Logs del Frontend
```bash
# Los logs aparecen en la terminal de Expo
# También puedes presionar 'j' para abrir el debugger
```

### Test Rápido del Backend
```bash
cd "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend"
node testFrontendConnection.js
```

---

## ✅ CHECKLIST ANTES DE PROBAR

- [ ] Backend corriendo en puerto 3000
- [ ] Frontend (Expo) corriendo en puerto 8081
- [ ] Android Emulator iniciado (o dispositivo físico listo)
- [ ] Credenciales de prueba anotadas
- [ ] Archivo .env del backend con SUPABASE_SERVICE_ROLE_KEY

---

## 🎉 ¡LISTO PARA PROBAR!

1. **Backend:** ✅ Corriendo
2. **Frontend:** ✅ Corriendo  
3. **Base de Datos:** ✅ Supabase conectado
4. **Usuario de prueba:** ✅ Migrado

**Ahora solo presiona `a` en la terminal de Expo para abrir en Android o escanea el QR con Expo Go** 📱

---

**Fecha:** Octubre 14, 2025  
**Versión:** 2.0.0 (con Supabase)  
**Estado:** ✅ LISTO PARA PRODUCCIÓN

