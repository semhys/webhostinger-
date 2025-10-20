// Test simple para verificar ChatGPT
const https = require('https');
const http = require('http');

const testData = {
  query: "bomba centrífuga eficiencia",
  research_focus: "internal_analysis"
};

console.log('🧪 Test rápido de ChatGPT integración...');
console.log('📡 Consulta:', testData.query);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/research',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      console.log('\n✅ Respuesta recibida:');
      console.log('🔍 Éxito:', response.success);
      console.log('📊 Documentos:', response.total_found);
      
      if (response.ai_analysis) {
        console.log('\n🤖 CHATGPT ACTIVADO:');
        console.log('✅ IA habilitada:', response.ai_analysis.enabled);
        console.log('🧠 Modelo:', response.ai_analysis.model_used);
        console.log('💰 Costo: $' + response.ai_analysis.cost_estimate.toFixed(4));
        console.log('🎯 Confianza:', (response.ai_analysis.confidence_score * 100).toFixed(1) + '%');
        
        if (response.ai_analysis.analysis) {
          console.log('\n📝 Análisis IA (preview):');
          console.log(response.ai_analysis.analysis.substring(0, 200) + '...');
        }
      } else {
        console.log('\n❌ ChatGPT no detectado - usando solo Elasticsearch');
      }
      
    } catch (error) {
      console.log('❌ Error parsing:', error);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(JSON.stringify(testData));
req.end();