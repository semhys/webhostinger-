'use client';

import { useEffect, useState } from 'react';

type Language = 'en' | 'es' | 'pt';

interface Content {
  [key: string]: {
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
  const [currentLang, setCurrentLang] = useState<Language | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ Establece idioma solo en cliente para evitar “hydration mismatch”
  useEffect(() => {
    const savedLang =
      localStorage.getItem('lang') ||
      navigator.language.slice(0, 2) ||
      'en';
    if (['en', 'es', 'pt'].includes(savedLang)) {
      setCurrentLang(savedLang as Language);
    } else {
      setCurrentLang('en');
    }
  }, []);

  if (!currentLang) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

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
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <a href="#home" className="text-sm lg:text-base hover:text-blue-300 transition-colors">{t.nav.home}</a>
              <a href="#about" className="text-sm lg:text-base hover:text-blue-300 transition-colors">{t.nav.about}</a>
              <a href="#store" className="text-sm lg:text-base hover:text-blue-300 transition-colors">{t.nav.store}</a>
              <a href="#academy" className="text-sm lg:text-base hover:text-blue-300 transition-colors">{t.nav.academy}</a>
              <a href="#blog" className="text-sm lg:text-base hover:text-blue-300 transition-colors">{t.nav.blog}</a>
              <a href="#solutions" className="text-sm lg:text-base hover:text-blue-300 transition-colors">{t.nav.solutions}</a>
              <a href="/contact" className="text-sm lg:text-base hover:text-blue-300 transition-colors">{t.nav.contact}</a>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              >
                <span>{languages.find(l => l.code === currentLang)?.flag}</span>
                <span className="text-sm font-medium">
                  {languages.find(l => l.code === currentLang)?.name}
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
                        localStorage.setItem('lang', language.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${currentLang === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              <span className="block">{t.hero.title.split(' ').slice(0, 2).join(' ')}</span>
              <span className="block bg-gradient-to-r from-orange-400 to-teal-400 bg-clip-text text-transparent">
                {t.hero.title.split(' ').slice(2).join(' ')}
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-300 mb-6 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-3">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base">
                {t.hero.cta}
              </button>
              <button className="w-full sm:w-auto border-2 border-orange-400/40 hover:border-orange-400/60 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-300 backdrop-blur-sm hover:bg-orange-500/10 text-sm sm:text-base">
                {t.hero.cta_secondary}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-orange-500 via-teal-600 to-emerald-600 text-white px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            {currentLang === 'en' && 'Ready to Start Your Project?'}
            {currentLang === 'es' && '¿Listo para Comenzar tu Proyecto?'}
            {currentLang === 'pt' && 'Pronto para Iniciar seu Projeto?'}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-orange-100 mb-6 sm:mb-8 max-w-3xl mx-auto">
            {currentLang === 'en' && "Let's discuss how SEMHYS can transform your engineering challenges into innovative solutions. Contact our expert team today."}
            {currentLang === 'es' && 'Hablemos sobre cómo SEMHYS puede transformar tus desafíos de ingeniería en soluciones innovadoras. Contacta a nuestro equipo experto hoy.'}
            {currentLang === 'pt' && 'Vamos discutir como a SEMHYS pode transformar seus desafios de engenharia em soluções inovadoras. Entre em contato com nossa equipe especializada hoje.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <a
              href="/contact"
              className="w-full sm:w-auto bg-white text-orange-600 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              {currentLang === 'en' && '🚀 Get Started Now'}
              {currentLang === 'es' && '🚀 Comenzar Ahora'}
              {currentLang === 'pt' && '🚀 Começar Agora'}
            </a>
            <a
              href="mailto:contact@semhys.com"
              className="w-full sm:w-auto border-2 border-white text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-white hover:text-orange-600 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
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
