
from typing import List, Dict
import json
from agents.base import SemhysAgent

class ConceptMapper(SemhysAgent):
    """
    Agente Mapeador.
    Replica la función de "Mind Map" y extracción de NotoebookLM.
    Extrae: Conceptos, Relaciones, Datos Cuantitativos, Definiciones.
    """
    def __init__(self):
        super().__init__(name="Concept Mapper", model_version="gemini-2.0-flash-exp", temperature=0.2)

    def get_system_instruction(self) -> str:
        return """
        Eres un Analista de Conocimiento Experto. Tu trabajo es extraer información estructurada (Grounding Data)
        de una lista de fuentes validadas.
        
        OBJETIVO:
        Identificar conceptos clave, relaciones causales y, SOBRE TODO, datos cuantitativos exactos citables.
        
        FORMATO DE SALIDA (JSON):
        {
          "concept_map": {
            "main_concepts": ["Concepto A", "Concepto B"],
            "relationships": ["A causa B", "C reduce D en X%"],
            "quantitative_data": [
              {
                "data": "La eficiencia cae 15%",
                "source_number": 1,
                "context": "En sistemas de bombeo..."
              }
            ],
            "definitions": [
                {"term": "Cavitación", "definition": "Formación de burbujas...", "source_number": 2}
            ]
          }
        }
        """

    def map_content(self, topic: str, accepted_sources: List[Dict]) -> Dict:
        """
        Genera el mapa conceptual.
        """
        print(f"[{self.name}] Mapeando conceptos para: {topic}")
        
        sources_text = json.dumps(accepted_sources, indent=2, ensure_ascii=False)
        
        prompt = (
            f"Extrae el conocimiento estructurado para el tema: '{topic}'.\n"
            f"Basado EXCLUSIVAMENTE en estas fuentes aceptadas:\n\n"
            f"{sources_text}\n\n"
            f"Devuelve un JSON válido con 'concept_map'."
        )

        response = self.generate(prompt)
        response = response.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(response)
        except Exception as e:
            print(f"Error parseando mapa: {e}")
            return {"concept_map": {}, "error": str(e)}
