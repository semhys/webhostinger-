@echo off
title SEMHYS Server - Always On
echo 🚀 Iniciando servidor SEMHYS...
echo ⚠️  NO CIERRES ESTA VENTANA
echo.

:restart
echo 📅 %date% %time% - Iniciando servidor...
npx next dev

echo.
echo ⚠️  Servidor desconectado. Reiniciando en 3 segundos...
timeout /t 3 /nobreak > nul
echo.
goto restart