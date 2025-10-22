'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ResearchResult {
  id: string;
  rank: number;
  title: string;
  content_preview: string;
  highlighted_content: string[];
  document_type: string;
  category: string;
  equipment_type?: string;
  filename: string;
  relevance_score: number;
  relevance_level: 'high' | 'medium' | 'low';
}

interface AIAnalysis {
  enabled: boolean;
  analysis: string;
  model_used: string;
  cost_estimate: number;
  tokens_used: {input: number, output: number};
  confidence_score: number;
  suggestions: string[];
}

interface ResearchResponse {
  success: boolean;
  results: ResearchResult[];
  total_found: number;
  research_summary: string;
  analysis_type: string;
  suggestions: string[];
  search_time_ms: number;
  equipment_breakdown: Array<{key: string, doc_count: number}>;
  ai_analysis?: AIAnalysis;
}

const ResearchAgent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [summary, setSummary] = useState('');
  const [totalFound, setTotalFound] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [analysisType, setAnalysisType] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [equipmentBreakdown, setEquipmentBreakdown] = useState<Array<{key: string, doc_count: number}>>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const predefinedQueries = [
    'bombas centrífugas eficiencia energética',
    'sistema presión RCI Tigo',
    'mantenimiento preventivo equipos hidráulicos', 
    'análisis caudal volumétrico proyectos',
    'especificaciones técnicas válvulas control',
    'diagnóstico fallas sistemas automatización',
    'rendimiento equipos Servientrega',
    'comparativo bombas multietapa'
  ];

  const performResearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSummary('');
    setResults([]);

    try {
      console.log('🔬 Iniciando investigación:', query);
      
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query.trim(),
          research_focus: 'internal_analysis'
        }),
      });

      const data: ResearchResponse = await response.json();
      console.log('📊 Resultados de investigación:', data);

      if (data.success) {
        setResults(data.results);
        setTotalFound(data.total_found);
        setSummary(data.research_summary);
        setAnalysisType(data.analysis_type);
        setSuggestions(data.suggestions);
        setSearchTime(data.search_time_ms);
        setEquipmentBreakdown(data.equipment_breakdown || []);
        
        // 🤖 Configurar análisis de IA
        if (data.ai_analysis) {
          setAiAnalysis(data.ai_analysis);
        }
      } else {
        setSummary(`❌ Error en la investigación`);
      }

    } catch (error) {
      console.error('Error de investigación:', error);
      setSummary('❌ Error de conexión con el agente de investigación SEMHYS');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performResearch();
    }
  };

  const RelevanceBadge = ({ level }: { level: string }) => {
    const colors = {
      high: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    const labels = {
      high: 'Alta Relevancia',
      medium: 'Media Relevancia', 
      low: 'Baja Relevancia'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${colors[level as keyof typeof colors]}`}>
        {labels[level as keyof typeof labels]}
      </span>
    );
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-teal-600 text-white p-6 rounded-lg mb-6 flex items-center justify-between">
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
            <h1 className="text-3xl font-bold mb-2">🔬 Agente de Investigación SEMHYS</h1>
            <p className="text-orange-100">Análisis técnico especializado sobre 22,210 documentos de ingeniería</p>
          </div>
        </div>
        <Link 
          href="/" 
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          ← Inicio
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-3 mb-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Consulta técnica especializada (ej: bombas centrífugas eficiencia, sistema RCI presión...)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
            disabled={isSearching}
          />
          <button
            onClick={performResearch}
            disabled={isSearching || !query.trim()}
            className="bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSearching ? '🔍 Investigando...' : '🔬 Investigar'}
          </button>
        </div>

        {/* Consultas predefinidas */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">💡 Consultas especializadas sugeridas:</p>
          <div className="flex flex-wrap gap-2">
            {predefinedQueries.slice(0, 4).map((predefined, index) => (
              <button
                key={index}
                onClick={() => setQuery(predefined)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-orange-100 text-gray-700 rounded-full transition-colors"
              >
                {predefined}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Análisis con IA ChatGPT */}
      {aiAnalysis && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🤖</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Análisis con IA ChatGPT</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>🧠 Modelo: {aiAnalysis.model_used}</span>
                  <span>💰 Costo: ${aiAnalysis.cost_estimate.toFixed(4)}</span>
                  <span>⚡ Tokens: {aiAnalysis.tokens_used.input + aiAnalysis.tokens_used.output}</span>
                  <span>🎯 Confianza: {(aiAnalysis.confidence_score * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-white p-4 rounded border">
              {aiAnalysis.analysis}
            </div>
          </div>
        </div>
      )}

      {/* Resumen de investigación */}
      {summary && !aiAnalysis?.enabled && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Resumen de Investigación</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
              {summary}
            </pre>
          </div>
          {searchTime > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              ⚡ Tiempo de análisis: {searchTime}ms
            </div>
          )}
        </div>
      )}

      {/* Estadísticas de equipos */}
      {equipmentBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ Distribución por Tipos de Equipos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {equipmentBreakdown.slice(0, 8).map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-orange-50 to-teal-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-800">{item.key}</div>
                <div className="text-2xl font-bold text-orange-600">{item.doc_count}</div>
                <div className="text-xs text-gray-500">documentos</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados de investigación */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            📑 Documentos Analizados ({totalFound} encontrados)
          </h2>
          
          {results.map((result) => (
            <div key={result.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              {/* Header del documento */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                      #{result.rank}
                    </span>
                    <RelevanceBadge level={result.relevance_level} />
                    <span className="text-xs text-gray-500">
                      Score: {result.relevance_score.toFixed(2)}
                    </span>
                  </div>
                  <h3 
                    className="text-lg font-bold text-gray-800 mb-1"
                    dangerouslySetInnerHTML={{ __html: result.title }}
                  />
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📁 {result.filename}</span>
                    <span>📄 {result.document_type.toUpperCase()}</span>
                    {result.equipment_type && (
                      <span>⚙️ {result.equipment_type}</span>
                    )}
                    <span>🏷️ {result.category}</span>
                  </div>
                </div>
              </div>

              {/* Preview del contenido */}
              <div className="mb-4">
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {result.content_preview}
                </p>
                
                {/* Contenido destacado */}
                {result.highlighted_content.length > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">🔍 Fragmentos relevantes:</h4>
                    {result.highlighted_content.slice(0, 3).map((highlight, index) => (
                      <div 
                        key={index} 
                        className="text-sm text-gray-700 mb-2 p-2 bg-white rounded border-l-2 border-orange-300"
                        dangerouslySetInnerHTML={{ __html: `...${highlight}...` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sugerencias de investigación */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Investigación Relacionada</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="text-sm text-gray-700">
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!isSearching && results.length === 0 && !summary && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔬</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Agente de Investigación SEMHYS Listo
          </h3>
          <p className="text-gray-500 mb-6">
            Realiza consultas técnicas especializadas sobre tu base de datos de 22,210 documentos
          </p>
          <div className="max-w-2xl mx-auto text-left">
            <p className="text-sm text-gray-600 mb-3">🎯 Tipos de investigación disponibles:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Equipos:</strong> Análisis de bombas, motores, válvulas, instrumentación</li>
              <li>• <strong>Rendimiento:</strong> Eficiencia energética, optimización de procesos</li>
              <li>• <strong>Mantenimiento:</strong> Diagnósticos, planes de mantenimiento predictivo</li>
              <li>• <strong>Especificaciones:</strong> Datasheets, parámetros técnicos, normas</li>
              <li>• <strong>Comparativo:</strong> Análisis entre diferentes sistemas y soluciones</li>
              <li>• <strong>Historial:</strong> Proyectos anteriores, lecciones aprendidas</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchAgent;