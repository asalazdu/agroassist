// Script para crear usuario test
const db = require('./src/infrastructure/database/sqlite/db');
const bcrypt = require('bcrypt');

async function crearUsuarioTest() {
  try {
    // Eliminar usuario existente
    db.query('DELETE FROM usuarios WHERE correo = ?', ['test@agroassist.com']);
    console.log('✅ Usuario anterior eliminado (si existía)');
    
    // Crear hash de la contraseña
    const hash = await bcrypt.hash('test123', 10);
    console.log('✅ Hash generado para password: test123');
    
    // Insertar nuevo usuario
    db.query(
      'INSERT INTO usuarios (nombre_completo, correo, contrasena, id_rol) VALUES (?, ?, ?, ?)',
      ['Usuario Test', 'test@agroassist.com', hash, 2]
    );
    console.log('✅ Usuario test creado');
    
    // Verificar
    const usuarios = db.query('SELECT id, nombre_completo, correo FROM usuarios WHERE correo = ?', ['test@agroassist.com']);
    console.log('\n📋 Usuario en la base de datos:');
    console.log(JSON.stringify(usuarios[0], null, 2));
    
    console.log('\n🔑 Credenciales para login:');
    console.log('   Email: test@agroassist.com');
    console.log('   Password: test123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

crearUsuarioTest();
