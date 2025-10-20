import { NextRequest, NextResponse } from 'next/server';
import { elasticsearchService } from '@/lib/elasticsearch';

interface AgentSearchRequest {
  query: string;
  type?: 'technical' | 'general' | 'all';
  equipment?: string;
  filters?: Record<string, string>;
  limit?: number;
}

interface AgentSearchResponse {
  success: boolean;
  results?: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
    score: number;
    source?: string;
    relevance: 'high' | 'medium' | 'low';
  }>;
  total_found?: number;
  search_time_ms?: number;
  suggestions?: string[];
  error?: string;
}

// Palabras clave técnicas para mejorar búsquedas
const TECHNICAL_KEYWORDS = {
  bombas: ['bomba', 'pump', 'impeller', 'volute', 'casing'],
  motores: ['motor', 'engine', 'rotor', 'stator', 'winding'],
  valvulas: ['válvula', 'valve', 'actuator', 'stem', 'seat'],
  sensores: ['sensor', 'transmitter', 'probe', 'detector'],
  automatizacion: ['plc', 'scada', 'hmi', 'control', 'automation']
};

function enhanceQuery(query: string): string {
  let enhancedQuery = query.toLowerCase();
  
  // Expandir consultas con sinónimos técnicos
  Object.entries(TECHNICAL_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (enhancedQuery.includes(keyword)) {
        enhancedQuery += ` OR ${keywords.join(' OR ')}`;
      }
    });
  });
  
  return enhancedQuery;
}

function calculateRelevance(score: number, maxScore: number): 'high' | 'medium' | 'low' {
  const normalizedScore = score / maxScore;
  if (normalizedScore > 0.7) return 'high';
  if (normalizedScore > 0.4) return 'medium';
  return 'low';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: AgentSearchRequest = await request.json();
    const { query, type = 'all', equipment, filters = {}, limit = 10 } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query debe tener al menos 2 caracteres'
      }, { status: 400 });
    }

    // Verificar conexión a Elasticsearch
    const isConnected = await elasticsearchService.checkConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Error de conexión con la base de datos'
      }, { status: 503 });
    }

    const startTime = Date.now();

    // Mejorar la consulta con sinónimos
    const enhancedQuery = enhanceQuery(query);

    // Configurar filtros según el tipo
    const searchFilters: Record<string, string> = { ...filters };
    if (type === 'technical') {
      searchFilters.category = 'technical';
    }
    if (equipment) {
      searchFilters['technical_specs.equipment_type'] = equipment;
    }

    // Realizar búsqueda
    const searchResults = type === 'technical' 
      ? await elasticsearchService.searchTechnicalDocs(enhancedQuery, equipment)
      : await elasticsearchService.searchDocuments(enhancedQuery, {
          filters: searchFilters,
          size: limit
        });

    const searchTime = Date.now() - startTime;

    // Calcular relevancia
    const maxScore = Math.max(...searchResults.map(r => r.score));
    const processedResults = searchResults.map(result => ({
      ...result,
      relevance: calculateRelevance(result.score, maxScore)
    }));

    // Generar sugerencias si hay pocos resultados
    const suggestions: string[] = [];
    if (searchResults.length < 3) {
      suggestions.push(
        'Intenta usar términos más generales',
        'Verifica la ortografía',
        'Usa sinónimos técnicos'
      );
    }

    const response: AgentSearchResponse = {
      success: true,
      results: processedResults,
      total_found: searchResults.length,
      search_time_ms: searchTime,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Agent search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Endpoint para verificar estado del agente
    const isConnected = await elasticsearchService.checkConnection();
    const stats = await elasticsearchService.getIndexStats();

    return NextResponse.json({
      success: true,
      status: isConnected ? 'online' : 'offline',
      elasticsearch_connected: isConnected,
      index_stats: stats,
      agent_version: '1.0.0',
      capabilities: [
        'technical_search',
        'document_indexing',
        'semantic_search',
        'equipment_filtering'
      ]
    });

  } catch (error) {
    console.error('Agent status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error verificando estado del agente'
    }, { status: 500 });
  }
}