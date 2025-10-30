/**
 * Script de Migración: Crear tablas del Foro Comunitario
 * Ejecuta el SQL en Supabase PostgreSQL
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurar cliente Supabase con service_role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Iniciando migración del Foro Comunitario...\n');

/**
 * Verificar y crear tablas del foro
 */
async function ejecutarMigracion() {
  try {
    console.log('� Verificando si las tablas del foro ya existen...\n');

    // Verificar tabla foro_hilos
    const { data: hilos, error: errorCheckHilos } = await supabase
      .from('foro_hilos')
      .select('id')
      .limit(1);

    // Verificar tabla foro_comentarios
    const { data: comentarios, error: errorCheckComentarios } = await supabase
      .from('foro_comentarios')
      .select('id')
      .limit(1);

    let tablasExisten = true;

    if (!errorCheckHilos) {
      console.log('✅ Tabla foro_hilos YA EXISTE');
      const { count } = await supabase
        .from('foro_hilos')
        .select('*', { count: 'exact', head: true });
      console.log(`   � Registros actuales: ${count || 0}\n`);
    } else {
      console.log('❌ Tabla foro_hilos NO EXISTE\n');
      tablasExisten = false;
    }

    if (!errorCheckComentarios) {
      console.log('✅ Tabla foro_comentarios YA EXISTE');
      const { count } = await supabase
        .from('foro_comentarios')
        .select('*', { count: 'exact', head: true });
      console.log(`   � Registros actuales: ${count || 0}\n`);
    } else {
      console.log('❌ Tabla foro_comentarios NO EXISTE\n');
      tablasExisten = false;
    }

    if (!tablasExisten) {
      console.log('\n⚠️  ACCIÓN REQUERIDA:');
      console.log('   Las tablas del foro NO existen. Debes ejecutar el script SQL manualmente.\n');
      
      console.log('📋 INSTRUCCIONES PASO A PASO:');
      console.log('   1. Ve a: https://supabase.com/dashboard/project/endtgngduxyxdyponecx/sql/new');
      console.log('   2. Abre el archivo: guia del proyecto/Script/ForoComunitario.sql');
      console.log('   3. Copia TODO el contenido');
      console.log('   4. Pégalo en el SQL Editor de Supabase');
      console.log('   5. Haz clic en "RUN" (o presiona Ctrl+Enter)');
      console.log('   6. Vuelve a ejecutar este script para verificar\n');
      
      console.log('💡 TIP: El script creará las tablas, índices, triggers y datos de ejemplo\n');
    } else {
      console.log('\n✅ ¡MIGRACIÓN COMPLETA!');
      console.log('   Todas las tablas del foro están creadas y listas.\n');
      console.log('🚀 Ahora puedes continuar con el frontend del foro.\n');
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  }
}

// Ejecutar
ejecutarMigracion();
