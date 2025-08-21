const gbifService = require('./src/infrastructure/services/gbifService');
const iNaturalistService = require('./src/infrastructure/services/iNaturalistService');
const usdaService = require('./src/infrastructure/services/usdaService');

/**
 * Script de prueba para verificar que las APIs gratuitas funcionan correctamente
 * Ejecutar con: node testAPIs.js
 */

async function testAllAPIs() {
  console.log('🧪 PROBANDO APIS GRATUITAS DE AGROASSIST');
  console.log('=====================================\n');

  // Test GBIF API
  console.log('1️⃣ Probando GBIF API (Biodiversidad Global)...');
  try {
    const gbifResult = await gbifService.searchPests('aphid');
    if (gbifResult.success) {
      console.log('✅ GBIF API: FUNCIONANDO');
      console.log(`   Resultados encontrados: ${gbifResult.data?.length || 0}`);
      if (gbifResult.data && gbifResult.data.length > 0) {
        console.log(`   Ejemplo: ${gbifResult.data[0].scientificName}`);
      }
    } else {
      console.log('❌ GBIF API: ERROR');
      console.log(`   Error: ${gbifResult.error}`);
    }
  } catch (error) {
    console.log('❌ GBIF API: EXCEPCIÓN');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test iNaturalist API
  console.log('2️⃣ Probando iNaturalist API (Identificación de Especies)...');
  try {
    const iNatResult = await iNaturalistService.searchInsectPests('aphid');
    if (iNatResult.success) {
      console.log('✅ iNaturalist API: FUNCIONANDO');
      console.log(`   Resultados encontrados: ${iNatResult.data?.length || 0}`);
      if (iNatResult.data && iNatResult.data.length > 0) {
        console.log(`   Ejemplo: ${iNatResult.data[0].scientificName} (${iNatResult.data[0].observationsCount} observaciones)`);
      }
    } else {
      console.log('❌ iNaturalist API: ERROR');
      console.log(`   Error: ${iNatResult.error}`);
    }
  } catch (error) {
    console.log('❌ iNaturalist API: EXCEPCIÓN');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test USDA API
  console.log('3️⃣ Probando USDA API (Datos Agrícolas)...');
  try {
    const usdaResult = await usdaService.getCropProduction('CORN', '2023');
    if (usdaResult.success) {
      console.log('✅ USDA API: FUNCIONANDO');
      console.log(`   Resultados encontrados: ${usdaResult.data?.length || 0}`);
      if (usdaResult.data && usdaResult.data.length > 0) {
        console.log(`   Ejemplo: ${usdaResult.data[0].commodity} en ${usdaResult.data[0].state}`);
      }
    } else {
      console.log('❌ USDA API: ERROR');
      console.log(`   Error: ${usdaResult.error}`);
    }
  } catch (error) {
    console.log('❌ USDA API: EXCEPCIÓN');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test del servicio integrado
  console.log('4️⃣ Probando Servicio Integrado...');
  try {
    const pestInformationService = require('./src/infrastructure/services/pestInformationService');
    const integratedResult = await pestInformationService.getCompletePestInfo('corn borer');
    
    if (integratedResult.success) {
      console.log('✅ Servicio Integrado: FUNCIONANDO');
      console.log(`   Total de resultados: ${integratedResult.summary?.totalResults || 0}`);
      console.log(`   Fuentes consultadas: ${Object.keys(integratedResult.sources || {}).length}`);
    } else {
      console.log('❌ Servicio Integrado: ERROR');
      console.log(`   Error: ${integratedResult.error}`);
    }
  } catch (error) {
    console.log('❌ Servicio Integrado: EXCEPCIÓN');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🎉 PRUEBA COMPLETADA');
  console.log('====================');
  console.log('💡 Si todas las APIs están funcionando, puedes iniciar el servidor con: npm start');
  console.log('🌐 Endpoint de prueba desde navegador: http://localhost:3000/api/pests/test');
}

// Ejecutar las pruebas
testAllAPIs().catch(console.error);
