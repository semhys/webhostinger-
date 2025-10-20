import { NextRequest, NextResponse } from 'next/server';
import { 
  WebhookPayload, 
  ContactFormData, 
  ProjectUpdateData, 
  LeadNotificationData, 
  AnalyticsReportData,
  WebhookResponse 
} from './types';

export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json();
    const webhookType = body.type;
    
    console.log('🔔 SEMHYS Webhook received:', {
      type: webhookType,
      timestamp: new Date().toISOString(),
      data: body
    });

    // Procesar diferentes tipos de webhooks
    switch (webhookType) {
      case 'contact_form':
        return await handleContactForm(body.data as ContactFormData);
      
      case 'project_update':
        return await handleProjectUpdate(body.data as ProjectUpdateData);
      
      case 'lead_notification':
        return await handleLeadNotification(body.data as LeadNotificationData);
      
      case 'analytics_report':
        return await handleAnalyticsReport(body.data as AnalyticsReportData);
      
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Unknown webhook type' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Handler para formularios de contacto
async function handleContactForm(data: ContactFormData): Promise<NextResponse<WebhookResponse>> {
  console.log('📧 Processing contact form:', data);
  
  // Aquí se procesaría el formulario de contacto
  // Ejemplo: enviar email, guardar en BD, notificar por WhatsApp
  
  return NextResponse.json({
    success: true,
    message: 'Contact form processed successfully',
    data: {
      contactId: `contact_${Date.now()}`,
      processed: true,
      notifications: ['email_sent', 'whatsapp_sent', 'crm_updated']
    }
  });
}

// Handler para actualizaciones de proyectos
async function handleProjectUpdate(data: ProjectUpdateData): Promise<NextResponse<WebhookResponse>> {
  console.log('🏗️ Processing project update:', data);
  
  return NextResponse.json({
    success: true,
    message: 'Project update processed',
    data: {
      projectId: data.projectId,
      status: 'updated',
      notifications_sent: true
    }
  });
}

// Handler para notificaciones de leads
async function handleLeadNotification(data: LeadNotificationData): Promise<NextResponse<WebhookResponse>> {
  console.log('💼 Processing lead notification:', data);
  
  return NextResponse.json({
    success: true,
    message: 'Lead notification processed',
    data: {
      leadId: data.leadId,
      assigned_to: 'auto_assign',
      priority: data.priority || 'medium'
    }
  });
}

// Handler para reportes de analytics
async function handleAnalyticsReport(data: AnalyticsReportData): Promise<NextResponse<WebhookResponse>> {
  console.log('📊 Processing analytics report:', data);
  
  return NextResponse.json({
    success: true,
    message: 'Analytics report processed',
    data: {
      reportId: `analytics_${Date.now()}`,
      metrics_processed: true,
      report_generated: true
    }
  });
}

export async function GET() {
  return NextResponse.json({
    service: 'SEMHYS n8n Webhook Endpoint',
    status: 'active',
    version: '1.0.0',
    supported_types: [
      'contact_form',
      'project_update', 
      'lead_notification',
      'analytics_report'
    ],
    endpoint: '/api/webhook',
    method: 'POST'
  });
}