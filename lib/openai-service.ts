import OpenAI from 'openai';

// Configuración del cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'tu_api_key_aqui',
});

// Configuración de modelos y costos
const AI_CONFIG = {
  models: {
    'gpt-4o-mini': {
      name: 'GPT-4o Mini',
      input_cost_per_1m: 0.15,
      output_cost_per_1m: 0.60,
      max_tokens: 16384,
      recommended: 'Económico y eficiente'
    },
    'gpt-4o': {
      name: 'GPT-4o',
      input_cost_per_1m: 2.50,
      output_cost_per_1m: 10.00,
      max_tokens: 8192,
      recommended: 'Máxima calidad'
    }
  },
  
  // Límites de seguridad
  safety_limits: {
    max_monthly_cost: parseFloat(process.env.OPENAI_COST_LIMIT_MONTHLY || '10.00'),
    max_tokens_per_request: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3')
  }
};

// Sistema de prompts especializados para SEMHYS
const SEMHYS_PROMPTS = {
  system_engineer: `Eres un ingeniero especialista de SEMHYS, empresa líder en sistemas hidráulicos, automatización industrial y eficiencia energética.

ESPECIALIDADES:
- Bombas centrífugas y sistemas de presión
- Automatización con PLCs y SCADA
- Análisis de eficiencia energética
- Mantenimiento predictivo
- Instrumentación y control
- Sistemas RCI (Remote Control Intelligence)

ESTILO DE RESPUESTA:
- Técnico pero claro y directo
- Basado en la experiencia de SEMHYS
- Con datos específicos y medibles
- Enfocado en soluciones prácticas
- Incluye recomendaciones concretas

FORMATO:
- Usa emojis técnicos relevantes (⚙️🔧📊💡⚡)
- Estructura con títulos claros
- Incluye parámetros técnicos específicos
- Sugiere próximos pasos cuando sea apropiado`,

  analysis_expert: `Eres el analista técnico principal de SEMHYS. Tu función es analizar documentos técnicos y extraer insights valiosos.

CAPACIDADES:
- Análisis de rendimiento de equipos
- Interpretación de datos de monitoreo
- Diagnóstico de problemas técnicos
- Comparación entre sistemas similares
- Identificación de oportunidades de mejora

METODOLOGÍA:
- Siempre busca patrones y tendencias
- Relaciona información de diferentes fuentes
- Cuantifica beneficios y ahorros potenciales
- Identifica riesgos y puntos críticos
- Propone soluciones basadas en evidencia`,

  research_assistant: `Eres el asistente de investigación técnica de SEMHYS. Ayudas a encontrar información específica en la base de datos documental.

FUNCIÓN:
- Interpretar consultas técnicas complejas
- Relacionar información dispersa en múltiples documentos
- Generar resúmenes ejecutivos
- Identificar documentos más relevantes
- Sugerir búsquedas relacionadas

CRITERIOS DE RELEVANCIA:
- Proximidad técnica al tema consultado
- Proyectos con características similares
- Equipos del mismo tipo o fabricante
- Análisis de rendimiento comparable
- Lecciones aprendidas aplicables`
};

// Función para calcular costo estimado
function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  const modelConfig = AI_CONFIG.models[model as keyof typeof AI_CONFIG.models];
  if (!modelConfig) return 0;
  
  const inputCost = (inputTokens / 1000000) * modelConfig.input_cost_per_1m;
  const outputCost = (outputTokens / 1000000) * modelConfig.output_cost_per_1m;
  
  return inputCost + outputCost;
}

// Función para contar tokens aproximadamente
function estimateTokens(text: string): number {
  // Estimación aproximada: 1 token ≈ 0.75 palabras en español
  return Math.ceil(text.split(' ').length * 1.33);
}

// Función principal de análisis con IA
export async function analyzeWithAI(
  query: string, 
  searchResults: any[], 
  analysisType: string = 'research'
): Promise<{
  analysis: string;
  cost_estimate: number;
  tokens_used: {input: number, output: number};
  model_used: string;
  suggestions: string[];
  confidence_score: number;
}> {
  
  try {
    // Verificar que tenemos API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'tu_api_key_aqui') {
      return {
        analysis: `🔑 **API Key de OpenAI requerida**\n\nPara activar el análisis con IA:\n\n1. Obtén tu API Key en: https://platform.openai.com/api-keys\n2. Agrégala al archivo .env.local: OPENAI_API_KEY=tu_key_real\n3. Reinicia el servidor\n\n💰 **Costo estimado**: ~$0.001 por consulta con GPT-4o Mini\n\n⚡ Mientras tanto, tienes búsqueda avanzada con Elasticsearch funcionando.`,
        cost_estimate: 0,
        tokens_used: {input: 0, output: 0},
        model_used: 'none',
        suggestions: [
          'Configura la API Key para activar análisis con IA',
          'Usa la búsqueda básica mientras tanto',
          'Considera GPT-4o Mini para costos mínimos'
        ],
        confidence_score: 0
      };
    }

    // Preparar contexto de documentos
    const documentContext = searchResults.slice(0, 5).map(doc => 
      `**${doc.title}** (${doc.document_type})\n${doc.content_preview}\n---`
    ).join('\n');

    // Seleccionar prompt según tipo de análisis
    let systemPrompt = SEMHYS_PROMPTS.research_assistant;
    if (analysisType.includes('equipment') || analysisType.includes('equipos')) {
      systemPrompt = SEMHYS_PROMPTS.system_engineer;
    } else if (analysisType.includes('analysis') || analysisType.includes('rendimiento')) {
      systemPrompt = SEMHYS_PROMPTS.analysis_expert;
    }

    // Construir prompt de usuario
    const userPrompt = `CONSULTA TÉCNICA: "${query}"

DOCUMENTOS ENCONTRADOS:
${documentContext}

ANÁLISIS REQUERIDO:
Como experto de SEMHYS, analiza la información encontrada y proporciona:

1. 📊 **Resumen Ejecutivo**: Síntesis de los hallazgos más relevantes
2. 🔧 **Análisis Técnico**: Interpretación especializada de los datos
3. 💡 **Insights Clave**: Patrones, tendencias y oportunidades identificadas
4. 🎯 **Recomendaciones**: Acciones concretas basadas en la evidencia
5. 📈 **Próximos Pasos**: Sugerencias para profundizar la investigación

ENFOQUE: ${analysisType === 'equipos' ? 'Análisis de equipos y componentes' : 
           analysisType === 'rendimiento' ? 'Optimización y eficiencia' : 
           'Investigación técnica integral'}

Total documentos en base: ${searchResults.length} encontrados para esta consulta.`;

    // Estimar tokens de entrada
    const inputTokens = estimateTokens(systemPrompt + userPrompt);
    
    // Verificar límites
    if (inputTokens > AI_CONFIG.safety_limits.max_tokens_per_request) {
      throw new Error(`Consulta muy extensa (${inputTokens} tokens). Límite: ${AI_CONFIG.safety_limits.max_tokens_per_request}`);
    }

    // Llamada a OpenAI
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    console.log(`🤖 Analizando con ${model}...`);
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user', 
          content: userPrompt
        }
      ],
      max_tokens: Math.min(AI_CONFIG.safety_limits.max_tokens_per_request, 2000),
      temperature: AI_CONFIG.safety_limits.temperature,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });

    const analysis = completion.choices[0]?.message?.content || 'No se pudo generar análisis';
    const outputTokens = estimateTokens(analysis);
    const estimatedCost = estimateCost(inputTokens, outputTokens, model);

    // Generar sugerencias basadas en el contexto
    const suggestions = [
      `Analizar proyectos similares con "${query.split(' ')[0]}"`,
      `Buscar especificaciones técnicas relacionadas`,
      `Revisar mantenimiento preventivo para estos equipos`,
      `Comparar rendimiento con proyectos anteriores`
    ];

    // Calcular confianza basada en cantidad y relevancia de resultados
    const confidenceScore = Math.min(
      0.95, 
      (searchResults.length / 10) * 0.6 + 
      (searchResults.filter(r => r.relevance_level === 'high').length / searchResults.length) * 0.4
    );

    return {
      analysis,
      cost_estimate: estimatedCost,
      tokens_used: { input: inputTokens, output: outputTokens },
      model_used: model,
      suggestions,
      confidence_score: confidenceScore
    };

  } catch (error) {
    console.error('🚨 Error en análisis IA:', error);
    
    return {
      analysis: `❌ **Error en el análisis con IA**\n\n${error instanceof Error ? error.message : 'Error desconocido'}\n\n🔍 **Búsqueda básica disponible**: Los resultados de Elasticsearch están funcionando correctamente.`,
      cost_estimate: 0,
      tokens_used: { input: 0, output: 0 },
      model_used: 'error',
      suggestions: [
        'Verifica la configuración de la API Key',
        'Intenta con una consulta más corta',
        'Usa la búsqueda básica mientras se resuelve'
      ],
      confidence_score: 0
    };
  }
}

// Función para obtener estadísticas de uso
export async function getAIUsageStats(): Promise<{
  model_config: typeof AI_CONFIG.models;
  current_model: string;
  safety_limits: typeof AI_CONFIG.safety_limits;
  api_status: 'configured' | 'missing' | 'invalid';
}> {
  
  const apiStatus = !process.env.OPENAI_API_KEY 
    ? 'missing' 
    : process.env.OPENAI_API_KEY === 'tu_api_key_aqui' 
    ? 'missing'
    : 'configured';
  
  return {
    model_config: AI_CONFIG.models,
    current_model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    safety_limits: AI_CONFIG.safety_limits,
    api_status: apiStatus
  };
}

// Función para validar API Key
export async function validateOpenAIKey(): Promise<boolean> {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'tu_api_key_aqui') {
      return false;
    }
    
    await openai.models.list();
    return true;
  } catch (error) {
    console.error('❌ API Key inválida:', error);
    return false;
  }
}