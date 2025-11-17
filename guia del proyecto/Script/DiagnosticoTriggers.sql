-- =============================================
-- DIAGNÓSTICO: Ver todos los triggers activos
-- =============================================

-- Ver triggers en la tabla usuarios
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'usuarios';

-- Ver todas las funciones relacionadas con updated_at
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%updated_at%';
