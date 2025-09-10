import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!authService.validateEmail(email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      
      if (result.success) {
        setEmailSent(true);
        Alert.alert(
          '¡Email Enviado!', 
          'Hemos enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y sigue las instrucciones.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setEmail('');
    setErrors({});
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <Ionicons name="mail-open" size={80} color="#4CAF50" />
            <Text style={styles.title}>¡Email Enviado!</Text>
            <Text style={styles.subtitle}>Revisa tu correo electrónico</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
              <Text style={styles.successTitle}>Enlace de Recuperación Enviado</Text>
              <Text style={styles.successMessage}>
                Hemos enviado un enlace de recuperación a:
              </Text>
              <Text style={styles.emailText}>{email}</Text>
              <Text style={styles.instructionsText}>
                • Revisa tu bandeja de entrada y spam{'\n'}
                • Haz clic en el enlace del email{'\n'}
                • Crea tu nueva contraseña{'\n'}
                • Regresa a la app para iniciar sesión
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleResendEmail}
            >
              <Text style={styles.resendButtonText}>Enviar a otro email</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backToLoginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backToLoginText}>Volver al Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <Ionicons name="key" size={60} color="#4CAF50" />
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <Text style={styles.subtitle}>Ingresa tu email para recuperar tu cuenta</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Recuperación de Cuenta</Text>
          
          <Text style={styles.description}>
            Ingresa el email asociado a tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TouchableOpacity 
            style={[styles.sendButton, loading && styles.buttonDisabled]}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Enviar Enlace de Recuperación</Text>
            )}
          </TouchableOpacity>

          <View style={styles.helpContainer}>
            <Ionicons name="information-circle" size={16} color="#666" />
            <Text style={styles.helpText}>
              El enlace de recuperación será válido por 24 horas
            </Text>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Recordaste tu contraseña? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={styles.loginButton}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  helpText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginButton: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Estilos para cuando el email fue enviado
  successContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginVertical: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'left',
  },
  resendButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  resendButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToLoginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
