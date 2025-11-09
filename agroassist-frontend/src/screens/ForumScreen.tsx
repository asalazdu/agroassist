/**
 * ForumScreen - Foro Comunitario AgroAssist
 * Pantalla completa con lista de hilos, crear posts, comentar y responder
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Modal, Alert, RefreshControl, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as forumService from '../../services/forumService';
import type { Hilo, Comentario } from '../../services/forumService';

export default function ForumScreen() {
  const [hilos, setHilos] = useState<Hilo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | undefined>();
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('general');
  const [creando, setCreando] = useState(false);
  const [modalHiloVisible, setModalHiloVisible] = useState(false);
  const [hiloSeleccionado, setHiloSeleccionado] = useState<Hilo | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [modalBusquedaVisible, setModalBusquedaVisible] = useState(false);

  const categorias = [
    { id: 'general', nombre: 'General', emoji: '💬' },
    { id: 'plagas', nombre: 'Plagas', emoji: '🐛' },
    { id: 'cultivos', nombre: 'Cultivos', emoji: '🌱' },
    { id: 'clima', nombre: 'Clima', emoji: '🌤️' },
    { id: 'mercado', nombre: 'Mercado', emoji: '💰' },
    { id: 'ayuda', nombre: 'Ayuda', emoji: '❓' },
  ];

  useEffect(() => {
    cargarHilos();
    obtenerUsuarioActual();
  }, [categoriaSeleccionada]);

  const obtenerUsuarioActual = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUsuarioId(userData.id);
      }
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
    }
  };

  const cargarHilos = async () => {
    try {
      setLoading(true);
      const resultado = await forumService.obtenerHilos(categoriaSeleccionada, 50, 0);
      if (resultado.ok && resultado.hilos) setHilos(resultado.hilos);
      else Alert.alert('Error', resultado.error || 'No se pudieron cargar los hilos');
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarHilos();
    setRefreshing(false);
  };

  const handleCrearHilo = async () => {
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) {
      Alert.alert('Error', 'El título y contenido son obligatorios');
      return;
    }
    if (nuevoTitulo.length < 10 || nuevoContenido.length < 10) {
      Alert.alert('Error', 'El título y contenido deben tener al menos 10 caracteres');
      return;
    }

    try {
      setCreando(true);
      const resultado = await forumService.crearHilo({
        titulo: nuevoTitulo.trim(),
        contenido: nuevoContenido.trim(),
        categoria: nuevaCategoria,
      });

      if (resultado.ok) {
        Alert.alert('¡Éxito!', 'Tu hilo ha sido publicado');
        setModalCrearVisible(false);
        setNuevoTitulo('');
        setNuevoContenido('');
        setNuevaCategoria('general');
        cargarHilos();
      } else {
        Alert.alert('Error', resultado.error || 'No se pudo crear el hilo');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setCreando(false);
    }
  };

  const handleAbrirHilo = async (hilo: Hilo) => {
    setHiloSeleccionado(hilo);
    setModalHiloVisible(true);
    setLoadingComentarios(true);

    try {
      const resultado = await forumService.obtenerComentarios(hilo.id);
      if (resultado.ok && resultado.comentarios) {
        setComentarios(resultado.comentarios);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingComentarios(false);
    }
  };

  const handleComentarEnHilo = async () => {
    if (!nuevoComentario.trim() || !hiloSeleccionado) return;
    if (nuevoComentario.length < 10) {
      Alert.alert('Error', 'El comentario debe tener al menos 10 caracteres');
      return;
    }

    try {
      const resultado = await forumService.crearComentario(hiloSeleccionado.id, {
        contenido: nuevoComentario.trim(),
      });

      if (resultado.ok) {
        setNuevoComentario('');
        const nuevosComentarios = await forumService.obtenerComentarios(hiloSeleccionado.id);
        if (nuevosComentarios.ok && nuevosComentarios.comentarios) {
          setComentarios(nuevosComentarios.comentarios);
        }
      } else {
        Alert.alert('Error', resultado.error || 'No se pudo publicar');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const handleEliminarHilo = async (hiloId: number) => {
    Alert.alert(
      'Eliminar hilo',
      '¿Estás seguro de que quieres eliminar este hilo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const resultado = await forumService.eliminarHilo(hiloId);
              if (resultado.ok) {
                Alert.alert('¡Éxito!', 'El hilo ha sido eliminado');
                setModalHiloVisible(false);
                cargarHilos();
              } else {
                Alert.alert('Error', resultado.error || 'No se pudo eliminar');
              }
            } catch (error) {
              Alert.alert('Error', 'Error de conexión');
            }
          },
        },
      ]
    );
  };

  const handleEliminarComentario = async (comentarioId: number) => {
    Alert.alert(
      'Eliminar comentario',
      '¿Estás seguro de que quieres eliminar este comentario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const resultado = await forumService.eliminarComentario(comentarioId);
              if (resultado.ok && hiloSeleccionado) {
                const nuevosComentarios = await forumService.obtenerComentarios(hiloSeleccionado.id);
                if (nuevosComentarios.ok && nuevosComentarios.comentarios) {
                  setComentarios(nuevosComentarios.comentarios);
                }
              } else {
                Alert.alert('Error', resultado.error || 'No se pudo eliminar');
              }
            } catch (error) {
              Alert.alert('Error', 'Error de conexión');
            }
          },
        },
      ]
    );
  };

  const handleBuscar = async () => {
    if (!busqueda.trim()) {
      Alert.alert('Error', 'Escribe algo para buscar');
      return;
    }

    try {
      setLoading(true);
      const resultado = await forumService.buscarHilos(busqueda.trim());
      if (resultado.ok && resultado.hilos) {
        setHilos(resultado.hilos);
        setModalBusquedaVisible(false);
        setBusqueda('');
      } else {
        Alert.alert('Sin resultados', 'No se encontraron hilos con esa búsqueda');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const renderHilo = ({ item }: { item: Hilo }) => {
    const numComentarios = item.comentarios?.[0]?.count || 0;
    const categoriaInfo = categorias.find((c) => c.id === item.categoria);

    return (
      <TouchableOpacity style={styles.hiloCard} onPress={() => handleAbrirHilo(item)} activeOpacity={0.7}>
        <View style={styles.hiloHeader}>
          <View style={styles.categoriaTag}>
            <Text style={styles.categoriaEmoji}>{categoriaInfo?.emoji || '💬'}</Text>
            <Text style={styles.categoriaTexto}>{categoriaInfo?.nombre || 'General'}</Text>
          </View>
          <Text style={styles.hiloFecha}>{forumService.formatearFechaRelativa(item.created_at)}</Text>
        </View>
        <Text style={styles.hiloTitulo} numberOfLines={2}>{item.titulo}</Text>
        <Text style={styles.hiloContenido} numberOfLines={3}>{item.contenido}</Text>
        <View style={styles.hiloFooter}>
          <View style={styles.autorInfo}>
            <Ionicons name="person-circle-outline" size={16} color="#666" />
            <Text style={styles.autorNombre}>{item.usuario?.nombre_completo || 'Usuario'}</Text>
          </View>
          <View style={styles.comentariosInfo}>
            <Ionicons name="chatbubbles-outline" size={16} color="#4A90E2" />
            <Text style={styles.comentariosTexto}>{numComentarios}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderComentario = (comentario: Comentario, nivel: number = 0) => (
    <View key={comentario.id} style={[styles.comentarioContainer, nivel > 0 && styles.comentarioRespuesta]}>
      <View style={styles.comentarioHeader}>
        <Ionicons name="person-circle" size={24} color="#4A90E2" />
        <View style={styles.comentarioHeaderTexto}>
          <Text style={styles.comentarioAutor}>{comentario.usuario?.nombre_completo || 'Usuario'}</Text>
          <Text style={styles.comentarioFecha}>{forumService.formatearFechaRelativa(comentario.created_at)}</Text>
        </View>
        {usuarioId === comentario.usuario_id && (
          <TouchableOpacity onPress={() => handleEliminarComentario(comentario.id)} style={styles.eliminarBtn}>
            <Ionicons name="trash-outline" size={18} color="#E74C3C" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.comentarioContenido}>{comentario.contenido}</Text>
      {comentario.respuestas && comentario.respuestas.map((r) => renderComentario(r, nivel + 1))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌾 Foro Comunitario</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.buscarButton} onPress={() => setModalBusquedaVisible(true)}>
            <Ionicons name="search" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.crearButton} onPress={() => setModalCrearVisible(true)}>
            <Ionicons name="add-circle" size={28} color="#27AE60" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasContainer}>
        <TouchableOpacity
          style={[styles.categoriaChip, !categoriaSeleccionada && styles.categoriaChipActiva]}
          onPress={() => setCategoriaSeleccionada(undefined)}
        >
          <Text style={[styles.categoriaChipTexto, !categoriaSeleccionada && styles.categoriaChipTextoActivo]}>Todas</Text>
        </TouchableOpacity>
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoriaChip, categoriaSeleccionada === cat.id && styles.categoriaChipActiva]}
            onPress={() => setCategoriaSeleccionada(cat.id)}
          >
            <Text style={styles.categoriaChipEmoji}>{cat.emoji}</Text>
            <Text style={[styles.categoriaChipTexto, categoriaSeleccionada === cat.id && styles.categoriaChipTextoActivo]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27AE60" />
          <Text style={styles.loadingText}>Cargando hilos...</Text>
        </View>
      ) : hilos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay hilos aún</Text>
          <Text style={styles.emptySubtext}>¡Sé el primero en publicar!</Text>
        </View>
      ) : (
        <FlatList
          data={hilos}
          renderItem={renderHilo}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listaContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#27AE60']} />}
        />
      )}

      {/* Modal Búsqueda */}
      <Modal visible={modalBusquedaVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🔍 Buscar Hilos</Text>
                <TouchableOpacity onPress={() => setModalBusquedaVisible(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.inputTitulo}
                placeholder="¿Qué estás buscando?"
                placeholderTextColor="#999"
                value={busqueda}
                onChangeText={setBusqueda}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.publicarButton, !busqueda.trim() && styles.publicarButtonDisabled]}
                onPress={handleBuscar}
                disabled={!busqueda.trim()}
              >
                <Text style={styles.publicarTexto}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal Crear Hilo */}
      <Modal visible={modalCrearVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✍️ Crear Hilo</Text>
              <TouchableOpacity onPress={() => setModalCrearVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCategorias}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoriaChip, nuevaCategoria === cat.id && styles.categoriaChipActiva]}
                  onPress={() => setNuevaCategoria(cat.id)}
                >
                  <Text style={styles.categoriaChipEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoriaChipTexto, nuevaCategoria === cat.id && styles.categoriaChipTextoActivo]}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.inputTitulo}
              placeholder="Título del hilo (mín. 10 caracteres)"
              placeholderTextColor="#999"
              value={nuevoTitulo}
              onChangeText={setNuevoTitulo}
              maxLength={200}
            />

            <TextInput
              style={styles.inputContenido}
              placeholder="Escribe tu pregunta o comentario... (mín. 10 caracteres)"
              placeholderTextColor="#999"
              value={nuevoContenido}
              onChangeText={setNuevoContenido}
              multiline
              maxLength={5000}
              textAlignVertical="top"
            />

            <Text style={styles.contador}>
              {nuevoTitulo.length}/200 • {nuevoContenido.length}/5000
            </Text>

            <TouchableOpacity
              style={[styles.publicarButton, creando && styles.publicarButtonDisabled]}
              onPress={handleCrearHilo}
              disabled={creando}
            >
              {creando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.publicarTexto}>Publicar</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Ver Hilo */}
      <Modal visible={modalHiloVisible} animationType="slide">
        <SafeAreaView style={styles.modalHiloContainer} edges={['top']}>
          <View style={styles.modalHiloHeader}>
            <TouchableOpacity onPress={() => setModalHiloVisible(false)}>
              <Ionicons name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalHiloTitle}>Hilo</Text>
            {hiloSeleccionado && usuarioId === hiloSeleccionado.usuario_id ? (
              <TouchableOpacity onPress={() => handleEliminarHilo(hiloSeleccionado.id)}>
                <Ionicons name="trash-outline" size={24} color="#E74C3C" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 28 }} />
            )}
          </View>

          {hiloSeleccionado && (
            <ScrollView style={styles.modalHiloContent}>
              <View style={styles.hiloDetalle}>
                <View style={styles.hiloDetalleHeader}>
                  <View style={styles.categoriaTag}>
                    <Text style={styles.categoriaEmoji}>
                      {forumService.getCategoriaEmoji(hiloSeleccionado.categoria)}
                    </Text>
                    <Text style={styles.categoriaTexto}>{hiloSeleccionado.categoria}</Text>
                  </View>
                  <Text style={styles.hiloFecha}>
                    {forumService.formatearFechaRelativa(hiloSeleccionado.created_at)}
                  </Text>
                </View>

                <Text style={styles.hiloDetalleTitulo}>{hiloSeleccionado.titulo}</Text>
                <Text style={styles.hiloDetalleContenido}>{hiloSeleccionado.contenido}</Text>

                <View style={styles.hiloDetalleFooter}>
                  <Ionicons name="person-circle-outline" size={20} color="#666" />
                  <Text style={styles.autorNombre}>
                    {hiloSeleccionado.usuario?.nombre_completo || 'Usuario'}
                  </Text>
                </View>
              </View>

              <View style={styles.comentariosSection}>
                <Text style={styles.comentariosTitulo}>
                  💬 Comentarios ({comentarios.length})
                </Text>

                {loadingComentarios ? (
                  <ActivityIndicator size="small" color="#27AE60" />
                ) : comentarios.length === 0 ? (
                  <Text style={styles.sinComentarios}>Sé el primero en comentar</Text>
                ) : (
                  comentarios.map((c) => renderComentario(c))
                )}
              </View>
            </ScrollView>
          )}

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.comentarInput}>
              <TextInput
                style={styles.inputComentario}
                placeholder="Escribe un comentario... (mín. 10 caracteres)"
                placeholderTextColor="#999"
                value={nuevoComentario}
                onChangeText={setNuevoComentario}
                multiline
                maxLength={2000}
              />
              <TouchableOpacity
                style={[styles.enviarButton, nuevoComentario.length < 10 && styles.enviarButtonDisabled]}
                onPress={handleComentarEnHilo}
                disabled={nuevoComentario.length < 10}
              >
                <Ionicons name="send" size={24} color={nuevoComentario.length >= 10 ? '#fff' : '#ccc'} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buscarButton: { padding: 5 },
  crearButton: { padding: 5 },
  eliminarBtn: { padding: 5 },
  categoriasContainer: { maxHeight: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  categoriaChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 5, marginVertical: 8, backgroundColor: '#F0F0F0', borderRadius: 20 },
  categoriaChipActiva: { backgroundColor: '#27AE60' },
  categoriaChipEmoji: { fontSize: 16, marginRight: 5 },
  categoriaChipTexto: { fontSize: 14, color: '#666', fontWeight: '600' },
  categoriaChipTextoActivo: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#999', marginTop: 20 },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 5 },
  listaContent: { paddingVertical: 10 },
  hiloCard: { backgroundColor: '#fff', marginHorizontal: 15, marginVertical: 8, padding: 15, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  hiloHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoriaTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  categoriaEmoji: { fontSize: 14, marginRight: 4 },
  categoriaTexto: { fontSize: 12, color: '#666', fontWeight: '600' },
  hiloFecha: { fontSize: 12, color: '#999' },
  hiloTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  hiloContenido: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  hiloFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  autorInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  autorNombre: { fontSize: 12, color: '#666', marginLeft: 5 },
  comentariosInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  comentariosTexto: { fontSize: 12, color: '#4A90E2', fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalCategorias: { maxHeight: 60, marginBottom: 15 },
  inputTitulo: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 15, color: '#333' },
  inputContenido: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 15, fontSize: 14, minHeight: 150, marginBottom: 10, color: '#333' },
  contador: { fontSize: 12, color: '#999', marginBottom: 15, textAlign: 'right' },
  publicarButton: { backgroundColor: '#27AE60', borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  publicarButtonDisabled: { backgroundColor: '#ccc' },
  publicarTexto: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  modalHiloContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  modalHiloHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalHiloTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalHiloContent: { flex: 1 },
  hiloDetalle: { backgroundColor: '#fff', padding: 20, marginBottom: 10 },
  hiloDetalleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  hiloDetalleTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  hiloDetalleContenido: { fontSize: 15, color: '#666', lineHeight: 24, marginBottom: 20 },
  hiloDetalleFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  comentariosSection: { backgroundColor: '#fff', padding: 15, marginTop: 10 },
  comentariosTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  sinComentarios: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
  comentarioContainer: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#4A90E2' },
  comentarioRespuesta: { marginLeft: 20, borderLeftColor: '#999' },
  comentarioHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  comentarioHeaderTexto: { marginLeft: 8, flex: 1 },
  comentarioAutor: { fontSize: 14, fontWeight: '600', color: '#333' },
  comentarioFecha: { fontSize: 11, color: '#999' },
  comentarioContenido: { fontSize: 14, color: '#555', lineHeight: 20 },
  comentarInput: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  inputComentario: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, maxHeight: 100, color: '#333' },
  enviarButton: { backgroundColor: '#27AE60', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  enviarButtonDisabled: { backgroundColor: '#E0E0E0' },
});
