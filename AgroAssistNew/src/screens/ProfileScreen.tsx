import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { User } from '../types';
import authService from '../services/authService';

interface Props {
  onLogout: () => void;
}

const ProfileScreen: React.FC<Props> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Primero intentar obtener datos del backend
      console.log('📥 Cargando datos del usuario desde el backend...');
      const userData = await authService.getUserProfile();
      
      console.log('✅ Datos recibidos:', userData);
      
      // Mapear los datos del backend al formato del frontend
      const mappedUser = {
        id: userData.id,
        name: userData.nombre_completo || userData.name,
        email: userData.correo || userData.email,
        phone: userData.telefono || userData.phone || '',
        location: userData.ubicacion || userData.location || '',
        farmSize: userData.tamaño_finca ? String(userData.tamaño_finca) : '',
        // Mantener también los campos en español por compatibilidad
        nombre_completo: userData.nombre_completo,
        correo: userData.correo,
        telefono: userData.telefono,
        ubicacion: userData.ubicacion,
        tamaño_finca: userData.tamaño_finca,
        id_rol: userData.id_rol,
        activo: userData.activo,
        fecha_creacion: userData.fecha_creacion
      };
      
      setUser(mappedUser);
      setFormData(mappedUser);
    } catch (error) {
      console.error('❌ Error cargando datos del usuario desde backend:', error);
      
      // Si falla, intentar cargar desde AsyncStorage (datos locales)
      try {
        console.log('📦 Cargando datos locales de AsyncStorage...');
        const storedUser = await authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setFormData(storedUser);
        } else {
          Alert.alert('Error', 'No se pudo cargar la información del usuario. Por favor inicia sesión nuevamente.');
        }
      } catch (localError) {
        console.error('❌ Error cargando datos locales:', localError);
        Alert.alert('Error', 'No se pudo cargar la información del usuario.');
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      
      console.log('✅ Usuario actualizado desde backend:', updatedUser);
      
      // Mapear los datos del backend al formato del frontend
      const mappedUser = {
        id: updatedUser.id,
        name: updatedUser.nombre_completo || updatedUser.name,
        email: updatedUser.correo || updatedUser.email,
        phone: updatedUser.telefono || updatedUser.phone || '',
        location: updatedUser.ubicacion || updatedUser.location || '',
        farmSize: updatedUser.tamaño_finca ? String(updatedUser.tamaño_finca) : '',
        // Mantener también los campos en español por compatibilidad
        nombre_completo: updatedUser.nombre_completo,
        correo: updatedUser.correo,
        telefono: updatedUser.telefono,
        ubicacion: updatedUser.ubicacion,
        tamaño_finca: updatedUser.tamaño_finca,
        id_rol: updatedUser.id_rol,
        activo: updatedUser.activo,
        fecha_creacion: updatedUser.fecha_creacion
      };
      
      setUser(mappedUser);
      setFormData(mappedUser);
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al actualizar perfil');
    } finally {
      setIsLoading(false);
    }
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
          },
        },
      ]
    );
  };

  const updateFormData = (field: keyof User, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>👤 Mi Perfil</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.name || ''}
              onChangeText={(text) => updateFormData('name', text)}
              placeholder="Tu nombre completo"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={formData.email || ''}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            <Text style={styles.helperText}>El email no puede ser modificado</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.phone || ''}
              onChangeText={(text) => updateFormData('phone', text)}
              placeholder="Tu número de teléfono"
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ubicación</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.location || ''}
              onChangeText={(text) => updateFormData('location', text)}
              placeholder="Ciudad, Departamento"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tamaño de la Finca (hectáreas)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.farmSize || ''}
              onChangeText={(text) => updateFormData('farmSize', text)}
              placeholder="Ej: 5.5"
              keyboardType="numeric"
              editable={isEditing}
            />
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  form: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  actionsContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileScreen;
