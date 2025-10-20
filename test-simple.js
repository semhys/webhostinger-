// Test simple de API Key
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'https://my-elasticsearch-project-ae3d96.es.us-central1.gcp.elastic.cloud:443',
  auth: {
    apiKey: 'LUdPRV9wa0JLNlVmSTVPU3FHVDE6RnhmTy15d0ktZWZveWtDUHliN0g2QQ=='
  }
});

async function testSimple() {
  try {
    console.log('🔍 Test de API Key...');
    
    const info = await client.info();
    console.log('✅ Conexión exitosa!');
    console.log('Cluster:', info.cluster_name);
    console.log('Versión:', info.version.number);
    
    return true;
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Código:', error.statusCode);
    console.log('Detalles:', error.meta?.body?.error || 'No disponible');
    return false;
  }
}

testSimple();