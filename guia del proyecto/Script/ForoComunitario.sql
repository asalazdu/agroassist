-- =============================================
-- MIGRACIÓN: FORO COMUNITARIO AGROASSIST
-- Fecha: 2024
-- Descripción: Tablas para sistema de foro con hilos, comentarios y respuestas anidadas
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
-- DATOS DE EJEMPLO (OPCIONAL)
-- =============================================

-- Insertar algunos hilos de ejemplo (solo si existen usuarios)
INSERT INTO foro_hilos (usuario_id, titulo, contenido, categoria) 
VALUES 
  (1, '¿Cómo controlar el Tizón Tardío en papa?', 
   'Hola comunidad, tengo un problema con Tizón Tardío en mis cultivos de papa en Nariño. ¿Alguien tiene experiencia con fungicidas efectivos o métodos de control orgánico? Las temperaturas han estado muy bajas últimamente.', 
   'plagas'),
  (1, 'Mejores épocas para sembrar café en clima frío', 
   'Quiero saber cuándo es la mejor época para sembrar café en zonas de clima frío como Pasto. He escuchado que las lluvias de abril son ideales, ¿es cierto?', 
   'cultivos'),
  (2, 'Alerta: Precios de papa cayendo en mercados locales', 
   'Los precios de papa están bajando mucho en Ipiales. ¿Alguien más está experimentando esto? ¿Deberíamos esperar para vender o hay alguna estrategia mejor?', 
   'mercado')
ON CONFLICT DO NOTHING;

-- Insertar comentarios de ejemplo
INSERT INTO foro_comentarios (hilo_id, usuario_id, contenido, comentario_padre_id)
VALUES 
  (1, 2, 'Yo tuve el mismo problema el año pasado. Te recomiendo usar Ridomil Gold cada 15 días y asegurarte de tener buen drenaje. También ayuda mucho eliminar las hojas afectadas de inmediato.', NULL),
  (1, 1, '¡Gracias! ¿Cuánto tiempo tardaste en ver mejoras? Mi cultivo está bastante afectado ya.', 1),
  (1, 2, 'Como dos semanas después de la primera aplicación empecé a ver resultados. Es importante ser constante con el tratamiento.', 2)
ON CONFLICT DO NOTHING;

-- =============================================
-- POLÍTICAS DE SEGURIDAD (RLS) - OPCIONAL
-- Si deseas habilitar Row Level Security
-- =============================================

-- Habilitar RLS (descomenta si lo necesitas)
-- ALTER TABLE foro_hilos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE foro_comentarios ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer hilos activos
-- CREATE POLICY "Todos pueden leer hilos activos" 
-- ON foro_hilos FOR SELECT 
-- USING (activo = true);

-- Política: Usuarios autenticados pueden crear hilos
-- CREATE POLICY "Usuarios autenticados pueden crear hilos" 
-- ON foro_hilos FOR INSERT 
-- WITH CHECK (auth.role() = 'authenticated');

-- Política: Solo el creador puede actualizar/eliminar su hilo
-- CREATE POLICY "Solo el creador puede editar su hilo" 
-- ON foro_hilos FOR UPDATE 
-- USING (auth.uid()::integer = usuario_id);

-- Política: Todos pueden leer comentarios activos
-- CREATE POLICY "Todos pueden leer comentarios activos" 
-- ON foro_comentarios FOR SELECT 
-- USING (activo = true);

-- Política: Usuarios autenticados pueden crear comentarios
-- CREATE POLICY "Usuarios autenticados pueden crear comentarios" 
-- ON foro_comentarios FOR INSERT 
-- WITH CHECK (auth.role() = 'authenticated');

-- Política: Solo el creador puede actualizar/eliminar su comentario
-- CREATE POLICY "Solo el creador puede editar su comentario" 
-- ON foro_comentarios FOR UPDATE 
-- USING (auth.uid()::integer = usuario_id);

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
       (SELECT COUNT(*) FROM foro_hilos) AS hilos_ejemplo,
       (SELECT COUNT(*) FROM foro_comentarios) AS comentarios_ejemplo;
