import { NextRequest, NextResponse } from 'next/server';
import { ContactFormData } from '../webhook/types';

export async function POST(request: NextRequest) {
  try {
    const formData: ContactFormData = await request.json();
    
    console.log('📨 New contact form submission:', {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      services: formData.services,
      timestamp: new Date().toISOString()
    });

    // Validar campos requeridos
    if (!formData.name || !formData.email || !formData.message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, email, message'
      }, { status: 400 });
    }

    // Preparar datos para n8n webhook (estructura simple)
    const webhookPayload = {
      type: 'contact_form',
      name: formData.name,
      email: formData.email,
      company: formData.company || 'No especificada',
      phone: formData.phone || 'No proporcionado',
      message: formData.message,
      services: Array.isArray(formData.services) ? formData.services.join(', ') : 'No especificados',
      language: formData.language || 'en',
      timestamp: new Date().toISOString(),
      source: 'website_contact_form'
    };

    // Enviar a n8n webhook (configurar URL en variables de entorno)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (n8nWebhookUrl) {
      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });

        const n8nResult = await n8nResponse.json();
        console.log('✅ n8n webhook response:', n8nResult);

      } catch (n8nError) {
        console.error('❌ n8n webhook error:', n8nError);
        // No falla el formulario si n8n falla, solo logea el error
        console.log('ℹ️ Form will still succeed - n8n error is non-blocking');
      }
    }

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: getSuccessMessage(formData.language || 'en'),
      data: {
        contactId: `contact_${Date.now()}`,
        receivedAt: new Date().toISOString(),
        services: formData.services,
        followUpWithin: '24 hours'
      }
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

function getSuccessMessage(language: string): string {
  const messages = {
    en: 'Thank you for contacting SEMHYS! We will respond within 24 hours.',
    es: '¡Gracias por contactar SEMHYS! Responderemos dentro de 24 horas.',
    pt: 'Obrigado por entrar em contato com a SEMHYS! Responderemos em 24 horas.'
  };
  
  return messages[language as keyof typeof messages] || messages.en;
}

export async function GET() {
  return NextResponse.json({
    service: 'SEMHYS Contact Form API',
    status: 'active',
    endpoint: '/api/contact',
    method: 'POST',
    required_fields: ['name', 'email', 'message'],
    optional_fields: ['company', 'phone', 'services', 'language'],
    supported_languages: ['en', 'es', 'pt']
  });
}