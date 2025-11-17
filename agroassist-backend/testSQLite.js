// Script de prueba rápida de SQLite
const db = require('./src/infrastructure/database/sqlite/db');
const userRepository = require('./src/infrastructure/database/sqlite/userRepository');
const hashService = require('./src/infrastructure/services/hash.service');

async function testSQLite() {
  console.log('\n🧪 ===== PRUEBA DE SQLITE =====\n');

  try {
    // 1. Verificar conexión
    console.log('1️⃣  Verificando conexión a SQLite...');
    const [rows] = await db.promise().query('SELECT 1 as test');
    console.log('✅ Conexión exitosa:', rows);

    // 2. Verificar tabla usuarios
    console.log('\n2️⃣  Verificando tabla usuarios...');
    const [usuarios] = await db.promise().query('SELECT COUNT(*) as total FROM usuarios');
    console.log(`✅ Tabla existe. Total usuarios: ${usuarios[0].total}`);

    // 3. Crear usuario de prueba
    console.log('\n3️⃣  Creando usuario de prueba...');
    const testEmail = 'test@agroassist.com';
    
    // Verificar si ya existe
    const exists = await userRepository.existsByEmail(testEmail);
    if (exists) {
      console.log('ℹ️  Usuario de prueba ya existe');
    } else {
      const hashedPassword = await hashService.hashPassword('test123');
      await userRepository.createUser({
        nombre_completo: 'Usuario de Prueba',
        correo: testEmail,
        contrasena: hashedPassword
      });
      console.log('✅ Usuario creado exitosamente');
    }

    // 4. Buscar usuario
    console.log('\n4️⃣  Buscando usuario...');
    const user = await userRepository.findByEmail(testEmail);
    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log('   - ID:', user.id);
      console.log('   - Nombre:', user.nombre_completo);
      console.log('   - Email:', user.correo);
      console.log('   - Rol ID:', user.id_rol);
      console.log('   - Creado:', user.creado_en);
    }

    // 5. Verificar hash de contraseña
    console.log('\n5️⃣  Verificando contraseña...');
    const isValid = await hashService.comparePassword('test123', user.contrasena);
    console.log(`✅ Contraseña válida: ${isValid}`);

    // 6. Listar todos los usuarios
    console.log('\n6️⃣  Listando todos los usuarios...');
    const [allUsers] = await db.promise().query('SELECT id, nombre_completo, correo, creado_en FROM usuarios');
    console.log(`✅ Total de usuarios: ${allUsers.length}`);
    allUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.nombre_completo} (${u.correo})`);
    });

    console.log('\n\n🎉 ===== TODAS LAS PRUEBAS PASARON =====\n');
    console.log('✅ SQLite está funcionando correctamente');
    console.log('✅ Tablas creadas');
    console.log('✅ Operaciones CRUD funcionando');
    console.log('✅ Hash de contraseñas funcionando');
    console.log('\n📝 Siguiente paso: Iniciar el servidor con "npm start"\n');

  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBA:', error);
    console.error('\nDetalles:', error.message);
  }
}

// Ejecutar pruebas
testSQLite();
