-- =============================================
-- FIX: Corregir conflicto de trigger updated_at
-- =============================================

-- Eliminar triggers anteriores
DROP TRIGGER IF EXISTS update_foro_hilos_updated_at ON foro_hilos;
DROP TRIGGER IF EXISTS update_foro_comentarios_updated_at ON foro_comentarios;

-- Crear función específica para el foro (con nombre único)
CREATE OR REPLACE FUNCTION update_foro_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear triggers con la función específica del foro
CREATE TRIGGER update_foro_hilos_updated_at
  BEFORE UPDATE ON foro_hilos
  FOR EACH ROW
  EXECUTE FUNCTION update_foro_updated_at();

CREATE TRIGGER update_foro_comentarios_updated_at
  BEFORE UPDATE ON foro_comentarios
  FOR EACH ROW
  EXECUTE FUNCTION update_foro_updated_at();

SELECT 'Fix aplicado correctamente' AS mensaje;
