# Guía Práctica de Testing - AgroAssist APIs

## 🔧 Configuración Inicial

### 1. Variables de Entorno
Asegúrate de tener configurado tu archivo `.env`:

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus valores:
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=agroassist
PORT=3000
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
WEATHER_API_KEY=tu_openweathermap_api_key
```

### 2. Obtener API Key del Clima
1. Ve a [OpenWeatherMap](https://openweathermap.org/api)
2. Crear cuenta gratuita
3. Confirmar email
4. Ir a "API keys" en tu dashboard
5. Copiar la clave y agregarla al `.env`

---

## 🚀 Secuencia Completa de Testing

### Paso 1: Iniciar el Servidor
```bash
cd agroassist-backend
npm install
npm start
```

### Paso 2: Verificar que el Servidor Funciona
```bash
curl http://localhost:3000/api
```

**Respuesta esperada:** Información general de las APIs.

### Paso 3: Registrar un Usuario de Prueba
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_completo": "Agricultor Test",
    "correo": "test@agroassist.com",
    "contrasena": "password123"
  }'
```

### Paso 4: Iniciar Sesión
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "test@agroassist.com",
    "contrasena": "password123"
  }'
```

**Importante:** Guarda el `token` de la respuesta para los siguientes pasos.

### Paso 5: Probar APIs Protegidas

#### 5.1 API del Clima
```bash
# Reemplaza TOKEN_AQUI con tu token real
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Pronóstico por ciudad
curl "http://localhost:3000/api/weather/forecast?city=Bogota&country=CO" \
  -H "Authorization: Bearer $TOKEN"

# Pronóstico por coordenadas (Medellín)
curl "http://localhost:3000/api/weather/coordinates?lat=6.2442&lon=-75.5812" \
  -H "Authorization: Bearer $TOKEN"
```

#### 5.2 API de Plagas
```bash
# Lista de cultivos disponibles
curl "http://localhost:3000/api/pests/crops" \
  -H "Authorization: Bearer $TOKEN"

# Plagas del maíz
curl "http://localhost:3000/api/pests/crop/maiz" \
  -H "Authorization: Bearer $TOKEN"

# Plagas del tomate
curl "http://localhost:3000/api/pests/crop/tomate" \
  -H "Authorization: Bearer $TOKEN"

# Búsqueda por síntomas
curl -X POST "http://localhost:3000/api/pests/symptoms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["hojas amarillas", "perforaciones en hojas", "plantas debilitadas"]
  }'
```

---

## 📋 Scripts de Testing Automatizado

### Script Bash para Testing Completo
Crea un archivo `test_apis.sh`:

```bash
#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}=== TESTING AGROASSIST APIs ===${NC}"

# 1. Test servidor
echo -e "\n${YELLOW}1. Probando servidor...${NC}"
curl -s "$BASE_URL/api" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Servidor funcionando${NC}"
else
    echo -e "${RED}✗ Servidor no responde${NC}"
    exit 1
fi

# 2. Registro
echo -e "\n${YELLOW}2. Registrando usuario de prueba...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "nombre_completo": "Test User",
        "correo": "test'$(date +%s)'@test.com",
        "contrasena": "password123"
    }')

if [[ $REGISTER_RESPONSE == *"ok\":true"* ]]; then
    echo -e "${GREEN}✓ Usuario registrado${NC}"
    EMAIL="test$(date +%s)@test.com"
else
    echo -e "${YELLOW}⚠ Usuario ya existe, usando existente${NC}"
    EMAIL="test@agroassist.com"
fi

# 3. Login
echo -e "\n${YELLOW}3. Iniciando sesión...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"correo\": \"$EMAIL\",
        \"contrasena\": \"password123\"
    }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login exitoso${NC}"
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ Error en login${NC}"
    echo $LOGIN_RESPONSE
    exit 1
fi

# 4. Test APIs protegidas
echo -e "\n${YELLOW}4. Probando API del clima...${NC}"
WEATHER_RESPONSE=$(curl -s "$BASE_URL/api/weather/forecast?city=Bogota" \
    -H "Authorization: Bearer $TOKEN")

if [[ $WEATHER_RESPONSE == *"success\":true"* ]]; then
    echo -e "${GREEN}✓ API del clima funcionando${NC}"
else
    echo -e "${RED}✗ Error en API del clima${NC}"
    echo $WEATHER_RESPONSE | head -c 200
fi

echo -e "\n${YELLOW}5. Probando API de plagas...${NC}"
PESTS_RESPONSE=$(curl -s "$BASE_URL/api/pests/crop/maiz" \
    -H "Authorization: Bearer $TOKEN")

if [[ $PESTS_RESPONSE == *"success\":true"* ]]; then
    echo -e "${GREEN}✓ API de plagas funcionando${NC}"
else
    echo -e "${RED}✗ Error en API de plagas${NC}"
    echo $PESTS_RESPONSE | head -c 200
fi

echo -e "\n${GREEN}=== TESTING COMPLETADO ===${NC}"
```

### Usar el Script
```bash
chmod +x test_apis.sh
./test_apis.sh
```

---

## 🐛 Troubleshooting

### Error: "npm no se reconoce"
- Instala Node.js desde [nodejs.org](https://nodejs.org)
- Reinicia tu terminal

### Error: "Token inválido"
- Verifica que el token no esté expirado (duran 1 hora)
- Haz login nuevamente para obtener un token fresco

### Error: "API key del clima no configurada"
- Verifica que `WEATHER_API_KEY` esté en tu archivo `.env`
- Confirma tu email en OpenWeatherMap
- La API key puede tardar unos minutos en activarse

### Error: "Error al conectar a la base de datos"
- Verifica que MySQL esté corriendo
- Confirma las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `agroassist` exista

### Error: "Ciudad no encontrada"
- Prueba con nombres de ciudades en inglés
- Usa códigos de país de 2 letras (CO, US, ES, etc.)

---

## 📱 Testing con Postman

### 1. Importar Colección
Crea una colección en Postman con estas peticiones:

**Variables de Entorno:**
- `base_url`: `http://localhost:3000`
- `token`: (se actualizará después del login)

**Peticiones:**

1. **Login**
   - Method: POST
   - URL: `{{base_url}}/api/auth/login`
   - Body (JSON):
   ```json
   {
     "correo": "test@agroassist.com",
     "contrasena": "password123"
   }
   ```
   - Test Script:
   ```javascript
   pm.test("Login successful", function () {
       pm.response.to.have.status(200);
       var jsonData = pm.response.json();
       pm.expect(jsonData.ok).to.eql(true);
       pm.environment.set("token", jsonData.token);
   });
   ```

2. **Weather Forecast**
   - Method: GET
   - URL: `{{base_url}}/api/weather/forecast?city=Bogota`
   - Headers: `Authorization: Bearer {{token}}`

3. **Pest Information**
   - Method: GET
   - URL: `{{base_url}}/api/pests/crop/maiz`
   - Headers: `Authorization: Bearer {{token}}`

---

## 🔍 Monitoreo y Logs

### Verificar Logs del Servidor
```bash
# En el terminal donde corre el servidor, verás:
# - Peticiones HTTP
# - Errores de autenticación
# - Errores de conexión a APIs externas
```

### Verificar Estado de la Base de Datos
```bash
# Conectar a MySQL y verificar usuarios
mysql -u tu_usuario -p agroassist

# Ver usuarios registrados
SELECT id, nombre_completo, correo, created_at FROM usuarios;

# Ver intentos de login
SELECT correo, intentos_fallidos, bloqueado_hasta FROM usuarios WHERE intentos_fallidos > 0;
```

¡Con esta guía deberías poder probar completamente las APIs de AgroAssist!
