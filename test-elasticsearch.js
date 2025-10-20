// Test de conexión a Elasticsearch
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'https://my-elasticsearch-project-ae3d96.es.us-central1.gcp.elastic.cloud:443',
  auth: {
    apiKey: 'LUdPRV9wa0JLNlVmSTVPU3FHVDE6RnhmTy15d0ktZWZveWtDUHliN0g2QQ=='
  },
  tls: {
    rejectUnauthorized: true
  }
});

async function testConnection() {
  console.log('🔗 Probando conexión a Elasticsearch...\n');
  
  try {
    // Test de ping
    console.log('📡 Test 1: Ping a cluster...');
    await client.ping();
    console.log('✅ Ping exitoso - Cluster accesible\n');

    // Test de info del cluster
    console.log('📊 Test 2: Información del cluster...');
    const info = await client.info();
    console.log('✅ Cluster info:', {
      name: info.cluster_name,
      version: info.version.number,
      lucene: info.version.lucene_version
    });
    console.log();

    // Test de índices existentes
    console.log('📁 Test 3: Listando índices...');
    const indices = await client.cat.indices({ format: 'json' });
    console.log('✅ Índices encontrados:', indices.length);
    if (indices.length > 0) {
      indices.forEach(index => {
        console.log(`  - ${index.index} (${index['docs.count']} docs, ${index['store.size']})`);
      });
    } else {
      console.log('  - No hay índices (normal para cluster nuevo)');
    }
    console.log();

    // Test de creación de índice SEMHYS
    console.log('🏗️  Test 4: Creando índice SEMHYS...');
    const indexName = 'semhys-test';
    
    const indexExists = await client.indices.exists({ index: indexName });
    if (indexExists) {
      console.log('ℹ️  Índice de prueba ya existe, eliminándolo...');
      await client.indices.delete({ index: indexName });
    }

    await client.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            title: { type: 'text' },
            content: { type: 'text' },
            type: { type: 'keyword' }
          }
        }
      }
    });
    console.log('✅ Índice SEMHYS creado correctamente');

    // Test de indexación de documento
    console.log('📄 Test 5: Indexando documento de prueba...');
    const docResponse = await client.index({
      index: indexName,
      body: {
        title: 'Bomba Centrífuga SEMHYS',
        content: 'Especificaciones técnicas para bomba centrífuga de alta eficiencia',
        type: 'technical',
        timestamp: new Date().toISOString()
      }
    });
    console.log('✅ Documento indexado, ID:', docResponse._id);

    // Esperar para que se indexe
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test de búsqueda
    console.log('🔍 Test 6: Búsqueda de documentos...');
    const searchResponse = await client.search({
      index: indexName,
      body: {
        query: {
          match: {
            content: 'bomba centrífuga'
          }
        }
      }
    });
    
    console.log('✅ Búsqueda exitosa:');
    console.log(`  - Documentos encontrados: ${searchResponse.hits.total.value}`);
    console.log(`  - Tiempo de búsqueda: ${searchResponse.took}ms`);

    // Limpiar índice de prueba
    console.log('🧹 Limpiando índice de prueba...');
    await client.indices.delete({ index: indexName });
    console.log('✅ Índice de prueba eliminado');

    console.log('\n🎉 ¡TODAS LAS PRUEBAS EXITOSAS!');
    console.log('🚀 Elasticsearch está listo para tu agente SEMHYS');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    
    if (error.meta?.body?.error) {
      console.error('   Detalles:', error.meta.body.error);
    }
    
    console.log('\n🔧 Posibles soluciones:');
    console.log('   1. Verificar credenciales en Elasticsearch Cloud');
    console.log('   2. Verificar que el cluster esté activo');
    console.log('   3. Revisar configuración de red/firewall');
  }
}

testConnection();