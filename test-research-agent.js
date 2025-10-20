// Test simple del agente de investigación
const http = require('http');

const testData = {
  query: "bombas centrífugas eficiencia energética",
  research_focus: "internal_analysis"
};

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/research',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(testData))
  },
  rejectUnauthorized: false
};

console.log('🧪 Probando Agente de Investigación SEMHYS...');
console.log('📡 Consulta:', testData.query);

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\n✅ Respuesta del Agente:');
      console.log('🔍 Éxito:', response.success);
      console.log('📊 Documentos encontrados:', response.total_found);
      console.log('⚡ Tiempo de búsqueda:', response.search_time_ms + 'ms');
      console.log('🎯 Tipo de análisis:', response.analysis_type);
      
      if (response.results && response.results.length > 0) {
        console.log('\n📋 Primeros 3 resultados:');
        response.results.slice(0, 3).forEach((result, i) => {
          console.log(`\n${i + 1}. ${result.title}`);
          console.log(`   📁 ${result.filename}`);
          console.log(`   🎯 Relevancia: ${result.relevance_level} (${result.relevance_score.toFixed(2)})`);
          console.log(`   📄 Tipo: ${result.document_type}`);
        });
      }
      
      if (response.research_summary) {
        console.log('\n📈 Resumen de investigación:');
        console.log(response.research_summary.substring(0, 300) + '...');
      }
      
    } catch (error) {
      console.log('❌ Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(JSON.stringify(testData));
req.end();