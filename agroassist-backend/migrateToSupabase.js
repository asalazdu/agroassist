/**
 * Script de migración de SQLite a Supabase
 * Migra usuarios existentes de SQLite a PostgreSQL (Supabase)
 * Mantiene SQLite como backup
 */

const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Usar service_role key para bypassear RLS durante la migración
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('✅ Supabase client configurado (modo admin)');
console.log('📡 URL:', process.env.SUPABASE_URL);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('\n⚠️  ADVERTENCIA: SUPABASE_SERVICE_ROLE_KEY no encontrada');
  console.warn('   Usando SUPABASE_KEY (puede fallar por RLS)');
  console.warn('   Ver: COMO_OBTENER_SERVICE_ROLE_KEY.md\n');
}

async function migrateUsers() {
  console.log('\n🚀 INICIANDO MIGRACIÓN DE USUARIOS');
  console.log('=====================================\n');

  try {
    // 1. Conectar a SQLite
    console.log('📂 Abriendo base de datos SQLite...');
    const db = new Database('./src/database/agroassist.db');
    
    // 2. Obtener usuarios de SQLite
    const users = db.prepare('SELECT * FROM usuarios').all();
    console.log(`✅ Encontrados ${users.length} usuarios en SQLite\n`);

    if (users.length === 0) {
      console.log('ℹ️  No hay usuarios para migrar');
      db.close();
      return;
    }

    // 3. Migrar cada usuario
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      console.log(`\n📝 Migrando usuario: ${user.correo}`);
      
      // Verificar si el usuario ya existe en Supabase
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id, correo')
        .eq('correo', user.correo)
        .single();

      if (existingUser) {
        console.log(`   ⏭️  Usuario ya existe en Supabase (ID: ${existingUser.id})`);
        skipped++;
        continue;
      }

      // Preparar datos para insertar
      const userData = {
        nombre_completo: user.nombre_completo,
        correo: user.correo,
        contrasena: user.contrasena, // Ya está hasheada
        telefono: user.telefono || null,
        ubicacion: user.ubicacion || null,
        tamaño_finca: user.tamaño_finca || null,
        id_rol: user.id_rol || 2,
        intentos_fallidos: user.intentos_fallidos || 0,
        bloqueado_hasta: user.bloqueado_hasta || null,
        reset_token: user.reset_token || null,
        reset_token_expiration: user.reset_token_expiration || null,
        ultimo_acceso: user.ultimo_acceso || null,
        // creado_en y actualizado_en se generan automáticamente
      };

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .insert([userData])
        .select();

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errors++;
      } else {
        console.log(`   ✅ Migrado exitosamente (Nuevo ID: ${data[0].id})`);
        console.log(`      Nombre: ${data[0].nombre_completo}`);
        console.log(`      Email: ${data[0].correo}`);
        console.log(`      Rol: ${data[0].id_rol === 1 ? 'admin' : 'usuario'}`);
        migrated++;
      }
    }

    // 4. Cerrar SQLite
    db.close();

    // 5. Resumen
    console.log('\n=====================================');
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('=====================================');
    console.log(`✅ Migrados exitosamente: ${migrated}`);
    console.log(`⏭️  Ya existían (omitidos): ${skipped}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📊 Total procesados: ${users.length}`);
    console.log('=====================================\n');

    if (migrated > 0) {
      console.log('🎉 ¡Migración completada con éxito!');
      console.log('💾 SQLite permanece como backup en: ./src/database/agroassist.db');
      console.log('☁️  Datos ahora en Supabase PostgreSQL\n');
    }

    // 6. Verificar en Supabase
    console.log('🔍 Verificando usuarios en Supabase...');
    const { data: allUsers, error: verifyError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, correo, id_rol')
      .order('id');

    if (verifyError) {
      console.error('❌ Error al verificar:', verifyError.message);
    } else {
      console.log(`✅ Total de usuarios en Supabase: ${allUsers.length}\n`);
      allUsers.forEach(u => {
        console.log(`   • ID: ${u.id} | ${u.nombre_completo} | ${u.correo}`);
      });
    }

  } catch (error) {
    console.error('\n❌ ERROR EN LA MIGRACIÓN:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateUsers()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
