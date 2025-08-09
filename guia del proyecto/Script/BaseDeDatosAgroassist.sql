-- Crear la base de datos
CREATE DATABASE agroassist_db;
USE agroassist_db;

-- Tabla de roles (usuario, admin)
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_rol INT NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id)
);

-- Tabla de datos meteorológicos
CREATE TABLE clima (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ciudad VARCHAR(100) NOT NULL,
    temperatura DECIMAL(5,2),
    humedad INT,
    descripcion VARCHAR(255),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- Tabla de reportes de plagas
CREATE TABLE plagas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_plaga VARCHAR(100) NOT NULL,
    descripcion TEXT,
    recomendaciones TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- Tabla de cultivos
CREATE TABLE cultivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cultivo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    zona VARCHAR(100),
    temporada VARCHAR(50),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (id, nombre) VALUES (1, 'admin'), (2, 'usuario');

ALTER TABLE usuarios
ADD COLUMN reset_token VARCHAR(255),
ADD COLUMN reset_token_expiration DATETIME;

ALTER TABLE usuarios
ADD COLUMN intentos_fallidos INT DEFAULT 0,
ADD COLUMN bloqueado_hasta DATETIME DEFAULT NULL;

SELECT * FROM roles;

SELECT * FROM usuarios;

