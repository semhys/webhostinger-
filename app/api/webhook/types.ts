// Tipos para los webhooks de SEMHYS
export interface WebhookPayload {
  type: 'contact_form' | 'project_update' | 'lead_notification' | 'analytics_report';
  data: ContactFormData | ProjectUpdateData | LeadNotificationData | AnalyticsReportData;
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  services: string[];
  language: 'en' | 'es' | 'pt';
  source: string;
  timestamp: string;
}

export interface ProjectUpdateData {
  projectId: string;
  projectName: string;
  status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold';
  progress: number;
  engineer: string;
  client: string;
  milestone?: string;
  notes?: string;
  nextSteps?: string[];
  estimatedCompletion?: string;
}

export interface LeadNotificationData {
  leadId: string;
  source: 'website' | 'referral' | 'social_media' | 'email' | 'phone';
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  serviceInterest: string[];
  budget?: string;
  timeline?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string;
  language: 'en' | 'es' | 'pt';
}

export interface AnalyticsReportData {
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    websiteVisits: number;
    contactForms: number;
    newLeads: number;
    projectsCompleted: number;
    revenue?: number;
  };
  topServices: string[];
  topPages: string[];
  trafficSources: Record<string, number>;
  conversions: {
    rate: number;
    total: number;
  };
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
}