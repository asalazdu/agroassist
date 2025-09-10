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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { authService, RegisterData } from '../services/authService';

interface RegisterScreenProps {
  navigation: any;
  onRegisterSuccess: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, onRegisterSuccess }) => {
  const [formData, setFormData] = useState<RegisterData>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    ubicacion: '',
    tipoAgricultor: 'pequeño',
    cultivos: [],
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedCultivos, setSelectedCultivos] = useState<{ [key: string]: boolean }>({});

  const cultivosOptions = [
    'Café', 'Maíz', 'Arroz', 'Papa', 'Plátano', 'Yuca', 'Frijol', 'Caña de azúcar',
    'Aguacate', 'Cacao', 'Tomate', 'Cebolla', 'Zanahoria', 'Lechuga', 'Cilantro',
    'Flores', 'Pastos', 'Otros'
  ];

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!authService.validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    const passwordValidation = authService.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message!;
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.cultivos.length === 0) {
      newErrors.cultivos = 'Selecciona al menos un cultivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await authService.register(formData);
      
      if (result.success) {
        Alert.alert(
          '¡Registro Exitoso!', 
          '¡Bienvenido a AgroAssist! Tu cuenta ha sido creada correctamente.',
          [{ text: 'OK', onPress: onRegisterSuccess }]
        );
      } else {
        Alert.alert('Error', result.message || 'Error al registrar usuario');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCultivo = (cultivo: string) => {
    const newSelected = { ...selectedCultivos };
    newSelected[cultivo] = !newSelected[cultivo];
    setSelectedCultivos(newSelected);

    const cultivosSeleccionados = Object.keys(newSelected).filter(key => newSelected[key]);
    setFormData({ ...formData, cultivos: cultivosSeleccionados });
    
    if (errors.cultivos) setErrors({ ...errors, cultivos: '' });
  };

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
          <Ionicons name="person-add" size={50} color="#4CAF50" />
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a la comunidad agrícola</Text>
        </View>

        <View style={styles.form}>
          {/* Información Personal */}
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                placeholder="Nombre"
                value={formData.nombre}
                onChangeText={(text) => {
                  setFormData({ ...formData, nombre: text });
                  if (errors.nombre) setErrors({ ...errors, nombre: '' });
                }}
                editable={!loading}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <TextInput
                style={[styles.input, errors.apellido && styles.inputError]}
                placeholder="Apellido"
                value={formData.apellido}
                onChangeText={(text) => {
                  setFormData({ ...formData, apellido: text });
                  if (errors.apellido) setErrors({ ...errors, apellido: '' });
                }}
                editable={!loading}
              />
            </View>
          </View>
          {(errors.nombre || errors.apellido) && (
            <Text style={styles.errorText}>
              {errors.nombre || errors.apellido}
            </Text>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={styles.inputContainer}>
            <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Teléfono (opcional)"
              value={formData.telefono}
              onChangeText={(text) => setFormData({ ...formData, telefono: text })}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ubicación (opcional)"
              value={formData.ubicacion}
              onChangeText={(text) => setFormData({ ...formData, ubicacion: text })}
              editable={!loading}
            />
          </View>

          {/* Contraseña */}
          <Text style={styles.sectionTitle}>Seguridad</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Contraseña"
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          {/* Información Agrícola */}
          <Text style={styles.sectionTitle}>Información Agrícola</Text>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Tipo de Agricultor:</Text>
            <Picker
              selectedValue={formData.tipoAgricultor}
              onValueChange={(value: 'pequeño' | 'mediano' | 'grande') => setFormData({ ...formData, tipoAgricultor: value })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Pequeño Agricultor" value="pequeño" />
              <Picker.Item label="Mediano Agricultor" value="mediano" />
              <Picker.Item label="Gran Agricultor" value="grande" />
            </Picker>
          </View>

          <Text style={styles.cultivosTitle}>Cultivos de Interés:</Text>
          <View style={styles.cultivosContainer}>
            {cultivosOptions.map((cultivo) => (
              <TouchableOpacity
                key={cultivo}
                style={[
                  styles.cultivoChip,
                  selectedCultivos[cultivo] && styles.cultivoChipSelected
                ]}
                onPress={() => toggleCultivo(cultivo)}
                disabled={loading}
              >
                <Text style={[
                  styles.cultivoText,
                  selectedCultivos[cultivo] && styles.cultivoTextSelected
                ]}>
                  {cultivo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.cultivos && <Text style={styles.errorText}>{errors.cultivos}</Text>}

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
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
  eyeIcon: {
    padding: 15,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  picker: {
    height: 50,
  },
  cultivosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  cultivosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  cultivoChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cultivoChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  cultivoText: {
    fontSize: 14,
    color: '#666',
  },
  cultivoTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
});
