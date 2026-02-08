
from typing import List, Dict
import json
from agents.base import SemhysAgent

class GroundedWriter(SemhysAgent):
    """
    Agente Redactor.
    Escribe secciones del artículo asegurando citas [#].
    """
    def __init__(self):
        super().__init__(name="Grounded Writer", model_version="gemini-2.0-flash-exp", temperature=0.5)

    def get_system_instruction(self) -> str:
        return """
        Eres un Redactor Técnico Riguroso.
        
        REGLA DE ORO: SOURCE-GROUNDING.
        1. Toda afirmación técnica DEBE tener una cita [X].
        2. No inventes datos. Usa solo la fuente proporcionada.
        3. Si un dato tiene 2 fuentes, usa ambas [1][2].
        4. Tono: Profesional, directo, sin relleno.
        
        FORMATO DE SALIDA:
        Devuelve el texto en Markdown listo para el blog.
        """

    def write_section(self, section_plan: Dict, assigned_sources: List[Dict]) -> str:
        """
        Escribe una sección específica basada en su plan y fuentes.
        """
        heading = section_plan.get("heading")
        target_length = section_plan.get("length_target", 200)
        
        # Convertir fuentes a texto formato "Fuente [ID]: Contenido Resumido o Título"
        # En un sistema real, aquí pasaríamos los chunks relevantes recuperados.
        # Por ahora, pasamos el objeto completo (o lo que tengamos simulado)
        sources_text = ""
        for s in assigned_sources:
            # Si tuviéramos RAG real, aquí iría el chunk.
            # Como es "NotebookLM Style simulation", asumimos que 's' tiene metadata o un resumen.
            sources_text += f"FUENTE [{s.get('source_number')}]: {s.get('title')} - URLs: {s.get('url')}\n"
            if 'extracted_content' in s:
                sources_text += f"CONTENIDO: {s['extracted_content'][:500]}...\n" # Truncado simulado
        
        print(f"[{self.name}] Escribiendo sección: {heading}")
        
        prompt = (
            f"Escribe la sección: '{heading}'.\n"
            f"Objetivo: {section_plan.get('focus')}\n"
            f"Longitud meta: {target_length} palabras.\n\n"
            f"UTILIZA EXCLUSIVAMENTE ESTAS FUENTES:\n{sources_text}\n\n"
            f"Recuerda citar con [ID] al final de cada frase técnica."
        )

        response = self.generate(prompt)
        return response.strip()

    def write_full_article_one_shot(self, topic: str, outline: Dict, sources: List[Dict]) -> str:
        """
        Genera el artículo COMPLETO en una sola llamada (Optimización para Free Tier).
        """
        print(f"[{self.name}] Generando artículo completo (Draft Mode)...")
        
        sources_text = json.dumps(sources, indent=2, ensure_ascii=False)
        structure_text = json.dumps(outline, indent=2, ensure_ascii=False)
        
        prompt = (
            f"Escribe un artículo técnico COMPLETO sobre: '{topic}'.\n\n"
            f"ESTRUCTURA OBLIGATORIA:\n{structure_text}\n\n"
            f"FUENTES DISPONIBLES:\n{sources_text}\n\n"
            f"INSTRUCCIONES CRÍTICAS:\n"
            f"1. Escribe TODAS las secciones en formato Markdown.\n"
            f"2. Cita OBLIGATORIAMENTE cada dato con `[#]` usando el 'source_number' del JSON.\n"
            f"3. Si una sección no tiene info en las fuentes, escribe un breve párrafo general sin inventar datos.\n"
            f"4. Mantén un tono técnico y profesional.\n"
            f"5. NO uses placeholders. Escribe el contenido final.\n"
        )
        
        return self.generate(prompt)
