-- =============================================
-- FIX DEFINITIVO: Eliminar trigger problemático de usuarios
-- =============================================

-- Ver qué triggers tiene la tabla usuarios
SELECT 
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'usuarios';

-- IMPORTANTE: La tabla usuarios NO tiene campo updated_at
-- Necesitamos eliminar cualquier trigger que intente usarlo

-- Eliminar trigger problemático si existe
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
DROP TRIGGER IF EXISTS update_updated_at_trigger ON usuarios;
DROP TRIGGER IF EXISTS usuarios_updated_at ON usuarios;

-- Verificar que se eliminó
SELECT 'Triggers eliminados de tabla usuarios' AS resultado;

-- Verificar estructura de la tabla usuarios
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
