# 📱 Manual de Instalación y Usuario - AgroAssist

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Instalación del Proyecto](#instalación-del-proyecto)
3. [Configuración Inicial](#configuración-inicial)
4. [Ejecución del Proyecto](#ejecución-del-proyecto)
5. [Uso de la Aplicación](#uso-de-la-aplicación)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

### Software Necesario

#### 1. **Node.js (v18 o superior)**
```powershell
# Verificar instalación
node --version
npm --version
```
- **Descargar:** https://nodejs.org/
- **Versión recomendada:** 18.x o 20.x LTS
- Durante la instalación, asegúrate de marcar "Add to PATH"

#### 2. **Git**
```powershell
# Verificar instalación
git --version
```
- **Descargar:** https://git-scm.com/download/win
- Usar configuración por defecto durante instalación

#### 3. **Expo Go en tu celular**
- **Android:** https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS:** https://apps.apple.com/app/expo-go/id982107779

**⚠️ IMPORTANTE:** El celular y la computadora deben estar en la **misma red WiFi**.

---

## 📦 Instalación del Proyecto

### Paso 1: Clonar el Repositorio

```powershell
# Abrir PowerShell y navegar a la carpeta deseada
cd Documents

# Clonar el proyecto
git clone https://github.com/asalazdu/agroassist.git

# Entrar a la carpeta
cd agroassist
```

### Paso 2: Instalar Dependencias del Backend

```powershell
# Navegar a la carpeta del backend
cd agroassist-backend

# Instalar dependencias
npm install

# Volver a la raíz
cd ..
```

**Tiempo estimado:** 2-3 minutos

### Paso 3: Instalar Dependencias del Frontend

```powershell
# Navegar a la carpeta del frontend
cd agroassist-frontend

# Instalar dependencias (usando legacy-peer-deps para compatibilidad)
npm install --legacy-peer-deps

# Volver a la raíz
cd ..
```

**Tiempo estimado:** 3-5 minutos

---

## ⚙️ Configuración Inicial

### Configuración del Backend

El backend ya incluye el archivo `.env` con todas las configuraciones necesarias:

```env
# Variables ya configuradas en el proyecto:
- Supabase (Base de datos)
- OpenAI API (Chatbot e IA)
- OpenWeatherMap (Clima)
- Perenual API (Información de plantas)
```

**✅ No necesitas modificar nada** - Todo está pre-configurado.

### Configuración del Frontend

El frontend también incluye el archivo `.env` con las configuraciones:

```env
# Variables ya configuradas:
- API Keys
- URLs de servicios
```

**✅ No necesitas modificar nada** - Todo está pre-configurado.

---

## 🚀 Ejecución del Proyecto

### Opción 1: Ejecución Manual (Recomendada para Desarrollo)

#### Paso 1: Iniciar el Backend

```powershell
# Abrir PowerShell - Terminal 1
cd "c:\Users\TU_USUARIO\Documents\agroassist\agroassist-backend"
npm start
```

**✅ Verificar que veas:**
```
✅ Supabase client configurado
✅ OpenAI API Key cargada
Servidor corriendo en http://localhost:3000
```

**⚠️ Mantén esta terminal abierta** - No la cierres.

#### Paso 2: Iniciar el Frontend

```powershell
# Abrir PowerShell - Terminal 2 (nueva ventana)
cd "c:\Users\TU_USUARIO\Documents\agroassist\agroassist-frontend"
npm start
```

**✅ Verificar que veas:**
```
Starting Metro Bundler...
› Metro waiting on exp://192.168.X.X:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

**⚠️ Mantén esta terminal abierta** - No la cierres.

#### Paso 3: Escanear el Código QR

1. **Abre Expo Go** en tu celular
2. **Escanea el código QR** que aparece en la terminal
   - **Android:** Usa el escáner dentro de la app Expo Go
   - **iOS:** Usa la cámara nativa del iPhone

**Tiempo de carga:** 30-60 segundos la primera vez

---

### Opción 2: Ejecución con Scripts (Un Solo Comando)

Puedes crear un script para iniciar todo automáticamente:

#### Windows - Crear `start-agroassist.ps1`:

```powershell
# Crear archivo en la raíz del proyecto
@"
# Script para iniciar AgroAssist
Write-Host "🌱 Iniciando AgroAssist..." -ForegroundColor Green

# Iniciar Backend en nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'agroassist-backend'; npm start"

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Iniciar Frontend en nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'agroassist-frontend'; npm start"

Write-Host "✅ Proyecto iniciado. Escanea el QR en la terminal del frontend." -ForegroundColor Green
"@ | Out-File -FilePath start-agroassist.ps1 -Encoding UTF8
```

#### Ejecutar:
```powershell
# Desde la raíz del proyecto
.\start-agroassist.ps1
```

---

## 📱 Uso de la Aplicación

### Primera Vez - Registro de Usuario

1. **Escanea el QR** con Expo Go
2. En la pantalla de bienvenida, toca **"Comenzar"**
3. Selecciona **"Registrarse"**
4. Completa el formulario:
   - **Nombre completo:** Tu nombre
   - **Correo:** tu@email.com
   - **Teléfono:** (Opcional)
   - **Contraseña:** Mínimo 8 caracteres con:
     - ✓ Una mayúscula (A-Z)
     - ✓ Una minúscula (a-z)
     - ✓ Un número (0-9)
     - ✓ Un símbolo (@$!%*#?&)
   - **Ejemplos válidos:** `Agro2025!`, `Colombia2024@`, `Prueba123#`

5. Toca **"Crear Cuenta"**
6. ✅ Listo - Ya estás dentro de la app

### Pantallas Principales

#### 🏠 **Inicio (Home)**
- **Clima actual** de tu ubicación
- **Resumen de cultivos** registrados
- **Acceso rápido** a funcionalidades

#### 🌾 **Cultivos**
- **Ver cultivos:** Lista de tus cultivos
- **Agregar cultivo:** 
  1. Toca el botón **"+"**
  2. Ingresa nombre, tipo, área
  3. Guarda
- **Editar/Eliminar:** Desliza o toca un cultivo

#### 🐛 **Plagas (con IA)**
- **Tomar foto:** 
  1. Toca **"Analizar con IA"**
  2. Permite acceso a la cámara
  3. Toma foto de la plaga/planta
  4. Espera análisis (10-20 segundos)
- **Resultados:**
  - Identificación de la plaga
  - Nivel de severidad
  - Recomendaciones de tratamiento
  - Ubicación (si GPS activo)

#### 💰 **Precios de Mercado**
- Ver precios actualizados de productos agrícolas
- Filtrar por categoría
- Ver tendencias de precios

#### 💡 **Recomendaciones**
- Consejos personalizados según tu ubicación
- Mejores prácticas agrícolas
- Calendario de siembra

#### 👤 **Perfil**
- Editar información personal
- Ver estadísticas
- Cerrar sesión

#### 💬 **Chatbot (Botón Flotante)**
- Toca el **icono de chat verde** (esquina inferior derecha)
- Preguntas soportadas:
  - 🌦️ **Clima:** "¿Cómo está el clima?" / "¿Va a llover mañana?"
  - 🐛 **Plagas:** "¿Cómo controlar pulgones?" / "Plagas del tomate"
  - 🌾 **Cultivos:** "¿Cuándo sembrar maíz?" / "Cuidados del café"
- Escribe tu pregunta y envía
- Espera respuesta inteligente (5-10 segundos)

---

## 🔍 Solución de Problemas

### Problema: El QR no funciona

**Solución:**
1. Verifica que estés en la **misma red WiFi** (celular y PC)
2. Revisa la IP mostrada en la terminal: `exp://192.168.X.X:8081`
3. Si es `localhost`, detén Expo y reinicia:
   ```powershell
   # Ctrl+C para detener
   npm start
   ```

### Problema: "No se puede conectar al servidor"

**Solución:**
1. Verifica que el **backend esté corriendo**:
   - Debe mostrar: `Servidor corriendo en http://localhost:3000`
2. Verifica tu **IP local**:
   ```powershell
   ipconfig
   # Busca: Adaptador de LAN inalámbrica Wi-Fi
   # IPv4: 192.168.X.X
   ```
3. Actualiza `src/config/api.ts` si tu IP cambió:
   ```typescript
   BACKEND_URL: 'http://192.168.X.X:3000/api',  // Tu IP actual
   ```

### Problema: Error al instalar dependencias

**Solución:**
```powershell
# Backend
cd agroassist-backend
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install

# Frontend
cd ../agroassist-frontend
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install --legacy-peer-deps
```

### Problema: "Contraseña inválida" al registrarse

**Solución:**
Tu contraseña debe cumplir TODOS estos requisitos:
- ✅ Mínimo 8 caracteres
- ✅ Al menos UNA mayúscula (A-Z)
- ✅ Al menos una minúscula (a-z)
- ✅ Al menos un número (0-9)
- ✅ Al menos un símbolo (@$!%*#?&)

**Ejemplos válidos:**
- ✅ `Agro2025!`
- ✅ `Colombia2024@`
- ✅ `MiClave123$`

**Ejemplos inválidos:**
- ❌ `agro2025!` (falta mayúscula)
- ❌ `AGRO2025!` (falta minúscula)
- ❌ `Agroassist` (falta número y símbolo)
- ❌ `Agro123` (falta símbolo)

### Problema: Expo Go muestra error de red

**Solución:**
1. **Desactiva VPN** si tienes una activa
2. **Desactiva Firewall temporalmente:**
   - Windows Defender Firewall → Desactivar
   - Prueba la app
   - Reactiva el Firewall después
3. **Permite acceso a Node.js:**
   - Windows Defender Firewall → Permitir app
   - Busca "Node.js"
   - Marca las casillas de red privada y pública

### Problema: La app se cierra al abrir

**Solución:**
1. Verifica los **logs en la terminal** del frontend
2. Limpia la caché de Expo:
   ```powershell
   npm start -- --clear
   ```
3. Desinstala y reinstala Expo Go en tu celular

---

## 📊 Comandos Útiles

### Ver Estado del Proyecto
```powershell
# Ver procesos de Node corriendo
Get-Process node

# Detener todos los procesos de Node
Get-Process node | Stop-Process -Force
```

### Reiniciar Todo
```powershell
# Detener ambos servidores (Ctrl+C en cada terminal)
# Luego reiniciar:

# Terminal 1 - Backend
cd agroassist-backend
npm start

# Terminal 2 - Frontend
cd agroassist-frontend
npm start
```

### Limpiar Caché
```powershell
# Frontend - Limpiar caché de Expo
cd agroassist-frontend
npm start -- --clear

# O forzar reset completo
npx expo start -c
```

---

## 📝 Resumen de Ejecución Rápida

### Para Usuarios que ya instalaron todo:

**1. Abrir PowerShell #1:**
```powershell
cd "c:\Users\TU_USUARIO\Documents\agroassist\agroassist-backend"
npm start
```

**2. Abrir PowerShell #2:**
```powershell
cd "c:\Users\TU_USUARIO\Documents\agroassist\agroassist-frontend"
npm start
```

**3. En tu celular:**
- Abrir **Expo Go**
- Escanear el **QR** de la terminal #2
- ✅ **¡Listo!** 🎉

---

## 🔐 Credenciales de Prueba

Si necesitas probar sin crear cuenta:

```
Email: test@agroassist.com
Contraseña: Admin123!
```

*(Este usuario ya está creado en la base de datos)*

---

## 📞 Soporte

Si encuentras problemas no cubiertos en este manual:

1. Revisa la sección de **Solución de Problemas**
2. Verifica que ambos servidores estén corriendo
3. Confirma que estés en la misma red WiFi
4. Revisa los logs en ambas terminales para identificar errores específicos

---

## ✅ Checklist de Instalación

- [ ] Node.js instalado (v18+)
- [ ] Git instalado
- [ ] Proyecto clonado
- [ ] Dependencias del backend instaladas
- [ ] Dependencias del frontend instaladas
- [ ] Expo Go instalado en celular
- [ ] Backend corriendo (puerto 3000)
- [ ] Frontend corriendo (Expo Metro)
- [ ] Celular y PC en la misma WiFi
- [ ] QR escaneado
- [ ] Usuario registrado
- [ ] ✅ App funcionando correctamente

---

**¡Bienvenido a AgroAssist! 🌱**

*Manual creado para facilitar el uso y desarrollo del proyecto AgroAssist.*
