# Script para iniciar Backend y Frontend de AgroAssist
# Ejecutar con: .\start-agroassist.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    AGROASSIST - Iniciando Servicios       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si hay procesos Node corriendo
Write-Host "🔍 Verificando procesos existentes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "⚠️  Encontrados $($nodeProcesses.Count) procesos Node. Deteniéndolos..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# 2. Iniciar Backend
Write-Host ""
Write-Host "🚀 Iniciando Backend..." -ForegroundColor Green
Write-Host "   Puerto: 3000" -ForegroundColor Gray
Write-Host "   Base de datos: Supabase PostgreSQL" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'c:\Users\juanl\Documents\final Login\agroassist\agroassist-backend'; `
     `$Host.UI.RawUI.WindowTitle = 'AgroAssist Backend'; `
     Write-Host '═══════════════════════════════════════' -ForegroundColor Green; `
     Write-Host '   AGROASSIST BACKEND SERVER' -ForegroundColor Green; `
     Write-Host '═══════════════════════════════════════' -ForegroundColor Green; `
     Write-Host ''; `
     node src/index.js"
)

# 3. Esperar a que el backend inicie
Write-Host "⏳ Esperando 5 segundos para que el backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 4. Verificar que el backend esté corriendo
Write-Host "🔍 Verificando backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/ping" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend funcionando correctamente!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend puede no estar listo aún. Continuando..." -ForegroundColor Yellow
}

# 5. Iniciar Frontend
Write-Host ""
Write-Host "🚀 Iniciando Frontend (Expo)..." -ForegroundColor Green
Write-Host "   Puerto: 8081" -ForegroundColor Gray
Write-Host "   Framework: React Native + Expo" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'c:\Users\juanl\Documents\final Login\agroassist\AgroAssistNew'; `
     `$Host.UI.RawUI.WindowTitle = 'AgroAssist Frontend (Expo)'; `
     Write-Host '═══════════════════════════════════════' -ForegroundColor Cyan; `
     Write-Host '   AGROASSIST FRONTEND (EXPO)' -ForegroundColor Cyan; `
     Write-Host '═══════════════════════════════════════' -ForegroundColor Cyan; `
     Write-Host ''; `
     Write-Host 'Presiona A para abrir en Android' -ForegroundColor Yellow; `
     Write-Host 'Presiona W para abrir en Web' -ForegroundColor Yellow; `
     Write-Host ''; `
     npx expo start"
)

# 6. Resumen
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ SERVICIOS INICIADOS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "📱 Frontend: http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "   Email:    test@agroassist.com" -ForegroundColor White
Write-Host "   Password: test123" -ForegroundColor White
Write-Host ""
Write-Host "💡 Comandos en la ventana de Expo:" -ForegroundColor Yellow
Write-Host "   a → Abrir en Android Emulator" -ForegroundColor White
Write-Host "   w → Abrir en navegador web" -ForegroundColor White
Write-Host "   r → Recargar app" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  NO CIERRES ESTA VENTANA - Mantiene el registro de los servicios" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
