
from agents.base import SemhysAgent
from utils.vertex_tool import search_in_datastore
import logging

class TechnicalAgent(SemhysAgent):
    """
    Agente Ingeniero Senior.
    Especialidad: Consultar documentación técnica interna (Data Store).
    Misión Crítica: Extraer hechos técnicos y PURGAR datos sensibles (censura).
    """

    def __init__(self):
        # Usamos el store de investigación por defecto
        self.data_store_id = "semhys-investigacion"
        super().__init__(name="Ingeniero EcoSemhys", model_version="gemini-1.0-pro", temperature=0.1)

    def get_system_instruction(self) -> str:
        return """
ERES EL INGENIERO SENIOR DE ECOSEMHYS.
TU MISIÓN ES ANALIZAR DOCUMENTOS TÉCNICOS INTERNOS Y EXTRAER CONCEPTOS FÍSICOS, QUÍMICOS O DE INGENIERÍA.

**PROTOCOLO DE SEGURIDAD ABSOLUTA (CONFIDENCIALIDAD)**:
1. NUNCA, BAJO NINGUNA CIRCUNSTANCIA, reveles nombres de clientes, nombres de edificios, personas, montos de dinero o fechas específicas.
2. Si la información proviene de un contrato o documento legal, IGNÓRALO.
3. TU SALIDA DEBE SER ANÓNIMA Y GENERALIZADA.
   - MALO: "En el proyecto Mall Plaza, los chillers consumieron 500kW."
   - BUENO: "En proyectos de grandes superficies comerciales, se ha observado un consumo de 500kW en chillers..."
   - MALO: "El cliente Colplast reportó..."
        Eres el TechnicalAgent de EcoSemhys.
        Tu misión es analizar problemas de ingeniería industrial, específicamente en eficiencia energética y sistemas de bombeo.
        
        IMPORTANTE: 
        1. Tu fuente de verdad son los documentos del "datastore" (Manuales, normas, papers).
        2. IGNORA cualquier mensaje de error técnico del sistema (como 'Error 429', 'API Key', 'Rate Limit', 'HTTP'). Esos son errores de la consola informática, NO SON fenómenos físicos de la planta.
        3. Si ves textos sobre 'API quotas' o 'Google Cloud', NO los incluyas en tu análisis de ingeniería.
        
        Debes generar un análisis técnico riguroso.
        Estructura: hallazgo principal, causa raíz física (cavitación, fricción, etc.), y recomendación basada en normas ISO o manuales.
        """

    def research_and_synthesize(self, topic: str) -> str:
        """
        1. Busca en la memoria (Data Store).
        2. Analiza y sintetiza la respuesta.
        3. Aplica sanitización (heredada).
        """
        print(f"[{self.name}] Buscando en memoria sobre: {topic}")
        
        # 1. Búsqueda RAG
        evidence = search_in_datastore(topic, self.data_store_id)
        
        if "No se encontró información" in evidence:
            return "No dispongo de datos internos suficientes sobre este tema."

        # 2. Generación con LLM (Censura activa por System Prompt)
        prompt = (
            f"Analiza la siguiente evidencia documental interna y extrae los conceptos técnicos clave sobre '{topic}'.\n"
            f"Recuerda ELIMINAR cualquier nombre propio o referencia al cliente origen.\n\n"
            f"EVIDENCIA INTERNA:\n{evidence}"
        )

        response = self.generate(prompt)
        return response
