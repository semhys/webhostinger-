
from typing import List, Dict
import json
from agents.base import SemhysAgent

class ArticleOutliner(SemhysAgent):
    """
    Agente Arquitecto.
    Genera la estructura (Outline) y ASIGNA FUENTES a cada sección.
    Regla: Mínimo 2 fuentes por H2.
    """
    def __init__(self):
        super().__init__(name="Article Outliner", model_version="gemini-2.0-flash-exp", temperature=0.3)

    def get_system_instruction(self) -> str:
        return """
        Eres un Editor Técnico Senior. Tu trabajo es planear la estructura de un artículo.
        
        REGLAS DE ESTRUCTURA:
        1. H1: Título atractivo con gancho técnico.
        2. H2: Secciones lógicas (Definición, Importancia, Mecánica, Solución).
        3. CRÍTICO: Debes asignar MÍNIMO 2 FUENTES (IDs) a cada sección H2 para asegurar grounding.
        
        FORMATO JSON:
        {
          "article_structure": {
            "sections": [
              {
                "heading": "Introducción...",
                "level": "h2",
                "assigned_sources": [1, 2],
                "length_target": 150,
                "focus": "Plantear el problema..."
              }
            ]
          }
        }
        """

    def create_outline(self, topic: str, concept_map: Dict, sources_summary: List[Dict]) -> Dict:
        """
        Crea el outline basado en los conceptos extraídos.
        """
        print(f"[{self.name}] Diseñando estructura para: {topic}")
        
        # Simplificar inputs para el prompt
        map_str = json.dumps(concept_map, indent=2, ensure_ascii=False)
        sources_str = json.dumps(sources_summary, indent=2, ensure_ascii=False)
        
        prompt = (
            f"Genera una estructura de artículo para '{topic}'.\n\n"
            f"MAPA CONCEPTUAL:\n{map_str}\n\n"
            f"FUENTES DISPONIBLES:\n{sources_str}\n\n"
            f"Asigna fuentes específicas a cada sección. Devuelve JSON válido."
        )

        response = self.generate(prompt)
        response = response.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(response)
        except Exception as e:
            print(f"Error parseando outline: {e}")
            return {"article_structure": {}, "error": str(e)}
