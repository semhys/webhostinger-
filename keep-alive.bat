@echo off
title SEMHYS Server - Always Active
echo ====================================
echo    SEMHYS SERVER - SIEMPRE ACTIVO
echo ====================================
echo.

:START
echo [%date% %time%] Iniciando servidor SEMHYS...
npm run dev

echo [%date% %time%] Servidor se desconecto. Reiniciando en 5 segundos...
timeout /t 5 /nobreak >nul
echo.
goto START