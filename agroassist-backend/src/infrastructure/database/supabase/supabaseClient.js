const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * Cliente de Supabase configurado con las credenciales del .env
 * 
 * IMPORTANTE: En el backend usamos SERVICE_ROLE_KEY para:
 * 1. Bypass de Row Level Security (RLS)
 * 2. Acceso completo a todas las tablas
 * 3. Operaciones de administración
 * 
 * Para frontend/cliente móvil, usar SUPABASE_KEY (anon key) + auth
 */

// Validar que las variables de entorno existan
if (!process.env.SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL no está definida en .env');
  process.exit(1);
}

// Usar SERVICE_ROLE_KEY en el backend para bypass de RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está definida en .env');
  console.error('Para el backend, debes usar la clave service_role para bypass de RLS');
  process.exit(1);
}

// Crear cliente de Supabase con service_role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Log de conexión exitosa
console.log('✅ Supabase client configurado');
console.log('📡 URL:', process.env.SUPABASE_URL);
console.log('🔐 Modo:', supabaseKey === process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE (Admin - RLS Bypass)' : 'ANON (Public)');

module.exports = supabase;
