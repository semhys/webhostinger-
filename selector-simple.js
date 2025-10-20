// Versión simple del selector - solo escribe la ruta
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎯 SEMHYS - SELECTOR DE CARPETA SIMPLE');
console.log('═'.repeat(40));
console.log('');
console.log('📁 Ejemplos de rutas:');
console.log('   C:\\MisDocumentos');
console.log('   D:\\Documentos_SEMHYS'); 
console.log('   C:\\Users\\ASUS\\Desktop\\MiCarpeta');
console.log('');

rl.question('📂 Escribe la ruta completa de tu carpeta de 21GB: ', (folderPath) => {
  const cleanPath = folderPath.replace(/"/g, '').trim();
  
  console.log('');
  console.log('✅ Ruta seleccionada:', cleanPath);
  console.log('');
  console.log('🚀 Para procesar esta carpeta, ejecuta:');
  console.log('');
  console.log(`node scripts\\bulk-upload.js "${cleanPath}"`);
  console.log('');
  console.log('💡 Copia y pega este comando en otra ventana de PowerShell');
  console.log('');
  
  rl.close();
});