"""
Agent 1: Ojeador Global (Market Intelligence)
Identifica tendencias de ingeniería hidráulica y eficiencia energética a nivel mundial.
"""

import os
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime
import vertexai
from vertexai.generative_models import GenerativeModel
from google.cloud import discoveryengine_v1 as discoveryengine

logger = logging.getLogger("agent_1_market_intelligence")

class MarketIntelligenceAgent:
    """
    Escanea fuentes globales para identificar tendencias de alto impacto
    en ingeniería hidráulica y eficiencia energética.
    """
    
    def __init__(self, project_id: str, location: str = "us-central1"):
        self.project_id = project_id
        self.location = location
        vertexai.init(project=project_id, location=location)
        self.model = GenerativeModel("gemini-1.5-flash")
        
        # Temas de interés para SEMHYS
        self.focus_areas = [
            "hydraulic engineering innovations",
            "energy efficiency in water systems",
            "sustainable pumping solutions",
            "smart water management",
            "renewable energy in hydraulics",
            "water treatment optimization",
            "IoT in hydraulic systems"
        ]
    
    def search_google_grounding(self, query: str, max_results: int = 5) -> List[Dict]:
        """
        Búsqueda con Google Search Grounding vía Vertex AI.
        """
        try:
            prompt = f"""
            Actúa como un analista de tendencias en ingeniería hidráulica.
            
            Busca información reciente (últimos 6 meses) sobre: {query}
            
            Enfócate en:
            - Innovaciones tecnológicas
            - Nuevas normativas (UE/USA)
            - Casos de éxito en la industria
            - Investigación académica relevante
            
            Devuelve un JSON con esta estructura:
            {{
                "trends": [
                    {{
                        "title": "título de la tendencia",
                        "description": "descripción breve",
                        "relevance_score": 0-10,
                        "source_type": "academia/industry/regulation",
                        "keywords": ["keyword1", "keyword2"]
                    }}
                ]
            }}
            """
            
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,
                    "top_p": 0.8,
                    "max_output_tokens": 2048,
                }
            )
            
            # Parse JSON response
            result_text = response.text.strip()
            # Remove markdown code blocks if present
            if result_text.startswith("```json"):
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif result_text.startswith("```"):
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            trends_data = json.loads(result_text)
            return trends_data.get("trends", [])
            
        except Exception as e:
            logger.error(f"Error en Google Search Grounding: {e}")
            return []
    
    def scan_academic_sources(self, topic: str) -> List[Dict]:
        """
        Simula búsqueda en IEEE, ScienceDirect (en producción usar APIs reales).
        Por ahora usa Vertex AI para generar insights académicos.
        """
        try:
            prompt = f"""
            Actúa como un investigador académico en ingeniería hidráulica.
            
            Genera un análisis de las últimas publicaciones académicas sobre: {topic}
            
            Incluye:
            - Tendencias en investigación
            - Tecnologías emergentes
            - Autores/instituciones líderes
            
            Formato JSON:
            {{
                "academic_insights": [
                    {{
                        "research_area": "área de investigación",
                        "key_findings": "hallazgos principales",
                        "impact_score": 0-10,
                        "applications": ["aplicación1", "aplicación2"]
                    }}
                ]
            }}
            """
            
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.4,
                    "max_output_tokens": 1500,
                }
            )
            
            result_text = response.text.strip()
            if result_text.startswith("```json"):
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif result_text.startswith("```"):
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            academic_data = json.loads(result_text)
            return academic_data.get("academic_insights", [])
            
        except Exception as e:
            logger.error(f"Error en búsqueda académica: {e}")
            return []
    
    def score_topic_relevance(self, topic_data: Dict) -> float:
        """
        Calcula score de relevancia para ventas y relevancia técnica.
        """
        # Factores de scoring
        relevance = topic_data.get("relevance_score", 5)
        impact = topic_data.get("impact_score", 5)
        
        # Bonus por tipo de fuente
        source_bonus = {
            "regulation": 2.0,  # Normativas tienen alta prioridad
            "industry": 1.5,    # Casos de industria son muy vendibles
            "academia": 1.2     # Academia aporta credibilidad
        }
        
        source_type = topic_data.get("source_type", "industry")
        multiplier = source_bonus.get(source_type, 1.0)
        
        # Score final (0-10)
        final_score = min(10, (relevance + impact) / 2 * multiplier)
        return round(final_score, 2)
    
    def select_top_topic(self) -> Dict:
        """
        Ejecuta el escaneo completo y selecciona el tema de mayor impacto.
        """
        logger.info("🔍 Iniciando escaneo global de tendencias...")
        
        all_topics = []
        
        # Escanear cada área de enfoque
        for area in self.focus_areas:
            logger.info(f"Escaneando: {area}")
            
            # Búsqueda con grounding
            trends = self.search_google_grounding(area, max_results=3)
            
            # Búsqueda académica
            academic = self.scan_academic_sources(area)
            
            # Combinar resultados
            for trend in trends:
                trend["focus_area"] = area
                trend["score"] = self.score_topic_relevance(trend)
                all_topics.append(trend)
            
            for insight in academic:
                insight["focus_area"] = area
                insight["score"] = self.score_topic_relevance(insight)
                insight["source_type"] = "academia"
                all_topics.append(insight)
        
        # Ordenar por score
        all_topics.sort(key=lambda x: x.get("score", 0), reverse=True)
        
        # Seleccionar top topic
        if all_topics:
            top_topic = all_topics[0]
            logger.info(f"✅ Tema seleccionado: {top_topic.get('title', 'N/A')} (Score: {top_topic.get('score')})")
            
            return {
                "selected_topic": top_topic,
                "alternatives": all_topics[1:6],  # Top 5 alternativas
                "scan_date": datetime.now().isoformat(),
                "total_topics_analyzed": len(all_topics)
            }
        else:
            logger.warning("⚠️ No se encontraron temas. Usando tema por defecto.")
            return {
                "selected_topic": {
                    "title": "Energy Efficiency in Modern Hydraulic Systems",
                    "description": "Latest innovations in energy-efficient pumping and water management",
                    "score": 7.5,
                    "focus_area": "energy efficiency in water systems",
                    "source_type": "industry"
                },
                "alternatives": [],
                "scan_date": datetime.now().isoformat(),
                "total_topics_analyzed": 0
            }
    
    def run(self, override_topic: Optional[str] = None) -> Dict:
        """
        Punto de entrada principal del agente.
        
        Args:
            override_topic: Tema manual desde el panel de control (opcional)
        
        Returns:
            Dict con el tema seleccionado y metadata
        """
        if override_topic:
            logger.info(f"📌 Usando tema manual: {override_topic}")
            return {
                "selected_topic": {
                    "title": override_topic,
                    "description": f"Tema prioritario definido por usuario",
                    "score": 10.0,
                    "focus_area": "user_defined",
                    "source_type": "manual"
                },
                "alternatives": [],
                "scan_date": datetime.now().isoformat(),
                "total_topics_analyzed": 0,
                "mode": "manual_override"
            }
        else:
            return self.select_top_topic()


if __name__ == "__main__":
    # Test del agente
    logging.basicConfig(level=logging.INFO)
    
    PROJECT_ID = os.getenv("GCP_PROJECT_ID", "gen-lang-client-0585991170")
    
    agent = MarketIntelligenceAgent(project_id=PROJECT_ID)
    result = agent.run()
    
    print("\n" + "="*80)
    print("RESULTADO AGENTE 1: OJEADOR GLOBAL")
    print("="*80)
    print(json.dumps(result, indent=2, ensure_ascii=False))
