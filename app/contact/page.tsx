'use client';

import { useState } from 'react';
import Link from 'next/link';
import ContactForm from '../../components/ContactForm';

export default function ContactPage() {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es' | 'pt'>('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
    { code: 'pt' as const, name: 'Português', flag: '🇧🇷' }
  ];

  const texts = {
    en: {
      pageTitle: 'Contact Us',
      heroTitle: 'Get in Touch with SEMHYS',
      heroSubtitle: 'Ready to start your engineering project? Let\'s discuss how we can help transform your ideas into reality.',
      contactInfo: 'Contact Information',
      quickContact: 'Quick Contact',
      office: 'Office',
      email: 'Email',
      phone: 'Phone', 
      hours: 'Business Hours',
      hoursText: 'Monday - Friday: 8:00 AM - 6:00 PM',
      services: 'Our Services',
      whyChoose: 'Why Choose SEMHYS?',
      reasons: [
        '15+ years of engineering expertise',
        'Multilingual team (English, Spanish, Portuguese)',
        'Global project experience',
        'Cutting-edge automation solutions',
        '24/7 technical support',
        'ISO certified processes'
      ]
    },
    es: {
      pageTitle: 'Contáctanos',
      heroTitle: 'Ponte en Contacto con SEMHYS',
      heroSubtitle: '¿Listo para comenzar tu proyecto de ingeniería? Hablemos de cómo podemos ayudarte a transformar tus ideas en realidad.',
      contactInfo: 'Información de Contacto',
      quickContact: 'Contacto Rápido',
      office: 'Oficina',
      email: 'Correo',
      phone: 'Teléfono',
      hours: 'Horario de Atención',
      hoursText: 'Lunes - Viernes: 8:00 AM - 6:00 PM',
      services: 'Nuestros Servicios',
      whyChoose: '¿Por Qué Elegir SEMHYS?',
      reasons: [
        '15+ años de experiencia en ingeniería',
        'Equipo multilingüe (Inglés, Español, Portugués)',
        'Experiencia en proyectos globales',
        'Soluciones de automatización de vanguardia',
        'Soporte técnico 24/7',
        'Procesos certificados ISO'
      ]
    },
    pt: {
      pageTitle: 'Fale Conosco',
      heroTitle: 'Entre em Contato com a SEMHYS',
      heroSubtitle: 'Pronto para iniciar seu projeto de engenharia? Vamos conversar sobre como podemos ajudar a transformar suas ideias em realidade.',
      contactInfo: 'Informações de Contato',
      quickContact: 'Contato Rápido',
      office: 'Escritório',
      email: 'Email',
      phone: 'Telefone',
      hours: 'Horário Comercial',
      hoursText: 'Segunda - Sexta: 8:00 - 18:00',
      services: 'Nossos Serviços',
      whyChoose: 'Por Que Escolher a SEMHYS?',
      reasons: [
        '15+ anos de expertise em engenharia',
        'Equipe multilíngue (Inglês, Espanhol, Português)',
        'Experiência em projetos globais',
        'Soluções de automação de ponta',
        'Suporte técnico 24/7',
        'Processos certificados ISO'
      ]
    }
  };

  const t = texts[currentLanguage];

  const servicesList = [
    '🏭 Industrial Automation',
    '⚙️ Process Control', 
    '📊 SCADA Systems',
    '🔧 PLC Programming',
    '💻 HMI Development',
    '⚡ Electrical Design',
    '🔗 System Integration',
    '🎯 Technical Consulting'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-orange-500 via-teal-600 to-emerald-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <img 
                  src="/logo-semhys.png" 
                  alt="SEMHYS Logo" 
                  className="mr-3 w-12 h-12 rounded-full shadow-lg"
                />
                <h1 className="text-2xl font-bold">SEMHYS</h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="hover:text-orange-200 transition-colors">Home</Link>
              <a href="/#about" className="hover:text-orange-200 transition-colors">About</a>
              <a href="/#solutions" className="hover:text-orange-200 transition-colors">Solutions</a>
              <span className="text-orange-200 font-semibold">Contact</span>
              
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
                >
                  <span>{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
                  <span className="text-sm font-medium">
                    {languages.find(lang => lang.code === currentLanguage)?.name}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setCurrentLanguage(language.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span className="mr-3">{language.flag}</span>
                        {language.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Back Button */}
            <div className="lg:hidden">
              <Link href="/" className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 via-teal-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">{t.heroTitle}</h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
              {t.heroSubtitle}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form - Main Column */}
          <div className="lg:col-span-2">
            <ContactForm language={currentLanguage} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-orange-500 mr-2">📞</span>
                {t.contactInfo}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-teal-600 text-xl">🏢</span>
                  <div>
                    <p className="font-semibold text-gray-700">{t.office}</p>
                    <p className="text-gray-600">Global Engineering Services</p>
                    <p className="text-gray-600">Remote & On-site Solutions</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-orange-500 text-xl">📧</span>
                  <div>
                    <p className="font-semibold text-gray-700">{t.email}</p>
                    <a href="mailto:contact@semhys.com" className="text-teal-600 hover:text-teal-700">
                      contact@semhys.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-green-600 text-xl">📱</span>
                  <div>
                    <p className="font-semibold text-gray-700">{t.phone}</p>
                    <a href="tel:+1234567890" className="text-teal-600 hover:text-teal-700">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-orange-500 text-xl">🕒</span>
                  <div>
                    <p className="font-semibold text-gray-700">{t.hours}</p>
                    <p className="text-gray-600">{t.hoursText}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-teal-600 mr-2">⚙️</span>
                {t.services}
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {servicesList.map((service, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
                    <span className="text-lg">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Choose SEMHYS */}
            <div className="bg-gradient-to-br from-orange-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-2">⭐</span>
                {t.whyChoose}
              </h3>
              
              <div className="space-y-3">
                {t.reasons.map((reason, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-yellow-300">✓</span>
                    <span className="text-orange-100">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Engineering Vision?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of satisfied clients who trust SEMHYS for their automation and engineering needs.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="mailto:contact@semhys.com" className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold transition-colors">
              Email Us Now
            </a>
            <a href="tel:+1234567890" className="bg-teal-600 hover:bg-teal-700 px-6 py-3 rounded-lg font-semibold transition-colors">
              Call Today
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}