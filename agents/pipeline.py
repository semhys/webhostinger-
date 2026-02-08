
from agents.technical import TechnicalAgent
from agents.researcher import ResearcherAgent
from agents.blogger import BloggerAgent
import logging

logger = logging.getLogger("semhys-pipeline")

class BlogPipeline:
    """
    Orquestador del Pipeline de Generación de Contenido.
    Coordina: Técnico -> Investigador -> Bloguero.
    """

    def __init__(self):
        self.technical_agent = TechnicalAgent()
        self.researcher_agent = ResearcherAgent()
        self.blogger_agent = BloggerAgent()

    def run_pipeline(self, topic: str) -> str:
        """
        Ejecuta el flujo completo para crear un post de blog.
        """
        logger.info(f"🚀 Iniciando Pipeline de Blog para: {topic}")
        
        # PASO 1: Investigación Técnica Interna
        print("\n--- PASO 1: AGENTE TÉCNICO ---")
        tech_notes = self.technical_agent.research_and_synthesize(topic)
        logger.info("✅ Notas técnicas generadas.")

        # PASO 2: Contexto Global
        print("\n--- PASO 2: AGENTE INVESTIGADOR ---")
        # Si el técnico no encontró nada, el investigador trabaja solo con el tema, 
        # pero es ideal que trabaje sobre los hallazgos técnicos.
        if "No dispongo de datos" in tech_notes:
            logger.warning("⚠️ No hubo datos técnicos internos, investigador trabajará solo.")
            research_notes = self.researcher_agent.expand_context(f"Tema general: {topic}")
        else:
            research_notes = self.researcher_agent.expand_context(tech_notes)
        logger.info("✅ Notas de investigación generadas.")

        # PASO 3: Redacción Final
        print("\n--- PASO 3: AGENTE BLOGUERO ---")
        final_post = self.blogger_agent.write_article(topic, tech_notes, research_notes)
        logger.info("✅ Póst de blog finalizado.")

        return final_post
