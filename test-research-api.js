// Test SEMHYS Research API con ChatGPT
const https = require('https');

const data = JSON.stringify({
  query: "pipeline welding",
  useAI: true
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/research',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Probando SEMHYS Research API...');
console.log('📊 Query: "pipeline welding" con AI activado');

const req = https.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      console.log('\n✅ RESULTADO:');
      console.log('🔍 Documentos encontrados:', result.results?.length || 0);
      
      if (result.aiAnalysis) {
        console.log('🤖 Análisis AI disponible:', result.aiAnalysis.length, 'chars');
        console.log('💰 Costo estimado:', result.estimatedCost);
        console.log('🎯 Confianza:', result.confidence);
      }
      
      if (result.error) {
        console.log('❌ Error:', result.error);
      }
      
    } catch (e) {
      console.log('❌ Error parseando respuesta:', e.message);
      console.log('📝 Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request error:', error.message);
});

req.write(data);
req.end();