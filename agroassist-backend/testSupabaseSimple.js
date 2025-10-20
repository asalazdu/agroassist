/**
 * Script simple de prueba para verificar la integración con Supabase
 * Sin dependencias externas
 */

const http = require('http');

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  PRUEBAS DE INTEGRACIÓN CON SUPABASE    ║');
  console.log('╚══════════════════════════════════════════╝\n');

  try {
    // Test 1: Ping
    console.log('1️⃣  TEST: Ping - Conexión a base de datos');
    const pingResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/ping',
      method: 'GET'
    });
    console.log(`   Status: ${pingResult.status}`);
    console.log(`   Respuesta:`, JSON.stringify(pingResult.data, null, 2));

    // Test 2: Login con usuario migrado
    console.log('\n2️⃣  TEST: Login - Usuario migrado (test@agroassist.com)');
    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      correo: 'test@agroassist.com',
      contrasena: 'test123'
    });
    console.log(`   Status: ${loginResult.status}`);
    console.log(`   Respuesta:`, JSON.stringify(loginResult.data, null, 2));

    if (loginResult.data.token) {
      console.log(`   ✅ Token obtenido: ${loginResult.data.token.substring(0, 50)}...`);
    }

    // Test 3: Registro de nuevo usuario
    console.log('\n3️⃣  TEST: Registro - Nuevo usuario Supabase');
    const timestamp = Date.now();
    const registerResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      nombre_completo: 'Usuario Supabase Test',
      correo: `supabase_${timestamp}@test.com`,
      contrasena: 'TestPass123!',
      telefono: '+57 300 1234567',
      ubicacion: 'Bogotá, Colombia',
      tamaño_finca: '5 hectáreas'
    });
    console.log(`   Status: ${registerResult.status}`);
    console.log(`   Respuesta:`, JSON.stringify(registerResult.data, null, 2));

    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║         PRUEBAS COMPLETADAS ✅           ║');
    console.log('╚══════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Asegúrate de que el servidor esté corriendo en puerto 3000\n');
  }
}

runTests();
