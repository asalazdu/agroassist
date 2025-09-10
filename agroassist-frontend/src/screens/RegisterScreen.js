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

const RegisterScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const {register} = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
      isValid = false;
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingrese un email válido';
      isValid = false;
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme su contraseña';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: '¡Registro exitoso!',
          text2: 'Tu cuenta ha sido creada correctamente',
        });
        navigation.navigate('Login');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error en el registro',
          text2: result.error || 'No se pudo crear la cuenta',
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
              <Text style={styles.appTitle}>Crear Cuenta</Text>
              <Text style={styles.appSubtitle}>Únete a AgroAssist IA</Text>
            </View>

            {/* Formulario de registro */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre completo</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.name ? globalStyles.inputError : null,
                  ]}
                  placeholder="Ingresa tu nombre completo"
                  placeholderTextColor={colors.text.hint}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {errors.name ? (
                  <Text style={globalStyles.errorText}>{errors.name}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.email ? globalStyles.inputError : null,
                  ]}
                  placeholder="Ingresa tu email"
                  placeholderTextColor={colors.text.hint}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email ? (
                  <Text style={globalStyles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.password ? globalStyles.inputError : null,
                  ]}
                  placeholder="Crea una contraseña"
                  placeholderTextColor={colors.text.hint}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.password ? (
                  <Text style={globalStyles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.confirmPassword ? globalStyles.inputError : null,
                  ]}
                  placeholder="Confirma tu contraseña"
                  placeholderTextColor={colors.text.hint}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.confirmPassword ? (
                  <Text style={globalStyles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              {/* Botón de registro */}
              <TouchableOpacity
                style={[styles.registerButton, loading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.text.onPrimary} />
                ) : (
                  <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                )}
              </TouchableOpacity>

              {/* Enlace para volver al login */}
              <View style={styles.linksContainer}>
                <Text style={styles.linkDescription}>¿Ya tienes una cuenta?</Text>
                <TouchableOpacity
                  onPress={handleBackToLogin}
                  disabled={loading}>
                  <Text style={styles.linkText}>Iniciar Sesión</Text>
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
  registerButton: {
    ...globalStyles.button,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  registerButtonText: {
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
};

export default RegisterScreen;
