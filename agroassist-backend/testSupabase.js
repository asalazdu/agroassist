/**
 * Script de prueba para verificar la integración con Supabase
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

async function testEndpoint(name, method, url, body = null) {
  console.log(`\n${colors.blue}Probando: ${name}${colors.reset}`);
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}✅ Éxito (${response.status})${colors.reset}`);
      console.log(JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      console.log(`${colors.yellow}⚠️  Error (${response.status})${colors.reset}`);
      console.log(JSON.stringify(data, null, 2));
      return { success: false, data };
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error de conexión: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}   PRUEBAS DE INTEGRACIÓN CON SUPABASE    ${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}`);

  // 1. Test de conexión
  await testEndpoint(
    '1. Ping - Conexión a base de datos',
    'GET',
    `${BASE_URL}/ping`
  );

  // 2. Test de login con usuario existente
  const loginResult = await testEndpoint(
    '2. Login - Usuario migrado',
    'POST',
    `${BASE_URL}/api/auth/login`,
    {
      correo: 'test@agroassist.com',
      contrasena: 'test123'
    }
  );

  let token = null;
  if (loginResult.success && loginResult.data.token) {
    token = loginResult.data.token;
    console.log(`${colors.green}Token obtenido: ${token.substring(0, 50)}...${colors.reset}`);
  }

  // 3. Test de registro de nuevo usuario
  const timestamp = Date.now();
  await testEndpoint(
    '3. Registro - Nuevo usuario',
    'POST',
    `${BASE_URL}/api/auth/register`,
    {
      nombre_completo: 'Usuario Supabase Test',
      correo: `test_${timestamp}@agroassist.com`,
      contrasena: 'Password123!',
      telefono: '+57 300 1234567',
      ubicacion: 'Bogotá, Colombia',
      tamaño_finca: '5 hectáreas'
    }
  );

  // 4. Test de endpoint protegido (si tenemos token)
  if (token) {
    console.log(`\n${colors.blue}Probando: 4. Perfil - Endpoint protegido${colors.reset}`);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        console.log(`${colors.green}✅ Éxito (${response.status})${colors.reset}`);
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(`${colors.yellow}⚠️  Error (${response.status})${colors.reset}`);
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    }
  }

  console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}   PRUEBAS COMPLETADAS${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}\n`);
}

// Ejecutar pruebas
runTests().catch(error => {
  console.error(`${colors.red}Error general: ${error}${colors.reset}`);
  process.exit(1);
});
