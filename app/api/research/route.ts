import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@elastic/elasticsearch';
import { analyzeWithAI, getAIUsageStats, validateOpenAIKey } from '@/lib/openai-service';

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE!,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY!
  }
});

// Configuración especializada para investigación técnica interna
const RESEARCH_CONFIG = {
  // Términos técnicos especializados con pesos
  technical_terms: {
    'sistemas hidráulicos': 3.0,
    'bombas centrífugas': 2.8,
    'presión diferencial': 2.6,
    'caudal volumétrico': 2.4,
    'eficiencia energética': 2.2,
    'automatización industrial': 2.0,
    'válvulas de control': 1.8,
    'instrumentación': 1.6,
    'mantenimiento predictivo': 1.4
  },
  
  // Categorías de documentos técnicos
  document_categories: [
    'hydraulic_systems', 'pump_analysis', 'flow_measurement',
    'pressure_control', 'automation', 'electrical_systems',
    'maintenance_reports', 'technical_specifications'
  ],
  
  // Tipos de análisis disponibles
  analysis_types: {
    'equipos': 'Análisis de equipos y componentes',
    'rendimiento': 'Análisis de rendimiento y eficiencia', 
    'mantenimiento': 'Análisis de mantenimiento y diagnóstico',
    'especificaciones': 'Búsqueda de especificaciones técnicas',
    'comparativo': 'Análisis comparativo entre sistemas',
    'historial': 'Historial de proyectos similares'
  }
};

// Función para análisis inteligente de la consulta
function analyzeResearchQuery(query: string) {
  const lowercaseQuery = query.toLowerCase();
  
  // Detectar tipo de investigación
  let research_type = 'general';
  if (lowercaseQuery.includes('bomba') || lowercaseQuery.includes('pump')) research_type = 'equipos';
  if (lowercaseQuery.includes('eficiencia') || lowercaseQuery.includes('rendimiento')) research_type = 'rendimiento';
  if (lowercaseQuery.includes('mantenimiento') || lowercaseQuery.includes('diagnóstico')) research_type = 'mantenimiento';
  if (lowercaseQuery.includes('especificación') || lowercaseQuery.includes('datasheet')) research_type = 'especificaciones';
  if (lowercaseQuery.includes('comparar') || lowercaseQuery.includes('diferencia')) research_type = 'comparativo';
  if (lowercaseQuery.includes('proyecto') || lowercaseQuery.includes('anterior')) research_type = 'historial';
  
  // Extraer términos técnicos clave
  const technical_terms = [];
  for (const [term, weight] of Object.entries(RESEARCH_CONFIG.technical_terms)) {
    if (lowercaseQuery.includes(term.toLowerCase())) {
      technical_terms.push({ term, weight });
    }
  }
  
  return { research_type, technical_terms };
}

// Función de búsqueda especializada para investigación
async function performResearchSearch(query: string, analysis: any) {
  try {
    const searchBody = {
      query: {
        bool: {
          should: [
            // Búsqueda exacta en metadatos técnicos
            {
              multi_match: {
                query: query,
                fields: [
                  'title^4.0',
                  'equipment_type^3.5', 
                  'specifications^3.0',
                  'technical_summary^2.8'
                ],
                type: 'phrase',
                boost: 4.0
              }
            },
            // Búsqueda semántica en contenido técnico
            {
              multi_match: {
                query: query,
                fields: [
                  'content^2.0',
                  'technical_data^2.5',
                  'analysis_results^2.2',
                  'conclusions^1.8'
                ],
                type: 'best_fields',
                fuzziness: 'AUTO',
                boost: 2.0
              }
            },
            // Boost por términos técnicos detectados
            ...analysis.technical_terms.map(({term, weight}: any) => ({
              match: {
                content: {
                  query: term,
                  boost: weight
                }
              }
            }))
          ],
          // Filtros para documentos técnicos relevantes
          filter: [
            {
              terms: {
                type: ['pdf', 'docx', 'xlsx', 'txt', 'doc']
              }
            },
            {
              range: {
                content_length: { gte: 100 } // Documentos con contenido sustancial
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      // Resaltado avanzado para análisis
      highlight: {
        fields: {
          content: {
            fragment_size: 300,
            number_of_fragments: 8,
            pre_tags: ['<mark class="highlight">'],
            post_tags: ['</mark>'],
            order: 'score'
          },
          title: {
            pre_tags: ['<strong class="title-match">'],
            post_tags: ['</strong>']
          }
        },
        max_analyzed_offset: 1000000
      },
      // Agregaciones para análisis estadístico
      aggs: {
        by_equipment_type: {
          terms: { field: 'equipment_type.keyword', size: 15 }
        },
        by_project_type: {
          terms: { field: 'project_type.keyword', size: 10 }
        },
        by_technical_category: {
          terms: { field: 'category.keyword', size: 20 }
        },
        content_analysis: {
          significant_text: {
            field: 'content',
            size: 10,
            min_doc_count: 2
          }
        }
      },
      size: 20, // Más resultados para análisis profundo
      _source: {
        fields: [
          'title', 'content', 'filename', 'type', 'category',
          'equipment_type', 'project_type', 'technical_summary',
          'specifications', 'analysis_results', 'path', 'size',
          'extracted_metadata'
        ]
      },
      sort: [
        { _score: { order: 'desc' } }
      ]
    };

    const response = await client.search({
      index: 'semhys-documents',
      body: searchBody
    });

    return response;
    
  } catch (error) {
    console.error('Research search error:', error);
    throw error;
  }
}

// Función para generar resumen de investigación
function generateResearchSummary(results: any, analysis: any, query: string) {
  const total_docs = results.hits.total.value;
  const research_type_desc = RESEARCH_CONFIG.analysis_types[analysis.research_type] || 'Análisis general';
  
  let summary = `🔬 **Investigación SEMHYS**: ${research_type_desc}\n`;
  summary += `📊 **Documentos encontrados**: ${total_docs}\n`;
  summary += `🎯 **Consulta**: "${query}"\n\n`;
  
  if (analysis.technical_terms.length > 0) {
    summary += `🔧 **Términos técnicos identificados**:\n`;
    analysis.technical_terms.forEach(({term, weight}: any) => {
      summary += `   • ${term} (relevancia: ${weight})\n`;
    });
    summary += '\n';
  }
  
  // Estadísticas de agregaciones
  const aggs = results.aggregations;
  if (aggs?.by_equipment_type?.buckets?.length > 0) {
    summary += `⚙️ **Tipos de equipos encontrados**:\n`;
    aggs.by_equipment_type.buckets.slice(0, 5).forEach((bucket: any) => {
      summary += `   • ${bucket.key}: ${bucket.doc_count} documentos\n`;
    });
    summary += '\n';
  }
  
  return summary;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { query, research_focus } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Consulta de investigación requerida',
        suggestion: 'Ingresa términos técnicos específicos como: "bombas centrífugas rendimiento", "sistema presión RCI", "mantenimiento equipos Tigo"'
      }, { status: 400 });
    }

    console.log(`🔬 SEMHYS Research Agent - Consulta: "${query}"`);
    
    // Análisis inteligente de la consulta
    const analysis = analyzeResearchQuery(query);
    console.log(`📊 Análisis detectado: ${analysis.research_type}, términos técnicos: ${analysis.technical_terms.length}`);

    const start_time = Date.now();
    
    // Búsqueda especializada
    const searchResponse = await performResearchSearch(query, analysis);
    
    const search_time = Date.now() - start_time;
    const hits = searchResponse.body.hits;
    const total_found = hits.total.value;

    if (total_found === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        total_found: 0,
        research_summary: `❌ **No se encontraron documentos técnicos** para "${query}"\n\n🔍 **Sugerencias**:\n• Intenta términos más específicos\n• Verifica ortografía técnica\n• Usa sinónimos de equipos o procesos`,
        suggestions: [
          'Prueba con términos como: "bomba", "presión", "caudal", "RCI"',
          'Incluye nombres de proyectos específicos',
          'Busca por tipos de equipos o marcas'
        ],
        search_time_ms: search_time,
        analysis_type: analysis.research_type
      });
    }

    // Procesar resultados para investigación
    const research_results = hits.hits.map((hit: any, index: number) => {
      const source = hit._source;
      const highlights = hit.highlight || {};
      
      return {
        id: hit._id,
        rank: index + 1,
        title: source.title || source.filename,
        content_preview: source.content?.substring(0, 500) + '...',
        highlighted_content: highlights.content || [],
        highlighted_title: highlights.title?.[0] || source.title,
        document_type: source.type,
        category: source.category,
        equipment_type: source.equipment_type,
        project_type: source.project_type,
        technical_summary: source.technical_summary,
        filename: source.filename,
        file_size: source.size,
        path: source.path,
        timestamp: source['@timestamp'],
        relevance_score: hit._score,
        relevance_level: hit._score > 10 ? 'high' : hit._score > 5 ? 'medium' : 'low'
      };
    });

    // 🤖 ANÁLISIS CON IA CHATGPT
    console.log('🧠 Iniciando análisis con IA...');
    const aiAnalysis = await analyzeWithAI(query, research_results, analysis.research_type);
    
    // Generar resumen combinado (Elasticsearch + IA)
    const research_summary = aiAnalysis.analysis || generateResearchSummary(searchResponse.body, analysis, query);

    // Sugerencias mejoradas con IA
    const suggestions = aiAnalysis.suggestions || [];
    const content_analysis = searchResponse.body.aggregations?.content_analysis?.buckets || [];
    if (content_analysis.length > 0) {
      suggestions.push('📈 **Términos relacionados encontrados**:');
      content_analysis.slice(0, 3).forEach((term: any) => {
        suggestions.push(`• "${term.key}" (${term.doc_count} documentos)`);
      });
    }

    return NextResponse.json({
      success: true,
      results: research_results,
      total_found,
      research_summary,
      
      // 🤖 Nuevos campos con IA
      ai_analysis: {
        enabled: aiAnalysis.model_used !== 'none' && aiAnalysis.model_used !== 'error',
        analysis: aiAnalysis.analysis,
        model_used: aiAnalysis.model_used,
        cost_estimate: aiAnalysis.cost_estimate,
        tokens_used: aiAnalysis.tokens_used,
        confidence_score: aiAnalysis.confidence_score,
        suggestions: aiAnalysis.suggestions
      },
      
      analysis_type: analysis.research_type,
      technical_terms_detected: analysis.technical_terms,
      suggestions,
      search_time_ms: search_time,
      equipment_breakdown: searchResponse.body.aggregations?.by_equipment_type?.buckets || [],
      project_breakdown: searchResponse.body.aggregations?.by_project_type?.buckets || []
    });

  } catch (error) {
    console.error('🚨 SEMHYS Research Agent Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del agente de investigación',
      technical_details: error instanceof Error ? error.message : 'Error desconocido',
      suggestion: 'Intenta reformular la consulta o contacta soporte técnico'
    }, { status: 500 });
  }
}

// Endpoint GET para obtener estadísticas del sistema
export async function GET(): Promise<NextResponse> {
  try {
    // Estadísticas de la base de datos
    const stats = await client.indices.stats({ index: 'semhys-documents' });
    const health = await client.cluster.health();
    
    // 🤖 Estadísticas de IA
    const aiStats = await getAIUsageStats();
    const apiKeyValid = await validateOpenAIKey();
    
    return NextResponse.json({
      agent_status: 'active',
      elasticsearch_health: health.status,
      total_documents: stats._all?.total.docs.count || 0,
      index_size_mb: Math.round((stats._all?.total.store.size_in_bytes || 0) / 1024 / 1024),
      
      // 🤖 Configuración de IA
      ai_integration: {
        status: apiKeyValid ? 'active' : 'needs_configuration',
        current_model: aiStats.current_model,
        available_models: Object.keys(aiStats.model_config),
        monthly_cost_limit: aiStats.safety_limits.max_monthly_cost,
        api_configured: apiKeyValid
      },
      
      available_analysis_types: Object.entries(RESEARCH_CONFIG.analysis_types),
      technical_terms_catalog: Object.keys(RESEARCH_CONFIG.technical_terms).length,
      last_updated: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      agent_status: 'error',
      error: 'No se puede conectar con la base de datos de investigación'
    }, { status: 500 });
  }
}