# 🎤 Documentación de Funcionalidades de Voz - AgroBot IA

## 📋 Resumen
AgroBot IA ahora incluye funcionalidades completas de voz bidireccional:
- **Text-to-Speech (TTS)**: El bot habla sus respuestas
- **Speech-to-Text (STT)**: Puedes hablarle al bot usando el micrófono
- **Control de audio**: Botones para mutear y controlar la reproducción

## 🚀 Nuevas Características

### 1. **Integración con OpenAI GPT-4** 🤖
- El chatbot ahora usa **GPT-4 real** en lugar de respuestas predefinidas
- Prompt especializado en agricultura colombiana con datos actualizados
- Contexto incluye: precios de mercado, rentabilidad, plagas, financiamiento, certificaciones
- Historial de conversación para respuestas contextuales
- Fallback inteligente a respuestas locales si OpenAI falla

**Archivo**: `src/services/chatbotService.ts`

### 2. **Text-to-Speech (TTS)** 🔊
- El bot habla automáticamente todas sus respuestas
- Voz en español colombiano (es-CO)
- Limpieza automática de markdown y emojis para mejor pronunciación
- Control de volumen y velocidad optimizados

**Tecnología**: `expo-speech`

### 3. **Speech-to-Text (STT)** 🎤
- Presiona el botón de micrófono para hablar
- Transcripción automática usando **OpenAI Whisper API**
- Grabación en alta calidad
- Manejo de permisos de micrófono

**Tecnología**: `expo-av` + OpenAI Whisper

### 4. **Controles de Voz** 🎛️
- **Botón 🔊/🔇**: Mutear/desmutear el audio del bot
- **Botón 🎤**: Iniciar/detener grabación de voz
- **Indicador visual**: Muestra cuando el bot está hablando o escuchando
- **Estado de grabación**: El botón cambia a rojo ⏹️ durante la grabación

## 📱 Interfaz de Usuario

### Controles en el Input
```
[🔊] [🎤] [_____ Texto _____] [📤]
```

- **🔊/🔇**: Toggle de mute (naranja)
- **🎤/⏹️**: Grabación de voz (azul/rojo)
- **Input de texto**: Deshabilitado durante grabación
- **📤**: Enviar mensaje (deshabilitado si está grabando)

### Indicadores de Estado
- **"🔊 Hablando..."**: Aparece cuando el bot está reproduciendo audio
- **"🎤 Escuchando..."**: Aparece durante la grabación

## 🔧 Arquitectura Técnica

### VoiceService (`src/services/voiceService.ts`)
Servicio singleton que maneja todas las operaciones de voz:

#### Métodos principales:
- `speak(text, options)`: Convierte texto a voz
- `stopSpeaking()`: Detiene la reproducción actual
- `startRecording()`: Inicia grabación de audio
- `stopRecording()`: Detiene y retorna URI del audio
- `transcribeAudio(audioUri, apiKey)`: Transcribe audio usando Whisper
- `setMuted(muted)`: Controla el estado de mute
- `cleanTextForSpeech(text)`: Limpia markdown/emojis del texto

#### Características:
- Singleton pattern para gestión centralizada
- Manejo automático de permisos
- Limpieza de texto para mejor pronunciación
- Configuración de audio mode para iOS/Android

### ChatbotService Mejorado
Ahora incluye:
- Integración con OpenAI GPT-4
- System prompt especializado en agricultura
- Historial de conversación (últimos 10 mensajes)
- Generación inteligente de sugerencias contextuales
- Fallback a respuestas locales si falla la API

## 🔑 Configuración Requerida

### Variables de Entorno (.env)
```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-xxx...
```

### Permisos Necesarios
- **Android**: `RECORD_AUDIO` (solicitado automáticamente)
- **iOS**: Permiso de micrófono en Info.plist

## 🎯 Flujo de Uso

### Texto → Respuesta Hablada
1. Usuario escribe mensaje
2. Se envía a OpenAI GPT-4
3. Bot responde con texto
4. VoiceService convierte a voz automáticamente
5. Usuario escucha la respuesta

### Voz → Texto → Respuesta Hablada
1. Usuario presiona 🎤
2. Sistema solicita permiso (primera vez)
3. Usuario habla (botón cambia a ⏹️ rojo)
4. Usuario presiona ⏹️ para terminar
5. Audio se transcribe con Whisper
6. Texto se envía a OpenAI GPT-4
7. Bot responde con texto
8. VoiceService convierte a voz
9. Usuario escucha la respuesta

### Control de Mute
1. Usuario presiona 🔊
2. Cambia a 🔇
3. Bot deja de reproducir audio
4. Respuestas siguen apareciendo como texto
5. Presionar 🔇 para reactivar audio

## 📊 Datos del Prompt Especializado

El bot tiene conocimiento actualizado (Oct 2025) sobre:

### Precios de Mercado
- Tomate: $2,800-3,200/kg
- Papa: $1,800-2,200/kg
- Maíz: $1,200-1,800/kg
- Aguacate Hass: $5,500-7,000/kg
- Y más...

### Rentabilidad (ROI)
- Tomate invernadero: 370-550%
- Aguacate Hass: 180-260%
- Papa tecnificada: 94-158%
- Maíz híbrido: 60-100%

### Recomendaciones por Tamaño de Finca
- Pequeñas (<2 ha): Tomate cherry, pimentón
- Medianas (2-10 ha): Tomate Milano F1, papa R12
- Grandes (>10 ha): Aguacate Hass, arroz mecanizado

### Plagas Comunes
- Tomate: Mosca blanca, Gusano cogollero
- Papa: Gota (Phytophthora), Polilla guatemalteca
- Maíz: Cogollero, Gusano elotero

### Financiamiento
- FINAGRO: 4-8% EA
- Banco Agrario: 6-12% EA
- Cooperativas: 8-15% EA

### Certificaciones
- GlobalGAP: $8-12M, +20-30% precio
- Orgánico: $15-25M, +40-60% precio

## 🐛 Manejo de Errores

### Si OpenAI API falla:
- Sistema usa respuestas locales inteligentes como fallback
- Usuario no nota interrupciones

### Si falla el micrófono:
- Alert notifica al usuario sobre permisos
- Puede seguir usando texto normalmente

### Si falla Whisper:
- Alert indica error de transcripción
- Usuario puede volver a intentar o escribir

## 🎨 Diseño Visual

### Colores de Botones
- **Mute 🔊**: Naranja (#FF9800)
- **Mic 🎤**: Azul (#2196F3)
- **Mic Recording ⏹️**: Rojo (#F44336) con shadow pulsante
- **Send 📤**: Verde (#4CAF50)

### Animaciones
- Botón de grabación pulsa cuando está activo
- Indicador de carga durante transcripción
- Smooth scroll automático a nuevos mensajes

## 🔄 Próximas Mejoras Posibles

1. **Detección automática de silencio**: Detener grabación cuando el usuario deja de hablar
2. **Múltiples voces**: Permitir elegir voz masculina/femenina
3. **Velocidad ajustable**: Control deslizante para velocidad de voz
4. **Historial de voz**: Guardar conversaciones de voz
5. **Modo offline**: Respuestas básicas sin internet
6. **Idiomas adicionales**: Soporte para inglés, portugués

## 📚 Referencias

- [Expo Speech Documentation](https://docs.expo.dev/versions/latest/sdk/speech/)
- [Expo AV Documentation](https://docs.expo.dev/versions/latest/sdk/av/)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [OpenAI GPT-4 API](https://platform.openai.com/docs/guides/gpt)

## 🎉 Resultado Final

El usuario ahora puede:
✅ Hablar con el bot usando voz
✅ Escuchar respuestas del bot
✅ Controlar el audio con botón de mute
✅ Recibir respuestas inteligentes basadas en GPT-4
✅ Obtener información agrícola actualizada y precisa
✅ Alternar fácilmente entre voz y texto

**¡AgroBot IA es ahora un asistente completamente conversacional!** 🎤🤖🌾
