-- ======================================================
-- BASE DE DATOS AGROASSIST - VERSIÓN ACTUALIZADA
-- Optimizada para APIs de Clima y Plagas
-- ======================================================

-- Crear la base de datos
CREATE DATABASE IF-- Vista de usuarios activos con estadísticas
CREATE OR REPLACE VIEW vista_usuarios_activos AS
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
GROUP BY u.id;st_db;
USE agroassist_db;

-- ======================================================
-- TABLAS PRINCIPALES
-- ======================================================

-- Tabla de roles (usuario, admin, técnico, consultor)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200) NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios (original funcionando)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_rol INT NOT NULL DEFAULT 2,
    
    -- Campos para seguridad y recuperación de contraseña (ya funcionando)
    reset_token VARCHAR(255) NULL,
    reset_token_expiration DATETIME NULL,
    
    -- Campos para control de intentos de login (ya funcionando)
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta DATETIME NULL,
    
    FOREIGN KEY (id_rol) REFERENCES roles(id)
);

-- Tabla de cultivos (información completa)
CREATE TABLE IF NOT EXISTS cultivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cultivo VARCHAR(100) NOT NULL,
    nombre_cientifico VARCHAR(150) NULL,
    descripcion TEXT NULL,
    ciclo_cultivo INT NULL COMMENT 'días del ciclo completo',
    temporada_siembra VARCHAR(100) NULL,
    temporada_cosecha VARCHAR(100) NULL,
    requerimientos_clima TEXT NULL,
    zona VARCHAR(100) NULL,
    temporada VARCHAR(50) NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_nombre (nombre_cultivo),
    INDEX idx_activo (activo)
);

-- Tabla de plagas (información estructurada)
CREATE TABLE IF NOT EXISTS plagas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_plaga VARCHAR(100) NOT NULL,
    nombre_cientifico VARCHAR(150) NULL,
    descripcion TEXT NULL,
    cultivo_afectado VARCHAR(100) NULL,
    nivel_dano ENUM('Bajo', 'Medio', 'Alto') DEFAULT 'Medio',
    periodo_critico VARCHAR(100) NULL,
    sintomas TEXT NULL,
    metodos_control TEXT NULL,
    recomendaciones TEXT NULL,
    activa BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NULL,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    INDEX idx_tipo (tipo_plaga),
    INDEX idx_cultivo (cultivo_afectado),
    INDEX idx_nivel (nivel_dano),
    INDEX idx_activa (activa)
);

-- Tabla de datos meteorológicos (mejorada para API)
CREATE TABLE IF NOT EXISTS clima (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ciudad VARCHAR(100) NOT NULL,
    pais VARCHAR(3) NULL,
    latitud DECIMAL(10, 8) NULL,
    longitud DECIMAL(11, 8) NULL,
    
    -- Temperaturas
    temperatura DECIMAL(5,2) NULL,
    temperatura_min DECIMAL(5,2) NULL,
    temperatura_max DECIMAL(5,2) NULL,
    
    -- Otros parámetros climáticos
    humedad INT NULL,
    presion DECIMAL(7,2) NULL,
    viento_velocidad DECIMAL(5,2) NULL,
    viento_direccion VARCHAR(10) NULL,
    visibilidad INT NULL,
    indice_uv DECIMAL(3,1) NULL,
    precipitacion DECIMAL(5,2) NULL,
    
    -- Información descriptiva
    descripcion VARCHAR(255) NULL,
    icono_clima VARCHAR(10) NULL,
    
    -- Metadatos
    fuente_api VARCHAR(50) DEFAULT 'openweathermap',
    datos_json TEXT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NULL,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    INDEX idx_ciudad_fecha (ciudad, fecha),
    INDEX idx_usuario_fecha (id_usuario, fecha),
    INDEX idx_coordenadas (latitud, longitud),
    INDEX idx_fecha (fecha)
);

-- ======================================================
-- TABLAS AUXILIARES PARA FUNCIONALIDADES AVANZADAS
-- ======================================================

-- Tabla de relación cultivos-plagas
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

-- Tabla de configuraciones de usuario
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

-- Tabla de auditoría de consultas API
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
    INDEX idx_tipo_fecha (tipo_api, fecha_consulta),
    INDEX idx_fecha (fecha_consulta)
);

-- Tabla de ubicaciones favoritas para clima
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

-- Tabla de alertas agrícolas
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
-- DATOS INICIALES
-- ======================================================

-- Insertar roles
INSERT IGNORE INTO roles (id, nombre, descripcion) VALUES 
(1, 'administrador', 'Administrador del sistema con acceso completo'),
(2, 'agricultor', 'Usuario agricultor con acceso a consultas de clima y plagas'),
(3, 'tecnico_agricola', 'Técnico agrícola con permisos avanzados'),
(4, 'consultor', 'Consultor agrícola especializado');

-- Insertar cultivos principales
INSERT IGNORE INTO cultivos (id, nombre_cultivo, nombre_cientifico, descripcion, ciclo_cultivo, activo) VALUES
(1, 'Maíz', 'Zea mays', 'Cereal básico de gran importancia alimentaria', 120, TRUE),
(2, 'Tomate', 'Solanum lycopersicum', 'Fruto de gran valor comercial y nutricional', 90, TRUE),
(3, 'Arroz', 'Oryza sativa', 'Cereal base de la alimentación mundial', 150, TRUE),
(4, 'Papa', 'Solanum tuberosum', 'Tubérculo de alto valor nutritivo', 100, TRUE),
(5, 'Soja', 'Glycine max', 'Leguminosa rica en proteínas', 130, TRUE),
(6, 'Frijol', 'Phaseolus vulgaris', 'Leguminosa de ciclo corto', 75, TRUE),
(7, 'Café', 'Coffea arabica', 'Cultivo perenne de exportación', 365, TRUE),
(8, 'Plátano', 'Musa paradisiaca', 'Fruta tropical de consumo masivo', 270, TRUE);

-- Insertar plagas principales
INSERT IGNORE INTO plagas (id, tipo_plaga, nombre_cientifico, descripcion, cultivo_afectado, nivel_dano, sintomas, metodos_control, activa) VALUES
(1, 'Gusano cogollero', 'Spodoptera frugiperda', 'Larva que ataca hojas tiernas del maíz', 'Maíz', 'Alto', 'Hojas perforadas, excremento granular, plantas debilitadas', 'Control biológico con Trichogramma, Bt, feromonas', TRUE),
(2, 'Mosca blanca', 'Bemisia tabaci', 'Insecto transmisor de virus en tomate', 'Tomate', 'Alto', 'Hojas amarillas, melaza pegajosa, transmisión de virus', 'Trampas amarillas, control biológico, insecticidas específicos', TRUE),
(3, 'Barrenador del tallo', 'Diatraea saccharalis', 'Larva que perfora tallos de arroz', 'Arroz', 'Alto', 'Tallos perforados, corazón muerto, panículas blancas', 'Manejo de agua, parasitoides, variedades resistentes', TRUE),
(4, 'Polilla de la papa', 'Phthorimaea operculella', 'Ataca tubérculos y hojas de papa', 'Papa', 'Alto', 'Galerías en tubérculos, hojas minadas, tubérculos no comerciales', 'Aporque adecuado, cosecha oportuna, almacenamiento', TRUE),
(5, 'Oruga de las leguminosas', 'Anticarsia gemmatalis', 'Larva defoliadora de soja', 'Soja', 'Medio', 'Defoliación, reducción del área foliar, menor rendimiento', 'Insecticidas específicos, control biológico con virus', TRUE);

-- Crear relaciones cultivos-plagas
INSERT IGNORE INTO cultivos_plagas (id_cultivo, id_plaga, nivel_susceptibilidad, periodo_mayor_riesgo) VALUES
(1, 1, 'Alto', 'Primeras 6 semanas después de siembra'),
(2, 2, 'Alto', 'Todo el ciclo del cultivo'),
(3, 3, 'Alto', 'Macollamiento y embuchamiento'),
(4, 4, 'Alto', 'Tuberización y post-cosecha'),
(5, 5, 'Medio', 'Floración y llenado de vainas');

-- ======================================================
-- VISTAS ÚTILES
-- ======================================================

-- Vista de usuarios activos con estadísticas
CREATE OR REPLACE VIEW vista_usuarios_activos AS
SELECT 
    u.id,
    u.nombre_completo,
    u.correo,
    r.nombre as rol,
    u.fecha_registro,
    u.ultimo_acceso,
    u.activo,
    COUNT(ac.id) as consultas_ultimo_mes,
    cu.ciudad_predeterminada,
    cu.unidad_temperatura
FROM usuarios u
LEFT JOIN roles r ON u.id_rol = r.id
LEFT JOIN auditoria_consultas ac ON u.id = ac.id_usuario 
    AND ac.fecha_consulta >= DATE_SUB(NOW(), INTERVAL 30 DAY)
LEFT JOIN configuraciones_usuario cu ON u.id = cu.id_usuario
WHERE u.activo = TRUE
GROUP BY u.id;

-- Vista de cultivos con sus plagas
CREATE OR REPLACE VIEW vista_cultivos_plagas AS
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
-- COMANDOS DE VERIFICACIÓN
-- ======================================================

-- Mostrar todas las tablas
SHOW TABLES;

-- Verificar datos iniciales
SELECT 'ROLES' as tabla, COUNT(*) as registros FROM roles
UNION ALL
SELECT 'USUARIOS' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'CULTIVOS' as tabla, COUNT(*) as registros FROM cultivos
UNION ALL
SELECT 'PLAGAS' as tabla, COUNT(*) as registros FROM plagas
UNION ALL
SELECT 'CULTIVOS_PLAGAS' as tabla, COUNT(*) as registros FROM cultivos_plagas;

COMMIT;

