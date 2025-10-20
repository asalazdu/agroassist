const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Crear carpeta database si no existe
const dbDir = path.join(__dirname, '../../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Ruta de la base de datos
const dbPath = path.join(dbDir, 'agroassist.db');

// Crear conexión
const db = new Database(dbPath, { verbose: console.log });

// Configuración de SQLite para mejor rendimiento
db.pragma('journal_mode = WAL'); // Write-Ahead Logging
db.pragma('foreign_keys = ON');   // Habilitar claves foráneas

// Inicializar tablas si no existen
function initializeTables() {
  // Tabla de roles
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insertar roles por defecto
  const insertRole = db.prepare(`
    INSERT OR IGNORE INTO roles (id, nombre, descripcion) 
    VALUES (?, ?, ?)
  `);
  
  insertRole.run(1, 'admin', 'Administrador del sistema');
  insertRole.run(2, 'usuario', 'Usuario regular');

  // Tabla de usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_completo TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      contrasena TEXT NOT NULL,
      id_rol INTEGER DEFAULT 2,
      intentos_fallidos INTEGER DEFAULT 0,
      bloqueado_hasta DATETIME NULL,
      reset_token TEXT NULL,
      reset_token_expiration DATETIME NULL,
      ultimo_acceso DATETIME NULL,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_rol) REFERENCES roles(id)
    );
  `);

  // Índices para mejorar performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
    CREATE INDEX IF NOT EXISTS idx_usuarios_reset_token ON usuarios(reset_token);
  `);

  console.log('✅ Tablas de SQLite inicializadas correctamente');
}

// Inicializar tablas al cargar el módulo
initializeTables();

// Funciones helper para mantener compatibilidad con MySQL
const dbHelpers = {
  // Ejecutar query con params (equivalente a mysql.query)
  query: (sql, params = []) => {
    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        // Para SELECT, retornamos array de resultados
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);
        return [rows]; // Formato compatible con MySQL [rows, fields]
      } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
        // Para INSERT, retornamos info de inserción
        const stmt = db.prepare(sql);
        const info = stmt.run(...params);
        return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
      } else {
        // Para UPDATE, DELETE, etc.
        const stmt = db.prepare(sql);
        const info = stmt.run(...params);
        return [{ affectedRows: info.changes }];
      }
    } catch (error) {
      console.error('Error en query SQLite:', error);
      throw error;
    }
  },

  // Versión promisificada para compatibilidad
  promise: () => ({
    query: (sql, params = []) => {
      return Promise.resolve(dbHelpers.query(sql, params));
    }
  }),

  // Transacciones
  transaction: (callback) => {
    const transaction = db.transaction(callback);
    return transaction();
  }
};

// Exportar db con helpers
module.exports = {
  ...db,
  ...dbHelpers,
  raw: db // Acceso directo a la instancia de better-sqlite3
};
