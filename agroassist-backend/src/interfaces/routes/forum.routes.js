/**
 * Forum Routes - Rutas para el foro comunitario
 * Base: /api/forum
 */

const { Router } = require('express');
const { check } = require('express-validator');
const { validateJWT } = require('../middlewares/validateJWT');
const { validateFields } = require('../middlewares/validateFields');
const {
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
} = require('../controllers/forum.controller');

const router = Router();

/**
 * GET /api/forum/threads
 * Obtener lista de hilos (público con auth)
 * Query params: categoria?, limite?, offset?
 */
router.get(
  '/threads',
  validateJWT,
  obtenerHilos
);

/**
 * GET /api/forum/threads/:id
 * Obtener detalles de un hilo específico
 */
router.get(
  '/threads/:id',
  validateJWT,
  obtenerHiloPorId
);

/**
 * POST /api/forum/threads
 * Crear un nuevo hilo
 * Body: { titulo, contenido, categoria? }
 */
router.post(
  '/threads',
  [
    validateJWT,
    check('titulo', 'El título es obligatorio').not().isEmpty(),
    check('titulo', 'El título debe tener entre 10 y 200 caracteres').isLength({ min: 10, max: 200 }),
    check('contenido', 'El contenido es obligatorio').not().isEmpty(),
    check('contenido', 'El contenido debe tener entre 10 y 5000 caracteres').isLength({ min: 10, max: 5000 }),
    validateFields
  ],
  crearHilo
);

/**
 * GET /api/forum/threads/:id/comments
 * Obtener comentarios de un hilo (con respuestas anidadas)
 */
router.get(
  '/threads/:id/comments',
  validateJWT,
  obtenerComentarios
);

/**
 * POST /api/forum/threads/:id/comments
 * Crear un comentario en un hilo
 * Body: { contenido }
 */
router.post(
  '/threads/:id/comments',
  [
    validateJWT,
    check('contenido', 'El contenido es obligatorio').not().isEmpty(),
    check('contenido', 'El contenido debe tener entre 10 y 2000 caracteres').isLength({ min: 10, max: 2000 }),
    validateFields
  ],
  crearComentario
);

/**
 * POST /api/forum/comments/:id/replies
 * Responder a un comentario
 * Body: { contenido, hiloId }
 */
router.post(
  '/comments/:id/replies',
  [
    validateJWT,
    check('contenido', 'El contenido es obligatorio').not().isEmpty(),
    check('contenido', 'El contenido debe tener entre 10 y 2000 caracteres').isLength({ min: 10, max: 2000 }),
    check('hiloId', 'El ID del hilo es obligatorio').not().isEmpty(),
    validateFields
  ],
  responderComentario
);

/**
 * DELETE /api/forum/threads/:id
 * Eliminar un hilo (solo el creador)
 */
router.delete(
  '/threads/:id',
  validateJWT,
  eliminarHilo
);

/**
 * DELETE /api/forum/comments/:id
 * Eliminar un comentario (solo el creador)
 */
router.delete(
  '/comments/:id',
  validateJWT,
  eliminarComentario
);

/**
 * GET /api/forum/search
 * Buscar hilos por texto
 * Query param: q (query string)
 */
router.get(
  '/search',
  [
    validateJWT,
    check('q', 'El parámetro de búsqueda es obligatorio').not().isEmpty(),
    validateFields
  ],
  buscarHilos
);

/**
 * GET /api/forum/my-threads
 * Obtener hilos del usuario actual
 */
router.get(
  '/my-threads',
  validateJWT,
  obtenerMisHilos
);

module.exports = router;
