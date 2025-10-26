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
      // Enviar a n8n para clasificación y respuesta
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          language: language,
          timestamp: userMessage.timestamp.toISOString(),
          sessionId: `chat-${Date.now()}`
        })
      });

      const result = await response.json();

      if (result.success) {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: result.response,
          timestamp: new Date(),
          category: result.category || 'general'
        };

        // Simular typing delay
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, botMessage]);
          setIsLoading(false);
        }, 1500);

      } else {
        throw new Error(result.error || 'Error en el chat');
      }

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