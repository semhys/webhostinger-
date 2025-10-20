// Test script para el webhook de chat SEMHYS
const testChatWebhook = async () => {
  const webhookUrl = 'https://semhys.app.n8n.cloud/webhook/semhys-chat';
  
  // Datos de prueba para consulta técnica
  const technicalQuery = {
    type: 'chat_message',
    message: 'Necesito especificaciones técnicas para una bomba centrífuga de 500 HP',
    language: 'es',
    category: 'technical',
    priority: 'medium',
    confidence: 0.8,
    sessionId: 'test-session-001',
    timestamp: new Date().toISOString(),
    source: 'floating_chat',
    userAgent: 'Test/1.0'
  };

  // Datos de prueba para consulta general
  const generalQuery = {
    type: 'chat_message',
    message: 'Hola, quisiera conocer más sobre los servicios de SEMHYS',
    language: 'es',
    category: 'general',
    priority: 'low',
    confidence: 0.2,
    sessionId: 'test-session-002',
    timestamp: new Date().toISOString(),
    source: 'floating_chat',
    userAgent: 'Test/1.0'
  };

  console.log('🚀 Probando webhook de chat SEMHYS...\n');

  try {
    // Probar consulta técnica
    console.log('📧 Enviando consulta TÉCNICA...');
    const techResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(technicalQuery)
    });

    console.log(`Status: ${techResponse.status}`);
    if (techResponse.ok) {
      console.log('✅ Consulta técnica enviada correctamente');
    } else {
      console.log('❌ Error en consulta técnica:', techResponse.statusText);
    }

    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Probar consulta general
    console.log('\n📧 Enviando consulta GENERAL...');
    const generalResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generalQuery)
    });

    console.log(`Status: ${generalResponse.status}`);
    if (generalResponse.ok) {
      console.log('✅ Consulta general enviada correctamente');
    } else {
      console.log('❌ Error en consulta general:', generalResponse.statusText);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }

  console.log('\n🎯 Prueba completada. Revisa n8n para ver los mensajes clasificados.');
};

// Ejecutar la prueba
testChatWebhook();