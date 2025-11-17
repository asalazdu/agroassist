// Script de prueba para el chatbot optimizado
const http = require('http');

const testQueries = [
  {
    name: "Consulta sobre broca del café",
    message: "Tengo broca en mi café, ¿cómo la controlo?"
  },
  {
    name: "Época de siembra de café",
    message: "¿Cuándo debo sembrar café en el Eje Cafetero?"
  },
  {
    name: "Problema con plátano",
    message: "Mis hojas de plátano tienen manchas negras"
  }
];

function testChatbot(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: query.message,
      userId: "test-user",
      context: { location: "Colombia" }
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/chatbot/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Probando chatbot optimizado con ChatGPT 5...\n');
  
  for (const query of testQueries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 ${query.name}`);
    console.log(`❓ Pregunta: "${query.message}"`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
      const response = await testChatbot(query);
      console.log(`✅ Respuesta:\n${response.response}\n`);
      
      if (response.metadata) {
        console.log(`📊 Metadata:`);
        console.log(`   - Tipo: ${response.metadata.queryType || 'general'}`);
        console.log(`   - Tokens: ${response.metadata.tokensUsed || 'N/A'}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    // Esperar un poco entre consultas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ Pruebas completadas');
}

runTests().catch(console.error);
