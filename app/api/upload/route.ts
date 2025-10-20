import { NextRequest, NextResponse } from 'next/server';
import { elasticsearchService } from '@/lib/elasticsearch';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

interface UploadResponse {
  success: boolean;
  files_processed?: number;
  total_size?: number;
  errors?: string[];
  results?: Array<{
    filename: string;
    status: 'success' | 'error';
    document_id?: string;
    error?: string;
  }>;
}

// Función para extraer texto de diferentes tipos de archivo
async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (mimeType.includes('text/plain')) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    
    if (mimeType.includes('application/json')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.stringify(JSON.parse(content), null, 2);
    }
    
    // Para PDFs, Word, etc. - retornar el nombre del archivo como contenido básico
    // En producción, aquí usarías librerías como pdf-parse, mammoth, etc.
    return `Documento: ${path.basename(filePath)}\nTipo: ${mimeType}\nArchivo disponible para descarga.`;
    
  } catch (error) {
    console.error('Error extracting text:', error);
    return `Error al procesar archivo: ${path.basename(filePath)}`;
  }
}

// Función para determinar la categoría del archivo
function categorizeFile(filename: string, content: string): {
  category: 'technical' | 'general' | 'manual' | 'specification';
  technical_specs?: any;
  tags: string[];
} {
  const lowerFilename = filename.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  const tags: string[] = [];
  let category: 'technical' | 'general' | 'manual' | 'specification' = 'general';
  let technical_specs: any = {};

  // Categorización por nombre de archivo
  if (lowerFilename.includes('manual') || lowerFilename.includes('guide')) {
    category = 'manual';
    tags.push('manual', 'documentation');
  } else if (lowerFilename.includes('spec') || lowerFilename.includes('specification')) {
    category = 'specification';
    tags.push('specification', 'technical');
  } else if (lowerFilename.includes('bomba') || lowerFilename.includes('pump')) {
    category = 'technical';
    tags.push('bomba', 'pump', 'technical');
    technical_specs.equipment_type = 'bomba';
  } else if (lowerFilename.includes('motor') || lowerFilename.includes('engine')) {
    category = 'technical';
    tags.push('motor', 'engine', 'technical');
    technical_specs.equipment_type = 'motor';
  } else if (lowerFilename.includes('valve') || lowerFilename.includes('valvula')) {
    category = 'technical';
    tags.push('valve', 'valvula', 'technical');
    technical_specs.equipment_type = 'valve';
  }

  // Categorización por contenido
  const technicalKeywords = ['especificacion', 'specification', 'technical', 'engineering', 'pressure', 'temperature', 'flow', 'rpm'];
  const foundKeywords = technicalKeywords.filter(keyword => lowerContent.includes(keyword));
  
  if (foundKeywords.length > 2) {
    category = 'technical';
    tags.push(...foundKeywords);
  }

  return { category, technical_specs, tags };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📤 Iniciando proceso de upload...');
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No se recibieron archivos'
      } as UploadResponse, { status: 400 });
    }

    console.log(`📁 Procesando ${files.length} archivos...`);

    // Verificar conexión con Elasticsearch
    const isConnected = await elasticsearchService.checkConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Error de conexión con Elasticsearch'
      } as UploadResponse, { status: 503 });
    }

    // Crear índice si no existe
    await elasticsearchService.createIndex();

    const results: Array<{
      filename: string;
      status: 'success' | 'error';
      document_id?: string;
      error?: string;
    }> = [];

    let totalSize = 0;
    const errors: string[] = [];

    // Procesar cada archivo
    for (const file of files) {
      try {
        console.log(`🔄 Procesando: ${file.name} (${file.size} bytes)`);
        
        totalSize += file.size;

        // Crear directorio temporal si no existe
        const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Guardar archivo temporalmente
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(uploadDir, file.name);
        await writeFile(filePath, buffer);

        // Extraer contenido
        const content = await extractTextFromFile(filePath, file.type);
        
        // Categorizar archivo
        const { category, technical_specs, tags } = categorizeFile(file.name, content);

        // Preparar documento para Elasticsearch
        const document = {
          title: file.name.replace(/\.[^/.]+$/, ""), // Remover extensión
          content: content,
          file_type: file.type || 'unknown',
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          category: category,
          technical_specs: technical_specs,
          tags: tags,
          uploaded_at: new Date().toISOString()
        };

        // Indexar en Elasticsearch
        const documentId = await elasticsearchService.indexDocument(document);

        results.push({
          filename: file.name,
          status: 'success',
          document_id: documentId
        });

        // Limpiar archivo temporal
        fs.unlinkSync(filePath);

        console.log(`✅ ${file.name} procesado correctamente`);

      } catch (error) {
        console.error(`❌ Error procesando ${file.name}:`, error);
        
        const errorMsg = `Error en ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        errors.push(errorMsg);
        
        results.push({
          filename: file.name,
          status: 'error',
          error: errorMsg
        });
      }
    }

    const response: UploadResponse = {
      success: results.some(r => r.status === 'success'),
      files_processed: results.filter(r => r.status === 'success').length,
      total_size: totalSize,
      results: results,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log(`🎯 Proceso completado: ${response.files_processed}/${files.length} archivos`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en upload:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    } as UploadResponse, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    // Retornar estadísticas de documentos
    const stats = await elasticsearchService.getIndexStats();
    
    return NextResponse.json({
      success: true,
      stats: stats,
      upload_info: {
        max_file_size: '50MB',
        supported_types: [
          'text/plain',
          'application/json',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'video/mp4'
        ],
        note: 'Para archivos grandes, usar el script de upload masivo'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error obteniendo estadísticas'
    }, { status: 500 });
  }
}