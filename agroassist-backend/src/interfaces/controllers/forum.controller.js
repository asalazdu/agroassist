/**
 * Forum Controller - Controlador para gestión del foro comunitario
 * Endpoints: hilos, comentarios, respuestas
 */

const forumRepository = require('../../infrastructure/database/supabase/forumRepository');

/**
 * GET /api/forum/threads
 * Obtener lista de hilos (con filtros opcionales)
 */
const obtenerHilos = async (req, res) => {
  try {
    const { categoria, limite = 20, offset = 0 } = req.query;

    const resultado = await forumRepository.obtenerHilos({
      categoria: categoria || null,
      limite: parseInt(limite),
      offset: parseInt(offset)
    });

    if (!resultado.success) {
      return res.status(400).json({
        ok: false,
        msg: resultado.error
      });
    }

    return res.status(200).json({
      ok: true,
      hilos: resultado.hilos,
      total: resultado.total
    });
  } catch (error) {
    console.error('Error en obtenerHilos:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener hilos del foro'
    });
  }
};

/**
 * GET /api/forum/threads/:id
 * Obtener detalles de un hilo específico
 */
const obtenerHiloPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await forumRepository.obtenerHiloPorId(parseInt(id));

    if (!resultado.success) {
      return res.status(404).json({
        ok: false,
        msg: resultado.error
      });
    }

    return res.status(200).json({
      ok: true,
      hilo: resultado.hilo
    });
  } catch (error) {
    console.error('Error en obtenerHiloPorId:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener hilo'
    });
  }
};

/**
 * POST /api/forum/threads
 * Crear un nuevo hilo
 * Body: { titulo, contenido, categoria? }
 */
const crearHilo = async (req, res) => {
  try {
    const { titulo, contenido, categoria = 'general' } = req.body;
    const usuarioId = req.uid; // Del middleware validateJWT

    // Validaciones básicas
    if (!titulo || !contenido) {
      return res.status(400).json({
        ok: false,
        msg: 'El título y contenido son obligatorios'
      });
    }

    const resultado = await forumRepository.crearHilo(
      usuarioId,
      titulo,
      contenido,
      categoria
    );

    if (!resultado.success) {
      return res.status(400).json({
        ok: false,
        msg: resultado.error
      });
    }

    return res.status(201).json({
      ok: true,
      msg: 'Hilo creado exitosamente',
      hilo: resultado.hilo
    });
  } catch (error) {
    console.error('Error en crearHilo:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al crear hilo'
    });
  }
};

/**
 * GET /api/forum/threads/:id/comments
 * Obtener comentarios de un hilo (con respuestas anidadas)
 */
const obtenerComentarios = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await forumRepository.obtenerComentarios(parseInt(id));

    if (!resultado.success) {
      return res.status(400).json({
        ok: false,
        msg: resultado.error
      });
    }

    return res.status(200).json({
      ok: true,
      comentarios: resultado.comentarios
    });
  } catch (error) {
    console.error('Error en obtenerComentarios:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener comentarios'
    });
  }
};

/**
 * POST /api/forum/threads/:id/comments
 * Crear un comentario en un hilo
 * Body: { contenido }
 */
const crearComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { contenido } = req.body;
    const usuarioId = req.uid;

    if (!contenido) {
      return res.status(400).json({
        ok: false,
        msg: 'El contenido es obligatorio'
      });
    }

    const resultado = await forumRepository.crearComentario(
      parseInt(id),
      usuarioId,
      contenido
    );

    if (!resultado.success) {
      return res.status(400).json({
        ok: false,
        msg: resultado.error
      });
    }

    return res.status(201).json({
      ok: true,
      msg: 'Comentario creado exitosamente',
      comentario: resultado.comentario
    });
  } catch (error) {
    console.error('Error en crearComentario:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al crear comentario'
    });
  }
};

/**
 * POST /api/forum/comments/:id/replies
 * Responder a un comentario
 * Body: { contenido }
 */
const responderComentario = async (req, res) => {
  try {
    const { id } = req.params; // ID del comentario padre
    const { contenido, hiloId } = req.body;
    const usuarioId = req.uid;

    if (!contenido || !hiloId) {
      return res.status(400).json({
        ok: false,
        msg: 'El contenido y el ID del hilo son obligatorios'
      });
    }

    const resultado = await forumRepository.crearComentario(
      parseInt(hiloId),
      usuarioId,
      contenido,
      parseInt(id) // comentarioPadreId
    );

    if (!resultado.success) {
      return res.status(400).json({
        ok: false,
        msg: resultado.error
      });
    }

    return res.status(201).json({
      ok: true,
      msg: 'Respuesta creada exitosamente',
      comentario: resultado.comentario
    });
  } catch (error) {
    console.error('Error en responderComentario:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al crear respuesta'
    });
  }
};

/**
 * DELETE /api/forum/threads/:id
 * Eliminar un hilo (soft delete)
 */
const eliminarHilo = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.uid;

    const resultado = await forumRepository.eliminarHilo(
      parseInt(id),
      usuarioId
    );

    if (!resultado.success) {
      return res.status(403).json({
        ok: false,
        msg: resultado.error
      });
    }

    return res.status(200).json({
      ok: true,
      msg: 'Hilo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarHilo:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al eliminar hilo'
    });
  }
};

/**
 * DELETE /api/forum/comments/:id
 * Eliminar un comentario (soft delete)
 */
const eliminarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.uid;

    const resultado = await forumRepository.eliminarComentario(
      parseInt(id),
      usuarioId
    );

    if (!resultado.success) {
      return res.status(403).json({
        ok: false,
        msg: resultado.error
      });
    }

    return res.status(200).json({
      ok: true,
      msg: 'Comentario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarComentario:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al eliminar comentario'
    });
  }
};

/**
 * GET /api/forum/search
 * Buscar hilos por texto
 */
const buscarHilos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        msg: 'El parámetro de búsqueda es obligatorio'
      });
    }

    const resultado = await forumRepository.buscarHilos(q.trim());

    if (!resultado.success) {
      return res.status(400).json({
        ok: false,
        msg: resultado.error
      });
    }

    return res.status(200).json({
      ok: true,
      hilos: resultado.hilos
    });
  } catch (error) {
    console.error('Error en buscarHilos:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al buscar hilos'
    });
  }
};

/**
 * GET /api/forum/my-threads
 * Obtener hilos del usuario actual
 */
const obtenerMisHilos = async (req, res) => {
  try {
    const usuarioId = req.uid;

    const resultado = await forumRepository.obtenerHilos({
      usuarioId: usuarioId,
      limite: 50,
      offset: 0
    });

    if (!resultado.success) {
      return res.status(400).json({
        ok: false,
        msg: resultado.error
      });
    }

    return res.status(200).json({
      ok: true,
      hilos: resultado.hilos
    });
  } catch (error) {
    console.error('Error en obtenerMisHilos:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener tus hilos'
    });
  }
};

module.exports = {
  obtenerHilos,
  obtenerHiloPorId,
  crearHilo,
  obtenerComentarios,
  crearComentario,
  responderComentario,
  eliminarHilo,
  eliminarComentario,
  buscarHilos,
  obtenerMisHilos
};
