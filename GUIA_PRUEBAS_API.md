# 🚀 GUÍA RÁPIDA - Cómo probar la integración de Perenual API

## ✅ Estado actual:
- ✅ Backend configurado con API Key de Perenual
- ✅ API validada (96 plagas disponibles)
- ✅ Frontend actualizado para consumir la API

---

## 📱 PASO 1: Iniciar Backend y Frontend

### Terminal 1 - Backend:
```bash
cd "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend"
node src/index.js
```

**Debes ver:**
```
✅ Servidor corriendo en http://localhost:3000
```

### Terminal 2 - Frontend:
```bash
cd "c:\Users\juanl\Documents\final Login\agroassist\AgroAssistNew"
npx expo start
```

**Debes ver:**
```
› Metro waiting on exp://192.168.1.5:8081
```

**Presiona `a`** para abrir en Android

---

## 🔍 PASO 2: Probar la API de Perenual en la app

### En tu celular/emulador:

1. **Abre la app AgroAssist**
2. **Ve a la pestaña "Plagas"** (ícono de insecto)
3. **Desplázate hacia abajo** hasta ver la sección de búsqueda
4. **Haz clic en el campo de búsqueda** 🔍
5. **Escribe términos en INGLÉS**:
   - `rust` (para ver royas)
   - `blight` (para ver tizones)
   - `fungi` (para ver hongos)
   - `coffee` (plagas del café)
   - `tomato` (plagas del tomate)
   - `bacteria` (enfermedades bacterianas)

6. **Verás plagas REALES** con:
   - ✅ Nombre común y científico
   - ✅ Descripción detallada
   - ✅ Cultivos afectados
   - ✅ Tratamientos

---

## 📊 PASO 3: Ver los logs

### En la terminal de Expo verás:
```
✅ 30 plagas cargadas desde Perenual API
✅ 15 resultados de búsqueda desde API
```

### En la terminal del backend verás:
```
🔍 Buscando plagas en Perenual API: "rust"
✅ Perenual API: 30 plagas/enfermedades obtenidas
```

---

## 🐛 SOLUCIÓN: Si no aparece información de clima

El problema es que el backend se está deteniendo. Para solucionarlo:

### Opción 1: Usar 2 terminales separadas
1. **Terminal 1**: Corre el backend y déjalo abierto
2. **Terminal 2**: Corre el frontend y déjalo abierto
3. **NO CIERRES** ninguna de las dos terminales

### Opción 2: Verificar logs
Si el clima no carga, revisa en Expo:
```
LOG  🌤️ Obteniendo clima para: Pasto
LOG  ✅ Clima obtenido: {...}
```

Si ves errores, el backend se detuvo.

---

## 🔧 Endpoints disponibles para probar

### Directamente en el navegador:
```
http://localhost:3000/api/pests/test
```

### Con Postman o curl:
```bash
# Listar todas las plagas
GET http://localhost:3000/api/pests/database

# Buscar plagas
GET http://localhost:3000/api/pests/database?query=rust

# Plagas por cultivo
GET http://localhost:3000/api/pests/by-crop/tomate
```

*(Necesitas agregar el header: `x-token: tu-token-de-sesion`)*

---

## 📸 Capturas esperadas:

### Pantalla de Plagas:
```
┌──────────────────────────┐
│ 📸 Analizar con Cámara   │ ← Tomar foto de plaga
├──────────────────────────┤
│ 🌤️ Alertas de Clima     │ ← Alertas automáticas
│ • Alta temperatura       │
│ • Humedad elevada        │
├──────────────────────────┤
│ 🔍 Buscar Plagas         │ ← AQUÍ ESTÁ LA API
│ ┌──────────────────┐     │
│ │ Buscar...        │🔍   │ ← Escribe aquí
│ └──────────────────┘     │
│                          │
│ 🐛 Fairy ring            │ ← Resultados reales
│    Agrocybe              │
│                          │
│ 🐛 Rust disease          │
│    Puccinia spp.         │
└──────────────────────────┘
```

---

## ⚠️ Troubleshooting

### Problema: "No se conecta al servidor"
**Solución:** El backend se detuvo. Reinícialo:
```bash
cd "c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend"
node src/index.js
```

### Problema: "Error 404 en /api/pests/database"
**Solución:** Verifica que el backend tenga el archivo `perenualService.js`

### Problema: "Solo veo 5 plagas"
**Solución:** La API falló, está usando datos locales de respaldo (esto es normal si no hay internet o el backend está detenido)

---

## ✨ Diferencias clave

### Antes (datos locales):
- 5 plagas fijas
- Nombres en español
- Sin detalles extensos

### Ahora (API de Perenual):
- **96 plagas reales**
- Nombres científicos
- Descripciones detalladas
- Cultivos huésped
- Tratamientos específicos
- **Búsqueda en tiempo real**

---

## 🎯 Para validar que TODO funciona:

1. ✅ Backend corriendo → Ver "Servidor corriendo en http://localhost:3000"
2. ✅ Frontend corriendo → Ver QR code en terminal
3. ✅ App conectada → Ver logs de "Perfil obtenido"
4. ✅ Clima cargando → Ver temperatura en HomeScreen
5. ✅ **API de Perenual** → Buscar "rust" y ver más de 5 resultados

---

**¿Necesitas ayuda?** Mándame screenshot de lo que ves en la pantalla de Plagas. 📸
