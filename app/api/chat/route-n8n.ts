import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  message: string;
  language: 'en' | 'es' | 'pt';
  timestamp: string;
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const chatData: ChatMessage = await request.json();
    const { message, language, timestamp, sessionId } = chatData;

    console.log(`🔬 SEMHYS Chat → N8N: "${message}"`);

    // Validación básica
    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Mensaje vacío'
      }, { status: 400 });
    }

    // URL del webhook N8N para chat inteligente
    const n8nWebhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      console.error('❌ N8N_CHAT_WEBHOOK_URL no configurada');
      return NextResponse.json({
        success: true,
        response: language === 'es' 
          ? '🔧 Gracias por contactar SEMHYS. Nuestro equipo especializado te responderá pronto.'
          : '🔧 Thank you for contacting SEMHYS. Our specialized team will respond soon.',
        category: 'general',
        priority: 'medium'
      });
    }

    try {
      console.log('📡 Enviando consulta a N8N...');
      
      // Enviar a N8N para procesamiento inteligente
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          language: language || 'es',
          timestamp: timestamp || new Date().toISOString(),
          sessionId: sessionId || `chat-${Date.now()}`,
          source: 'semhys-chat-flotante'
        })
      });

      if (!n8nResponse.ok) {
        throw new Error(`N8N error: ${n8nResponse.status}`);
      }

      const n8nResult = await n8nResponse.json();
      console.log('✅ N8N procesó consulta:', n8nResult.category);

      return NextResponse.json({
        success: true,
        response: n8nResult.response || n8nResult.message || 'Consulta procesada correctamente.',
        category: n8nResult.category || 'general',
        priority: n8nResult.priority || 'medium',
        agent: n8nResult.agent || 'SEMHYS-N8N',
        timestamp: n8nResult.timestamp || new Date().toISOString()
      });

    } catch (n8nError) {
      console.error('❌ Error conectando con N8N:', n8nError);
      
      // Respuesta de fallback profesional
      const fallbackResponse = language === 'es' 
        ? '🔧 Hemos recibido tu consulta sobre ingeniería. Nuestro equipo de especialistas de SEMHYS te contactará en las próximas 2 horas para brindarte una solución personalizada.'
        : '🔧 We have received your engineering inquiry. Our SEMHYS specialist team will contact you within the next 2 hours to provide a personalized solution.';

      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        category: 'general',
        priority: 'medium',
        agent: 'SEMHYS-Local',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ SEMHYS Chat Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error procesando consulta'
    }, { status: 500 });
  }
}