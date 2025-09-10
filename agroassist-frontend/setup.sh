#!/bin/bash

echo "🌱 Configurando AgroAssist Frontend - React Native"
echo "=================================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "📦 Por favor instala Node.js desde: https://nodejs.org/"
    exit 1
else
    echo "✅ Node.js encontrado: $(node --version)"
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está disponible"
    exit 1
else
    echo "✅ npm encontrado: $(npm --version)"
fi

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Verificar React Native CLI
if ! command -v react-native &> /dev/null; then
    echo ""
    echo "⚠️  React Native CLI no está instalado globalmente"
    echo "🔧 Instalando React Native CLI..."
    npm install -g react-native-cli
fi

# Verificar si es macOS para CocoaPods
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "🍎 Detectado macOS - Configurando iOS..."
    
    if command -v pod &> /dev/null; then
        echo "📦 Instalando pods de iOS..."
        cd ios && pod install && cd ..
        echo "✅ Pods de iOS instalados"
    else
        echo "⚠️  CocoaPods no está instalado"
        echo "🔧 Instala CocoaPods: sudo gem install cocoapods"
    fi
fi

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "📱 Para ejecutar la aplicación:"
echo "   Android: npm run android"
echo "   iOS:     npm run ios"
echo ""
echo "🚀 Para iniciar Metro: npm start"
echo ""
echo "📖 Lee el README.md para más información"
