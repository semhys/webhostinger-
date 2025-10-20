// Script para upload masivo de documentos SEMHYS
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

// Configuración
const ELASTICSEARCH_NODE = 'https://my-elasticsearch-project-ae3d96.es.us-central1.gcp.elastic.cloud:443';
const ELASTICSEARCH_API_KEY = 'LUdPRV9wa0JLNlVmSTVPU3FHVDE6RnhmTy15d0ktZWZveWtDUHliN0g2QQ==';
const INDEX_NAME = 'semhys-documents';

// Cliente Elasticsearch
const client = new Client({
  node: ELASTICSEARCH_NODE,
  auth: { apiKey: ELASTICSEARCH_API_KEY }
});

// Tipos de archivo soportados
const SUPPORTED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.md', '.json', '.csv',
  '.jpg', '.jpeg', '.png', '.gif', '.bmp',
  '.mp4', '.avi', '.mov', '.wmv', '.flv',
  '.zip', '.rar', '.7z'
];

// Función para obtener todos los archivos recursivamente
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Función para extraer metadatos del archivo
function extractMetadata(filePath) {
  const stats = fs.statSync(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();
  
  return {
    filename: filename,
    filepath: filePath,
    extension: ext,
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    directory: path.dirname(filePath)
  };
}

// Función para categorizar archivo
function categorizeFile(filename, filePath) {
  const lowerFilename = filename.toLowerCase();
  const lowerPath = filePath.toLowerCase();
  
  let category = 'general';
  let equipment_type = null;
  const tags = [];
  
  // Categorización por nombre y ruta
  if (lowerFilename.includes('manual') || lowerPath.includes('manual')) {
    category = 'manual';
    tags.push('manual', 'documentation');
  } else if (lowerFilename.includes('spec') || lowerFilename.includes('specification')) {
    category = 'specification';
    tags.push('specification', 'technical');
  } else if (lowerFilename.includes('bomba') || lowerFilename.includes('pump')) {
    category = 'technical';
    equipment_type = 'bomba';
    tags.push('bomba', 'pump', 'technical');
  } else if (lowerFilename.includes('motor') || lowerFilename.includes('engine')) {
    category = 'technical';
    equipment_type = 'motor';
    tags.push('motor', 'engine', 'technical');
  } else if (lowerFilename.includes('valve') || lowerFilename.includes('valvula')) {
    category = 'technical';
    equipment_type = 'valve';
    tags.push('valve', 'valvula', 'technical');
  } else if (lowerPath.includes('tecnic') || lowerPath.includes('engineering')) {
    category = 'technical';
    tags.push('technical', 'engineering');
  }
  
  return { category, equipment_type, tags };
}

// Función para crear el índice
async function createIndex() {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    
    if (!exists) {
      await client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              title: { type: 'text', analyzer: 'standard' },
              filename: { type: 'keyword' },
              filepath: { type: 'keyword' },
              content: { type: 'text' },
              file_type: { type: 'keyword' },
              file_size: { type: 'long' },
              category: { type: 'keyword' },
              equipment_type: { type: 'keyword' },
              tags: { type: 'keyword' },
              created_at: { type: 'date' },
              uploaded_at: { type: 'date' },
              directory: { type: 'keyword' }
            }
          }
        }
      });
      console.log('✅ Índice creado correctamente');
    } else {
      console.log('ℹ️  Índice ya existe');
    }
  } catch (error) {
    console.error('❌ Error creando índice:', error);
    throw error;
  }
}

// Función principal de upload
async function bulkUpload(documentsPath) {
  try {
    console.log('🚀 INICIANDO UPLOAD MASIVO SEMHYS');
    console.log(`📁 Carpeta: ${documentsPath}`);
    
    if (!fs.existsSync(documentsPath)) {
      throw new Error(`La carpeta no existe: ${documentsPath}`);
    }

    // Verificar conexión
    console.log('\n🔗 Verificando conexión...');
    await client.ping();
    console.log('✅ Conectado a Elasticsearch');

    // Crear índice
    await createIndex();

    // Obtener todos los archivos
    console.log('\n📋 Escaneando archivos...');
    const allFiles = getAllFiles(documentsPath);
    console.log(`📄 Encontrados ${allFiles.length} archivos soportados`);

    if (allFiles.length === 0) {
      console.log('⚠️  No se encontraron archivos soportados');
      return;
    }

    // Procesar archivos en lotes
    const BATCH_SIZE = 10;
    let processed = 0;
    let successful = 0;
    let errors = 0;

    console.log('\n🔄 Iniciando procesamiento...');

    for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
      const batch = allFiles.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (filePath) => {
        try {
          const metadata = extractMetadata(filePath);
          const { category, equipment_type, tags } = categorizeFile(metadata.filename, filePath);
          
          // Crear documento básico (sin contenido por ahora para archivos grandes)
          const document = {
            title: metadata.filename.replace(/\.[^/.]+$/, ""),
            filename: metadata.filename,
            filepath: metadata.filepath,
            content: `Documento: ${metadata.filename}`,
            file_type: metadata.extension,
            file_size: metadata.size,
            category: category,
            equipment_type: equipment_type,
            tags: tags,
            created_at: metadata.created.toISOString(),
            uploaded_at: new Date().toISOString(),
            directory: path.relative(documentsPath, metadata.directory) || '/'
          };

          const response = await client.index({
            index: INDEX_NAME,
            body: document
          });

          console.log(`✅ ${metadata.filename} (${(metadata.size / 1024 / 1024).toFixed(2)} MB)`);
          return { success: true, file: metadata.filename, id: response._id };

        } catch (error) {
          console.error(`❌ Error: ${path.basename(filePath)} - ${error.message}`);
          return { success: false, file: path.basename(filePath), error: error.message };
        }
      });

      const results = await Promise.all(batchPromises);
      
      results.forEach(result => {
        processed++;
        if (result.success) {
          successful++;
        } else {
          errors++;
        }
      });

      // Mostrar progreso
      const progress = ((processed / allFiles.length) * 100).toFixed(1);
      console.log(`📊 Progreso: ${progress}% (${processed}/${allFiles.length})`);

      // Pausa pequeña entre lotes
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Resumen final
    console.log('\n🎯 RESUMEN FINAL:');
    console.log(`✅ Archivos procesados exitosamente: ${successful}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📊 Total procesado: ${processed}`);
    console.log(`📈 Tasa de éxito: ${((successful / processed) * 100).toFixed(1)}%`);

    // Estadísticas del índice
    const stats = await client.count({ index: INDEX_NAME });
    console.log(`📄 Total documentos en el índice: ${stats.count}`);

    console.log('\n🚀 ¡Upload masivo completado!');
    console.log('🔍 Ahora puedes buscar en el panel de administración: /admin');

  } catch (error) {
    console.error('❌ Error en upload masivo:', error);
    process.exit(1);
  }
}

// Ejecutar script
const documentsPath = process.argv[2];

if (!documentsPath) {
  console.log('❌ Error: Debes especificar la ruta a los documentos');
  console.log('📝 Uso: node bulk-upload.js "C:\\ruta\\a\\tus\\documentos"');
  process.exit(1);
}

bulkUpload(documentsPath);