-- ======================================================
-- ANÁLISIS Y MEJORAS PARA BASE DE DATOS AGROASSIST
-- ======================================================

-- PROBLEMAS IDENTIFICADOS EN EL ESQUEMA ACTUAL:
-- 1. Falta de columnas en usuarios para seguridad (intentos_fallidos, bloqueado_hasta)
-- 2. Tabla de clima muy básica - no aprovecha datos de APIs externas
-- 3. Tabla de plagas no estructura bien la información
-- 4. Falta de auditoría de consultas a APIs
-- 5. No hay relación entre cultivos y plagas
-- 6. Falta de configuración de APIs por usuario

-- ======================================================
-- ALTER TABLES PARA ESQUEMA EXISTENTE
-- ======================================================

-- 1. MEJORAS EN TABLA USUARIOS (ya parcialmente implementado)
-- Agregar campos de seguridad que faltan
ALTER TABLE usuarios 
ADD COLUMN intentos_fallidos INT DEFAULT 0,
ADD COLUMN bloqueado_hasta DATETIME NULL,
ADD COLUMN ultimo_acceso DATETIME NULL,
ADD COLUMN activo BOOLEAN DEFAULT TRUE;

-- 2. MEJORAR TABLA CLIMA - Almacenar datos más ricos de la API
ALTER TABLE clima 
ADD COLUMN pais VARCHAR(3) NULL,
ADD COLUMN latitud DECIMAL(10, 8) NULL,
ADD COLUMN longitud DECIMAL(11, 8) NULL,
ADD COLUMN temperatura_min DECIMAL(5,2) NULL,
ADD COLUMN temperatura_max DECIMAL(5,2) NULL,
ADD COLUMN viento_velocidad DECIMAL(5,2) NULL,
ADD COLUMN viento_direccion VARCHAR(10) NULL,
ADD COLUMN presion DECIMAL(7,2) NULL,
ADD COLUMN visibilidad INT NULL,
ADD COLUMN indice_uv DECIMAL(3,1) NULL,
ADD COLUMN precipitacion DECIMAL(5,2) NULL,
ADD COLUMN icono_clima VARCHAR(10) NULL,
ADD COLUMN fuente_api VARCHAR(50) DEFAULT 'openweathermap',
ADD COLUMN datos_json TEXT NULL; -- Para guardar respuesta completa de API

-- 3. REESTRUCTURAR TABLA PLAGAS - Mejorar organización
ALTER TABLE plagas 
ADD COLUMN cultivo_afectado VARCHAR(100) NULL,
ADD COLUMN nivel_dano ENUM('Bajo', 'Medio', 'Alto') DEFAULT 'Medio',
ADD COLUMN periodo_critico VARCHAR(100) NULL,
ADD COLUMN sintomas TEXT NULL,
ADD COLUMN metodos_control TEXT NULL,
ADD COLUMN activa BOOLEAN DEFAULT TRUE;

-- 4. MEJORAR TABLA CULTIVOS - Agregar más información
ALTER TABLE cultivos 
ADD COLUMN nombre_cientifico VARCHAR(150) NULL,
ADD COLUMN ciclo_cultivo INT NULL COMMENT 'días del ciclo completo',
ADD COLUMN temporada_siembra VARCHAR(100) NULL,
ADD COLUMN temporada_cosecha VARCHAR(100) NULL,
ADD COLUMN requerimientos_clima TEXT NULL,
ADD COLUMN activo BOOLEAN DEFAULT TRUE;

-- ======================================================
-- NUEVAS TABLAS PARA MEJORAR EL SISTEMA
-- ======================================================

-- 5. TABLA DE AUDITORÍA DE CONSULTAS API
CREATE TABLE auditoria_consultas (
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

-- 6. TABLA DE CONFIGURACIONES DE USUARIO
CREATE TABLE configuraciones_usuario (
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

-- 7. TABLA DE RELACIÓN CULTIVOS-PLAGAS
CREATE TABLE cultivos_plagas (
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

-- 8. TABLA DE HISTORIAL CLIMÁTICO
CREATE TABLE historial_climatico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ciudad VARCHAR(100) NOT NULL,
    pais VARCHAR(3) NOT NULL,
    fecha_registro DATE NOT NULL,
    temp_min DECIMAL(5,2) NULL,
    temp_max DECIMAL(5,2) NULL,
    temp_promedio DECIMAL(5,2) NULL,
    humedad_promedio INT NULL,
    precipitacion_total DECIMAL(5,2) NULL,
    viento_promedio DECIMAL(5,2) NULL,
    condicion_predominante VARCHAR(100) NULL,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ciudad_fecha (ciudad, pais, fecha_registro),
    INDEX idx_ciudad_fecha (ciudad, fecha_registro),
    INDEX idx_fecha (fecha_registro)
);

-- 9. TABLA DE ALERTAS AGRÍCOLAS
CREATE TABLE alertas_agricolas (
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

-- 10. TABLA DE CONSULTAS CLIMA FAVORITAS
CREATE TABLE clima_favoritos (
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

-- ======================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ======================================================

-- Índices para tabla usuarios (mejoras de performance)
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_usuarios_ultimo_acceso ON usuarios(ultimo_acceso);

-- Índices para tabla clima
CREATE INDEX idx_clima_ciudad_fecha ON clima(ciudad, fecha);
CREATE INDEX idx_clima_usuario_fecha ON clima(id_usuario, fecha);
CREATE INDEX idx_clima_coordenadas ON clima(latitud, longitud);

-- Índices para tabla plagas
CREATE INDEX idx_plagas_tipo ON plagas(tipo_plaga);
CREATE INDEX idx_plagas_cultivo ON plagas(cultivo_afectado);
CREATE INDEX idx_plagas_nivel ON plagas(nivel_dano);

-- Índices para tabla cultivos
CREATE INDEX idx_cultivos_nombre ON cultivos(nombre_cultivo);
CREATE INDEX idx_cultivos_activo ON cultivos(activo);

-- ======================================================
-- DATOS INICIALES MEJORADOS
-- ======================================================

-- Actualizar roles existentes
UPDATE roles SET nombre = 'administrador' WHERE id = 1;
UPDATE roles SET nombre = 'agricultor' WHERE id = 2;

-- Agregar más roles
INSERT IGNORE INTO roles (id, nombre) VALUES 
(3, 'tecnico_agricola'),
(4, 'consultor');

-- Datos iniciales de cultivos (información más completa)
INSERT IGNORE INTO cultivos (id, nombre_cultivo, nombre_cientifico, descripcion, ciclo_cultivo, activo) VALUES
(1, 'Maíz', 'Zea mays', 'Cereal básico de gran importancia alimentaria', 120, TRUE),
(2, 'Tomate', 'Solanum lycopersicum', 'Fruto de gran valor comercial y nutricional', 90, TRUE),
(3, 'Arroz', 'Oryza sativa', 'Cereal base de la alimentación mundial', 150, TRUE),
(4, 'Papa', 'Solanum tuberosum', 'Tubérculo de alto valor nutritivo', 100, TRUE),
(5, 'Soja', 'Glycine max', 'Leguminosa rica en proteínas', 130, TRUE),
(6, 'Frijol', 'Phaseolus vulgaris', 'Leguminosa de ciclo corto', 75, TRUE),
(7, 'Café', 'Coffea arabica', 'Cultivo perenne de exportación', 365, TRUE),
(8, 'Plátano', 'Musa paradisiaca', 'Fruta tropical de consumo masivo', 270, TRUE);

-- Datos iniciales de plagas (información estructurada)
INSERT IGNORE INTO plagas (id, tipo_plaga, descripcion, cultivo_afectado, nivel_dano, sintomas, metodos_control, activa) VALUES
(1, 'Gusano cogollero', 'Spodoptera frugiperda - Larva que ataca hojas tiernas', 'Maíz', 'Alto', 'Hojas perforadas, excremento granular, plantas debilitadas', 'Control biológico, Bt, feromonas', TRUE),
(2, 'Mosca blanca', 'Bemisia tabaci - Insecto transmisor de virus', 'Tomate', 'Alto', 'Hojas amarillas, melaza, transmisión de virus', 'Trampas amarillas, control biológico, insecticidas específicos', TRUE),
(3, 'Barrenador del tallo', 'Diatraea saccharalis - Larva que perfora tallos', 'Arroz', 'Alto', 'Tallos perforados, corazón muerto, panículas blancas', 'Manejo de agua, parasitoides, variedades resistentes', TRUE),
(4, 'Polilla de la papa', 'Phthorimaea operculella - Ataca tubérculos y hojas', 'Papa', 'Alto', 'Galerías en tubérculos, hojas minadas', 'Aporque, cosecha oportuna, almacenamiento adecuado', TRUE),
(5, 'Roya de la soja', 'Phakopsora pachyrhizi - Hongo que ataca hojas', 'Soja', 'Medio', 'Manchas amarillas en hojas, defoliación', 'Fungicidas, variedades resistentes, rotación', TRUE);

-- Crear relaciones cultivos-plagas
INSERT IGNORE INTO cultivos_plagas (id_cultivo, id_plaga, nivel_susceptibilidad, periodo_mayor_riesgo) VALUES
(1, 1, 'Alto', 'Primeras 6 semanas'),
(2, 2, 'Alto', 'Todo el ciclo'),
(3, 3, 'Alto', 'Macollamiento y embuchamiento'),
(4, 4, 'Alto', 'Tuberización y post-cosecha'),
(5, 5, 'Medio', 'Floración y llenado de vainas');

-- ======================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ======================================================

-- Procedimiento para limpiar datos antiguos
DELIMITER $$
CREATE PROCEDURE LimpiarDatosAntiguos()
BEGIN
    -- Limpiar consultas de auditoría mayores a 90 días
    DELETE FROM auditoria_consultas WHERE fecha_consulta < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    -- Limpiar datos climáticos mayores a 30 días
    DELETE FROM clima WHERE fecha < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Limpiar alertas expiradas y leídas mayores a 7 días
    DELETE FROM alertas_agricolas 
    WHERE (fecha_expiracion < NOW() OR (leida = TRUE AND fecha_creacion < DATE_SUB(NOW(), INTERVAL 7 DAY)));
    
    SELECT 'Limpieza de datos completada' AS resultado;
END$$
DELIMITER ;

-- Procedimiento para estadísticas de uso
DELIMITER $$
CREATE PROCEDURE EstadisticasUso(IN fecha_inicio DATE, IN fecha_fin DATE)
BEGIN
    SELECT 
        'Consultas por API' AS categoria,
        tipo_api,
        COUNT(*) as total_consultas,
        COUNT(DISTINCT id_usuario) as usuarios_unicos,
        AVG(tiempo_respuesta_ms) as tiempo_promedio_ms
    FROM auditoria_consultas 
    WHERE DATE(fecha_consulta) BETWEEN fecha_inicio AND fecha_fin
    GROUP BY tipo_api
    
    UNION ALL
    
    SELECT 
        'Usuarios más activos' AS categoria,
        u.nombre_completo as tipo_api,
        COUNT(ac.id) as total_consultas,
        COUNT(DISTINCT DATE(ac.fecha_consulta)) as usuarios_unicos,
        0 as tiempo_promedio_ms
    FROM usuarios u
    JOIN auditoria_consultas ac ON u.id = ac.id_usuario
    WHERE DATE(ac.fecha_consulta) BETWEEN fecha_inicio AND fecha_fin
    GROUP BY u.id, u.nombre_completo
    ORDER BY total_consultas DESC
    LIMIT 10;
END$$
DELIMITER ;

-- ======================================================
-- TRIGGERS PARA AUDITORÍA
-- ======================================================

-- Trigger para actualizar último acceso de usuario
DELIMITER $$
CREATE TRIGGER after_user_login
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    IF NEW.intentos_fallidos = 0 AND OLD.intentos_fallidos > 0 THEN
        UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = NEW.id;
    END IF;
END$$
DELIMITER ;

-- ======================================================
-- VISTAS ÚTILES
-- ======================================================

-- Vista de usuarios activos con estadísticas
CREATE VIEW vista_usuarios_activos AS
SELECT 
    u.id,
    u.nombre_completo,
    u.correo,
    r.nombre as rol,
    u.fecha_registro,
    u.ultimo_acceso,
    u.activo,
    COUNT(ac.id) as total_consultas_mes,
    cu.ciudad_predeterminada,
    cu.unidad_temperatura
FROM usuarios u
LEFT JOIN roles r ON u.id_rol = r.id
LEFT JOIN auditoria_consultas ac ON u.id = ac.id_usuario 
    AND ac.fecha_consulta >= DATE_SUB(NOW(), INTERVAL 30 DAY)
LEFT JOIN configuraciones_usuario cu ON u.id = cu.id_usuario
WHERE u.activo = TRUE
GROUP BY u.id, u.nombre_completo, u.correo, r.nombre, u.fecha_registro, u.ultimo_acceso, u.activo, cu.ciudad_predeterminada, cu.unidad_temperatura;

-- Vista de cultivos con sus plagas asociadas
CREATE VIEW vista_cultivos_plagas AS
SELECT 
    c.id as cultivo_id,
    c.nombre_cultivo,
    c.nombre_cientifico,
    p.id as plaga_id,
    p.tipo_plaga,
    cp.nivel_susceptibilidad,
    cp.periodo_mayor_riesgo,
    p.nivel_dano,
    p.sintomas
FROM cultivos c
LEFT JOIN cultivos_plagas cp ON c.id = cp.id_cultivo
LEFT JOIN plagas p ON cp.id_plaga = p.id
WHERE c.activo = TRUE AND (p.activa = TRUE OR p.activa IS NULL)
ORDER BY c.nombre_cultivo, cp.nivel_susceptibilidad DESC;

-- ======================================================
-- COMANDOS DE VERIFICACIÓN
-- ======================================================

-- Verificar estructura final
SHOW TABLES;
DESCRIBE usuarios;
DESCRIBE clima;
DESCRIBE plagas;
DESCRIBE cultivos;

-- Verificar datos iniciales
SELECT * FROM roles;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_cultivos FROM cultivos;
SELECT COUNT(*) as total_plagas FROM plagas;

-- Verificar índices
SHOW INDEX FROM usuarios;
SHOW INDEX FROM clima;
SHOW INDEX FROM plagas;

COMMIT;
