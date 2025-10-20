'use client';

import { useState } from 'react';
import { ContactFormData } from '../app/api/webhook/types';

interface ContactFormProps {
  language: 'en' | 'es' | 'pt';
}

const ContactForm = ({ language = 'en' }: ContactFormProps) => {
  const [formData, setFormData] = useState<Partial<ContactFormData>>({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    services: [],
    language: language
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Textos por idioma
  const texts = {
    en: {
      title: 'Contact SEMHYS',
      subtitle: 'Let\'s discuss your engineering project',
      name: 'Full Name',
      email: 'Email Address',
      company: 'Company (optional)',
      phone: 'Phone Number (optional)',
      message: 'Project Details',
      services: 'Services of Interest',
      submit: 'Send Message',
      submitting: 'Sending...',
      namePlaceholder: 'Your full name',
      emailPlaceholder: 'your@email.com',
      companyPlaceholder: 'Your company name',
      phonePlaceholder: '+1 (555) 123-4567',
      messagePlaceholder: 'Tell us about your project, requirements, timeline, and any specific challenges you\'re facing...',
      required: 'Required field',
      servicesList: [
        'Industrial Automation',
        'Process Control',
        'SCADA Systems',
        'PLC Programming', 
        'HMI Development',
        'Electrical Design',
        'System Integration',
        'Technical Consulting'
      ]
    },
    es: {
      title: 'Contactar SEMHYS',
      subtitle: 'Hablemos de tu proyecto de ingeniería',
      name: 'Nombre Completo',
      email: 'Correo Electrónico', 
      company: 'Empresa (opcional)',
      phone: 'Teléfono (opcional)',
      message: 'Detalles del Proyecto',
      services: 'Servicios de Interés',
      submit: 'Enviar Mensaje',
      submitting: 'Enviando...',
      namePlaceholder: 'Tu nombre completo',
      emailPlaceholder: 'tu@correo.com',
      companyPlaceholder: 'Nombre de tu empresa',
      phonePlaceholder: '+34 612 345 678',
      messagePlaceholder: 'Cuéntanos sobre tu proyecto, requisitos, cronograma y cualquier desafío específico que enfrentes...',
      required: 'Campo requerido',
      servicesList: [
        'Automatización Industrial',
        'Control de Procesos',
        'Sistemas SCADA',
        'Programación PLC',
        'Desarrollo HMI',
        'Diseño Eléctrico',
        'Integración de Sistemas',
        'Consultoría Técnica'
      ]
    },
    pt: {
      title: 'Contatar SEMHYS',
      subtitle: 'Vamos discutir seu projeto de engenharia',
      name: 'Nome Completo',
      email: 'Endereço de Email',
      company: 'Empresa (opcional)',
      phone: 'Telefone (opcional)',
      message: 'Detalhes do Projeto',
      services: 'Serviços de Interesse',
      submit: 'Enviar Mensagem',
      submitting: 'Enviando...',
      namePlaceholder: 'Seu nome completo',
      emailPlaceholder: 'seu@email.com',
      companyPlaceholder: 'Nome da sua empresa',
      phonePlaceholder: '+55 11 9 8765-4321',
      messagePlaceholder: 'Conte-nos sobre seu projeto, requisitos, cronograma e quaisquer desafios específicos que esteja enfrentando...',
      required: 'Campo obrigatório',
      servicesList: [
        'Automação Industrial',
        'Controle de Processos',
        'Sistemas SCADA',
        'Programação PLC',
        'Desenvolvimento HMI',
        'Projeto Elétrico',
        'Integração de Sistemas',
        'Consultoria Técnica'
      ]
    }
  };

  const t = texts[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (service: string) => {
    setFormData(prev => {
      const currentServices = prev.services || [];
      const updatedServices = currentServices.includes(service)
        ? currentServices.filter(s => s !== service)
        : [...currentServices, service];
      return { ...prev, services: updatedServices };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error');
      setSubmitMessage(t.required);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.message);
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          message: '',
          services: [],
          language: language
        });
      } else {
        throw new Error(result.error || 'Unknown error');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-teal-600 px-8 py-6">
        <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-orange-100">{t.subtitle}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.name} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder={t.namePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.email} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              placeholder={t.emailPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.company}
            </label>
            <input
              type="text"
              name="company"
              value={formData.company || ''}
              onChange={handleInputChange}
              placeholder={t.companyPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.phone}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              placeholder={t.phonePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {t.services}
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {t.servicesList.map((service) => (
              <label key={service} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.services?.includes(service) || false}
                  onChange={() => handleServiceChange(service)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-orange-600 transition-colors">
                  {service}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.message} <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message || ''}
            onChange={handleInputChange}
            placeholder={t.messagePlaceholder}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-vertical"
            required
          />
        </div>

        {/* Submit Status */}
        {submitStatus !== 'idle' && (
          <div className={`p-4 rounded-lg ${
            submitStatus === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {submitMessage}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-4 font-semibold text-white rounded-lg transition-all duration-200 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 transform hover:scale-105'
            }`}
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;