// Script interactivo para upload de carpeta completa
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración
const ELASTICSEARCH_NODE = 'https://my-elasticsearch-project-ae3d96.es.us-central1.gcp.elastic.cloud:443';
const ELASTICSEARCH_API_KEY = 'LUdPRV9wa0JLNlVmSTVPU3FHVDE6RnhmTy15d0ktZWZveWtDUHliN0g2QQ==';
const INDEX_NAME = 'semhys-documents';

const client = new Client({
  node: ELASTICSEARCH_NODE,
  auth: { apiKey: ELASTICSEARCH_API_KEY }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para preguntar rutas
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Función para mostrar rutas comunes
function showCommonPaths() {
  console.log('\n📁 RUTAS COMUNES EN WINDOWS:');
  console.log('1. C:\\Users\\ASUS\\Documents');
  console.log('2. C:\\Users\\ASUS\\Desktop');
  console.log('3. C:\\Users\\ASUS\\Downloads');
  console.log('4. D:\\');
  console.log('5. E:\\');
  console.log('6. Otra carpeta (escribe la ruta completa)');
}

// Función para escanear carpeta y mostrar contenido
function scanFolder(folderPath, maxDepth = 2, currentDepth = 0) {
  const items = [];
  
  if (currentDepth >= maxDepth) return items;
  
  try {
    const files = fs.readdirSync(folderPath);
    
    files.slice(0, 10).forEach(file => { // Mostrar solo primeros 10
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        items.push({
          type: 'folder',
          name: file,
          path: filePath,
          size: 0
        });
        
        // Recursivo para subcarpetas
        const subItems = scanFolder(filePath, maxDepth, currentDepth + 1);
        items.push(...subItems.slice(0, 5)); // Max 5 subitems
      } else {
        items.push({
          type: 'file',
          name: file,
          path: filePath,
          size: stat.size
        });
      }
    });
  } catch (error) {
    // Ignorar errores de permisos
  }
  
  return items;
}

// Función para mostrar preview de la carpeta
function showFolderPreview(folderPath) {
  console.log(`\n🔍 PREVIEW DE: ${folderPath}`);
  console.log('━'.repeat(60));
  
  const items = scanFolder(folderPath, 2);
  
  if (items.length === 0) {
    console.log('❌ Carpeta vacía o sin permisos');
    return false;
  }
  
  const folders = items.filter(i => i.type === 'folder');
  const files = items.filter(i => i.type === 'file');
  
  console.log(`📂 Carpetas encontradas: ${folders.length}`);
  folders.slice(0, 5).forEach(folder => {
    console.log(`   📁 ${folder.name}`);
  });
  
  console.log(`\n📄 Archivos encontrados: ${files.length}`);
  files.slice(0, 8).forEach(file => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    console.log(`   📄 ${file.name} (${sizeMB} MB)`);
  });
  
  if (items.length > 13) {
    console.log(`   ... y ${items.length - 13} elementos más`);
  }
  
  // Calcular tamaño total aproximado
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalGB = (totalSize / 1024 / 1024 / 1024).toFixed(2);
  console.log(`\n💾 Tamaño estimado: ${totalGB} GB (muestra parcial)`);
  
  return true;
}

// Función principal
async function interactiveUpload() {
  try {
    console.log('🚀 SEMHYS - UPLOAD INTERACTIVO DE DOCUMENTOS');
    console.log('═'.repeat(50));
    
    // Verificar conexión
    console.log('\n🔗 Verificando conexión a Elasticsearch...');
    await client.ping();
    console.log('✅ Conectado correctamente');
    
    let folderPath = '';
    let validFolder = false;
    
    while (!validFolder) {
      showCommonPaths();
      
      const choice = await askQuestion('\n👉 Selecciona una opción (1-6) o escribe la ruta completa: ');
      
      switch (choice) {
        case '1':
          folderPath = 'C:\\Users\\ASUS\\Documents';
          break;
        case '2':
          folderPath = 'C:\\Users\\ASUS\\Desktop';
          break;
        case '3':
          folderPath = 'C:\\Users\\ASUS\\Downloads';
          break;
        case '4':
          folderPath = 'D:\\';
          break;
        case '5':
          folderPath = 'E:\\';
          break;
        case '6':
          const customPath = await askQuestion('📁 Escribe la ruta completa de tu carpeta: ');
          folderPath = customPath.replace(/"/g, ''); // Remover comillas
          break;
        default:
          folderPath = choice.replace(/"/g, '');
          break;
      }
      
      // Verificar si la carpeta existe
      if (fs.existsSync(folderPath)) {
        console.log(`\n✅ Carpeta encontrada: ${folderPath}`);
        
        // Mostrar preview
        validFolder = showFolderPreview(folderPath);
        
        if (validFolder) {
          const confirm = await askQuestion('\n❓ ¿Quieres procesar esta carpeta? (s/n): ');
          if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'si' && confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
            validFolder = false;
            console.log('\n🔄 Vamos a elegir otra carpeta...');
          }
        } else {
          console.log('\n❌ Carpeta no válida, elige otra...');
        }
      } else {
        console.log(`\n❌ Carpeta no encontrada: ${folderPath}`);
        console.log('💡 Asegúrate de que la ruta sea correcta');
      }
    }
    
    // Confirmar inicio del proceso
    console.log('\n🚀 INICIANDO PROCESAMIENTO...');
    console.log(`📁 Carpeta: ${folderPath}`);
    console.log('⏰ Esto puede tomar varios minutos...');
    
    const startTime = Date.now();
    
    // Aquí llamaríamos al script de upload masivo
    console.log('\n🔄 Ejecutando upload masivo...');
    console.log('💡 Usa este comando para ejecutar el upload:');
    console.log(`node scripts/bulk-upload.js "${folderPath}"`);
    
    rl.close();
    
    // Ejecutar el upload directamente
    const { exec } = require('child_process');
    const command = `node scripts/bulk-upload.js "${folderPath}"`;
    
    console.log('\n⚡ Iniciando upload automático...');
    
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error ejecutando upload:', error);
        return;
      }
      
      if (stderr) {
        console.error('⚠️  Warnings:', stderr);
      }
      
      console.log(stdout);
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
      console.log(`\n⏱️  Tiempo total: ${duration} minutos`);
      console.log('🎉 ¡Upload completado!');
      console.log('🔍 Revisa el panel de admin: http://localhost:3001/admin');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
  }
}

// Iniciar script interactivo
console.log('🎯 Iniciando selector interactivo...');
interactiveUpload();