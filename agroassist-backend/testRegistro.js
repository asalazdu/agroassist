/**
 * Test rápido de registro con los datos proporcionados
 */

const http = require('http');

const registrationData = {
  nombre_completo: 'prueba',
  correo: 'prueba@agroassist.com',
  contrasena: 'Abcd1234.',
  telefono: '1234567'
};

console.log('📝 Datos de registro:');
console.log(JSON.stringify(registrationData, null, 2));

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', chunk => data += chunk);
  
  res.on('end', () => {
    console.log('\n📊 Respuesta del servidor:');
    console.log('Status:', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      console.log('Data:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 201) {
        console.log('\n✅ REGISTRO EXITOSO');
      } else if (res.statusCode === 400) {
        console.log('\n❌ ERROR DE VALIDACIÓN');
        if (response.errors) {
          console.log('Errores:', response.errors);
        }
      } else if (res.statusCode === 409) {
        console.log('\n⚠️  EMAIL YA EXISTE');
      }
    } catch (e) {
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message);
  console.log('Asegúrate de que el backend esté corriendo en puerto 3000');
});

req.write(JSON.stringify(registrationData));
req.end();
