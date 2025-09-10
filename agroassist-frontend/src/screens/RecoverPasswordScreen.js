import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import {useAuth} from '../services/AuthContext';
import globalStyles, {colors, spacing, typography} from '../styles/globalStyles';
import LogoComponent from '../components/LogoComponent';

const RecoverPasswordScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const {recoverPassword} = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!email.trim()) {
      setEmailError('El email es requerido');
      return false;
    } else if (!validateEmail(email)) {
      setEmailError('Ingrese un email válido');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const handleRecoverPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await recoverPassword(email.trim());

      if (result.success) {
        setEmailSent(true);
        Toast.show({
          type: 'success',
          text1: '¡Email enviado!',
          text2: 'Revisa tu bandeja de entrada para recuperar tu contraseña',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.error || 'No se pudo enviar el email de recuperación',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error de conexión',
        text2: 'No se pudo conectar con el servidor',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleRecoverPassword();
  };

  if (emailSent) {
    return (
      <LinearGradient
        colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
        style={globalStyles.container}>
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <LogoComponent size={100} />
            <Text style={styles.successTitle}>¡Email Enviado!</Text>
            <Text style={styles.successMessage}>
              Hemos enviado las instrucciones para recuperar tu contraseña a:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.instructionText}>
              Revisa tu bandeja de entrada y sigue las instrucciones del email.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={handleResendEmail}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.text.onPrimary} />
              ) : (
                <Text style={styles.buttonText}>Reenviar Email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToLogin}>
              <Text style={styles.secondaryButtonText}>Volver al Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
      style={globalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={globalStyles.container}>
        <ScrollView
          contentContainerStyle={globalStyles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Logo y título */}
            <View style={styles.logoContainer}>
              <LogoComponent size={100} />
              <Text style={styles.appTitle}>Recuperar Contraseña</Text>
              <Text style={styles.appSubtitle}>
                Ingresa tu email para recuperar tu cuenta
              </Text>
            </View>

            {/* Formulario */}
            <View style={styles.formContainer}>
              <Text style={styles.description}>
                Te enviaremos un email con las instrucciones para crear una nueva contraseña.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    emailError ? globalStyles.inputError : null,
                  ]}
                  placeholder="Ingresa tu email"
                  placeholderTextColor={colors.text.hint}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {emailError ? (
                  <Text style={globalStyles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              {/* Botón de recuperar */}
              <TouchableOpacity
                style={[styles.recoverButton, loading && styles.disabledButton]}
                onPress={handleRecoverPassword}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.text.onPrimary} />
                ) : (
                  <Text style={styles.recoverButtonText}>Enviar Email</Text>
                )}
              </TouchableOpacity>

              {/* Enlace para volver al login */}
              <View style={styles.linksContainer}>
                <Text style={styles.linkDescription}>¿Recordaste tu contraseña?</Text>
                <TouchableOpacity
                  onPress={handleBackToLogin}
                  disabled={loading}>
                  <Text style={styles.linkText}>Volver al Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  appTitle: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: typography.body1,
    color: colors.text.onPrimary,
    marginTop: spacing.xs,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  description: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...globalStyles.label,
    color: colors.text.primary,
  },
  input: {
    ...globalStyles.input,
    marginTop: spacing.xs,
  },
  recoverButton: {
    ...globalStyles.button,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  recoverButtonText: {
    ...globalStyles.buttonText,
    fontSize: typography.h6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkDescription: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  linkText: {
    fontSize: typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  // Estilos para la pantalla de éxito
  successContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  successMessage: {
    fontSize: typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emailText: {
    fontSize: typography.body1,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  button: {
    ...globalStyles.button,
    marginBottom: spacing.md,
    width: '100%',
  },
  buttonText: {
    ...globalStyles.buttonText,
  },
  secondaryButton: {
    ...globalStyles.buttonSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...globalStyles.buttonSecondaryText,
  },
};

export default RecoverPasswordScreen;
