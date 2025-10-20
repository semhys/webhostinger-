// Test de la API Key de OpenAI
const fetch = require('node-fetch');

async function testChatGPTIntegration() {
  console.log('🧪 Probando integración ChatGPT con SEMHYS...\n');
  
  try {
    // Test 1: Verificar configuración de IA
    console.log('📊 Test 1: Verificando configuración...');
    const configResponse = await fetch('http://localhost:3001/api/research');
    const configData = await configResponse.json();
    
    console.log('✅ Estado IA:', configData.ai_integration?.status);
    console.log('🤖 Modelo configurado:', configData.ai_integration?.current_model);
    console.log('💰 Límite mensual: $', configData.ai_integration?.monthly_cost_limit);
    
    // Test 2: Hacer consulta con IA
    console.log('\n🔬 Test 2: Consulta técnica con ChatGPT...');
    const queryResponse = await fetch('http://localhost:3001/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'bombas centrífugas eficiencia energética sistemas hidráulicos',
        research_focus: 'internal_analysis'
      })
    });
    
    const queryData = await queryResponse.json();
    
    if (queryData.success) {
      console.log('✅ Documentos encontrados:', queryData.total_found);
      console.log('⚡ Tiempo búsqueda:', queryData.search_time_ms + 'ms');
      
      if (queryData.ai_analysis) {
        console.log('\n🤖 ANÁLISIS CON CHATGPT:');
        console.log('📈 IA habilitada:', queryData.ai_analysis.enabled ? 'SÍ' : 'NO');
        console.log('🧠 Modelo usado:', queryData.ai_analysis.model_used);
        console.log('💰 Costo estimado: $', queryData.ai_analysis.cost_estimate.toFixed(4));
        console.log('🎯 Confianza:', (queryData.ai_analysis.confidence_score * 100).toFixed(1) + '%');
        console.log('⚡ Tokens usados:', queryData.ai_analysis.tokens_used.input + queryData.ai_analysis.tokens_used.output);
        
        console.log('\n📝 RESUMEN GENERADO POR IA:');
        console.log(queryData.ai_analysis.analysis.substring(0, 300) + '...\n');
        
        console.log('💡 Sugerencias de IA:', queryData.ai_analysis.suggestions.slice(0, 2));
      } else {
        console.log('❌ IA no activada - solo búsqueda básica');
      }
    } else {
      console.log('❌ Error en consulta:', queryData);
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

testChatGPTIntegration();