-- =============================================
-- MIGRACIÓN: FORO COMUNITARIO AGROASSIST
-- Fecha: 2024
-- Descripción: Tablas para sistema de foro con hilos, comentarios y respuestas anidadas
-- VERSIÓN SIN DATOS DE EJEMPLO
-- =============================================

-- Tabla: foro_hilos
-- Descripción: Hilos/posts principales del foro comunitario
CREATE TABLE IF NOT EXISTS foro_hilos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL,
  contenido TEXT NOT NULL,
  categoria VARCHAR(50) DEFAULT 'general',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para foro_hilos
CREATE INDEX IF NOT EXISTS idx_foro_hilos_usuario ON foro_hilos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_foro_hilos_categoria ON foro_hilos(categoria);
CREATE INDEX IF NOT EXISTS idx_foro_hilos_created ON foro_hilos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_foro_hilos_activo ON foro_hilos(activo);

-- Tabla: foro_comentarios
-- Descripción: Comentarios y respuestas anidadas en los hilos del foro
CREATE TABLE IF NOT EXISTS foro_comentarios (
  id SERIAL PRIMARY KEY,
  hilo_id INTEGER NOT NULL REFERENCES foro_hilos(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  comentario_padre_id INTEGER REFERENCES foro_comentarios(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para foro_comentarios
CREATE INDEX IF NOT EXISTS idx_foro_comentarios_hilo ON foro_comentarios(hilo_id);
CREATE INDEX IF NOT EXISTS idx_foro_comentarios_usuario ON foro_comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_foro_comentarios_padre ON foro_comentarios(comentario_padre_id);
CREATE INDEX IF NOT EXISTS idx_foro_comentarios_created ON foro_comentarios(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_foro_comentarios_activo ON foro_comentarios(activo);

-- Comentarios de documentación
COMMENT ON TABLE foro_hilos IS 'Hilos principales del foro comunitario de AgroAssist';
COMMENT ON COLUMN foro_hilos.categoria IS 'Categorías: general, plagas, cultivos, clima, mercado, ayuda';
COMMENT ON COLUMN foro_hilos.activo IS 'Soft delete: false = eliminado';

COMMENT ON TABLE foro_comentarios IS 'Comentarios y respuestas anidadas en hilos del foro';
COMMENT ON COLUMN foro_comentarios.comentario_padre_id IS 'NULL = comentario raíz, ID = respuesta a comentario';
COMMENT ON COLUMN foro_comentarios.activo IS 'Soft delete: false = eliminado';

-- =============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_foro_hilos_updated_at ON foro_hilos;
CREATE TRIGGER update_foro_hilos_updated_at
  BEFORE UPDATE ON foro_hilos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_foro_comentarios_updated_at ON foro_comentarios;
CREATE TRIGGER update_foro_comentarios_updated_at
  BEFORE UPDATE ON foro_comentarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VISTA: Estadísticas del foro
-- =============================================

CREATE OR REPLACE VIEW vista_estadisticas_foro AS
SELECT 
  (SELECT COUNT(*) FROM foro_hilos WHERE activo = true) AS total_hilos,
  (SELECT COUNT(*) FROM foro_comentarios WHERE activo = true) AS total_comentarios,
  (SELECT COUNT(DISTINCT usuario_id) FROM foro_hilos WHERE activo = true) AS usuarios_activos,
  (SELECT categoria FROM foro_hilos WHERE activo = true GROUP BY categoria ORDER BY COUNT(*) DESC LIMIT 1) AS categoria_mas_popular;

-- =============================================
-- FIN DE MIGRACIÓN
-- =============================================

-- Verificar creación exitosa
SELECT 'Tablas del foro creadas exitosamente' AS mensaje,
       (SELECT COUNT(*) FROM foro_hilos) AS total_hilos,
       (SELECT COUNT(*) FROM foro_comentarios) AS total_comentarios;
