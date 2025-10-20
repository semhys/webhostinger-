# SEMHYS Server Keep-Alive PowerShell Script
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   SEMHYS SERVER - SIEMPRE ACTIVO" -ForegroundColor Green  
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

$restartCount = 0

function Start-SemhysServer {
    param($count)
    
    Write-Host "[$(Get-Date)] 🚀 Iniciando servidor SEMHYS (Reinicio #$count)" -ForegroundColor Yellow
    
    try {
        Set-Location "C:\Users\ASUS\semhys"
        $process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
        
        # Esperar a que el proceso termine
        $process.WaitForExit()
        
        Write-Host "[$(Get-Date)] ❌ Servidor se desconectó. Reiniciando en 5 segundos..." -ForegroundColor Red
        Start-Sleep -Seconds 5
        
        return $true
    }
    catch {
        Write-Host "[$(Get-Date)] 💥 Error: $($_.Exception.Message)" -ForegroundColor Red
        Start-Sleep -Seconds 10
        return $true
    }
}

# Bucle infinito para mantener el servidor activo
while ($true) {
    $restartCount++
    $continue = Start-SemhysServer -count $restartCount
    
    if (-not $continue) {
        break
    }
}

Write-Host "🛑 Monitor de SEMHYS terminado." -ForegroundColor Red