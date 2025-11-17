// Test rápido de Perenual API
const axios = require('axios');

const PERENUAL_API_KEY = 'sk-YzMV68f6d928ac68d13022';
const PERENUAL_BASE_URL = 'https://perenual.com/api';

async function testPerenualAPI() {
  console.log('🧪 Probando Perenual API...');
  console.log(`🔑 API Key: ${PERENUAL_API_KEY}`);
  
  try {
    const response = await axios.get(`${PERENUAL_BASE_URL}/pest-disease-list`, {
      params: {
        key: PERENUAL_API_KEY,
        page: 1
      },
      timeout: 10000
    });

    console.log('✅ ¡Conexión exitosa!');
    console.log(`📊 Total de plagas disponibles: ${response.data.total}`);
    console.log(`📄 Página actual: ${response.data.current_page}/${response.data.last_page}`);
    console.log(`📋 Resultados en esta página: ${response.data.data.length}`);
    
    if (response.data.data.length > 0) {
      console.log('\n🐛 Primera plaga:');
      const firstPest = response.data.data[0];
      console.log(`   ID: ${firstPest.id}`);
      console.log(`   Nombre: ${firstPest.common_name}`);
      console.log(`   Científico: ${firstPest.scientific_name}`);
      console.log(`   Cultivos: ${firstPest.host ? firstPest.host.join(', ') : 'N/A'}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.status || error.message);
    if (error.response?.status === 401) {
      console.error('🔐 API Key inválida o expirada');
    } else if (error.response?.status === 429) {
      console.error('⏱️ Límite de requests alcanzado');
    } else if (error.response?.data) {
      console.error('📄 Respuesta:', error.response.data);
    }
    return false;
  }
}

testPerenualAPI().then(() => process.exit(0)).catch(() => process.exit(1));
