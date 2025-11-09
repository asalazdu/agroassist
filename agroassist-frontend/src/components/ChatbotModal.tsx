import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import chatbotService from '../services/chatbotService';
import voiceService from '../services/voiceService';
import { API_CONFIG } from '../config/api';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const ChatbotModal: React.FC<Props> = ({ visible, onClose, initialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      text: '¡Hola! 👋 Soy AgroBot IA, tu asistente agrícola inteligente con voz. Puedes escribirme o hablarme presionando el micrófono. 🎤',
      isUser: false,
      timestamp: new Date(),
      suggestions: ['Ver clima', 'Plagas comunes', 'Precios hoy', 'Ayuda']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, visible]);

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (messageText === '') return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(messageText);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, botMessage]);

      // 🔊 Hacer que el bot hable la respuesta (si no está muteado)
      if (!isMuted) {
        setIsSpeaking(true);
        await voiceService.speak(response.message);
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error en chatbot:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar mensaje inicial automáticamente cuando se pasa un initialMessage
  useEffect(() => {
    if (visible && initialMessage && initialMessage.trim() !== '') {
      // Pequeño delay para que se vea natural y la UI se renderice
      setTimeout(() => {
        handleSend(initialMessage);
      }, 800);
    }
  }, [visible, initialMessage]);

  const handleSuggestionPress = (suggestion: string) => {
    handleSend(suggestion);
  };

  // 🎤 GRABAR VOZ
  const handleMicPress = async () => {
    if (isRecording) {
      // Detener grabación y transcribir
      try {
        setIsLoading(true);
        const audioUri = await voiceService.stopRecording();
        setIsRecording(false);

        if (audioUri) {
          // Transcribir audio usando Whisper API
          try {
            const transcription = await voiceService.transcribeAudio(
              audioUri,
              API_CONFIG.OPENAI_API_KEY
            );
            
            if (transcription) {
              // Enviar texto transcrito
              await handleSend(transcription);
            }
          } catch (transcriptionError: any) {
            console.error('Error en transcripción:', transcriptionError);
            
            // Mostrar mensaje de error más específico
            const errorMessage = transcriptionError.message || 'No pude entender el audio. Por favor intenta de nuevo.';
            
            Alert.alert(
              'Error de transcripción',
              errorMessage,
              [{ text: 'OK' }]
            );
          }
        }
      } catch (error) {
        console.error('Error deteniendo grabación:', error);
        Alert.alert('Error', 'Hubo un problema con la grabación');
      } finally {
        setIsLoading(false);
        setIsRecording(false);
      }
    } else {
      // Iniciar grabación
      try {
        await voiceService.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Error iniciando grabación:', error);
        Alert.alert(
          'Permiso requerido',
          'Necesito acceso al micrófono para poder escucharte.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // 🔇 MUTEAR/DESMUTEAR
  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    voiceService.setMuted(newMutedState);
    
    if (newMutedState && isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      {!message.isUser && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.botText,
          ]}
        >
          {message.text}
        </Text>
        {message.suggestions && message.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {message.suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>AgroBot IA</Text>
              <Text style={styles.headerSubtitle}>Asistente Agrícola</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <View style={[styles.messageContainer, styles.botMessage]}>
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🤖</Text>
              </View>
              <View style={[styles.messageBubble, styles.botBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>Escribiendo...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input con controles de voz */}
        <View style={styles.inputContainer}>
          {/* Botón de Mute/Unmute */}
          <TouchableOpacity
            style={[styles.voiceButton, styles.muteButton]}
            onPress={handleMuteToggle}
          >
            <Text style={styles.voiceButtonText}>{isMuted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>

          {/* Botón de Micrófono */}
          <TouchableOpacity
            style={[
              styles.voiceButton,
              styles.micButton,
              isRecording && styles.micButtonRecording
            ]}
            onPress={handleMicPress}
            disabled={isLoading}
          >
            <Text style={styles.voiceButtonText}>
              {isRecording ? '⏹️' : '🎤'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isRecording ? "Grabando..." : "Escribe o habla..."}
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSend()}
            editable={!isRecording && !isLoading}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading || isRecording}
          >
            <Text style={styles.sendButtonText}>📤</Text>
          </TouchableOpacity>
        </View>

        {/* Indicador de estado de voz */}
        {(isSpeaking || isRecording) && (
          <View style={styles.voiceStatusBar}>
            <View style={styles.voiceStatusIndicator}>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.voiceStatusText}>
                {isSpeaking ? '🔊 Hablando...' : '🎤 Escuchando...'}
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#E8F5E9',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  botAvatarText: {
    fontSize: 18,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#2C3E50',
  },
  loadingText: {
    marginLeft: 8,
    color: '#7F8C8D',
    fontSize: 14,
  },
  suggestionsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  suggestionText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    color: '#2C3E50',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    fontSize: 20,
  },
  // 🎤 ESTILOS DE VOZ
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  muteButton: {
    backgroundColor: '#FF9800',
  },
  micButton: {
    backgroundColor: '#2196F3',
  },
  micButtonRecording: {
    backgroundColor: '#F44336',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceButtonText: {
    fontSize: 20,
  },
  voiceStatusBar: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    alignItems: 'center',
  },
  voiceStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceStatusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatbotModal;
