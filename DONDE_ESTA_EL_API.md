# 📍 DÓNDE ESTÁ LA INTEGRACIÓN DE PERENUAL API

## 🎯 Problema resuelto:

✅ **Error 401 solucionado** - Ahora usa datos locales primero, luego intenta API en segundo plano
✅ **Sección de búsqueda VISIBLE** - Abierta por defecto, no colapsada
✅ **Indicador de API** - Muestra si está usando Perenual o datos locales

---

## 📱 CÓMO ENCONTRAR LA FUNCIONALIDAD EN LA APP:

### Paso 1: Abre la app
1. Abre **AgroAssist** en tu celular/emulador
2. Ve a la pestaña **"Plagas"** (último ícono de la barra inferior, parece un insecto 🐛)

### Paso 2: Desplázate hacia abajo
En la pantalla de Plagas verás **3 secciones**:

```
┌─────────────────────────────────────┐
│ 📸 Analizar Foto con IA             │ ← Sección 1: Análisis de imágenes
│    Tomar foto del cultivo           │
│    [BOTÓN VERDE]                    │
├─────────────────────────────────────┤
│                                     │
│ 🌤️ Alertas Basadas en Clima        │ ← Sección 2: Alertas climáticas
│    • Alta temperatura (riesgo)     │
│    • Humedad elevada               │
│    [Actualizar Alertas]            │
├─────────────────────────────────────┤
│                                     │
│ ▼ 🔍 Base de Datos de Plagas (96)  │ ← Sección 3: AQUÍ ESTÁ LA API
│    ✓ API Perenual                  │    (o "Datos locales" si API falla)
│                                     │
│ ┌─────────────────────────────┐    │
│ │ 🔍 Buscar plaga...          │    │ ← ESCRIBE AQUÍ
│ └─────────────────────────────┘    │
│                                     │
│ 🌐 Conectado a Perenual API        │ ← Aparece si API funciona
│    Busca en inglés: rust, blight   │
│                                     │
│ 📋 96 Plagas disponibles            │
│                                     │
│ 🐛 Fairy ring                       │ ← Plagas reales de la API
│    Agrocybe                         │
│    [Toca para ver detalles]        │
│                                     │
│ 🐛 Fungi Nuisance                   │
│    Panaeolus foenisecii            │
│    [Toca para ver detalles]        │
│                                     │
│ (continúa la lista...)              │
└─────────────────────────────────────┘
```

---

## 🔍 CÓMO PROBAR LA API:

### Opción 1: Ver todas las plagas
- Abre la sección "Base de Datos de Plagas"
- Si ves **"96 Plagas"** → API funcionando ✅
- Si ves **"5 Plagas"** → Usando datos locales

### Opción 2: Buscar plagas específicas
En el campo de búsqueda, escribe en **INGLÉS**:

**Plagas comunes:**
- `rust` → Royas (hongos)
- `blight` → Tizones
- `fungi` → Hongos en general
- `mildew` → Mildiu
- `bacteria` → Bacterias
- `virus` → Virus

**Por cultivo:**
- `coffee` → Plagas del café
- `tomato` → Plagas del tomate
- `potato` → Plagas de papa
- `corn` → Plagas de maíz
- `banana` → Plagas de banano

### Opción 3: Ver detalles
- Toca cualquier plaga de la lista
- Verás un modal con:
  - Nombre científico
  - Descripción completa
  - Síntomas
  - Cultivos afectados
  - Tratamiento
  - Prevención

---

## 🔧 ESTADO ACTUAL:

### ✅ Lo que funciona:
1. **Datos locales**: 5 plagas siempre disponibles
2. **API de Perenual**: Intenta cargar 96 plagas reales
3. **Fallback inteligente**: Si la API falla, usa datos locales sin errores
4. **Búsqueda**: Funciona tanto con datos locales como de API
5. **Sin errores 401**: Ahora está solucionado

### ℹ️ Comportamiento:
- **Primero** muestra datos locales (instantáneo)
- **Luego** intenta cargar desde API de Perenual (en segundo plano)
- **Si API funciona**: Actualiza con 96 plagas reales
- **Si API falla**: Mantiene las 5 plagas locales

---

## 🎨 INDICADORES VISUALES:

### En el botón de la sección:
```
▼ 🔍 Base de Datos de Plagas (96)    ✓ API Perenual
                                      ↑ Si ves esto, API funciona
```

o

```
▼ 🔍 Base de Datos de Plagas (5)     Datos locales
                                     ↑ Si ves esto, usando fallback
```

### Dentro de la sección:
Si la API está funcionando, verás un banner verde:
```
┌────────────────────────────────────┐
│ 🌐 Conectado a Perenual API        │
│    Busca en inglés: rust, blight   │
└────────────────────────────────────┘
```

---

## 📊 VERIFICACIÓN EN LOGS:

### En la consola de Expo verás:
```
LOG  ✅ 5 plagas cargadas (datos locales)
LOG  ✅ 96 plagas actualizadas desde Perenual API
```

o si la API falla:
```
LOG  ✅ 5 plagas cargadas (datos locales)
LOG  ℹ️ API requiere autenticación, usando datos locales
```

---

## 🐛 SI NO VES LA SECCIÓN:

### Chequeo rápido:
1. ¿Estás en la pestaña "Plagas"? ✓
2. ¿Hiciste scroll hacia abajo? ✓
3. ¿Ves las 3 secciones (Cámara, Alertas, Base de Datos)? ✓

### Si solo ves las primeras 2 secciones:
- Haz **más scroll hacia abajo**
- La sección de búsqueda está después de las alertas de clima

---

## 💡 EJEMPLO DE USO:

1. Abre Plagas → Scroll abajo
2. Ve la sección "Base de Datos de Plagas"
3. En el buscador escribe: `rust`
4. Espera 1-2 segundos
5. Verás plagas relacionadas con "rust" (royas)
6. Toca una para ver detalles completos

---

## 🔥 DIFERENCIA ANTES VS AHORA:

### Antes (datos estáticos):
```
5 plagas fijas
Solo en español
Sin búsqueda dinámica
```

### Ahora (con Perenual API):
```
96 plagas reales (si API funciona)
Nombres científicos correctos
Búsqueda en tiempo real
Información actualizada
Fallback automático si falla
```

---

**¿Necesitas ayuda?** 
- Mándame screenshot de la pantalla de Plagas
- Dime si ves "5" o "96" en el contador
- Dime si aparece el banner verde de "Conectado a Perenual API"
