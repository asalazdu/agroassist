/**
 * Forum Repository - Gestión de hilos y comentarios del foro comunitario
 * Tabla: foro_hilos, foro_comentarios
 */

const supabase = require('./supabaseClient');

/**
 * Filtro de contenido inapropiado
 * Lista de palabras prohibidas (español)
 */
const PALABRAS_PROHIBIDAS = [
  'puto', 'puta', 'mierda', 'coño', 'cabrón', 'cabron', 'pendejo', 
  'idiota', 'estúpido', 'estupido', 'imbécil', 'imbecil', 'gonorrea',
  'hijueputa', 'hp', 'malparido', 'güevón', 'guevon', 'marica',
  'verga', 'carajo', 'maldito', 'joder', 'cojones', 'huevon',
  // Agregar más según necesidad
];

/**
 * Valida y limpia contenido para evitar spam y palabras inapropiadas
 * @param {string} texto - Texto a validar
 * @returns {Object} { esValido, textoLimpio, palabrasEncontradas }
 */
const validarContenido = (texto) => {
  if (!texto || texto.trim().length === 0) {
    return { esValido: false, error: 'El contenido no puede estar vacío' };
  }

  const textoLower = texto.toLowerCase();
  const palabrasEncontradas = [];

  // Buscar palabras prohibidas
  PALABRAS_PROHIBIDAS.forEach(palabra => {
    const regex = new RegExp(`\\b${palabra}\\b`, 'gi');
    if (regex.test(textoLower)) {
      palabrasEncontradas.push(palabra);
    }
  });

  if (palabrasEncontradas.length > 0) {
    return {
      esValido: false,
      error: 'El contenido contiene lenguaje inapropiado',
      palabrasEncontradas
    };
  }

  // Validar longitud mínima y máxima
  if (texto.trim().length < 10) {
    return { esValido: false, error: 'El contenido es demasiado corto (mínimo 10 caracteres)' };
  }

  if (texto.length > 5000) {
    return { esValido: false, error: 'El contenido es demasiado largo (máximo 5000 caracteres)' };
  }

  return { esValido: true, textoLimpio: texto.trim() };
};

/**
 * Crear un nuevo hilo en el foro
 */
const crearHilo = async (usuarioId, titulo, contenido, categoria = 'general') => {
  try {
    // Validar título
    const validacionTitulo = validarContenido(titulo);
    if (!validacionTitulo.esValido) {
      return { success: false, error: validacionTitulo.error };
    }

    // Validar contenido
    const validacionContenido = validarContenido(contenido);
    if (!validacionContenido.esValido) {
      return { success: false, error: validacionContenido.error };
    }

    const nuevoHilo = {
      usuario_id: usuarioId,
      titulo: validacionTitulo.textoLimpio,
      contenido: validacionContenido.textoLimpio,
      categoria: categoria,
      activo: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('foro_hilos')
      .insert([nuevoHilo])
      .select()
      .single();

    if (error) {
      console.error('Error creando hilo:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Hilo creado: "${titulo}" por usuario ${usuarioId}`);
    return { success: true, hilo: data };
  } catch (error) {
    console.error('Error en crearHilo:', error);
    return { success: false, error: 'Error interno al crear hilo' };
  }
};

/**
 * Obtener lista de hilos (con paginación y filtros)
 */
const obtenerHilos = async ({ categoria = null, usuarioId = null, limite = 20, offset = 0 } = {}) => {
  try {
    let query = supabase
      .from('foro_hilos')
      .select(`
        *,
        usuario:usuarios!foro_hilos_usuario_id_fkey(id, nombre_completo),
        comentarios:foro_comentarios(count)
      `)
      .eq('activo', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limite - 1);

    // Aplicar filtros opcionales
    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error obteniendo hilos:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ ${data?.length || 0} hilos obtenidos`);
    return { success: true, hilos: data, total: count };
  } catch (error) {
    console.error('Error en obtenerHilos:', error);
    return { success: false, error: 'Error interno al obtener hilos' };
  }
};

/**
 * Obtener detalles de un hilo específico
 */
const obtenerHiloPorId = async (hiloId) => {
  try {
    const { data, error } = await supabase
      .from('foro_hilos')
      .select(`
        *,
        usuario:usuarios!foro_hilos_usuario_id_fkey(id, nombre_completo, ubicacion)
      `)
      .eq('id', hiloId)
      .eq('activo', true)
      .single();

    if (error) {
      console.error('Error obteniendo hilo:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Hilo no encontrado' };
    }

    return { success: true, hilo: data };
  } catch (error) {
    console.error('Error en obtenerHiloPorId:', error);
    return { success: false, error: 'Error interno al obtener hilo' };
  }
};

/**
 * Crear un comentario en un hilo
 */
const crearComentario = async (hiloId, usuarioId, contenido, comentarioPadreId = null) => {
  try {
    // Verificar que el hilo existe
    const { data: hilo, error: errorHilo } = await supabase
      .from('foro_hilos')
      .select('id')
      .eq('id', hiloId)
      .eq('activo', true)
      .single();

    if (errorHilo || !hilo) {
      return { success: false, error: 'Hilo no encontrado' };
    }

    // Validar contenido
    const validacion = validarContenido(contenido);
    if (!validacion.esValido) {
      return { success: false, error: validacion.error };
    }

    const nuevoComentario = {
      hilo_id: hiloId,
      usuario_id: usuarioId,
      contenido: validacion.textoLimpio,
      comentario_padre_id: comentarioPadreId,
      activo: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('foro_comentarios')
      .insert([nuevoComentario])
      .select()
      .single();

    if (error) {
      console.error('Error creando comentario:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Comentario creado en hilo ${hiloId} por usuario ${usuarioId}`);
    return { success: true, comentario: data };
  } catch (error) {
    console.error('Error en crearComentario:', error);
    return { success: false, error: 'Error interno al crear comentario' };
  }
};

/**
 * Obtener comentarios de un hilo (con respuestas anidadas)
 */
const obtenerComentarios = async (hiloId) => {
  try {
    console.log(`📖 Obteniendo comentarios para hilo ${hiloId}...`);
    
    // Obtener todos los comentarios del hilo (incluyendo respuestas)
    const { data: comentarios, error } = await supabase
      .from('foro_comentarios')
      .select(`
        *,
        usuario:usuarios!foro_comentarios_usuario_id_fkey(id, nombre_completo, ubicacion)
      `)
      .eq('hilo_id', hiloId)
      .eq('activo', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo comentarios:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ ${comentarios?.length || 0} comentarios obtenidos de BD`);

    // Organizar comentarios en estructura jerárquica
    const comentariosMap = {};
    const comentariosPrincipales = [];

    // Primero, crear un mapa de todos los comentarios
    comentarios.forEach(comentario => {
      comentariosMap[comentario.id] = { ...comentario, respuestas: [] };
    });

    // Luego, organizar en jerarquía
    comentarios.forEach(comentario => {
      if (comentario.comentario_padre_id === null) {
        // Es un comentario principal
        comentariosPrincipales.push(comentariosMap[comentario.id]);
      } else {
        // Es una respuesta, agregarlo al padre
        const padre = comentariosMap[comentario.comentario_padre_id];
        if (padre) {
          padre.respuestas.push(comentariosMap[comentario.id]);
        }
      }
    });

    console.log(`✅ ${comentariosPrincipales.length} comentarios principales organizados`);
    return { success: true, comentarios: comentariosPrincipales };
  } catch (error) {
    console.error('❌ Error en obtenerComentarios:', error);
    return { success: false, error: 'Error interno al obtener comentarios' };
  }
};

/**
 * Eliminar hilo (soft delete)
 */
const eliminarHilo = async (hiloId, usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('foro_hilos')
      .update({ activo: false })
      .eq('id', hiloId)
      .eq('usuario_id', usuarioId) // Solo el creador puede eliminar
      .select()
      .single();

    if (error) {
      console.error('Error eliminando hilo:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Hilo no encontrado o sin permisos' };
    }

    console.log(`✅ Hilo ${hiloId} eliminado por usuario ${usuarioId}`);
    return { success: true };
  } catch (error) {
    console.error('Error en eliminarHilo:', error);
    return { success: false, error: 'Error interno al eliminar hilo' };
  }
};

/**
 * Eliminar comentario (soft delete)
 */
const eliminarComentario = async (comentarioId, usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('foro_comentarios')
      .update({ activo: false })
      .eq('id', comentarioId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Error eliminando comentario:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Comentario no encontrado o sin permisos' };
    }

    console.log(`✅ Comentario ${comentarioId} eliminado por usuario ${usuarioId}`);
    return { success: true };
  } catch (error) {
    console.error('Error en eliminarComentario:', error);
    return { success: false, error: 'Error interno al eliminar comentario' };
  }
};

/**
 * Buscar hilos por texto
 */
const buscarHilos = async (query) => {
  try {
    const { data, error } = await supabase
      .from('foro_hilos')
      .select(`
        *,
        usuario:usuarios!foro_hilos_usuario_id_fkey(id, nombre_completo),
        comentarios:foro_comentarios(count)
      `)
      .eq('activo', true)
      .or(`titulo.ilike.%${query}%,contenido.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error buscando hilos:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ ${data?.length || 0} hilos encontrados para "${query}"`);
    return { success: true, hilos: data };
  } catch (error) {
    console.error('Error en buscarHilos:', error);
    return { success: false, error: 'Error interno al buscar hilos' };
  }
};

module.exports = {
  crearHilo,
  obtenerHilos,
  obtenerHiloPorId,
  crearComentario,
  obtenerComentarios,
  eliminarHilo,
  eliminarComentario,
  buscarHilos,
  validarContenido
};
