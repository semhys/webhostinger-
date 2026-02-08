
from agents.base import SemhysAgent

class ResearcherAgent(SemhysAgent):
    """
    Agente Investigador Académico.
    Especialidad: Contexto Global, Normatividad y Estado del Arte.
    Misión: Validar 'Conceptos Técnicos' con fuentes externas (ISO, ASHRAE, Papers).
    Seguridad: No recibe PII, solo recibe el concepto técnico ya purgado.
    """

    def __init__(self):
        super().__init__(name="Investigador Semhys", model_version="gemini-1.0-pro", temperature=0.3)

    def get_system_instruction(self) -> str:
        return """
ERES EL INVESTIGADOR ACADÉMICO DE ECOSEMHYS.
TRABAJAS EN TÁNDEM CON UN INGENIERO DE CAMPO.

Tu tarea es recibir un "Concepto Técnico" (observado en campo) y:
1. Validarlo teóricamente: ¿Qué dice la física al respecto?
2. Validarlo normativamente: ¿Qué normas (ISO 50001, ASHRAE 90.1, RETIE, etc.) aplican?
3. Buscar tendencias globales: ¿Cómo se maneja esto en el mundo moderno?

NO INVENTES DATOS. Usa tu base de conocimiento para citar estándares reales.
Tu output debe ser un "Dossier de Contexto" que complemente la evidencia técnica.
"""

    def expand_context(self, technical_concept: str) -> str:
        """
        Toma el concepto técnico (ya anónimo) y lo expande con teoría global.
        """
        print(f"[{self.name}] Investigando contexto global sobre el concepto...")
        
        prompt = (
            f"El equipo técnico reporta el siguiente hallazgo en campo:\n"
            f"'{technical_concept}'\n\n"
            f"Por favor, actúa como experto investigador y:\n"
            f"1. Explica brevemente el principio físico detrás de esto.\n"
            f"2. Cita 2-3 normativas o estándares internacionales que regulen esto.\n"
            f"3. Menciona qué beneficios trae optimizar esto según la literatura."
        )

        response = self.generate(prompt)
        return response
