"""
Agent 3: Núcleo Notebook (NotebookLM-Style Technical Synthesizer)
Procesa el Dossier de Conocimiento como única "Fuente de Verdad" y genera contenido técnico de alto nivel.
"""

import os
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime
import vertexai
from vertexai.generative_models import GenerativeModel

logger = logging.getLogger("agent_3_notebook_synthesizer")

class NotebookSynthesizerAgent:
    """
    Sintetiza conocimiento técnico en artículos de ingeniería de clase mundial.
    Estilo NotebookLM: procesa el dossier como única fuente de verdad.
    """
    
    def __init__(self, project_id: str, location: str = "us-central1"):
        self.project_id = project_id
        self.location = location
        vertexai.init(project=project_id, location=location)
        
        # Modelo para síntesis técnica
        self.model = GenerativeModel("gemini-1.5-flash")
    
    def _build_context_from_dossier(self, dossier: Dict) -> str:
        """
        Construye el contexto técnico desde el dossier sanitizado.
        """
        context_parts = []
        
        context_parts.append(f"TEMA: {dossier.get('topic', 'N/A')}")
        context_parts.append(f"DOCUMENTOS ANALIZADOS: {dossier.get('total_documents', 0)}")
        context_parts.append(f"DISCIPLINAS: {', '.join(dossier.get('disciplines_covered', []))}")
        context_parts.append("\n" + "="*80)
        context_parts.append("CONOCIMIENTO TÉCNICO EXTRAÍDO:")
        context_parts.append("="*80 + "\n")
        
        # Organizar conocimiento por disciplina
        knowledge_base = dossier.get("knowledge_base", {})
        
        for discipline, docs in knowledge_base.items():
            context_parts.append(f"\n### DISCIPLINA: {discipline.upper()}")
            context_parts.append("-" * 60)
            
            for i, doc in enumerate(docs, 1):
                technical_content = doc.get("technical_content", "")
                doc_type = doc.get("doc_type", "unknown")
                
                context_parts.append(f"\nDOCUMENTO {i} ({doc_type}):")
                context_parts.append(technical_content)
                context_parts.append("")
        
        return "\n".join(context_parts)
    
    def generate_article_structure(self, topic: str, dossier: Dict) -> Dict:
        """
        Genera la estructura lógica del artículo basada en el dossier.
        """
        context = self._build_context_from_dossier(dossier)
        
        prompt = f"""
        Actúa como un Ingeniero Senior redactando un artículo técnico de clase mundial.
        
        CONTEXTO TÉCNICO (Fuente de Verdad):
        {context}
        
        TAREA:
        Diseña la estructura de un artículo técnico sobre: {topic}
        
        REQUISITOS:
        - El contenido debe sonar a ingeniería de alto nivel, NO a marketing genérico
        - Usa terminología técnica precisa
        - Incluye principios físicos y fórmulas cuando sea relevante
        - Organiza en secciones lógicas
        - Cada sección debe tener objetivos claros
        
        FORMATO JSON:
        {{
            "title": "título técnico del artículo",
            "subtitle": "subtítulo descriptivo",
            "sections": [
                {{
                    "section_number": 1,
                    "section_title": "título de la sección",
                    "objective": "qué debe lograr esta sección",
                    "key_points": ["punto1", "punto2", "punto3"],
                    "technical_depth": "basic/intermediate/advanced"
                }}
            ],
            "target_audience": "descripción de la audiencia objetivo",
            "estimated_reading_time": "X minutos"
        }}
        """
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.4,
                    "top_p": 0.8,
                    "max_output_tokens": 2048,
                }
            )
            
            result_text = response.text.strip()
            if result_text.startswith("```json"):
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif result_text.startswith("```"):
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            structure = json.loads(result_text)
            logger.info(f"✅ Estructura generada: {len(structure.get('sections', []))} secciones")
            
            return structure
            
        except Exception as e:
            logger.error(f"Error generando estructura: {e}")
            # Estructura por defecto
            return {
                "title": topic,
                "subtitle": "Technical Analysis",
                "sections": [
                    {
                        "section_number": 1,
                        "section_title": "Introduction",
                        "objective": "Introduce the topic",
                        "key_points": ["Context", "Importance", "Scope"],
                        "technical_depth": "basic"
                    }
                ],
                "target_audience": "Engineering professionals",
                "estimated_reading_time": "5 minutes"
            }
    
    def write_section(self, section: Dict, context: str, previous_sections: str = "") -> str:
        """
        Escribe una sección individual del artículo.
        """
        prompt = f"""
        Actúa como un Ingeniero Senior redactando un artículo técnico.
        
        CONTEXTO TÉCNICO (Fuente de Verdad):
        {context}
        
        SECCIONES PREVIAS:
        {previous_sections if previous_sections else "Esta es la primera sección"}
        
        TAREA:
        Escribe la siguiente sección del artículo:
        
        Sección #{section.get('section_number')}: {section.get('section_title')}
        Objetivo: {section.get('objective')}
        Puntos clave: {', '.join(section.get('key_points', []))}
        Profundidad técnica: {section.get('technical_depth')}
        
        REQUISITOS:
        - Contenido de ingeniería de alto nivel (NO marketing)
        - Usa datos y principios del CONTEXTO TÉCNICO proporcionado
        - Incluye terminología técnica precisa
        - Mantén coherencia con secciones previas
        - Longitud: 300-500 palabras
        
        IMPORTANTE: Solo genera el contenido de esta sección, sin título de sección.
        """
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.5,
                    "top_p": 0.9,
                    "max_output_tokens": 1024,
                }
            )
            
            section_content = response.text.strip()
            logger.info(f"✅ Sección {section.get('section_number')} escrita ({len(section_content)} chars)")
            
            return section_content
            
        except Exception as e:
            logger.error(f"Error escribiendo sección {section.get('section_number')}: {e}")
            return f"[Error generando contenido para sección {section.get('section_title')}]"
    
    def synthesize_article(self, topic: str, dossier: Dict) -> Dict:
        """
        Genera el artículo completo basado en el dossier.
        
        Returns:
            Dict con el artículo completo y metadata
        """
        logger.info(f"📝 Sintetizando artículo sobre: {topic}")
        
        # Construir contexto
        context = self._build_context_from_dossier(dossier)
        
        # Generar estructura
        structure = self.generate_article_structure(topic, dossier)
        
        # Escribir cada sección
        article_sections = []
        previous_content = ""
        
        for section in structure.get("sections", []):
            section_content = self.write_section(section, context, previous_content)
            
            article_sections.append({
                "section_number": section.get("section_number"),
                "section_title": section.get("section_title"),
                "content": section_content
            })
            
            # Acumular contenido previo para coherencia
            previous_content += f"\n\n## {section.get('section_title')}\n{section_content}"
        
        # Ensamblar artículo completo
        full_article = f"""# {structure.get('title')}

## {structure.get('subtitle')}

**Audiencia:** {structure.get('target_audience')}  
**Tiempo de lectura:** {structure.get('estimated_reading_time')}

---

"""
        
        for section in article_sections:
            full_article += f"\n## {section['section_title']}\n\n"
            full_article += section['content']
            full_article += "\n\n---\n"
        
        logger.info(f"✅ Artículo completo: {len(full_article)} caracteres")
        
        return {
            "article": {
                "title": structure.get("title"),
                "subtitle": structure.get("subtitle"),
                "full_text": full_article,
                "sections": article_sections,
                "metadata": {
                    "topic": topic,
                    "target_audience": structure.get("target_audience"),
                    "reading_time": structure.get("estimated_reading_time"),
                    "word_count": len(full_article.split()),
                    "sections_count": len(article_sections),
                    "generated_at": datetime.now().isoformat()
                }
            },
            "source_dossier": {
                "total_documents": dossier.get("total_documents"),
                "disciplines": dossier.get("disciplines_covered"),
                "privacy_guarantee": dossier.get("privacy_guarantee")
            }
        }
    
    def run(self, topic: str, dossier: Dict) -> Dict:
        """
        Punto de entrada principal del agente.
        
        Args:
            topic: Tema del artículo
            dossier: Dossier de conocimiento de Agent 2
        
        Returns:
            Artículo técnico completo
        """
        return self.synthesize_article(topic, dossier)


if __name__ == "__main__":
    # Test del agente
    logging.basicConfig(level=logging.INFO)
    
    PROJECT_ID = os.getenv("GCP_PROJECT_ID", "gen-lang-client-0585991170")
    
    # Mock dossier para testing
    mock_dossier = {
        "topic": "Energy Efficiency in Hydraulic Pumping Systems",
        "total_documents": 5,
        "disciplines_covered": ["hydraulics", "energy_systems"],
        "knowledge_base": {
            "hydraulics": [
                {
                    "technical_content": "Variable frequency drives (VFDs) can reduce energy consumption in centrifugal pumps by up to 50% by matching pump speed to actual demand.",
                    "discipline": "hydraulics",
                    "doc_type": "technical_report"
                }
            ]
        },
        "privacy_guarantee": "✅ ZERO PII - Solo conocimiento técnico"
    }
    
    agent = NotebookSynthesizerAgent(project_id=PROJECT_ID)
    result = agent.run("Energy Efficiency in Hydraulic Pumping Systems", mock_dossier)
    
    print("\n" + "="*80)
    print("RESULTADO AGENTE 3: NÚCLEO NOTEBOOK")
    print("="*80)
    print(json.dumps(result, indent=2, ensure_ascii=False))
