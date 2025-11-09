import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface VoiceOptions {
  language?: string;
  pitch?: number;
  rate?: number;
}

class VoiceService {
  private static instance: VoiceService;
  private recording: Audio.Recording | null = null;
  private isSpeaking: boolean = false;
  private isMuted: boolean = false;

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  constructor() {
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error configurando audio:', error);
    }
  }

  // TEXT-TO-SPEECH: El bot habla
  async speak(text: string, options?: VoiceOptions): Promise<void> {
    if (this.isMuted) {
      console.log('🔇 Audio muteado, no se reproduce');
      return;
    }

    // Detener cualquier reproducción anterior
    await this.stopSpeaking();

    // Limpiar texto de markdown y emojis para mejor pronunciación
    const cleanText = this.cleanTextForSpeech(text);

    this.isSpeaking = true;

    return new Promise((resolve) => {
      Speech.speak(cleanText, {
        language: options?.language || 'es-CO', // Español colombiano
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.9, // Un poco más lento para mejor comprensión
        onDone: () => {
          this.isSpeaking = false;
          resolve();
        },
        onError: (error) => {
          console.error('Error en TTS:', error);
          this.isSpeaking = false;
          resolve();
        },
      });
    });
  }

  async stopSpeaking(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
    }
  }

  // Limpiar texto para mejor pronunciación
  private cleanTextForSpeech(text: string): string {
    return text
      // Remover markdown
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#+\s/g, '')
      .replace(/•/g, ',')
      // Remover emojis
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      // Remover saltos de línea excesivos
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ', ')
      // Limpiar espacios
      .trim();
  }

  // SPEECH-TO-TEXT: El usuario habla
  async startRecording(): Promise<void> {
    try {
      console.log('🎤 Iniciando grabación...');
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permiso de micrófono denegado');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      console.log('🎤 Grabación iniciada');
    } catch (error) {
      console.error('Error iniciando grabación:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) {
        console.log('No hay grabación activa');
        return null;
      }

      console.log('🎤 Deteniendo grabación...');
      await this.recording.stopAndUnloadAsync();
      
      const uri = this.recording.getURI();
      this.recording = null;

      console.log('🎤 Grabación guardada en:', uri);
      
      // Aquí deberías enviar el audio a un servicio de transcripción
      // Por ahora, retornamos un mensaje indicando que se grabó
      return uri;
    } catch (error) {
      console.error('Error deteniendo grabación:', error);
      this.recording = null;
      return null;
    }
  }

  // Transcribir audio usando OpenAI Whisper API
  async transcribeAudio(audioUri: string, apiKey: string): Promise<string> {
    try {
      console.log('🎙️ Transcribiendo audio...');

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      
      // En React Native, necesitamos especificar el tipo MIME y nombre del archivo
      const audioFile: any = {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      };

      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      formData.append('language', 'es'); // Español

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en Whisper API:', response.status, errorText);
        
        // Manejo específico de errores
        if (response.status === 429) {
          throw new Error('RATE_LIMIT: Demasiadas solicitudes. Espera un momento e intenta de nuevo.');
        } else if (response.status === 401) {
          throw new Error('AUTH_ERROR: API Key inválida o expirada.');
        } else if (response.status === 400) {
          throw new Error('INVALID_AUDIO: El archivo de audio no es válido.');
        } else {
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Transcripción:', data.text);
      
      return data.text;
    } catch (error: any) {
      console.error('Error en transcripción:', error);
      
      // Propagar mensaje de error amigable
      if (error.message.startsWith('RATE_LIMIT')) {
        throw new Error('⏱️ Demasiadas solicitudes. Por favor espera 20 segundos e intenta de nuevo.');
      } else if (error.message.startsWith('AUTH_ERROR')) {
        throw new Error('🔑 Error de autenticación. Verifica tu API Key de OpenAI.');
      } else if (error.message.startsWith('INVALID_AUDIO')) {
        throw new Error('🎤 Audio inválido. Intenta grabar de nuevo.');
      } else {
        throw new Error('❌ Error al transcribir. Intenta escribir tu mensaje.');
      }
    }
  }

  // Control de mute
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.isSpeaking) {
      this.stopSpeaking();
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  isRecording(): boolean {
    return this.recording !== null;
  }
}

export default VoiceService.getInstance();
