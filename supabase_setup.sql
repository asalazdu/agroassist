-- =====================================================
-- AGROASSIST - CONFIGURACIÓN COMPLETA DE SUPABASE
-- =====================================================
-- Fecha: Octubre 14, 2025
-- Este script crea todas las tablas necesarias para AgroAssist
-- con Row Level Security (RLS) configurado
-- =====================================================

-- =====================================================
-- EXTENSIONES NECESARIAS
-- =====================================================
-- Habilitar extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- Para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Para encriptación

-- =====================================================
-- TABLA: roles
-- =====================================================
-- Roles de usuario en el sistema
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar roles por defecto
INSERT INTO public.roles (id, nombre, descripcion) VALUES
    (1, 'admin', 'Administrador del sistema con acceso completo'),
    (2, 'usuario', 'Usuario regular del sistema')
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- TABLA: usuarios
-- =====================================================
-- Usuarios principales del sistema
CREATE TABLE IF NOT EXISTS public.usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    correo VARCHAR(200) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    ubicacion VARCHAR(255),
    tamaño_finca DECIMAL(10, 2),
    id_rol INTEGER DEFAULT 2 REFERENCES public.roles(id) ON DELETE SET NULL,
    
    -- Campos de seguridad
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado_hasta TIMESTAMP WITH TIME ZONE,
    
    -- Campos de recuperación de contraseña
    reset_token VARCHAR(255),
    reset_token_expiration TIMESTAMP WITH TIME ZONE,
    
    -- Campos de auditoría
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para búsquedas rápidas
    CONSTRAINT usuarios_correo_check CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON public.usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_reset_token ON public.usuarios(reset_token);
CREATE INDEX IF NOT EXISTS idx_usuarios_id_rol ON public.usuarios(id_rol);

-- =====================================================
-- TABLA: cultivos_usuario
-- =====================================================
-- Registro de cultivos de cada usuario
CREATE TABLE IF NOT EXISTS public.cultivos_usuario (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    
    -- Información del cultivo
    nombre_cultivo VARCHAR(100) NOT NULL,
    variedad VARCHAR(100),
    area_sembrada DECIMAL(10, 2), -- en hectáreas o m²
    unidad_area VARCHAR(20) DEFAULT 'hectáreas', -- 'hectáreas', 'm²', 'fanegadas'
    
    -- Fechas importantes
    fecha_siembra DATE NOT NULL,
    fecha_cosecha_estimada DATE,
    fecha_cosecha_real DATE,
    
    -- Estado del cultivo
    estado VARCHAR(50) DEFAULT 'activo', -- 'activo', 'cosechado', 'perdido'
    notas TEXT,
    
    -- Ubicación específica
    lote VARCHAR(100),
    coordenadas_gps POINT, -- Para almacenar lat/long
    
    -- Auditoría
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cultivos_usuario_id ON public.cultivos_usuario(id_usuario);
CREATE INDEX IF NOT EXISTS idx_cultivos_estado ON public.cultivos_usuario(estado);
CREATE INDEX IF NOT EXISTS idx_cultivos_fecha_siembra ON public.cultivos_usuario(fecha_siembra);

-- =====================================================
-- TABLA: registros_clima
-- =====================================================
-- Historial de datos climáticos
CREATE TABLE IF NOT EXISTS public.registros_clima (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE,
    
    -- Datos climáticos
    ubicacion VARCHAR(255) NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    
    temperatura DECIMAL(5, 2), -- °C
    humedad INTEGER, -- %
    precipitacion DECIMAL(6, 2), -- mm
    velocidad_viento DECIMAL(5, 2), -- km/h
    direccion_viento INTEGER, -- grados
    presion_atmosferica DECIMAL(7, 2), -- hPa
    indice_uv INTEGER,
    
    -- Condición general
    descripcion VARCHAR(100), -- 'soleado', 'lluvioso', etc.
    icono VARCHAR(10), -- código del icono
    
    -- Forecasts
    es_forecast BOOLEAN DEFAULT FALSE,
    fecha_forecast DATE,
    
    -- Metadata
    fuente_datos VARCHAR(50) DEFAULT 'OpenWeatherMap',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clima_usuario ON public.registros_clima(id_usuario);
CREATE INDEX IF NOT EXISTS idx_clima_ubicacion ON public.registros_clima(ubicacion);
CREATE INDEX IF NOT EXISTS idx_clima_fecha ON public.registros_clima(creado_en);

-- =====================================================
-- TABLA: consultas_chatbot
-- =====================================================
-- Historial de conversaciones con el chatbot
CREATE TABLE IF NOT EXISTS public.consultas_chatbot (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    
    -- Contenido de la conversación
    consulta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    
    -- Metadata
    modelo_ia VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
    tokens_usados INTEGER,
    tiempo_respuesta INTEGER, -- ms
    
    -- Contexto
    cultivo_relacionado INTEGER REFERENCES public.cultivos_usuario(id) ON DELETE SET NULL,
    categoria VARCHAR(50), -- 'plagas', 'clima', 'general', 'cultivos', etc.
    
    -- Rating de la respuesta
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    feedback TEXT,
    
    -- Auditoría
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_chatbot_usuario ON public.consultas_chatbot(id_usuario);
CREATE INDEX IF NOT EXISTS idx_chatbot_categoria ON public.consultas_chatbot(categoria);
CREATE INDEX IF NOT EXISTS idx_chatbot_fecha ON public.consultas_chatbot(creado_en);

-- =====================================================
-- TABLA: fotos_cultivos
-- =====================================================
-- Almacenamiento de fotos y análisis de cultivos
CREATE TABLE IF NOT EXISTS public.fotos_cultivos (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_cultivo INTEGER REFERENCES public.cultivos_usuario(id) ON DELETE CASCADE,
    
    -- Información de la foto
    url_foto TEXT NOT NULL, -- URL en Supabase Storage
    url_thumbnail TEXT, -- Miniatura
    
    -- Análisis por IA
    analisis_ia TEXT,
    plagas_detectadas TEXT[], -- Array de plagas identificadas
    enfermedades_detectadas TEXT[], -- Array de enfermedades
    salud_general VARCHAR(50), -- 'excelente', 'buena', 'regular', 'mala', 'crítica'
    confianza_analisis DECIMAL(5, 2), -- % de confianza
    
    -- Recomendaciones
    recomendaciones TEXT,
    requiere_atencion BOOLEAN DEFAULT FALSE,
    prioridad VARCHAR(20) DEFAULT 'normal', -- 'baja', 'normal', 'alta', 'urgente'
    
    -- Metadata
    modelo_ia VARCHAR(50) DEFAULT 'claude-3.5-sonnet',
    tamaño_archivo INTEGER, -- bytes
    
    -- Auditoría
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fotos_usuario ON public.fotos_cultivos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_fotos_cultivo ON public.fotos_cultivos(id_cultivo);
CREATE INDEX IF NOT EXISTS idx_fotos_requiere_atencion ON public.fotos_cultivos(requiere_atencion);

-- =====================================================
-- TABLA: plagas_colombia
-- =====================================================
-- Base de datos de plagas en Colombia
CREATE TABLE IF NOT EXISTS public.plagas_colombia (
    id SERIAL PRIMARY KEY,
    
    -- Identificación
    nombre_comun VARCHAR(200) NOT NULL,
    nombre_cientifico VARCHAR(200),
    tipo VARCHAR(50), -- 'insecto', 'hongo', 'bacteria', 'virus', 'nematodo', etc.
    
    -- Descripción
    descripcion TEXT,
    sintomas TEXT,
    
    -- Cultivos afectados
    cultivos_afectados TEXT[], -- Array de nombres de cultivos
    
    -- Severidad y control
    nivel_severidad VARCHAR(20), -- 'bajo', 'medio', 'alto', 'crítico'
    metodos_control TEXT,
    control_organico TEXT,
    control_quimico TEXT,
    prevencion TEXT,
    
    -- Temporalidad
    epoca_critica VARCHAR(100), -- 'lluvias', 'verano', 'todo el año'
    meses_criticos INTEGER[], -- [1,2,3] = Ene, Feb, Mar
    
    -- Ubicación
    regiones_colombia TEXT[], -- ['Andina', 'Caribe', 'Pacífica', etc.]
    altitud_min INTEGER, -- msnm
    altitud_max INTEGER, -- msnm
    
    -- Multimedia
    fotos_referencia TEXT[], -- URLs de fotos
    
    -- Metadata
    fuente VARCHAR(100), -- ICA, CIAT, etc.
    verificado BOOLEAN DEFAULT FALSE,
    
    -- Auditoría
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_plagas_nombre_comun ON public.plagas_colombia(nombre_comun);
CREATE INDEX IF NOT EXISTS idx_plagas_tipo ON public.plagas_colombia(tipo);
CREATE INDEX IF NOT EXISTS idx_plagas_cultivos ON public.plagas_colombia USING GIN(cultivos_afectados);

-- =====================================================
-- TABLA: precios_agricolas
-- =====================================================
-- Precios de productos e insumos agrícolas (SIPSA)
CREATE TABLE IF NOT EXISTS public.precios_agricolas (
    id SERIAL PRIMARY KEY,
    
    -- Identificación del producto
    tipo VARCHAR(50) NOT NULL, -- 'producto', 'insumo'
    categoria VARCHAR(100), -- 'frutas', 'hortalizas', 'fertilizantes', etc.
    nombre VARCHAR(200) NOT NULL,
    presentacion VARCHAR(100), -- 'kg', 'bulto 50kg', 'litro', etc.
    
    -- Precios
    precio_minimo DECIMAL(10, 2),
    precio_maximo DECIMAL(10, 2),
    precio_promedio DECIMAL(10, 2) NOT NULL,
    moneda VARCHAR(10) DEFAULT 'COP',
    
    -- Ubicación
    ciudad VARCHAR(100),
    mercado VARCHAR(200), -- 'Corabastos', 'Plaza Minorista', etc.
    region VARCHAR(100),
    
    -- Temporal
    fecha_registro DATE NOT NULL,
    semana INTEGER, -- Número de semana del año
    
    -- Metadata
    fuente VARCHAR(100) DEFAULT 'SIPSA-DANE',
    
    -- Auditoría
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_precios_nombre ON public.precios_agricolas(nombre);
CREATE INDEX IF NOT EXISTS idx_precios_fecha ON public.precios_agricolas(fecha_registro);
CREATE INDEX IF NOT EXISTS idx_precios_tipo ON public.precios_agricolas(tipo);
CREATE INDEX IF NOT EXISTS idx_precios_ciudad ON public.precios_agricolas(ciudad);

-- =====================================================
-- TABLA: alertas_usuario
-- =====================================================
-- Alertas y notificaciones para usuarios
CREATE TABLE IF NOT EXISTS public.alertas_usuario (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_cultivo INTEGER REFERENCES public.cultivos_usuario(id) ON DELETE CASCADE,
    
    -- Contenido de la alerta
    tipo VARCHAR(50) NOT NULL, -- 'clima', 'plaga', 'cosecha', 'precio', 'general'
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    
    -- Prioridad
    prioridad VARCHAR(20) DEFAULT 'normal', -- 'baja', 'normal', 'alta', 'urgente'
    
    -- Estado
    leida BOOLEAN DEFAULT FALSE,
    fecha_leida TIMESTAMP WITH TIME ZONE,
    archivada BOOLEAN DEFAULT FALSE,
    
    -- Acción requerida
    requiere_accion BOOLEAN DEFAULT FALSE,
    accion_completada BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    origen VARCHAR(50), -- 'sistema', 'chatbot', 'api_clima', etc.
    datos_adicionales JSONB, -- Datos extra en formato JSON
    
    -- Auditoría
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_alertas_usuario ON public.alertas_usuario(id_usuario);
CREATE INDEX IF NOT EXISTS idx_alertas_leida ON public.alertas_usuario(leida);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON public.alertas_usuario(tipo);

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para actualizar el campo actualizado_en automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas que tienen actualizado_en
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cultivos_updated_at BEFORE UPDATE ON public.cultivos_usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fotos_updated_at BEFORE UPDATE ON public.fotos_cultivos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plagas_updated_at BEFORE UPDATE ON public.plagas_colombia
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Activar RLS en todas las tablas sensibles

-- USUARIOS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver y editar su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON public.usuarios FOR SELECT
    USING (auth.uid()::text = id::text OR id_rol = 1);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON public.usuarios FOR UPDATE
    USING (auth.uid()::text = id::text);

-- CULTIVOS
ALTER TABLE public.cultivos_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propios cultivos"
    ON public.cultivos_usuario FOR SELECT
    USING (auth.uid()::text = id_usuario::text);

CREATE POLICY "Usuarios pueden insertar sus propios cultivos"
    ON public.cultivos_usuario FOR INSERT
    WITH CHECK (auth.uid()::text = id_usuario::text);

CREATE POLICY "Usuarios pueden actualizar sus propios cultivos"
    ON public.cultivos_usuario FOR UPDATE
    USING (auth.uid()::text = id_usuario::text);

CREATE POLICY "Usuarios pueden eliminar sus propios cultivos"
    ON public.cultivos_usuario FOR DELETE
    USING (auth.uid()::text = id_usuario::text);

-- REGISTROS CLIMA
ALTER TABLE public.registros_clima ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus registros de clima"
    ON public.registros_clima FOR SELECT
    USING (auth.uid()::text = id_usuario::text OR id_usuario IS NULL);

CREATE POLICY "Usuarios pueden insertar registros de clima"
    ON public.registros_clima FOR INSERT
    WITH CHECK (auth.uid()::text = id_usuario::text OR id_usuario IS NULL);

-- CONSULTAS CHATBOT
ALTER TABLE public.consultas_chatbot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus consultas"
    ON public.consultas_chatbot FOR SELECT
    USING (auth.uid()::text = id_usuario::text);

CREATE POLICY "Usuarios pueden insertar consultas"
    ON public.consultas_chatbot FOR INSERT
    WITH CHECK (auth.uid()::text = id_usuario::text);

-- FOTOS CULTIVOS
ALTER TABLE public.fotos_cultivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus fotos"
    ON public.fotos_cultivos FOR SELECT
    USING (auth.uid()::text = id_usuario::text);

CREATE POLICY "Usuarios pueden insertar fotos"
    ON public.fotos_cultivos FOR INSERT
    WITH CHECK (auth.uid()::text = id_usuario::text);

CREATE POLICY "Usuarios pueden actualizar sus fotos"
    ON public.fotos_cultivos FOR UPDATE
    USING (auth.uid()::text = id_usuario::text);

CREATE POLICY "Usuarios pueden eliminar sus fotos"
    ON public.fotos_cultivos FOR DELETE
    USING (auth.uid()::text = id_usuario::text);

-- ALERTAS
ALTER TABLE public.alertas_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus alertas"
    ON public.alertas_usuario FOR SELECT
    USING (auth.uid()::text = id_usuario::text);

CREATE POLICY "Usuarios pueden actualizar sus alertas"
    ON public.alertas_usuario FOR UPDATE
    USING (auth.uid()::text = id_usuario::text);

-- Tablas públicas (sin RLS porque son datos de referencia)
-- plagas_colombia y precios_agricolas son de solo lectura para todos

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de cultivos activos con información del usuario
CREATE OR REPLACE VIEW cultivos_activos_v AS
SELECT 
    c.*,
    u.nombre_completo,
    u.ubicacion,
    (CURRENT_DATE - c.fecha_siembra) as dias_sembrado,
    (c.fecha_cosecha_estimada - CURRENT_DATE) as dias_para_cosecha
FROM cultivos_usuario c
JOIN usuarios u ON c.id_usuario = u.id
WHERE c.estado = 'activo';

-- Vista de alertas no leídas
CREATE OR REPLACE VIEW alertas_pendientes_v AS
SELECT 
    a.*,
    u.nombre_completo,
    u.correo
FROM alertas_usuario a
JOIN usuarios u ON a.id_usuario = u.id
WHERE a.leida = FALSE
ORDER BY a.prioridad DESC, a.creado_en DESC;

-- =====================================================
-- DATOS INICIALES (SEEDS)
-- =====================================================

-- Insertar algunas plagas comunes de Colombia
INSERT INTO public.plagas_colombia (
    nombre_comun,
    nombre_cientifico,
    tipo,
    descripcion,
    sintomas,
    cultivos_afectados,
    nivel_severidad,
    metodos_control,
    epoca_critica,
    regiones_colombia
) VALUES
(
    'Broca del Café',
    'Hypothenemus hampei',
    'insecto',
    'Pequeño escarabajo que perfora los granos de café',
    'Perforaciones en granos, caída prematura de frutos',
    ARRAY['café'],
    'alto',
    'Control cultural: recolección de frutos, manejo de arvenses. Control biológico: Beauveria bassiana',
    'todo el año',
    ARRAY['Andina', 'Pacífica']
),
(
    'Gota o Gotera',
    'Phytophthora infestans',
    'hongo',
    'Enfermedad fúngica que afecta hojas, tallos y tubérculos',
    'Manchas oscuras en hojas, pudrición de tubérculos',
    ARRAY['papa', 'tomate'],
    'crítico',
    'Rotación de cultivos, fungicidas preventivos, variedades resistentes',
    'lluvias',
    ARRAY['Andina']
),
(
    'Picudo del Plátano',
    'Cosmopolites sordidus',
    'insecto',
    'Gorgojo que ataca el cormo del plátano',
    'Túneles en el pseudotallo, debilitamiento general',
    ARRAY['plátano', 'banano'],
    'alto',
    'Trampas con pseudotallos, nematodos entomopatógenos',
    'todo el año',
    ARRAY['Caribe', 'Pacífica', 'Amazonia']
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Para ejecutar este script:
-- 1. Ir a Supabase Dashboard
-- 2. SQL Editor (panel izquierdo)
-- 3. New Query
-- 4. Copiar y pegar este código
-- 5. Run (o Ctrl+Enter)
-- =====================================================

-- Verificar que todo se creó correctamente
SELECT 'Script ejecutado exitosamente!' as mensaje;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
