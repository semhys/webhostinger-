'use client';

import { useState } from 'react';

type Language = 'en' | 'es' | 'pt';

interface Content {
  en: {
    nav: {
      title: string;
      home: string;
      about: string;
      store: string;
      academy: string;
      blog: string;
      solutions: string;
      contact: string;
    };
    hero: {
      title: string;
      subtitle: string;
      cta: string;
      cta_secondary: string;
    };
    company: {
      tagline: string;
      description: string;
    };
    services: {
      title: string;
      subtitle: string;
    };
  };
  es: {
    nav: {
      title: string;
      home: string;
      about: string;
      store: string;
      academy: string;
      blog: string;
      solutions: string;
      contact: string;
    };
    hero: {
      title: string;
      subtitle: string;
      cta: string;
      cta_secondary: string;
    };
    company: {
      tagline: string;
      description: string;
    };
    services: {
      title: string;
      subtitle: string;
    };
  };
  pt: {
    nav: {
      title: string;
      home: string;
      about: string;
      store: string;
      academy: string;
      blog: string;
      solutions: string;
      contact: string;
    };
    hero: {
      title: string;
      subtitle: string;
      cta: string;
      cta_secondary: string;
    };
    company: {
      tagline: string;
      description: string;
    };
    services: {
      title: string;
      subtitle: string;
    };
  };
}

const content: Content = {
  en: {
    nav: {
      title: "SEMHYS - Engineering Excellence",
      home: "Home",
      about: "About Us",
      store: "Store",
      academy: "Academy",
      blog: "Insights",
      solutions: "Solutions",
      contact: "Contact"
    },
    hero: {
      title: "Engineering Excellence Redefined",
      subtitle: "Advanced solutions for high-performance engineering challenges",
      cta: "Discover Our Solutions",
      cta_secondary: "Learn More"
    },
    company: {
      tagline: "Innovation engineered",
      description: "Leading the future of engineering with cutting-edge technology and world-class expertise."
    },
    services: {
      title: "Our Solutions",
      subtitle: "Comprehensive engineering solutions for global challenges"
    }
  },
  es: {
    nav: {
      title: "SEMHYS - Excelencia en Ingeniería",
      home: "Inicio",
      about: "Nosotros",
      store: "Tienda",
      academy: "Academia",
      blog: "Perspectivas",
      solutions: "Soluciones",
      contact: "Contacto"
    },
    hero: {
      title: "Excelencia en Ingeniería Redefinida",
      subtitle: "Soluciones avanzadas para desafíos de ingeniería de alto rendimiento",
      cta: "Descubre Nuestras Soluciones",
      cta_secondary: "Saber Más"
    },
    company: {
      tagline: "Innovación diseñada",
      description: "Liderando el futuro de la ingeniería con tecnología de vanguardia y experiencia de clase mundial."
    },
    services: {
      title: "Nuestras Soluciones",
      subtitle: "Soluciones integrales de ingeniería para desafíos globales"
    }
  },
  pt: {
    nav: {
      title: "SEMHYS - Excelência em Engenharia",
      home: "Início",
      about: "Sobre Nós",
      store: "Loja",
      academy: "Academia",
      blog: "Perspectivas",
      solutions: "Soluções",
      contact: "Contato"
    },
    hero: {
      title: "Excelência em Engenharia Redefinida",
      subtitle: "Soluções avançadas para desafios de engenharia de alta performance",
      cta: "Descubra Nossas Soluções",
      cta_secondary: "Saiba Mais"
    },
    company: {
      tagline: "Inovação projetada",
      description: "Liderando o futuro da engenharia com tecnologia de ponta e expertise de classe mundial."
    },
    services: {
      title: "Nossas Soluções",
      subtitle: "Soluções abrangentes de engenharia para desafios globais"
    }
  }
};

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'pt' as Language, name: 'Português', flag: '🇧🇷' }
];

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const t = content[currentLang];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-orange-500 via-teal-600 to-emerald-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a 
                href="#home" 
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
              >
                <img 
                  src="/logo-semhys.png" 
                  alt="SEMHYS Logo" 
                  className="mr-3 w-12 h-12 rounded-full shadow-lg"
                />
                <h1 className="text-2xl font-bold">SEMHYS</h1>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#home" className="hover:text-blue-300 transition-colors">{t.nav.home}</a>
              <a href="#about" className="hover:text-blue-300 transition-colors">{t.nav.about}</a>
              <a href="#store" className="hover:text-blue-300 transition-colors">{t.nav.store}</a>
              <a href="#academy" className="hover:text-blue-300 transition-colors">{t.nav.academy}</a>
              <a href="#blog" className="hover:text-blue-300 transition-colors">{t.nav.blog}</a>
              <a href="#solutions" className="hover:text-blue-300 transition-colors">{t.nav.solutions}</a>
              <a href="/contact" className="hover:text-blue-300 transition-colors">{t.nav.contact}</a>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              >
                <span>{languages.find(lang => lang.code === currentLang)?.flag}</span>
                <span className="text-sm font-medium">
                  {languages.find(lang => lang.code === currentLang)?.name}
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
                        setCurrentLang(language.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        currentLang === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
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
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-teal-900 to-emerald-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">{t.hero.title.split(' ').slice(0, 2).join(' ')}</span>
              <span className="block bg-gradient-to-r from-orange-400 to-teal-400 bg-clip-text text-transparent">
                {t.hero.title.split(' ').slice(2).join(' ')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                {t.hero.cta}
              </button>
              <button className="border-2 border-orange-400/40 hover:border-orange-400/60 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 backdrop-blur-sm hover:bg-orange-500/10">
                {t.hero.cta_secondary}
              </button>
            </div>

            {/* Features Icons */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center border border-orange-400/30">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-orange-300 text-sm font-medium">Innovation</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-lg flex items-center justify-center border border-teal-400/30">
                  <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-teal-300 text-sm font-medium">Performance</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center border border-emerald-400/30">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <p className="text-emerald-300 text-sm font-medium">Global</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500/20 via-teal-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-orange-400/30">
                  <svg className="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-orange-300 text-sm font-medium">Excellence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t.company.tagline}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.company.description}
          </p>
        </div>
      </section>

      {/* Services Preview */}
      <section id="solutions" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.services.title}
            </h2>
            <p className="text-xl text-gray-600">
              {t.services.subtitle}
            </p>
          </div>
          
          {/* Services grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service cards placeholder */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-orange-500">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Engineering</h3>
                <p className="text-gray-600">Cutting-edge solutions for complex engineering challenges with SEMHYS innovation</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-teal-600">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Solutions</h3>
                <p className="text-gray-600">Technology-driven approaches to optimize performance and efficiency</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-emerald-600">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Impact</h3>
                <p className="text-gray-600">International engineering solutions with sustainable and scalable results</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-teal-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {currentLang === 'en' && 'Ready to Start Your Project?'}
            {currentLang === 'es' && '¿Listo para Comenzar tu Proyecto?'}
            {currentLang === 'pt' && 'Pronto para Iniciar seu Projeto?'}
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            {currentLang === 'en' && 'Let\'s discuss how SEMHYS can transform your engineering challenges into innovative solutions. Contact our expert team today.'}
            {currentLang === 'es' && 'Hablemos sobre cómo SEMHYS puede transformar tus desafíos de ingeniería en soluciones innovadoras. Contacta a nuestro equipo experto hoy.'}
            {currentLang === 'pt' && 'Vamos discutir como a SEMHYS pode transformar seus desafios de engenharia em soluções inovadoras. Entre em contato com nossa equipe especializada hoje.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/contact" 
              className="bg-white text-orange-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {currentLang === 'en' && '🚀 Get Started Now'}
              {currentLang === 'es' && '🚀 Comenzar Ahora'}
              {currentLang === 'pt' && '🚀 Começar Agora'}
            </a>
            <a 
              href="mailto:contact@semhys.com" 
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-orange-600 transition-all duration-200 transform hover:scale-105"
            >
              {currentLang === 'en' && '📧 Email Us'}
              {currentLang === 'es' && '📧 Contáctanos'}
              {currentLang === 'pt' && '📧 Envie-nos Email'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}