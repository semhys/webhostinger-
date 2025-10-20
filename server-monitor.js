const { exec, spawn } = require('child_process');
const path = require('path');

console.log('🚀 SEMHYS Server Monitor - Iniciando...');
console.log('====================================');

let serverProcess = null;
let restartCount = 0;

function startServer() {
  console.log(`[${new Date().toLocaleString()}] 🔄 Iniciando servidor SEMHYS (Reinicio #${restartCount + 1})`);
  
  serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  serverProcess.on('close', (code) => {
    console.log(`[${new Date().toLocaleString()}] ❌ Servidor se desconectó (código: ${code})`);
    console.log(`[${new Date().toLocaleString()}] 🔄 Reiniciando en 3 segundos...`);
    
    setTimeout(() => {
      restartCount++;
      startServer();
    }, 3000);
  });

  serverProcess.on('error', (error) => {
    console.error(`[${new Date().toLocaleString()}] 💥 Error del servidor:`, error);
    setTimeout(() => {
      restartCount++;
      startServer();
    }, 5000);
  });
}

// Capturar Ctrl+C para salir limpiamente
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando SEMHYS Server Monitor...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

// Iniciar el servidor
startServer();

console.log('✅ Monitor activo. Presiona Ctrl+C para detener.');
console.log('🌐 Servidor disponible en: http://localhost:3000');
console.log('🎛️  Panel admin en: http://localhost:3000/admin');