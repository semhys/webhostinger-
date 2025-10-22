'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AgentStats {
  status: 'online' | 'offline' | 'connecting';
  elasticsearch_connected: boolean;
  total_documents: number;
  index_size: number;
  agent_version: string;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  score: number;
  relevance: 'high' | 'medium' | 'low';
}

const AdminPanel = () => {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'upload' | 'research'>('dashboard');
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadResults, setUploadResults] = useState<any[]>([]);

  // Verificar estado del agente
  const checkAgentStatus = async () => {
    try {
      const response = await fetch('/api/agent');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error checking agent status:', error);
      setStats({
        status: 'offline',
        elasticsearch_connected: false,
        total_documents: 0,
        index_size: 0,
        agent_version: '1.0.0'
      });
    }
  };

  // Realizar búsqueda
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          type: 'all',
          limit: 20
        })
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        console.error('Search error:', data.error);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar upload de archivos
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsLoading(true);
    setUploadResults([]);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadResults(result.results || []);
        checkAgentStatus();
      } else {
        console.error('Upload error:', result.error);
      }

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAgentStatus();
    const interval = setInterval(checkAgentStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      online: 'bg-green-100 text-green-800 border-green-200',
      offline: 'bg-red-100 text-red-800 border-red-200',
      connecting: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[status as keyof typeof colors]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-teal-600 shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link 
                href="/" 
                className="mr-4 hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo-semhys.png" 
                  alt="SEMHYS Logo" 
                  className="w-12 h-12 bg-white rounded-full p-1"
                />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  SEMHYS Agent Control Panel
                </h1>
                <p className="text-orange-100">Sistema de Gestión del Agente Interno</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {stats && <StatusBadge status={stats.status} />}
              <button 
                onClick={checkAgentStatus}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Actualizar Estado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'research', label: 'Investigación Técnica', icon: '🔬' },
              { id: 'search', label: 'Búsqueda', icon: '🔍' },
              { id: 'upload', label: 'Subir Documentos', icon: '📤' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Cards */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🔌</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Estado de Conexión
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.elasticsearch_connected ? 'Conectado' : 'Desconectado'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📄</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Documentos Indexados
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.total_documents?.toLocaleString() || '0'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">💾</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tamaño del Índice
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.index_size ? `${(stats.index_size / 1024 / 1024).toFixed(2)} MB` : '0 MB'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Info */}
            <div className="md:col-span-3 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Información del Agente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Versión:</span>
                    <span className="ml-2 text-sm font-medium">{stats?.agent_version || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Estado:</span>
                    <span className="ml-2">{stats && <StatusBadge status={stats.status} />}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'research' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🔬 Agente de Investigación SEMHYS
              </h2>
              <p className="text-gray-600 mb-6">
                Accede al sistema completo de investigación técnica especializada
              </p>
              <a
                href="/research"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-teal-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 Abrir Agente de Investigación
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">🎯 Capacidades del Agente</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Análisis de 22,210 documentos técnicos</li>
                  <li>• Investigación especializada por equipos</li>
                  <li>• Búsqueda semántica avanzada</li>
                  <li>• Análisis de rendimiento y eficiencia</li>
                  <li>• Comparativas técnicas detalladas</li>
                  <li>• Historial de proyectos similares</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">🔧 Tipos de Consultas</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• "bombas centrífugas eficiencia energética"</li>
                  <li>• "sistema presión RCI Tigo análisis"</li>
                  <li>• "mantenimiento preventivo hidráulicos"</li>
                  <li>• "especificaciones válvulas control"</li>
                  <li>• "diagnóstico fallas automatización"</li>
                  <li>• "comparativo equipos Servientrega"</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Búsqueda en Base de Conocimiento
              </h3>
              
              <div className="flex space-x-4 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar documentos técnicos..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{result.title}</h4>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          result.relevance === 'high' ? 'bg-green-100 text-green-800' :
                          result.relevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.relevance}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {result.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{result.content}</p>
                    <div className="text-xs text-gray-500">
                      Score: {result.score.toFixed(3)}
                    </div>
                  </div>
                ))}

                {searchResults.length === 0 && searchQuery && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron resultados para "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Subir Documentos SEMHYS
                </h3>
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors"
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    handleFileUpload(files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(Array.from(e.target.files));
                      }
                    }}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-gray-600 mb-2">
                      Arrastra archivos aquí o click para seleccionar
                    </p>
                    <p className="text-sm text-gray-400">
                      Soporta: PDF, Word, Excel, Imágenes, Videos, Text
                    </p>
                    <div className="mt-4">
                      <span className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                        Seleccionar Archivos
                      </span>
                    </div>
                  </label>
                </div>

                {/* Upload Progress */}
                {isLoading && (
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{width: '45%'}}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Procesando documentos...</p>
                  </div>
                )}

                {/* Upload Results */}
                {uploadResults.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Resultados del Upload:</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {uploadResults.map((result, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          result.status === 'success' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{result.filename}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              result.status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.status === 'success' ? '✅ Éxito' : '❌ Error'}
                            </span>
                          </div>
                          {result.error && (
                            <p className="text-xs text-red-600 mt-1">{result.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Instrucciones de Upload:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Archivos individuales:</strong> Usa el area de drag & drop arriba</li>
                <li>• <strong>Carpetas completas:</strong> Para tus 21GB, usa el script masivo (ver abajo)</li>
                <li>• <strong>Tipos soportados:</strong> PDF, Word, Excel, TXT, Imágenes, Videos</li>
                <li>• <strong>Categorización automática:</strong> Los archivos se clasifican por contenido</li>
              </ul>
            </div>

            {/* Bulk Upload Script */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">🚀 Script para Upload Masivo (21GB):</h4>
              <div className="bg-black text-green-400 p-3 rounded text-sm font-mono">
                <div>cd c:\Users\ASUS\semhys</div>
                <div>node scripts\bulk-upload.js "C:\ruta\a\tus\21GB\documentos"</div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Este script procesará todos los archivos de la carpeta automáticamente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;