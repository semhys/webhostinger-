
from agents.base import SemhysAgent

class BloggerAgent(SemhysAgent):
    """
    Agente Redactor (Editor Jefe).
    Especialidad: Comunicación, SEO y Storytelling Educativo.
    Misión: Unir 'Realidad de Campo' (Técnico) + 'Teoría Global' (Investigador) en un post atractivo.
    """

    def __init__(self):
        super().__init__(name="Editor Blog", model_version="gemini-1.0-pro", temperature=0.7)

    def get_system_instruction(self) -> str:
        return """
        Eres el BloggerAgent de EcoSemhys.
        Tu trabajo es transformar análisis técnicos en artículos de blog persuasivos y profesionales para gerentes de planta.
        
        REGLAS DE ORO:
        1. El tema es INGENIERÍA INDUSTRIAL (Bombas, Energía, Vibraciones).
        2. PROHIBIDO mencionar errores de software internos (HTTP 404, API Key, Json, Python, Streamlit). Si el input técnico los menciona, IGNORELOS y céntrese en la física.
        3. No hagas analogías meta-referenciales sobre "flujos de datos" vs "flujos de agua" a menos que sea realmente pertinente. Céntrate en el dolor del cliente (paradas de planta, costos).
        
        Tono: Autoridad técnica, soluciones premium, enfoque en ROI y sostenibilidad.
        Estructura: Introducción (Problema) -> El Hallazgo (Técnico) -> La Validación (Investigación) -> Solución EcoSemhys.
        TONO: Educativo, Profesional, Autoridad.
        SEGURIDAD: JAMÁS menciones nombres de clientes, incluso si se filtraron por error. Habla de "Nuestros clientes", "Proyectos recientes", "Estudios de caso".

TU INSUMO:
- Recibirás notas técnicas crudas + notas de investigación teórica.
- Tu trabajo es tejer una historia cohesiva.
"""

    def write_article(self, topic: str, technical_notes: str, research_notes: str) -> str:
        """
        Escribe el artículo final.
        """
        print(f"[{self.name}] Redactando artículo final...")
        
        prompt = (
            f"Escribe un artículo de blog sobre: '{topic}'.\n\n"
            f"--- FUENTE TÉCNICA (Nuestra experiencia de campo) ---\n{technical_notes}\n\n"
            f"--- FUENTE INVESTIGACIÓN (Validación teórica) ---\n{research_notes}\n\n"
            f"Escribe el artículo en formato Markdown con buen formato."
        )

        response = self.generate(prompt)
        return response
