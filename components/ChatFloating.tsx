'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatFloatingProps {
  language?: 'en' | 'es' | 'pt';
}

const ChatFloating = ({ language = 'en' }: ChatFloatingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const texts = {
    en: {
      title: 'SEMHYS Technical Support',
      subtitle: 'Engineering Assistance',
      placeholder: 'Type your question...',
      welcome: '👋 Hello! How can we help?'
    },
    es: {
      title: 'Soporte Técnico SEMHYS',
      subtitle: 'Asistencia en Ingeniería',
      placeholder: 'Escribe tu pregunta...',
      welcome: '👋 ¡Hola! ¿Cómo podemos ayudarte?'
    },
    pt: {
      title: 'Suporte Técnico SEMHYS',
      subtitle: 'Assistência em Engenharia',
      placeholder: 'Digite sua pergunta...',
      welcome: '👋 Olá! Como podemos ajudá-lo?'
    }
  };

  const t = texts[language];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

    try {
      // Enviar DIRECTAMENTE a N8N webhook - sin procesamiento local
      const n8nWebhookUrl = 'https://semhys.app.n8n.cloud/webhook/a1a353bf-01ee-4c68-b7fe-7143bad7bd3d/chat';
      
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: userMessage.content,
          language: language,
          timestamp: userMessage.timestamp.toISOString(),
          sessionId: `chat-${Date.now()}`,
          source: 'semhys-chat-flotante'
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Mostrar TODO lo que devuelve N8N tal cual
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: result.message || JSON.stringify(result),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(`N8N HTTP ${response.status}`);
      }

    } catch (error) {
      console.error('N8N error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
          <div className="w-6 sm:w-8 h-6 sm:h-8 bg-white rounded-full p-1 flex items-center justify-center flex-shrink-0">
            <span className="text-orange-500 font-bold text-sm">S</span>
          </div>
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

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Procesando...</span>
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
      `}</style>
    </div>
  );
};

export default ChatFloating;