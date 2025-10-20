// Test manual del webhook n8n
const testWebhook = async () => {
  const webhookUrl = 'https://semhys.app.n8n.cloud/webhook/semhys-contact';
  
  const testData = {
    type: 'contact_form',
    name: 'Test SEMHYS Fixed',
    email: 'test@semhys.com',
    company: 'Test Company',
    phone: '+1234567890',
    message: 'Prueba con estructura simplificada',
    services: 'Industrial Automation, PLC Programming',
    language: 'es',
    timestamp: new Date().toISOString(),
    source: 'manual_test'
  };

  try {
    console.log('🚀 Enviando test a n8n webhook...');
    console.log('URL:', webhookUrl);
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('📋 Response Body:', result);
    
    if (response.ok) {
      console.log('✅ Test exitoso - Revisa tu email y n8n executions');
    } else {
      console.log('❌ Error en el webhook');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testWebhook();