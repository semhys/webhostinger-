'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  category?: 'general' | 'technical' | 'routing';
}

interface ChatFloatingProps {
  language?: 'en' | 'es' | 'pt';
}

const ChatFloating = ({ language = 'en' }: ChatFloatingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      title: 'SEMHYS Technical Support',
      subtitle: 'Engineering Assistance',
      placeholder: 'Type your engineering question...',
      send: 'Send',
      minimize: 'Minimize',
      welcome: '👋 Hello! I\'m SEMHYS AI Assistant. I can help you with:',
      options: [
        '🔧 Technical specifications',
        '⚙️ Engineering solutions', 
        '📊 Project consultations',
        '🛠️ Industrial automation'
      ],
      typing: 'SEMHYS AI is thinking...'
    },
    es: {
      title: 'Soporte Técnico SEMHYS',
      subtitle: 'Asistencia en Ingeniería',
      placeholder: 'Escribe tu consulta de ingeniería...',
      send: 'Enviar',
      minimize: 'Minimizar',
      welcome: '👋 ¡Hola! Soy el Asistente IA de SEMHYS. Puedo ayudarte con:',
      options: [
        '🔧 Especificaciones técnicas',
        '⚙️ Soluciones de ingeniería',
        '📊 Consultas de proyectos', 
        '🛠️ Automatización industrial'
      ],
      typing: 'IA SEMHYS está pensando...'
    },
    pt: {
      title: 'Suporte Técnico SEMHYS',
      subtitle: 'Assistência em Engenharia',
      placeholder: 'Digite sua consulta de engenharia...',
      send: 'Enviar',
      minimize: 'Minimizar',
      welcome: '👋 Olá! Sou o Assistente IA da SEMHYS. Posso ajudá-lo com:',
      options: [
        '🔧 Especificações técnicas',
        '⚙️ Soluções de engenharia',
        '📊 Consultas de projetos',
        '🛠️ Automação industrial'
      ],
      typing: 'IA SEMHYS está pensando...'
    }
  };

  const t = texts[language];

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        type: 'bot',
        content: t.welcome,
        timestamp: new Date(),
        category: 'general'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, t.welcome]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Funciones de procesamiento de mensajes
  const detectLanguage = (text: string): 'en' | 'es' | 'pt' => {
    const lower = text.toLowerCase();
    if (/\b(olá|oi|obrigado|está|você|temos|projeto|como)\b/.test(lower)) return 'pt';
    if (/\b(hello|hi|thank|please|what|how|design|system|water)\b/.test(lower)) return 'en';
    return 'es';
  };

  const extractClientName = (text: string): string | null => {
    const match = text.match(/\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\b/);
    const commonWords = ['hola', 'buenas', 'gracias', 'hello', 'hi', 'oi', 'obrigado', 'please', 'por', 'favor'];
    return match && !commonWords.includes(match[1].toLowerCase()) ? match[1] : null;
  };

  const classifyQuery = (text: string): { category: 'technical' | 'commercial' | 'general'; priority: string } => {
    const lower = text.toLowerCase();
    const technicalKeywords = ['diseño', 'design', 'projeto', 'cálculo', 'calculation', 'especificación', 'specification', 'tubería', 'pipe', 'tubulação', 'bomba', 'pump', 'sistemas', 'systems', 'hidráulica', 'hydraulics', 'tratamiento', 'treatment', 'agua', 'water', 'flujo', 'flow', 'presión', 'pressure', 'proyecto', 'project'];
    const commercialKeywords = ['precio', 'price', 'preço', 'costo', 'cost', 'custo', 'presupuesto', 'budget', 'orçamento', 'contrato', 'contract', 'propuesta', 'proposal', 'servicios', 'services', 'serviços', 'consultoría', 'consulting', 'consultoria', 'paquete', 'package'];

    let technicalScore = 0;
    let commercialScore = 0;

    technicalKeywords.forEach(kw => {
      if (lower.includes(kw)) technicalScore++;
    });
    commercialKeywords.forEach(kw => {
      if (lower.includes(kw)) commercialScore++;
    });

    if (technicalScore > commercialScore && technicalScore > 0) {
      return { category: 'technical', priority: 'high' };
    } else if (commercialScore > technicalScore && commercialScore > 0) {
      return { category: 'commercial', priority: 'medium' };
    }
    return { category: 'general', priority: 'medium' };
  };

  const generateResponse = (message: string, lang: 'en' | 'es' | 'pt', clientName: string | null, category: 'technical' | 'commercial' | 'general'): string => {
    const responses = {
      es: {
        technical: clientName 
          ? `¡Hola ${clientName}! 👋\n\nHe detectado que es una **consulta técnica**. Nuestro equipo de ingenieros especializados en sistemas hidráulicos revisará tu solicitud y te contactará en las próximas 2-4 horas.\n\n🔧 **Áreas de especialidad:**\n• Diseño de sistemas hidráulicos\n• Cálculos de flujo y presión\n• Especificaciones de equipamiento\n• Tratamiento y depuración de agua`
          : `¡Hola! 👋\n\nDetecté que es una **consulta técnica**. Nuestro equipo de ingeniería está revisando tu solicitud.`,
        commercial: clientName
          ? `¡Hola ${clientName}! 💼\n\nDetecté que es una **consulta comercial**. Nuestro equipo de ventas te contactará dentro de 24 horas con información sobre servicios, presupuestos y disponibilidad.\n\n📊 **Información que podemos proporcionar:**\n• Paquetes de servicios\n• Presupuestos personalizados\n• Planes de implementación`
          : `¡Hola! 💼\n\nDetecté que es una **consulta comercial**. Nuestro equipo de ventas te contactará pronto.`,
        general: clientName
          ? `¡Hola ${clientName}! 👋\n\nGracias por contactar a SEMHYS LLC. Tu consulta ha sido registrada y nuestro equipo te responderá pronto.`
          : `¡Hola! 👋\n\nGracias por contactar a SEMHYS LLC. ¿En qué podemos ayudarte?`
      },
      en: {
        technical: clientName
          ? `Hello ${clientName}! 👋\n\nI've detected this is a **technical inquiry**. Our specialized engineering team will review your request and contact you within 2-4 hours.\n\n🔧 **Our expertise includes:**\n• Hydraulic systems design\n• Flow and pressure calculations\n• Equipment specifications\n• Water treatment and purification`
          : `Hello! 👋\n\nI've detected this is a **technical inquiry**. Our engineering team is reviewing your request.`,
        commercial: clientName
          ? `Hello ${clientName}! 💼\n\nI've detected this is a **commercial inquiry**. Our sales team will contact you within 24 hours with information about services, quotes, and availability.\n\n📊 **What we can provide:**\n• Service packages\n• Custom quotes\n• Implementation plans`
          : `Hello! 💼\n\nI've detected this is a **commercial inquiry**. Our sales team will contact you soon.`,
        general: clientName
          ? `Hello ${clientName}! 👋\n\nThank you for contacting SEMHYS LLC. Your inquiry has been recorded and our team will respond soon.`
          : `Hello! 👋\n\nThank you for contacting SEMHYS LLC. How can we assist you?`
      },
      pt: {
        technical: clientName
          ? `Olá ${clientName}! 👋\n\nDetectei que é uma **consulta técnica**. Nossa equipe especializada em engenharia de sistemas hidráulicos revisará sua solicitação e entrará em contato em 2-4 horas.\n\n🔧 **Nossas especialidades:**\n• Design de sistemas hidráulicos\n• Cálculos de fluxo e pressão\n• Especificações de equipamento\n• Tratamento e purificação de água`
          : `Olá! 👋\n\nDetectei que é uma **consulta técnica**. Nossa equipe de engenharia está revisando sua solicitação.`,
        commercial: clientName
          ? `Olá ${clientName}! 💼\n\nDetectei que é uma **consulta comercial**. Nosso equipe de vendas entrará em contato em 24 horas com informações sobre serviços, orçamentos e disponibilidade.\n\n📊 **Informações que podemos fornecer:**\n• Pacotes de serviços\n• Orçamentos personalizados\n• Planos de implementação`
          : `Olá! 💼\n\nDetectei que é uma **consulta comercial**. Nosso equipe de vendas entrará em contato em breve.`,
        general: clientName
          ? `Olá ${clientName}! 👋\n\nObrigado por entrar em contato com a SEMHYS LLC. Sua consulta foi registrada e nossa equipe responderá em breve.`
          : `Olá! 👋\n\nObrigado por entrar em contato com a SEMHYS LLC. Como podemos ajudá-lo?`
      }
    };

    return responses[lang]?.[category] || responses.es.general;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Detectar idioma, nombre y clasificar
      const detectedLang = detectLanguage(userMessage.content) as 'en' | 'es' | 'pt';
      const clientName = extractClientName(userMessage.content);
      const classification = classifyQuery(userMessage.content);

      // Generar respuesta personalizada
      const botResponse = generateResponse(
        userMessage.content,
        detectedLang,
        clientName,
        classification.category
      );

      // Enviar a N8N si está configurado
      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.content,
            language: detectedLang,
            timestamp: userMessage.timestamp.toISOString(),
            sessionId: `chat-${Date.now()}`,
            clientName: clientName,
            category: classification.category
          })
        });
      } catch {
        console.log('N8N webhook not available, using local response');
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        category: classification.category
      };

      // Simular typing delay
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: language === 'es' 
          ? 'Lo siento, hubo un error. Por favor intenta de nuevo.' 
          : 'Sorry, there was an error. Please try again.',
        timestamp: new Date(),
        category: 'general'
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickOption = (option: string) => {
    setInputValue(option);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
        >
          <div className="relative">
            <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {t.title}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-full sm:w-96 max-w-[calc(100vw-2rem)] h-[calc(100vh-8rem)] sm:h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-teal-600 text-white p-3 sm:p-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <img 
            src="/logo-semhys.png" 
            alt="SEMHYS Logo" 
            className="w-6 sm:w-8 h-6 sm:h-8 bg-white rounded-full p-0.5 flex-shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-bold text-base sm:text-lg truncate">{t.title}</h3>
            <p className="text-orange-100 text-xs sm:text-sm truncate">{t.subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-orange-200 transition-colors flex-shrink-0 ml-2"
          title={t.minimize}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-teal-600 text-white'
                  : message.type === 'system'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-xs sm:text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Quick Options */}
        {messages.length === 1 && (
          <div className="space-y-2">
            {t.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuickOption(option)}
                className="w-full text-left p-2 sm:p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors text-xs sm:text-sm text-gray-700"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="typing-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
                <span className="text-xs text-gray-500">{t.typing}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2 sm:gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 sm:p-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex-shrink-0"
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* CSS for typing animation */}
      <style jsx>{`
        .typing-dots {
          display: flex;
          align-items: center;
          space-x: 2px;
        }
        .dot {
          width: 6px;
          height: 6px;
          background-color: #6b7280;
          border-radius: 50%;
          margin-right: 4px;
          animation: typing 1.4s infinite ease-in-out;
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatFloating;