// Test completo del sistema de chat SEMHYS
const testChatSystem = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🚀 INICIANDO PRUEBA COMPLETA DEL CHAT SEMHYS\n');

  // Casos de prueba diversos
  const testCases = [
    {
      name: 'CONSULTA TÉCNICA - Bomba Centrífuga',
      message: 'Necesito especificaciones técnicas para una bomba centrífuga de 500 HP para aplicación industrial',
      expectedCategory: 'technical'
    },
    {
      name: 'CONSULTA TÉCNICA - Automatización',
      message: 'Requiero información sobre sistemas de automatización y control PLC para línea de producción',
      expectedCategory: 'technical'
    },
    {
      name: 'CONSULTA GENERAL - Servicios',
      message: 'Hola, quisiera conocer más sobre los servicios que ofrece SEMHYS',
      expectedCategory: 'general'
    },
    {
      name: 'CONSULTA GENERAL - Contacto',
      message: 'Me gustaría obtener una cotización para un proyecto de ingeniería',
      expectedCategory: 'general'
    },
    {
      name: 'CONSULTA URGENTE - Falla',
      message: 'URGENTE: Tenemos una falla crítica en el motor principal de la planta',
      expectedCategory: 'technical'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📋 Test ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log(`   Mensaje: "${testCase.message}"`);

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.message,
          language: 'es',
          timestamp: new Date().toISOString(),
          sessionId: `test-session-${i + 1}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   🎯 Categoría detectada: ${result.category}`);
        console.log(`   ⚡ Prioridad: ${result.priority}`);
        console.log(`   💬 Respuesta: "${result.response.substring(0, 80)}..."`);
        
        // Verificar clasificación
        if (result.category === testCase.expectedCategory) {
          console.log(`   ✅ Clasificación CORRECTA`);
          passedTests++;
        } else {
          console.log(`   ❌ Clasificación INCORRECTA (esperado: ${testCase.expectedCategory})`);
        }
        
      } else {
        console.log(`   ❌ Error HTTP: ${response.status}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }

    } catch (error) {
      console.log(`   ❌ Error de conexión: ${error.message}`);
    }

    console.log(''); // Línea en blanco
    
    // Pausa entre tests
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Resumen final
  console.log('🎯 RESUMEN DE PRUEBAS:');
  console.log(`   Tests pasados: ${passedTests}/${totalTests}`);
  console.log(`   Porcentaje de éxito: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('   🎉 ¡TODOS LOS TESTS PASARON! El chat está funcionando correctamente.');
  } else {
    console.log('   ⚠️  Algunos tests fallaron. Revisar la lógica de clasificación.');
  }

  console.log('\n🔗 Próximo paso: Importar workflow en n8n.cloud para activar el webhook');
};

// Ejecutar las pruebas
testChatSystem().catch(console.error);