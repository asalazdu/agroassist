-- ======================================================
-- SCRIPT DE MIGRACIÓN - SOLO ALTER TABLES
-- Para actualizar base de datos existente sin perder datos
-- ======================================================

USE agroassist_db;

-- ======================================================
-- ALTER TABLES PARA ESQUEMA EXISTENTE
-- ======================================================

-- 1. TABLA USUARIOS - MANTENER COMO ESTÁ (NO MODIFICAR)
-- La tabla usuarios ya funciona correctamente con:
-- - reset_token, reset_token_expiration (para recuperación de contraseña)
-- - intentos_fallidos, bloqueado_hasta (para control de login)
-- 
-- NO ejecutar ALTER TABLE usuarios - mantener funcionalidad existente

-- 2. MEJORAS EN TABLA CLIMA - Almacenar datos más ricos de la API
ALTER TABLE clima 
ADD COLUMN IF NOT EXISTS pais VARCHAR(3) NULL,
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8) NULL,
ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8) NULL,
ADD COLUMN IF NOT EXISTS temperatura_min DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS temperatura_max DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS viento_velocidad DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS viento_direccion VARCHAR(10) NULL,
ADD COLUMN IF NOT EXISTS presion DECIMAL(7,2) NULL,
ADD COLUMN IF NOT EXISTS visibilidad INT NULL,
ADD COLUMN IF NOT EXISTS indice_uv DECIMAL(3,1) NULL,
ADD COLUMN IF NOT EXISTS precipitacion DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS icono_clima VARCHAR(10) NULL,
ADD COLUMN IF NOT EXISTS fuente_api VARCHAR(50) DEFAULT 'openweathermap',
ADD COLUMN IF NOT EXISTS datos_json TEXT NULL;

-- Agregar índices para tabla clima
ALTER TABLE clima 
ADD INDEX IF NOT EXISTS idx_clima_ciudad_fecha (ciudad, fecha),
ADD INDEX IF NOT EXISTS idx_clima_usuario_fecha (id_usuario, fecha),
ADD INDEX IF NOT EXISTS idx_clima_coordenadas (latitud, longitud);

-- 3. MEJORAS EN TABLA PLAGAS
ALTER TABLE plagas 
ADD COLUMN IF NOT EXISTS nombre_cientifico VARCHAR(150) NULL,
ADD COLUMN IF NOT EXISTS cultivo_afectado VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS nivel_dano ENUM('Bajo', 'Medio', 'Alto') DEFAULT 'Medio',
ADD COLUMN IF NOT EXISTS periodo_critico VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS sintomas TEXT NULL,
ADD COLUMN IF NOT EXISTS metodos_control TEXT NULL,
ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT TRUE;

-- Renombrar columna si existe (compatibilidad)
-- ALTER TABLE plagas CHANGE COLUMN descripcion descripcion TEXT NULL;
-- ALTER TABLE plagas CHANGE COLUMN recomendaciones metodos_control TEXT NULL;

-- Agregar índices para tabla plagas
ALTER TABLE plagas 
ADD INDEX IF NOT EXISTS idx_plagas_tipo (tipo_plaga),
ADD INDEX IF NOT EXISTS idx_plagas_cultivo (cultivo_afectado),
ADD INDEX IF NOT EXISTS idx_plagas_nivel (nivel_dano),
ADD INDEX IF NOT EXISTS idx_plagas_activa (activa);

-- 4. MEJORAS EN TABLA CULTIVOS
ALTER TABLE cultivos 
ADD COLUMN IF NOT EXISTS nombre_cientifico VARCHAR(150) NULL,
ADD COLUMN IF NOT EXISTS ciclo_cultivo INT NULL COMMENT 'días del ciclo completo',
ADD COLUMN IF NOT EXISTS temporada_siembra VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS temporada_cosecha VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS requerimientos_clima TEXT NULL,
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Agregar índices para tabla cultivos
ALTER TABLE cultivos 
ADD INDEX IF NOT EXISTS idx_cultivos_nombre (nombre_cultivo),
ADD INDEX IF NOT EXISTS idx_cultivos_activo (activo);

-- 5. ACTUALIZAR TABLA ROLES
ALTER TABLE roles 
ADD COLUMN IF NOT EXISTS descripcion VARCHAR(200) NULL,
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP;

-- ======================================================
-- NUEVAS TABLAS (solo si no existen)
-- ======================================================

-- 6. TABLA DE RELACIÓN CULTIVOS-PLAGAS
CREATE TABLE IF NOT EXISTS cultivos_plagas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cultivo INT NOT NULL,
    id_plaga INT NOT NULL,
    nivel_susceptibilidad ENUM('Bajo', 'Medio', 'Alto') DEFAULT 'Medio',
    periodo_mayor_riesgo VARCHAR(100) NULL,
    metodos_prevencion TEXT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cultivo) REFERENCES cultivos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_plaga) REFERENCES plagas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cultivo_plaga (id_cultivo, id_plaga)
);

-- 7. TABLA DE CONFIGURACIONES DE USUARIO
CREATE TABLE IF NOT EXISTS configuraciones_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    ciudad_predeterminada VARCHAR(100) NULL,
    pais_predeterminado VARCHAR(3) NULL,
    latitud_predeterminada DECIMAL(10, 8) NULL,
    longitud_predeterminada DECIMAL(11, 8) NULL,
    unidad_temperatura ENUM('celsius', 'fahrenheit') DEFAULT 'celsius',
    unidad_viento ENUM('kmh', 'mph', 'ms') DEFAULT 'kmh',
    idioma VARCHAR(5) DEFAULT 'es',
    notificaciones_email BOOLEAN DEFAULT FALSE,
    limite_consultas_diarias INT DEFAULT 100,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_config (id_usuario)
);

-- 8. TABLA DE AUDITORÍA DE CONSULTAS API
CREATE TABLE IF NOT EXISTS auditoria_consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_api ENUM('clima', 'plagas') NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    parametros_consulta TEXT NULL,
    ip_cliente VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    respuesta_exitosa BOOLEAN NOT NULL,
    codigo_respuesta INT NULL,
    tiempo_respuesta_ms INT NULL,
    fecha_consulta DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (id_usuario, fecha_consulta),
    INDEX idx_tipo_fecha (tipo_api, fecha_consulta)
);

-- 9. TABLA DE UBICACIONES FAVORITAS PARA CLIMA
CREATE TABLE IF NOT EXISTS clima_favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre_ubicacion VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    pais VARCHAR(3) NULL,
    latitud DECIMAL(10, 8) NULL,
    longitud DECIMAL(11, 8) NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_activo (id_usuario, activo)
);

-- 10. TABLA DE ALERTAS AGRÍCOLAS
CREATE TABLE IF NOT EXISTS alertas_agricolas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_alerta ENUM('clima', 'plaga', 'cultivo') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    nivel_urgencia ENUM('info', 'warning', 'danger') DEFAULT 'info',
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NULL,
    datos_adicionales JSON NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (id_usuario, fecha_creacion),
    INDEX idx_no_leidas (id_usuario, leida, fecha_creacion)
);

-- ======================================================
-- ACTUALIZAR DATOS EXISTENTES
-- ======================================================

-- Actualizar roles existentes (solo si no están actualizados)
UPDATE roles SET descripcion = 'Administrador del sistema con acceso completo' WHERE id = 1 AND descripcion IS NULL;
UPDATE roles SET descripcion = 'Usuario agricultor con acceso a consultas de clima y plagas' WHERE id = 2 AND descripcion IS NULL;

-- Agregar nuevos roles si no existen
INSERT IGNORE INTO roles (id, nombre, descripcion) VALUES 
(3, 'tecnico_agricola', 'Técnico agrícola con permisos avanzados'),
(4, 'consultor', 'Consultor agrícola especializado');

-- Actualizar usuarios existentes - NO TOCAR (mantener funcionalidad)
-- La tabla usuarios ya funciona correctamente

-- ======================================================
-- INSERTAR DATOS INICIALES (solo si las tablas están vacías)
-- ======================================================

-- Insertar cultivos principales (solo si no existen)
INSERT IGNORE INTO cultivos (id, nombre_cultivo, nombre_cientifico, descripcion, ciclo_cultivo, activo) VALUES
(1, 'Maíz', 'Zea mays', 'Cereal básico de gran importancia alimentaria', 120, TRUE),
(2, 'Tomate', 'Solanum lycopersicum', 'Fruto de gran valor comercial y nutricional', 90, TRUE),
(3, 'Arroz', 'Oryza sativa', 'Cereal base de la alimentación mundial', 150, TRUE),
(4, 'Papa', 'Solanum tuberosum', 'Tubérculo de alto valor nutritivo', 100, TRUE),
(5, 'Soja', 'Glycine max', 'Leguminosa rica en proteínas', 130, TRUE),
(6, 'Frijol', 'Phaseolus vulgaris', 'Leguminosa de ciclo corto', 75, TRUE),
(7, 'Café', 'Coffea arabica', 'Cultivo perenne de exportación', 365, TRUE),
(8, 'Plátano', 'Musa paradisiaca', 'Fruta tropical de consumo masivo', 270, TRUE);

-- Insertar plagas principales (solo si no existen)
INSERT IGNORE INTO plagas (id, tipo_plaga, nombre_cientifico, descripcion, cultivo_afectado, nivel_dano, sintomas, metodos_control, activa) VALUES
(1, 'Gusano cogollero', 'Spodoptera frugiperda', 'Larva que ataca hojas tiernas del maíz', 'Maíz', 'Alto', 'Hojas perforadas, excremento granular, plantas debilitadas', 'Control biológico con Trichogramma, Bt, feromonas', TRUE),
(2, 'Mosca blanca', 'Bemisia tabaci', 'Insecto transmisor de virus en tomate', 'Tomate', 'Alto', 'Hojas amarillas, melaza pegajosa, transmisión de virus', 'Trampas amarillas, control biológico, insecticidas específicos', TRUE),
(3, 'Barrenador del tallo', 'Diatraea saccharalis', 'Larva que perfora tallos de arroz', 'Arroz', 'Alto', 'Tallos perforados, corazón muerto, panículas blancas', 'Manejo de agua, parasitoides, variedades resistentes', TRUE),
(4, 'Polilla de la papa', 'Phthorimaea operculella', 'Ataca tubérculos y hojas de papa', 'Papa', 'Alto', 'Galerías en tubérculos, hojas minadas, tubérculos no comerciales', 'Aporque adecuado, cosecha oportuna, almacenamiento', TRUE),
(5, 'Oruga de las leguminosas', 'Anticarsia gemmatalis', 'Larva defoliadora de soja', 'Soja', 'Medio', 'Defoliación, reducción del área foliar, menor rendimiento', 'Insecticidas específicos, control biológico con virus', TRUE);

-- Crear relaciones cultivos-plagas (solo si no existen)
INSERT IGNORE INTO cultivos_plagas (id_cultivo, id_plaga, nivel_susceptibilidad, periodo_mayor_riesgo) VALUES
(1, 1, 'Alto', 'Primeras 6 semanas después de siembra'),
(2, 2, 'Alto', 'Todo el ciclo del cultivo'),
(3, 3, 'Alto', 'Macollamiento y embuchamiento'),
(4, 4, 'Alto', 'Tuberización y post-cosecha'),
(5, 5, 'Medio', 'Floración y llenado de vainas');

-- ======================================================
-- CREAR VISTAS (reemplazar si existen)
-- ======================================================

-- Vista de usuarios activos con estadísticas (compatible con tabla original)
DROP VIEW IF EXISTS vista_usuarios_activos;
CREATE VIEW vista_usuarios_activos AS
SELECT 
    u.id,
    u.nombre_completo,
    u.correo,
    r.nombre as rol,
    u.fecha_registro,
    COALESCE(COUNT(ac.id), 0) as consultas_ultimo_mes,
    cu.ciudad_predeterminada,
    cu.unidad_temperatura
FROM usuarios u
LEFT JOIN roles r ON u.id_rol = r.id
LEFT JOIN auditoria_consultas ac ON u.id = ac.id_usuario 
    AND ac.fecha_consulta >= DATE_SUB(NOW(), INTERVAL 30 DAY)
LEFT JOIN configuraciones_usuario cu ON u.id = cu.id_usuario
GROUP BY u.id, u.nombre_completo, u.correo, r.nombre, u.fecha_registro, cu.ciudad_predeterminada, cu.unidad_temperatura;

-- Vista de cultivos con sus plagas
DROP VIEW IF EXISTS vista_cultivos_plagas;
CREATE VIEW vista_cultivos_plagas AS
SELECT 
    c.id as cultivo_id,
    c.nombre_cultivo,
    c.nombre_cientifico,
    p.id as plaga_id,
    p.tipo_plaga,
    p.nombre_cientifico as plaga_cientifica,
    cp.nivel_susceptibilidad,
    cp.periodo_mayor_riesgo,
    p.nivel_dano,
    p.sintomas
FROM cultivos c
LEFT JOIN cultivos_plagas cp ON c.id = cp.id_cultivo AND cp.activo = TRUE
LEFT JOIN plagas p ON cp.id_plaga = p.id AND p.activa = TRUE
WHERE c.activo = TRUE
ORDER BY c.nombre_cultivo, cp.nivel_susceptibilidad DESC;

-- ======================================================
-- COMANDOS DE VERIFICACIÓN FINAL
-- ======================================================

-- Verificar estructura actualizada
SELECT 
    'TABLA' as tipo,
    TABLE_NAME as nombre,
    TABLE_ROWS as registros
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'agroassist_db' 
ORDER BY TABLE_NAME;

-- Verificar nuevas columnas en usuarios
DESCRIBE usuarios;

-- Verificar nuevas columnas en clima  
DESCRIBE clima;

-- Verificar nuevas columnas en plagas
DESCRIBE plagas;

-- Verificar datos
SELECT 'ROLES' as tabla, COUNT(*) as registros FROM roles
UNION ALL
SELECT 'USUARIOS' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'CULTIVOS' as tabla, COUNT(*) as registros FROM cultivos
UNION ALL
SELECT 'PLAGAS' as tabla, COUNT(*) as registros FROM plagas
UNION ALL
SELECT 'CULTIVOS_PLAGAS' as tabla, COUNT(*) as registros FROM cultivos_plagas
UNION ALL
SELECT 'AUDITORIA_CONSULTAS' as tabla, COUNT(*) as registros FROM auditoria_consultas;

-- Mensaje final
SELECT 'MIGRACIÓN COMPLETADA EXITOSAMENTE' as resultado, NOW() as fecha_ejecucion;

COMMIT;
