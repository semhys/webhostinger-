import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  message: string;
  language: 'en' | 'es' | 'pt';
  timestamp: string;
  sessionId: string;
}

interface ChatResponse {
  success: boolean;
  response?: string;
  category?: 'general' | 'technical' | 'routing';
  priority?: 'low' | 'medium' | 'high';
  error?: string;
}

// Palabras clave para clasificación
const TECHNICAL_KEYWORDS = {
  es: [
    'motor', 'bomba', 'válvula', 'sensor', 'actuador', 'controlador', 'plc', 'scada',
    'automatización', 'industrial', 'ingeniería', 'especificación', 'técnico', 'calibración',
    'mantenimiento', 'reparación', 'instalación', 'configuración', 'programación',
    'hidráulico', 'neumático', 'eléctrico', 'mecánico', 'sistema', 'equipo',
    'presión', 'temperatura', 'caudal', 'voltaje', 'corriente', 'potencia',
    'turbina', 'compresor', 'intercambiador', 'reactor', 'tanque', 'tubería'
  ],
  en: [
    'motor', 'pump', 'valve', 'sensor', 'actuator', 'controller', 'plc', 'scada',
    'automation', 'industrial', 'engineering', 'specification', 'technical', 'calibration',
    'maintenance', 'repair', 'installation', 'configuration', 'programming',
    'hydraulic', 'pneumatic', 'electrical', 'mechanical', 'system', 'equipment',
    'pressure', 'temperature', 'flow', 'voltage', 'current', 'power',
    'turbine', 'compressor', 'exchanger', 'reactor', 'tank', 'pipeline'
  ],
  pt: [
    'motor', 'bomba', 'válvula', 'sensor', 'atuador', 'controlador', 'plc', 'scada',
    'automação', 'industrial', 'engenharia', 'especificação', 'técnico', 'calibração',
    'manutenção', 'reparo', 'instalação', 'configuração', 'programação',
    'hidráulico', 'pneumático', 'elétrico', 'mecânico', 'sistema', 'equipamento',
    'pressão', 'temperatura', 'fluxo', 'voltagem', 'corrente', 'potência',
    'turbina', 'compressor', 'trocador', 'reator', 'tanque', 'tubulação'
  ]
};

const GENERAL_RESPONSES = {
  es: {
    greeting: '¡Hola! Soy el Asistente IA de SEMHYS. ¿En qué puedo ayudarte hoy?',
    services: 'SEMHYS ofrece soluciones completas de ingeniería industrial, automatización, y consultoría técnica especializada.',
    contact: 'Puedes contactarnos a través del formulario en nuestra web o escribiendo a contact@semhys.com',
    about: 'SEMHYS es una empresa especializada en soluciones de ingeniería e innovación tecnológica para la industria.',
    default: 'Entiendo tu consulta. Te conectaré con nuestro equipo especializado para brindarte la mejor asistencia.'
  },
  en: {
    greeting: 'Hello! I\'m SEMHYS AI Assistant. How can I help you today?',
    services: 'SEMHYS offers complete industrial engineering solutions, automation, and specialized technical consulting.',
    contact: 'You can contact us through the form on our website or by writing to contact@semhys.com',
    about: 'SEMHYS is a company specialized in engineering solutions and technological innovation for industry.',
    default: 'I understand your inquiry. I\'ll connect you with our specialized team to provide you with the best assistance.'
  },
  pt: {
    greeting: 'Olá! Sou o Assistente IA da SEMHYS. Como posso ajudá-lo hoje?',
    services: 'A SEMHYS oferece soluções completas de engenharia industrial, automação e consultoria técnica especializada.',
    contact: 'Você pode nos contatar através do formulário em nosso site ou escrevendo para contact@semhys.com',
    about: 'SEMHYS é uma empresa especializada em soluções de engenharia e inovação tecnológica para a indústria.',
    default: 'Entendo sua consulta. Vou conectá-lo com nossa equipe especializada para fornecer a melhor assistência.'
  }
};

function classifyMessage(message: string, language: 'en' | 'es' | 'pt'): {
  category: 'general' | 'technical';
  priority: 'low' | 'medium' | 'high';
  confidence: number;
} {
  const lowerMessage = message.toLowerCase();
  const technicalKeywords = TECHNICAL_KEYWORDS[language];
  
  // Contar coincidencias técnicas
  const technicalMatches = technicalKeywords.filter(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  ).length;
  
  // Palabras urgentes
  const urgentWords = ['urgente', 'urgent', 'emergency', 'emergencia', 'crítico', 'critical', 'falla', 'failure'];
  const hasUrgentWords = urgentWords.some(word => lowerMessage.includes(word));
  
  // Determinar categoría
  const isTechnical = technicalMatches > 0 || 
    lowerMessage.includes('especificación') ||
    lowerMessage.includes('specification') ||
    lowerMessage.includes('proyecto') ||
    lowerMessage.includes('project');
  
  // Determinar prioridad
  let priority: 'low' | 'medium' | 'high' = 'low';
  if (hasUrgentWords) {
    priority = 'high';
  } else if (technicalMatches > 2 || isTechnical) {
    priority = 'medium';
  }
  
  return {
    category: isTechnical ? 'technical' : 'general',
    priority,
    confidence: Math.min(technicalMatches * 0.3 + (isTechnical ? 0.4 : 0), 1)
  };
}

function generateResponse(message: string, category: 'general' | 'technical', language: 'en' | 'es' | 'pt'): string {
  const responses = GENERAL_RESPONSES[language];
  const lowerMessage = message.toLowerCase();
  
  // Respuestas específicas para consultas generales
  if (category === 'general') {
    if (lowerMessage.includes('hola') || lowerMessage.includes('hello') || lowerMessage.includes('olá')) {
      return responses.greeting;
    }
    if (lowerMessage.includes('servicio') || lowerMessage.includes('service') || lowerMessage.includes('serviço')) {
      return responses.services;
    }
    if (lowerMessage.includes('contacto') || lowerMessage.includes('contact') || lowerMessage.includes('contato')) {
      return responses.contact;
    }
    if (lowerMessage.includes('empresa') || lowerMessage.includes('company') || lowerMessage.includes('sobre')) {
      return responses.about;
    }
  }
  
  // Para consultas técnicas
  if (category === 'technical') {
    if (language === 'es') {
      return `Entiendo que tienes una consulta técnica especializada. Nuestro equipo de ingeniería revisará tu solicitud y te proporcionará una respuesta detallada. Te enviaremos la información técnica correspondiente a la brevedad.`;
    } else if (language === 'en') {
      return `I understand you have a specialized technical inquiry. Our engineering team will review your request and provide you with a detailed response. We'll send you the corresponding technical information shortly.`;
    } else {
      return `Entendo que você tem uma consulta técnica especializada. Nossa equipe de engenharia revisará sua solicitação e fornecerá uma resposta detalhada. Enviaremos as informações técnicas correspondentes em breve.`;
    }
  }
  
  return responses.default;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ChatMessage = await request.json();
    const { message, language, timestamp, sessionId } = body;

    if (!message || !language) {
      return NextResponse.json({
        success: false,
        error: 'Mensaje y idioma son requeridos'
      }, { status: 400 });
    }

    // Clasificar el mensaje
    const classification = classifyMessage(message, language);
    
    // Generar respuesta inicial
    const response = generateResponse(message, classification.category, language);

    // Preparar datos para n8n
    const n8nPayload = {
      type: 'chat_message',
      message: message,
      language: language,
      category: classification.category,
      priority: classification.priority,
      confidence: classification.confidence,
      sessionId: sessionId,
      timestamp: timestamp,
      source: 'floating_chat',
      userAgent: request.headers.get('user-agent') || 'Unknown'
    };

    // Enviar a n8n para procesamiento avanzado y logging
    const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    
    if (webhookUrl) {
      try {
        const n8nResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload)
        });

        console.log(`n8n webhook status: ${n8nResponse.status}`);
        
        // Si n8n devuelve una respuesta personalizada, usarla
        if (n8nResponse.ok) {
          const n8nResult = await n8nResponse.json();
          if (n8nResult.customResponse) {
            return NextResponse.json({
              success: true,
              response: n8nResult.customResponse,
              category: classification.category,
              priority: classification.priority
            });
          }
        }
      } catch (n8nError) {
        console.error('Error sending to n8n:', n8nError);
        // Continuar con respuesta local si n8n falla
      }
    }

    // Respuesta exitosa con clasificación
    return NextResponse.json({
      success: true,
      response: response,
      category: classification.category,
      priority: classification.priority
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}