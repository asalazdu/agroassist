# AgroAssist Frontend Setup Script para Windows
Write-Host "🌱 Configurando AgroAssist Frontend - React Native" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "📦 Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está disponible" -ForegroundColor Red
    exit 1
}

# Instalar dependencias
Write-Host ""
Write-Host "📦 Instalando dependencias..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

# Verificar React Native CLI
try {
    react-native --version | Out-Null
    Write-Host "✅ React Native CLI disponible" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "⚠️  React Native CLI no está instalado globalmente" -ForegroundColor Yellow
    Write-Host "🔧 Instalando React Native CLI..." -ForegroundColor Blue
    npm install -g react-native-cli
}

# Verificar Android Studio / SDK
Write-Host ""
Write-Host "📱 Verificando configuración de Android..." -ForegroundColor Blue

if ($env:ANDROID_HOME) {
    Write-Host "✅ ANDROID_HOME configurado: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "⚠️  ANDROID_HOME no está configurado" -ForegroundColor Yellow
    Write-Host "🔧 Configura Android Studio y las variables de entorno" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Para ejecutar la aplicación:" -ForegroundColor Blue
Write-Host "   Android: npm run android"
Write-Host "   Metro:   npm start"
Write-Host ""
Write-Host "📖 Lee el README.md para más información" -ForegroundColor Blue
Write-Host ""
Write-Host "⚠️  Asegúrate de que el backend esté ejecutándose en http://localhost:3000" -ForegroundColor Yellow
