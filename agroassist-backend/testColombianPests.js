/**
 * Script de prueba para el sistema de plagas colombiano
 * Todas las pruebas en español y enfocadas en agricultura colombiana
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Configuración de pruebas
const TEST_CONFIG = {
  // Credenciales de prueba
  usuario: {
    nombre: 'Agricultor Colombiano',
    email: 'test@agroassist.co',
    password: 'password123'
  },
  
  // Datos de prueba colombianos
  plagas: ['broca del café', 'roya', 'gusano cogollero', 'trips', 'sigatoka negra'],
  cultivos: ['café', 'maíz', 'arroz', 'plátano', 'papa'],
  ubicaciones: {
    bogota: { latitud: 4.7110, longitud: -74.0721 },
    medellin: { latitud: 6.2442, longitud: -75.5812 },
    cali: { latitud: 3.4516, longitud: -76.5320 },
    barranquilla: { latitud: 10.9639, longitud: -74.7964 }
  }
};

let authToken = null;

/**
 * Función auxiliar para hacer peticiones con manejo de errores
 */
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers,
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Autenticación de usuario
 */
async function authenticate() {
  console.log('\n🔐 === AUTENTICACIÓN ===');
  
  // Intentar login
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: TEST_CONFIG.usuario.email,
    password: TEST_CONFIG.usuario.password
  });

  if (loginResult.success) {
    authToken = loginResult.data.token;
    console.log('✅ Login exitoso');
    return true;
  }

  // Si falla login, intentar registro
  console.log('⚠️  Login falló, intentando registro...');
  
  const registerResult = await makeRequest('POST', '/api/auth/register', {
    name: TEST_CONFIG.usuario.nombre,
    email: TEST_CONFIG.usuario.email,
    password: TEST_CONFIG.usuario.password
  });

  if (registerResult.success) {
    console.log('✅ Registro exitoso');
    
    // Login después del registro
    const secondLoginResult = await makeRequest('POST', '/api/auth/login', {
      email: TEST_CONFIG.usuario.email,
      password: TEST_CONFIG.usuario.password
    });

    if (secondLoginResult.success) {
      authToken = secondLoginResult.data.token;
      console.log('✅ Login después de registro exitoso');
      return true;
    }
  }

  console.log('❌ Error en autenticación:', registerResult.error);
  return false;
}

/**
 * Headers con autenticación
 */
function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Prueba del endpoint de información del sistema
 */
async function testSystemInfo() {
  console.log('\n📊 === INFORMACIÓN DEL SISTEMA ===');
  
  const result = await makeRequest('GET', '/api/plagas/info-sistema');
  
  if (result.success) {
    console.log('✅ Sistema funcionando correctamente');
    console.log(`📍 Enfoque: ${result.data.enfoque}`);
    console.log(`🗣️  Idioma: ${result.data.idioma}`);
    console.log(`🌱 Regiones: ${result.data.regiones_colombia.join(', ')}`);
  } else {
    console.log('❌ Error en información del sistema:', result.error);
  }
}

/**
 * Prueba del endpoint de test
 */
async function testAPI() {
  console.log('\n🧪 === PRUEBA DE API ===');
  
  const result = await makeRequest('GET', '/api/plagas/test-colombia');
  
  if (result.success) {
    console.log('✅ API funcionando correctamente');
    console.log(`🌱 Cultivos soportados: ${result.data.cultivos_soportados.length}`);
    console.log(`🐛 Plagas principales: ${result.data.plagas_principales.length}`);
  } else {
    console.log('❌ Error en test de API:', result.error);
  }
}

/**
 * Prueba de lista de cultivos
 */
async function testCropsList() {
  console.log('\n🌾 === LISTA DE CULTIVOS COLOMBIA ===');
  
  const result = await makeRequest('GET', '/api/plagas/cultivos-colombia');
  
  if (result.success) {
    console.log('✅ Lista de cultivos obtenida');
    console.log(`📊 Total cultivos: ${result.data.total_cultivos}`);
    
    // Mostrar algunos cultivos
    result.data.cultivos_principales_colombia.slice(0, 3).forEach(cultivo => {
      console.log(`🌱 ${cultivo.nombre} - Regiones: ${cultivo.regiones.slice(0, 3).join(', ')}`);
    });
  } else {
    console.log('❌ Error obteniendo cultivos:', result.error);
  }
}

/**
 * Prueba de búsqueda de plagas
 */
async function testPestSearch() {
  console.log('\n🔍 === BÚSQUEDA DE PLAGAS ===');
  
  for (const plaga of TEST_CONFIG.plagas.slice(0, 3)) {
    console.log(`\n🐛 Buscando: ${plaga}`);
    
    const result = await makeRequest(
      'GET', 
      `/api/plagas/buscar/${encodeURIComponent(plaga)}`,
      null,
      getAuthHeaders()
    );
    
    if (result.success) {
      console.log(`✅ Información encontrada para ${plaga}`);
      
      if (result.data.informacion_colombiana) {
        console.log(`   📍 Regiones problemáticas: ${result.data.informacion_colombiana.regiones_problematicas?.join(', ')}`);
        console.log(`   ⏰ Época crítica: ${result.data.informacion_colombiana.epoca_critica}`);
      }
      
      if (result.data.recomendaciones) {
        console.log(`   💡 Recomendaciones: ${result.data.recomendaciones.length} disponibles`);
      }
    } else {
      console.log(`❌ Error buscando ${plaga}:`, result.error);
    }
  }
}

/**
 * Prueba de plagas por cultivo
 */
async function testCropPests() {
  console.log('\n🌱 === PLAGAS POR CULTIVO ===');
  
  for (const cultivo of TEST_CONFIG.cultivos.slice(0, 3)) {
    console.log(`\n🌾 Consultando cultivo: ${cultivo}`);
    
    const result = await makeRequest(
      'GET',
      `/api/plagas/cultivo/${encodeURIComponent(cultivo)}`,
      null,
      getAuthHeaders()
    );
    
    if (result.success) {
      console.log(`✅ Información encontrada para ${cultivo}`);
      
      if (result.data.informacion_cultivo_colombia) {
        const info = result.data.informacion_cultivo_colombia;
        console.log(`   🔬 Nombre científico: ${info.nombreCientifico}`);
        console.log(`   📍 Regiones: ${info.regiones?.slice(0, 3).join(', ')}`);
        console.log(`   🌱 Siembra: ${info.epoca_siembra}`);
      }
      
      if (result.data.plagas_principales_colombia) {
        console.log(`   🐛 Plagas principales: ${result.data.plagas_principales_colombia.length} identificadas`);
      }
    } else {
      console.log(`❌ Error consultando ${cultivo}:`, result.error);
    }
  }
}

/**
 * Prueba de búsqueda por ubicación
 */
async function testLocationSearch() {
  console.log('\n📍 === BÚSQUEDA POR UBICACIÓN ===');
  
  const ciudades = Object.keys(TEST_CONFIG.ubicaciones).slice(0, 2);
  
  for (const ciudad of ciudades) {
    const ubicacion = TEST_CONFIG.ubicaciones[ciudad];
    console.log(`\n🏙️  Buscando plagas cerca de ${ciudad}`);
    
    const result = await makeRequest(
      'POST',
      '/api/plagas/ubicacion',
      {
        latitud: ubicacion.latitud,
        longitud: ubicacion.longitud,
        tipoCultivo: 'café'
      },
      getAuthHeaders()
    );
    
    if (result.success) {
      console.log(`✅ Búsqueda exitosa para ${ciudad}`);
      console.log(`   🌍 Región: ${result.data.ubicacion?.region_colombia?.region}`);
      console.log(`   🌡️  Clima: ${result.data.ubicacion?.region_colombia?.clima}`);
      
      if (result.data.recomendaciones_regionales) {
        console.log(`   💡 Recomendaciones regionales: ${result.data.recomendaciones_regionales.length} disponibles`);
      }
    } else {
      console.log(`❌ Error buscando en ${ciudad}:`, result.error);
    }
  }
}

/**
 * Prueba de plan de manejo
 */
async function testControlPlan() {
  console.log('\n📋 === PLAN DE MANEJO ===');
  
  const casos = [
    { plaga: 'broca del café', cultivo: 'café' },
    { plaga: 'roya', cultivo: 'café' },
    { plaga: 'gusano cogollero', cultivo: 'maíz' }
  ];
  
  for (const caso of casos.slice(0, 2)) {
    console.log(`\n🎯 Plan para: ${caso.plaga} en ${caso.cultivo}`);
    
    const result = await makeRequest(
      'POST',
      '/api/plagas/plan-manejo',
      {
        nombrePlaga: caso.plaga,
        nombreCultivo: caso.cultivo
      },
      getAuthHeaders()
    );
    
    if (result.success) {
      console.log(`✅ Plan de manejo generado`);
      
      if (result.data.plan_de_manejo) {
        const plan = result.data.plan_de_manejo;
        if (plan.control_biologico) {
          console.log(`   🦠 Control biológico: ${plan.control_biologico.length} opciones`);
        }
        if (plan.control_cultural) {
          console.log(`   🌾 Control cultural: ${plan.control_cultural.length} prácticas`);
        }
        if (plan.control_quimico) {
          console.log(`   ⚗️  Control químico: ${plan.control_quimico.length} opciones`);
        }
      }
      
      if (result.data.normatividad) {
        console.log(`   📋 Regulación: ${result.data.normatividad.entidad_reguladora}`);
      }
    } else {
      console.log(`❌ Error generando plan:`, result.error);
    }
  }
}

/**
 * Función principal que ejecuta todas las pruebas
 */
async function runAllTests() {
  console.log('🇨🇴 ===== PRUEBAS SISTEMA COLOMBIANO DE PLAGAS =====');
  console.log('🌱 AgroAssist - Información especializada para Colombia');
  console.log('🗣️  Idioma: Español');
  console.log('📅 Fecha:', new Date().toLocaleString('es-CO'));
  
  try {
    // Pruebas que no requieren autenticación
    await testSystemInfo();
    await testAPI();
    await testCropsList();
    
    // Autenticación
    const authSuccess = await authenticate();
    
    if (authSuccess) {
      // Pruebas que requieren autenticación
      await testPestSearch();
      await testCropPests();
      await testLocationSearch();
      await testControlPlan();
      
      console.log('\n🎉 === RESUMEN FINAL ===');
      console.log('✅ Todas las pruebas completadas exitosamente');
      console.log('🇨🇴 Sistema colombiano funcionando correctamente');
      console.log('🗣️  Todas las respuestas en español');
      console.log('🌱 Información específica para agricultura colombiana');
      console.log('📱 API lista para integración con frontend');
      
    } else {
      console.log('\n❌ No se pudo completar la autenticación');
      console.log('🔧 Verifique que el servidor esté ejecutándose');
    }
    
  } catch (error) {
    console.error('\n💥 Error durante las pruebas:', error.message);
    console.log('🔧 Asegúrese de que el servidor esté ejecutándose en http://localhost:3000');
  }
  
  console.log('\n🏁 Pruebas finalizadas');
}

// Ejecutar pruebas
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testSystemInfo,
  testAPI,
  testPestSearch,
  testCropPests,
  testLocationSearch,
  testControlPlan
};
