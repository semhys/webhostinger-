// Test de webhooks n8n
const https = require('https');

async function testN8nWebhook(url, data, name) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`✅ ${name}: ${res.statusCode} - ${responseData.substring(0, 100)}...`);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${name}: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testN8n() {
  console.log('🔍 Verificando n8n Cloud Webhooks...\n');
  
  // Test 1: Webhook de contacto
  console.log('📧 Test 1: Webhook de Contacto');
  try {
    await testN8nWebhook(
      'https://semhys.app.n8n.cloud/webhook/semhys-contact',
      {
        name: 'Test SEMHYS',
        email: 'test@semhys.com',
        message: 'Test de verificación del webhook',
        timestamp: new Date().toISOString()
      },
      'Contacto Webhook'
    );
  } catch (error) {
    console.log('❌ Webhook de contacto no disponible');
  }

  console.log('\n💬 Test 2: Webhook de Chat');
  try {
    await testN8nWebhook(
      'https://semhys.app.n8n.cloud/webhook/semhys-chat',
      {
        message: 'Test de verificación del chat',
        category: 'technical',
        timestamp: new Date().toISOString()
      },
      'Chat Webhook'
    );
  } catch (error) {
    console.log('❌ Webhook de chat no disponible');
  }
}

testN8n();