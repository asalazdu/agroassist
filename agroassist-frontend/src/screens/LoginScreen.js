import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
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

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {login} = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;

    // Validar email
    if (!email.trim()) {
      setEmailError('El email es requerido');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Ingrese un email válido');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validar contraseña
    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: '¡Bienvenido!',
          text2: 'Has iniciado sesión correctamente',
        });
        // La navegación se manejará automáticamente por el AuthContext
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error de autenticación',
          text2: result.error || 'Credenciales incorrectas',
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

  const handleRecoverPassword = () => {
    navigation.navigate('RecoverPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

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
              <LogoComponent size={120} />
              <Text style={styles.appTitle}>Agroassist IA</Text>
              <Text style={styles.appSubtitle}>Tu asistente inteligente</Text>
            </View>

            {/* Formulario de login */}
            <View style={styles.formContainer}>
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

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <TextInput
                  style={[
                    styles.input,
                    passwordError ? globalStyles.inputError : null,
                  ]}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor={colors.text.hint}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {passwordError ? (
                  <Text style={globalStyles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              {/* Botón de login */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.text.onPrimary} />
                ) : (
                  <Text style={styles.loginButtonText}>Ingresar</Text>
                )}
              </TouchableOpacity>

              {/* Enlaces adicionales */}
              <View style={styles.linksContainer}>
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={loading}>
                  <Text style={styles.linkText}>Registrarse</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRecoverPassword}
                  disabled={loading}>
                  <Text style={styles.linkText}>Recuperar contraseña</Text>
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
    marginBottom: spacing.xxl,
  },
  appTitle: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: colors.text.onPrimary,
    marginTop: spacing.md,
  },
  appSubtitle: {
    fontSize: typography.body1,
    color: colors.text.onPrimary,
    marginTop: spacing.xs,
    opacity: 0.9,
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
  loginButton: {
    ...globalStyles.button,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  loginButtonText: {
    ...globalStyles.buttonText,
    fontSize: typography.h6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  linkText: {
    fontSize: typography.body2,
    color: colors.primary,
    fontWeight: '600',
    marginVertical: spacing.xs,
  },
};

export default LoginScreen;
