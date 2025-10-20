import { Client } from '@elastic/elasticsearch';

// Cliente de Elasticsearch configurado
const client = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY || ''
  },
  tls: {
    rejectUnauthorized: true
  }
});

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  score: number;
  source?: string;
  metadata?: any;
}

export interface SearchOptions {
  index?: string;
  size?: number;
  from?: number;
  filters?: Record<string, any>;
  fuzzy?: boolean;
}

class ElasticsearchService {
  private readonly defaultIndex = 'semhys-documents';

  // Verificar conexión con Elasticsearch
  async checkConnection(): Promise<boolean> {
    try {
      const response = await client.ping();
      console.log('✅ Elasticsearch conectado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error conectando a Elasticsearch:', error);
      return false;
    }
  }

  // Crear índice para documentos SEMHYS
  async createIndex(): Promise<void> {
    try {
      const exists = await client.indices.exists({ index: this.defaultIndex });
      
      if (!exists) {
        await client.indices.create({
          index: this.defaultIndex,
          body: {
            mappings: {
              properties: {
                title: { 
                  type: 'text',
                  analyzer: 'standard',
                  fields: {
                    keyword: { type: 'keyword' }
                  }
                },
                content: { 
                  type: 'text',
                  analyzer: 'standard'
                },
                file_type: { type: 'keyword' },
                file_name: { type: 'keyword' },
                file_path: { type: 'keyword' },
                file_size: { type: 'long' },
                created_at: { type: 'date' },
                updated_at: { type: 'date' },
                tags: { type: 'keyword' },
                category: { 
                  type: 'keyword',
                  fields: {
                    text: { type: 'text' }
                  }
                },
                technical_specs: {
                  type: 'object',
                  properties: {
                    equipment_type: { type: 'keyword' },
                    specifications: { type: 'text' },
                    manufacturer: { type: 'keyword' },
                    model: { type: 'keyword' }
                  }
                },
                vector_content: {
                  type: 'dense_vector',
                  dims: 768
                }
              }
            },
            settings: {
              analysis: {
                analyzer: {
                  semhys_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'snowball']
                  }
                }
              }
            }
          }
        });
        console.log('✅ Índice SEMHYS creado correctamente');
      }
    } catch (error) {
      console.error('❌ Error creando índice:', error);
      throw error;
    }
  }

  // Buscar documentos con consulta inteligente
  async searchDocuments(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      const {
        index = this.defaultIndex,
        size = 10,
        from = 0,
        filters = {},
        fuzzy = true
      } = options;

      const searchBody: any = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query,
                  fields: [
                    'title^3',
                    'content^2',
                    'technical_specs.specifications^2',
                    'tags',
                    'category'
                  ],
                  type: 'best_fields',
                  fuzziness: fuzzy ? 'AUTO' : 0,
                  operator: 'or'
                }
              }
            ],
            filter: []
          }
        },
        highlight: {
          fields: {
            content: {
              fragment_size: 150,
              number_of_fragments: 3
            },
            'technical_specs.specifications': {
              fragment_size: 100,
              number_of_fragments: 2
            }
          }
        },
        _source: ['title', 'content', 'file_type', 'file_name', 'category', 'technical_specs'],
        size,
        from
      };

      // Aplicar filtros adicionales
      Object.entries(filters).forEach(([key, value]) => {
        searchBody.query.bool.filter.push({
          term: { [key]: value }
        });
      });

      const response = await client.search({
        index,
        body: searchBody
      });

      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        title: hit._source.title || hit._source.file_name || 'Sin título',
        content: hit.highlight?.content?.[0] || hit._source.content?.substring(0, 300) || '',
        type: hit._source.file_type || 'unknown',
        score: hit._score || 0,
        source: hit._source.file_path,
        metadata: {
          category: hit._source.category,
          technical_specs: hit._source.technical_specs,
          highlights: hit.highlight
        }
      }));

    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      throw error;
    }
  }

  // Buscar documentos técnicos específicos
  async searchTechnicalDocs(query: string, equipmentType?: string): Promise<SearchResult[]> {
    const filters: Record<string, any> = {
      category: 'technical'
    };

    if (equipmentType) {
      filters['technical_specs.equipment_type'] = equipmentType;
    }

    return this.searchDocuments(query, { filters, size: 15 });
  }

  // Indexar un documento nuevo
  async indexDocument(document: {
    title: string;
    content: string;
    file_type: string;
    file_name: string;
    file_path: string;
    category?: string;
    technical_specs?: any;
    tags?: string[];
  }): Promise<string> {
    try {
      const response = await client.index({
        index: this.defaultIndex,
        body: {
          ...document,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });

      console.log(`✅ Documento indexado: ${document.file_name}`);
      return response._id;
    } catch (error) {
      console.error('❌ Error indexando documento:', error);
      throw error;
    }
  }

  // Obtener estadísticas del índice
  async getIndexStats(): Promise<any> {
    try {
      const stats = await client.indices.stats({ index: this.defaultIndex });
      const count = await client.count({ index: this.defaultIndex });
      
      return {
        total_documents: count.count,
        index_size: stats.indices[this.defaultIndex]?.total?.store?.size_in_bytes || 0,
        status: 'active'
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  }
}

export const elasticsearchService = new ElasticsearchService();
export default elasticsearchService;