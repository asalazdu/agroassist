import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { authService, User } from '../services/authService';
import { weatherService } from '../services/weatherService';

interface ProfileScreenProps {
  navigation: any;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [selectedCultivos, setSelectedCultivos] = useState<{ [key: string]: boolean }>({});
  const [weatherLocation, setWeatherLocation] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const cultivosOptions = [
    'Café', 'Maíz', 'Arroz', 'Papa', 'Plátano', 'Yuca', 'Frijol', 'Caña de azúcar',
    'Aguacate', 'Cacao', 'Tomate', 'Cebolla', 'Zanahoria', 'Lechuga', 'Cilantro',
    'Flores', 'Pastos', 'Otros'
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userProfile = await authService.getProfile();
      if (userProfile) {
        setUser(userProfile);
        setFormData(userProfile);
        
        // Configurar cultivos seleccionados
        const cultivosMap: { [key: string]: boolean } = {};
        userProfile.cultivos.forEach(cultivo => {
          cultivosMap[cultivo] = true;
        });
        setSelectedCultivos(cultivosMap);
        
        // Configurar ubicación del clima
        setWeatherLocation(userProfile.ubicacion || '');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setFormData({ ...user });
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({ ...user });
    setErrors({});
    
    // Restaurar cultivos
    const cultivosMap: { [key: string]: boolean } = {};
    user?.cultivos.forEach(cultivo => {
      cultivosMap[cultivo] = true;
    });
    setSelectedCultivos(cultivosMap);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido?.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!authService.validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (formData.cultivos && formData.cultivos.length === 0) {
      newErrors.cultivos = 'Selecciona al menos un cultivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const result = await authService.updateProfile(formData);
      
      if (result.success && result.user) {
        setUser(result.user);
        setEditing(false);
        setErrors({});
        Alert.alert('¡Éxito!', 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', result.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setSaving(false);
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

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            onLogout();
          }
        }
      ]
    );
  };

  const handleWeatherLocation = () => {
    navigation.navigate('Weather', { 
      initialLocation: weatherLocation || user?.ubicacion 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#f44336" />
        <Text style={styles.errorText}>Error al cargar perfil</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
          )}
          {editing && (
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={20} color="#4CAF50" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.userName}>
          {user.nombre} {user.apellido}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        <View style={styles.userType}>
          <Ionicons name="leaf" size={16} color="#4CAF50" />
          <Text style={styles.userTypeText}>
            {user.tipoAgricultor.charAt(0).toUpperCase() + user.tipoAgricultor.slice(1)} Agricultor
          </Text>
        </View>

        <View style={styles.headerButtons}>
          {editing ? (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEdit}>
              <Ionicons name="create" size={16} color="#4CAF50" />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                value={editing ? formData.nombre : user.nombre}
                onChangeText={(text) => {
                  setFormData({ ...formData, nombre: text });
                  if (errors.nombre) setErrors({ ...errors, nombre: '' });
                }}
                editable={editing}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Apellido</Text>
              <TextInput
                style={[styles.input, errors.apellido && styles.inputError]}
                value={editing ? formData.apellido : user.apellido}
                onChangeText={(text) => {
                  setFormData({ ...formData, apellido: text });
                  if (errors.apellido) setErrors({ ...errors, apellido: '' });
                }}
                editable={editing}
              />
            </View>
          </View>
          {(errors.nombre || errors.apellido) && (
            <Text style={styles.errorText}>{errors.nombre || errors.apellido}</Text>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={editing ? formData.email : user.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={editing}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={editing ? formData.telefono : user.telefono}
              onChangeText={(text) => setFormData({ ...formData, telefono: text })}
              keyboardType="phone-pad"
              editable={editing}
              placeholder="Opcional"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ubicación</Text>
            <TextInput
              style={styles.input}
              value={editing ? formData.ubicacion : user.ubicacion}
              onChangeText={(text) => setFormData({ ...formData, ubicacion: text })}
              editable={editing}
              placeholder="Opcional"
            />
          </View>
        </View>

        {/* Información Agrícola */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Agrícola</Text>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.inputLabel}>Tipo de Agricultor</Text>
            {editing ? (
              <Picker
                selectedValue={formData.tipoAgricultor}
                onValueChange={(value: 'pequeño' | 'mediano' | 'grande') => 
                  setFormData({ ...formData, tipoAgricultor: value })
                }
                style={styles.picker}
              >
                <Picker.Item label="Pequeño Agricultor" value="pequeño" />
                <Picker.Item label="Mediano Agricultor" value="mediano" />
                <Picker.Item label="Gran Agricultor" value="grande" />
              </Picker>
            ) : (
              <Text style={styles.staticText}>
                {user.tipoAgricultor.charAt(0).toUpperCase() + user.tipoAgricultor.slice(1)} Agricultor
              </Text>
            )}
          </View>

          <Text style={styles.cultivosTitle}>Cultivos de Interés</Text>
          {editing ? (
            <View style={styles.cultivosContainer}>
              {cultivosOptions.map((cultivo) => (
                <TouchableOpacity
                  key={cultivo}
                  style={[
                    styles.cultivoChip,
                    selectedCultivos[cultivo] && styles.cultivoChipSelected
                  ]}
                  onPress={() => toggleCultivo(cultivo)}
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
          ) : (
            <View style={styles.cultivosContainer}>
              {user.cultivos.map((cultivo) => (
                <View key={cultivo} style={styles.cultivoChipStatic}>
                  <Text style={styles.cultivoTextStatic}>{cultivo}</Text>
                </View>
              ))}
            </View>
          )}
          {errors.cultivos && <Text style={styles.errorText}>{errors.cultivos}</Text>}
        </View>

        {/* Accesos Rápidos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          
          <TouchableOpacity style={styles.quickAction} onPress={handleWeatherLocation}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="partly-sunny" size={24} color="#4CAF50" />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Clima Local</Text>
              <Text style={styles.quickActionSubtitle}>
                Ver pronóstico de {weatherLocation || 'tu ubicación'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction} 
            onPress={() => navigation.navigate('PestIdentification')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="bug" size={24} color="#4CAF50" />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Identificar Plagas</Text>
              <Text style={styles.quickActionSubtitle}>Detectar y tratar problemas en cultivos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction} 
            onPress={() => navigation.navigate('Chatbot')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="chatbubbles" size={24} color="#4CAF50" />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Asistente IA</Text>
              <Text style={styles.quickActionSubtitle}>Consultas agrícolas personalizadas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Configuraciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuraciones</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Notificaciones</Text>
              <Text style={styles.settingSubtitle}>Alertas de clima y plagas</Text>
            </View>
            <Switch 
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
            />
          </View>
        </View>

        {/* Información de la Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
          <Text style={styles.accountInfo}>
            Miembro desde: {new Date(user.fechaRegistro).toLocaleDateString('es-CO')}
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#f44336" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginVertical: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#388E3C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#E8F5E8',
    marginBottom: 10,
  },
  userType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#388E3C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 20,
  },
  userTypeText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#f44336',
  },
  staticText: {
    fontSize: 16,
    color: '#333',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
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
  cultivoChipStatic: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  cultivoText: {
    fontSize: 14,
    color: '#666',
  },
  cultivoTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cultivoTextStatic: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  accountInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  logoutButtonText: {
    color: '#f44336',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});
