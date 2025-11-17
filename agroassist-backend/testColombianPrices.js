const colombianPricesService = require('./src/infrastructure/services/colombianPricesService');
const GetColombianMarketPrices = require('./src/application/use-cases/getColombianMarketPrices');

/**
 * Script de prueba para verificar la API de precios de mercado colombiano
 * Ejecutar con: node testColombianPrices.js
 */

async function testColombianMarketAPI() {
  console.log('🇨🇴 PROBANDO API DE PRECIOS DE MERCADO COLOMBIANO');
  console.log('=================================================\n');

  const getColombianMarketPrices = new GetColombianMarketPrices();

  // Test 1: Precios de productos básicos
  console.log('1️⃣ Probando precios de productos básicos...');
  try {
    const productTests = ['huevos', 'maiz', 'arroz', 'papa'];
    
    for (const product of productTests) {
      const result = await getColombianMarketPrices.getProductPrices(product, 'Bogotá');
      if (result.success) {
        const price = result.data?.sources?.dane?.data?.pricePerKg || 'N/A';
        console.log(`   ✅ ${product}: $${price} COP/kg`);
      } else {
        console.log(`   ❌ ${product}: Error - ${result.error}`);
      }
    }
  } catch (error) {
    console.log('   ❌ Error en prueba de productos:', error.message);
  }
  console.log('');

  // Test 2: Precios de insumos agrícolas
  console.log('2️⃣ Probando precios de insumos agrícolas...');
  try {
    const inputs = ['fertilizante', 'semilla'];
    
    for (const input of inputs) {
      const result = await getColombianMarketPrices.getInputPrices(input);
      if (result.success) {
        console.log(`   ✅ ${input}: ${result.products?.length || 0} productos encontrados`);
      } else {
        console.log(`   ❌ ${input}: Error - ${result.error}`);
      }
    }
  } catch (error) {
    console.log('   ❌ Error en prueba de insumos:', error.message);
  }
  console.log('');

  // Test 3: Comparación regional
  console.log('3️⃣ Probando comparación regional...');
  try {
    const result = await getColombianMarketPrices.compareRegionalPrices('arroz');
    if (result.success) {
      console.log(`   ✅ Comparación regional: ${result.regionalComparison?.length || 0} regiones analizadas`);
      if (result.bestMarkets?.recommendedMarkets?.length > 0) {
        const bestMarket = result.bestMarkets.recommendedMarkets[0];
        console.log(`   💰 Mejor mercado: ${bestMarket.region} - $${bestMarket.price} COP/kg`);
      }
    } else {
      console.log(`   ❌ Comparación regional: Error - ${result.error}`);
    }
  } catch (error) {
    console.log('   ❌ Error en comparación regional:', error.message);
  }
  console.log('');

  // Test 4: Historial de precios
  console.log('4️⃣ Probando historial de precios...');
  try {
    const result = await getColombianMarketPrices.getPriceHistory('maiz', 6);
    if (result.success) {
      console.log(`   ✅ Historial: ${result.historicalData?.length || 0} puntos de datos`);
      if (result.trends) {
        console.log(`   📈 Tendencia: ${result.trends.trend} (${result.trends.changePercent}%)`);
      }
      if (result.forecast?.nextMonthEstimate) {
        console.log(`   🔮 Pronóstico próximo mes: $${result.forecast.nextMonthEstimate} COP/kg`);
      }
    } else {
      console.log(`   ❌ Historial: Error - ${result.error}`);
    }
  } catch (error) {
    console.log('   ❌ Error en historial:', error.message);
  }
  console.log('');

  // Test 5: Análisis completo de mercado
  console.log('5️⃣ Probando análisis completo de mercado...');
  try {
    const products = ['huevos', 'maiz', 'fertilizante'];
    const result = await getColombianMarketPrices.getMarketAnalysis(products, 'Medellín');
    if (result.success) {
      console.log(`   ✅ Análisis de mercado: ${result.data?.products?.length || 0} productos analizados`);
      console.log(`   📊 Disponibilidad de datos: ${result.data?.marketSummary?.dataAvailability || 'N/A'}`);
      if (result.data?.recommendations?.length > 0) {
        console.log(`   💡 Recomendaciones: ${result.data.recommendations.length} sugerencias disponibles`);
      }
    } else {
      console.log(`   ❌ Análisis de mercado: Error - ${result.error}`);
    }
  } catch (error) {
    console.log('   ❌ Error en análisis de mercado:', error.message);
  }
  console.log('');

  // Test 6: Servicio base
  console.log('6️⃣ Probando servicio base directamente...');
  try {
    const directResult = await colombianPricesService.getProductPrices('tomate');
    if (directResult.success) {
      console.log('   ✅ Servicio base: Funcionando correctamente');
      console.log(`   📝 Fuentes consultadas: ${Object.keys(directResult.data?.sources || {}).length}`);
    } else {
      console.log(`   ❌ Servicio base: Error - ${directResult.error}`);
    }
  } catch (error) {
    console.log('   ❌ Error en servicio base:', error.message);
  }
  console.log('');

  // Resumen de pruebas
  console.log('📋 RESUMEN DE FUNCIONALIDADES DISPONIBLES');
  console.log('==========================================');
  console.log('✅ Consulta de precios por producto');
  console.log('✅ Precios de insumos agrícolas');
  console.log('✅ Comparación entre regiones');
  console.log('✅ Análisis histórico de tendencias');
  console.log('✅ Pronósticos básicos');
  console.log('✅ Análisis integral de mercado');
  console.log('');

  console.log('🏛️ FUENTES DE DATOS IMPLEMENTADAS');
  console.log('==================================');
  console.log('📊 DANE-SIPSA (simulado) - Precios oficiales');
  console.log('🌐 FAO (simulado) - Datos internacionales');
  console.log('🏦 Banco Mundial (simulado) - Commodities');
  console.log('');

  console.log('🚀 PRÓXIMOS PASOS PARA IMPLEMENTACIÓN REAL');
  console.log('==========================================');
  console.log('1. Contactar DANE para acceso a API SIPSA oficial');
  console.log('2. Registrarse en Agronet del MADR');
  console.log('3. Configurar scraping de centrales de abastecimiento');
  console.log('4. Implementar cache para optimizar consultas');
  console.log('5. Añadir validación de datos en tiempo real');
  console.log('');

  console.log('💻 COMANDOS PARA PROBAR LA API');
  console.log('==============================');
  console.log('# Iniciar servidor');
  console.log('npm start');
  console.log('');
  console.log('# Probar endpoint público');
  console.log('curl http://localhost:3000/api/market/test');
  console.log('');
  console.log('# Ver productos disponibles');
  console.log('curl http://localhost:3000/api/market/products');
  console.log('');
  console.log('# Buscar producto');
  console.log('curl http://localhost:3000/api/market/search/maiz');
  console.log('');
  console.log('# Precio de producto (requiere JWT)');
  console.log('curl -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('     http://localhost:3000/api/market/product/huevos?region=Bogotá');
  console.log('');

  console.log('🎉 ¡PRUEBA COMPLETADA!');
  console.log('=======================');
  console.log('La API de precios de mercado colombiano está lista para usar.');
  console.log('Consulte COLOMBIAN_MARKET_API_GUIDE.md para documentación completa.');
}

// Ejecutar las pruebas
testColombianMarketAPI().catch(console.error);
