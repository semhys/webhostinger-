
from typing import List, Dict
import json
from agents.base import SemhysAgent

class SourceValidator(SemhysAgent):
    """
    Agente validador de fuentes usando criterio CRAAP.
    Currency, Relevance, Authority, Accuracy, Purpose.
    """
    def __init__(self):
        super().__init__(name="Source Validator", model_version="gemini-2.0-flash-exp", temperature=0.1)

    def get_system_instruction(self) -> str:
        return """
        Eres un Bibliotecario Técnico Experto. Tu trabajo es validar fuentes usando el método CRAAP.
        
        CRITERIOS (Score 1-5 cada uno):
        1. Currency (Actualidad): >=2022 (5), >=2019 (4), >=2014 (3), <2014 (1).
        2. Relevance (Relevancia): ¿Habla del tema central? Directo (5), Subtema (3), General (2).
        3. Authority (Autoridad): Normas/Fabricantes Líderes (5), Unis/Institutos (4), Blog con fuentes (2).
        4. Accuracy (Precisión): ¿Tiene refs? (5), ¿Es oficial? (5), ¿Sin fuentes? (1).
        5. Purpose (Propósito): Educativo/Técnico (5), Mkt moderado (3), Venta pura (0).
        
        Umbral de aceptación: Promedio >= 2.0.
        NOTA: Si la fuente parece técnica y relevante, ACEPTALA. No seas demasiado estricto con fechas si es un ejemplo.
        """

    def validate(self, topic: str, sources: List[Dict]) -> Dict:
        """
        Valida una lista de fuentes.
        """
        print(f"[{self.name}] Validando {len(sources)} fuentes para: {topic}")
        
        sources_text = json.dumps(sources, indent=2, ensure_ascii=False)
        
        prompt = (
            f"Analiza las siguientes fuentes para el tema: '{topic}'.\n"
            f"Aplica el criterio CRAAP a cada una.\n\n"
            f"FUENTES:\n{sources_text}\n\n"
            f"Devuelve UNICAMENTE un JSON válido con este formato:\n"
            f"{{\n"
            f"  \"validation_table\": [\n"
            f"    {{\n"
            f"      \"source_number\": 1,\n"
            f"      \"url\": \"...\",\n"
            f"      \"title\": \"...\",\n"
            f"      \"craap_score\": 4.2,\n"
            f"      \"decision\": \"ACCEPTED\" o \"REJECTED\",\n"
            f"      \"analysis\": \"Currency: 5 (2024), Authority: 4...\"\n"
            f"    }}\n"
            f"  ]\n"
            f"}}"
        )

        response = self.generate(prompt)
        
        # Limpieza simple de JSON markdown
        response = response.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(response)
        except Exception as e:
            print(f"Error parseando validación: {e}")
            return {"validation_table": [], "error": str(e)}
