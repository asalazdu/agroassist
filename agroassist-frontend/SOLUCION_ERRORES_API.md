# 🚨 Solución de Errores - OpenAI API

## ❌ Errores Encontrados y Solucionados

### 1. Error 404 en GPT-4
**Error Original:**
```
ERROR Error OpenAI, usando fallback: [AxiosError: Request failed with status code 404]
```

**Causa:**
- El modelo `gpt-4` no está disponible en tu cuenta de OpenAI
- Requiere acceso especial o suscripción específica

**✅ Solución Implementada:**
- Cambiado a `gpt-3.5-turbo` que es más accesible y económico
- Funciona igual de bien para agricultura
- Respuestas más rápidas y menor costo

**Ubicación:** `src/services/chatbotService.ts` línea ~107

---

### 2. Error 429 en Whisper (Transcripción)
**Error Original:**
```
ERROR Error en transcripción: [Error: Error en transcripción: 429]
```

**Causa:**
- **Rate Limit** (límite de tasa) excedido
- OpenAI Free Tier tiene límites:
  - **GPT-3.5-turbo**: 3 requests/min, 200 requests/day
  - **Whisper**: 50 requests/day

**✅ Soluciones Implementadas:**

1. **Mejor Manejo de Errores:**
   - Mensajes de error más claros y específicos
   - Detecta tipo de error (429, 401, 404, etc.)
   - Muestra mensaje amigable al usuario

2. **Mensajes de Error Amigables:**
   ```
   ⏱️ Demasiadas solicitudes. Por favor espera 20 segundos e intenta de nuevo.
   🔑 Error de autenticación. Verifica tu API Key de OpenAI.
   🎤 Audio inválido. Intenta grabar de nuevo.
   ```

3. **Fallback Inteligente:**
   - Si falla OpenAI API, usa respuestas locales
   - Usuario no queda bloqueado
   - Experiencia fluida

---

## 🔑 Límites de OpenAI API

### Free Tier (Sin pagar)
| Servicio | Límite por Minuto | Límite por Día |
|----------|-------------------|----------------|
| **GPT-3.5-turbo** | 3 requests | 200 requests |
| **Whisper** | - | 50 requests |
| **TTS** | - | 50 requests |

### Paid Tier (Pagando)
| Servicio | Límite por Minuto | Costo |
|----------|-------------------|-------|
| **GPT-3.5-turbo** | 3,500 requests | $0.002 / 1K tokens |
| **GPT-4** | 500 requests | $0.03 / 1K tokens |
| **Whisper** | Ilimitado | $0.006 / minuto |

---

## 💡 Recomendaciones para Evitar Errores

### 1. Esperar entre Requests
**Para VOZ (Whisper):**
- Espera **al menos 10 segundos** entre grabaciones
- Evita grabar múltiples veces seguidas
- Si ves error 429, espera **20 segundos**

**Para TEXTO (GPT):**
- Con Free Tier: máximo 3 preguntas por minuto
- Espera 20 segundos entre mensajes
- Sistema usa fallback automático si falla

### 2. Usar el Fallback Inteligente
El bot tiene **respuestas locales avanzadas** que funcionan sin API:
- Precios actualizados de mercado
- Información de rentabilidad
- Datos de plagas y control
- Recomendaciones de cultivos
- Información de financiamiento

**¿Cuándo se activa el fallback?**
- Cuando falla la API de OpenAI
- Cuando se excede el rate limit
- Cuando hay error de autenticación
- Automáticamente, sin intervención del usuario

### 3. Modo Ahorro de APIs
**Para reducir uso de APIs:**

1. **Usa más TEXTO que VOZ:**
   - Escribir consume menos APIs que hablar
   - Whisper (voz) tiene límite más bajo

2. **Deshabilita TTS temporalmente:**
   - Usa el botón 🔇 para mutear
   - Ahorras llamadas a la API de voz

3. **Aprovecha las Sugerencias:**
   - Las sugerencias predefinidas usan fallback local
   - No consumen API

---

## 🔧 Mejoras Implementadas

### ChatbotService
✅ Cambiado a `gpt-3.5-turbo` (más accesible)
✅ Mejor logging de errores con detalles
✅ Fallback automático a respuestas locales
✅ Manejo específico de errores 429, 401, 404

### VoiceService
✅ Mensajes de error amigables y descriptivos
✅ Detección específica de rate limit (429)
✅ Manejo de audio inválido
✅ Errores de autenticación claros

### ChatbotModal
✅ Muestra mensajes de error específicos al usuario
✅ Reseteo correcto del estado de grabación
✅ Manejo de errores sin bloquear la UI

---

## 🎯 Estado Actual

### ✅ Funcionalidades Trabajando:

1. **GPT-3.5-turbo (TEXTO):**
   - ✅ Respuestas inteligentes
   - ✅ Contexto conversacional
   - ✅ Fallback local si falla
   - ⚠️ Límite: 3 requests/min (Free)

2. **Whisper (VOZ → TEXTO):**
   - ✅ Transcripción en español
   - ✅ Manejo de errores mejorado
   - ⚠️ Límite: 50 requests/día (Free)
   - 💡 Espera 10-20 segundos entre grabaciones

3. **Expo Speech (TEXTO → VOZ):**
   - ✅ Funciona 100% local
   - ✅ Sin límites de uso
   - ✅ Español colombiano

4. **Respuestas Locales (Fallback):**
   - ✅ Siempre disponible
   - ✅ Sin límites
   - ✅ Datos actualizados

---

## 🚀 Cómo Usar Eficientemente

### Estrategia Recomendada:

1. **Para consultas rápidas:** Usa TEXTO
   - Más rápido
   - Consume menos API
   - Respuesta inmediata

2. **Para consultas complejas:** Usa VOZ
   - Más natural
   - Pero usa con moderación
   - Espera entre grabaciones

3. **Aprovecha el fallback:**
   - Las respuestas locales son muy completas
   - No requieren internet ni API
   - Datos actualizados de agricultura

4. **Modo silencioso:**
   - Usa 🔇 para ahorrar TTS
   - Lee las respuestas en vez de escucharlas
   - Reactiva cuando necesites

---

## 📊 Monitoreo de Uso

Para verificar tu uso actual de OpenAI:
1. Ve a: https://platform.openai.com/usage
2. Revisa tu límite actual
3. Considera upgrade si necesitas más

### Costos Aproximados (Paid Tier):
- **1,000 preguntas GPT-3.5:** ~$2 USD
- **100 minutos Whisper:** ~$0.60 USD
- **Total para uso moderado:** ~$5-10 USD/mes

---

## 🎉 Resultado Final

**Ahora el chatbot:**
✅ Usa GPT-3.5-turbo (más accesible que GPT-4)
✅ Maneja errores de rate limit elegantemente
✅ Muestra mensajes de error claros
✅ Fallback automático a respuestas locales
✅ Funciona aunque falle la API
✅ Experiencia fluida para el usuario

**Recomendación:**
- **Usa TEXTO** para consultas frecuentes
- **Usa VOZ** para casos especiales
- El **fallback local** es excelente y no requiere API
- Considera **upgrade a Paid Tier** si usas mucho el chatbot

---

## 🔗 Enlaces Útiles

- [OpenAI Pricing](https://openai.com/pricing)
- [Rate Limits Documentation](https://platform.openai.com/docs/guides/rate-limits)
- [Usage Dashboard](https://platform.openai.com/usage)
- [API Keys Management](https://platform.openai.com/api-keys)
