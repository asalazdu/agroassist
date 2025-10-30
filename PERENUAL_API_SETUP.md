# 🌱 Integración Perenual API - Instrucciones

## ✅ ¿Qué se ha implementado?

Se ha integrado **Perenual API** (https://perenual.com) para obtener información REAL de plagas y enfermedades de plantas en tiempo real, reemplazando los datos estáticos (mock).

### Nuevas funcionalidades:

1. **Base de datos dinámica**: Más de 239 plagas/enfermedades reales
2. **Búsqueda en tiempo real**: Buscar plagas por nombre con la API
3. **Información detallada**: Descripción, soluciones, imágenes reales
4. **Filtro por cultivo**: Buscar plagas específicas para cada cultivo
5. **Fallback inteligente**: Si la API falla, usa datos locales

---

## 🔑 PASO 1: Obtener tu API Key (GRATIS)

### Registro en Perenual:

1. Ve a: **https://perenual.com/user/developer**
2. Haz clic en "Sign Up" o "Register"
3. Completa el formulario:
   - Email
   - Nombre
   - Contraseña
4. Confirma tu email
5. Inicia sesión en: **https://perenual.com/user/developer**
6. **Copia tu API Key** (aparecerá como: `sk-...` o similar)

### Plan Gratuito incluye:
- ✅ **300 requests por día**
- ✅ Acceso a 239+ plagas y enfermedades
- ✅ 10,000+ especies de plantas
- ✅ Imágenes y descripciones detalladas

---

## 📝 PASO 2: Configurar la API Key en tu proyecto

### Opción A: Backend (.env)

Abre el archivo: `agroassist-backend\.env`

Busca la línea:
```env
PERENUAL_API_KEY=
```

Pégala tu API Key:
```env
PERENUAL_API_KEY=sk-tu-api-key-aqui
```

**Ejemplo:**
```env
PERENUAL_API_KEY=sk-abcd1234efgh5678ijkl
```

### Guarda el archivo y **reinicia el backend**

---

## 🚀 PASO 3: Probar la integración

### 1. Reiniciar Backend

Abre una terminal en la carpeta del backend:

```bash
cd "agroassist-backend"
node src/index.js
```

Deberías ver:
```
✅ Servidor corriendo en http://localhost:3000
```

### 2. Reiniciar Frontend (Expo)

Abre otra terminal:

```bash
cd "AgroAssistNew"
npx expo start --clear
```

### 3. Probar en la app

Ve a la pestaña **"Plagas"** en tu app:

1. **Alertas climáticas** - Deben aparecer según tu clima actual
2. **Búsqueda de plagas** - Haz clic en el botón de búsqueda
3. **Escribe**: "rust" o "blight" o "fungi"
4. Verás **resultados reales de la API** con:
   - ✅ Nombre científico
   - ✅ Descripción detallada
   - ✅ Cultivos afectados
   - ✅ Tratamiento y prevención

---

## 🔍 Endpoints disponibles

### Backend creado:

1. **GET /api/pests/database**
   - Lista de plagas con búsqueda
   - Parámetros: `?query=rust&page=1`

2. **GET /api/pests/database/:id**
   - Detalles de una plaga específica

3. **GET /api/pests/by-crop/:cropName**
   - Plagas específicas para un cultivo
   - Ejemplo: `/api/pests/by-crop/tomate`

---

## 📊 Monitoreo

### En la consola del Backend verás:

```
✅ Perenual API: 30 plagas/enfermedades obtenidas
🔍 Buscando plagas en Perenual API: "rust"
```

### En la consola de Expo verás:

```
✅ 30 plagas cargadas desde Perenual API
✅ 15 resultados de búsqueda desde API
```

---

## 🛟 Fallback (Si no tienes API Key)

**¡No te preocupes!** La app seguirá funcionando con:

- 5 plagas predefinidas (datos locales)
- Búsqueda local
- Todas las demás funcionalidades

El backend mostrará:
```
⚠️ PERENUAL_API_KEY no configurada, usando datos de respaldo
```

---

## 🔧 Solución de problemas

### Problema 1: "API Key inválida"
```
❌ Error en Perenual API: 401
```
**Solución**: Verifica que copiaste bien la API Key (sin espacios extras)

### Problema 2: "Límite de requests alcanzado"
```
❌ Límite de requests alcanzado (429)
```
**Solución**: Espera 24 horas o actualiza a plan de pago ($6.99/mes)

### Problema 3: "No se conecta a la API"
```
❌ Error obteniendo plagas de API: timeout
```
**Solución**: Verifica tu conexión a internet. La app usará datos locales automáticamente.

---

## 📈 Mejoras futuras (opcional)

Si quieres expandir:

1. **Cache**: Guardar resultados en SQLite para reducir requests
2. **Imágenes**: Mostrar fotos reales de las plagas (ya vienen en la API)
3. **Favoritos**: Guardar plagas frecuentes del usuario
4. **Notificaciones**: Alertar cuando hay nuevas plagas para los cultivos del usuario

---

## 📞 Recursos

- **Documentación Perenual**: https://perenual.com/docs/api
- **Postman Collection**: https://www.postman.com/perenual
- **Discord Perenual**: https://discord.gg/pFCnuUvkk4

---

## ✨ Archivos modificados

### Backend:
- ✅ `src/infrastructure/services/perenualService.js` (NUEVO)
- ✅ `src/interfaces/controllers/pest.controller.js`
- ✅ `src/interfaces/routes/pest.routes.js`
- ✅ `.env` (agregar PERENUAL_API_KEY)

### Frontend:
- ✅ `src/services/pestService.ts`
- ✅ `src/screens/PestsScreenWithAI.tsx`

---

## 🎯 Resultado final

Con la API Key configurada, tendrás:

- 📚 **239+ plagas reales** en lugar de 5
- 🔍 **Búsqueda dinámica** con resultados actualizados
- 🌍 **Información internacional** válida para Colombia y otros países
- 🖼️ **Imágenes reales** de plagas y enfermedades
- 🚀 **Escalabilidad** para futuras funcionalidades

---

**¿Necesitas ayuda?** Solo dime que API Key obtuviste y te ayudo a configurarla. 🚀
