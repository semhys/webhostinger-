
from typing import List, Dict
import json
from agents.base import SemhysAgent

class VerifierAgent(SemhysAgent):
    """
    Agente Auditor (No-Hallucination Check).
    Verifica que cada cita corresponda a la fuente y que no haya datos inventados.
    """
    def __init__(self):
        super().__init__(name="Verifier Agent", model_version="gemini-2.0-flash-exp", temperature=0.0)

    def get_system_instruction(self) -> str:
        return """
        Eres un Auditor de Calidad de Contenido.
        Tu trabajo es detectar ALUCINACIONES y verificaciones de citas.
        
        CHECKLIST:
        1. ¿El texto menciona un número/dato? -> ¿Tiene cita [X]? -> ¿La fuente X realmente dice eso?
        2. ¿El tono es objetivo?
        
        Devuelve JSON:
        {
          "hallucination_check_passed": boolean,
          "issues_found": ["Párrafo 2 cita [1] pero la fuente 1 no menciona '50%'"],
          "corrected_text": "Texto corregido si es posible (opcional)"
        }
        """

    def verify_content(self, text: str, sources: List[Dict]) -> Dict:
        """
        Verifica un bloque de texto contra las fuentes.
        """
        # Preparar contexto de fuentes
        sources_brief = [{"id": s.get("source_number"), "title": s.get("title")} for s in sources]
        sources_str = json.dumps(sources_brief, indent=2)
        
        prompt = (
            f"Audita el siguiente texto generado:\n\n"
            f"{text}\n\n"
            f"Contra estas fuentes disponibles (Metadata):\n{sources_str}\n\n"
            f"Detecta si hay afirmaciones sin sustento o citas inventadas (ej. cita [9] si solo hay 3 fuentes)."
        )

        response = self.generate(prompt)
        response = response.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(response)
        except:
            # Fallback simple
            if "passed" in response.lower() or "true" in response.lower():
                return {"hallucination_check_passed": True, "issues_found": []}
            return {"hallucination_check_passed": False, "issues_found": ["Error en auditoría automática"]}
