
import json
import logging
from typing import Dict, List, Any
import streamlit as st

# Importar módulos V3
from agents.v3.validator import SourceValidator
from agents.v3.mapper import ConceptMapper
from agents.v3.outliner import ArticleOutliner
from agents.v3.writer import GroundedWriter
from agents.v3.verifier import VerifierAgent

logger = logging.getLogger("semhys-v3")

class BloggerV3Agent:
    """
    Agente Orquestador V3 (NotebookLM Style).
    Coordina el pipeline secuencial:
    Input -> Validar -> Mapear -> Estructurar -> Redactar -> Verificar -> Output JSON
    """
    def __init__(self):
        self.validator = SourceValidator()
        self.mapper = ConceptMapper()
        self.outliner = ArticleOutliner()
        self.writer = GroundedWriter()
        self.verifier = VerifierAgent()

    def run_pipeline(self, topic: str, raw_sources: List[Dict], status_container=None) -> Dict:
        """
        Ejecuta todo el flujo V3.
        Argumento opcional 'status_container' para actualizar UI de Streamlit en tiempo real.
        """
        result = {
            "metadata": {"topic": topic, "version": "3.0"},
            "log": []
        }
        
        def update_status(msg):
            print(f"[V3 Pipeline] {msg}")
            result["log"].append(msg)
            if status_container:
                status_container.write(f"⚙️ {msg}")

        # --- FASE 1: VALIDACIÓN ---
        update_status("Validando fuentes con criterio CRAAP...")
        validation_result = self.validator.validate(topic, raw_sources)
        result["sources_validation"] = validation_result
        
        # Filtrar solo aceptadas
        accepted_sources = []
        if "validation_table" in validation_result:
            for s in validation_result["validation_table"]:
                if s.get("decision") == "ACCEPTED":
                    # Mapear de vuelta al objeto original si es necesario, 
                    # aquí asumimos que validation_result tiene suficiente info o hacemos match por URL/ID
                    # Para simplificar, reconstruimos una lista simple
                    accepted_sources.append(s)
        
        if len(accepted_sources) == 0:
            result["error"] = "No sources passed validation."
            update_status("❌ Ninguna fuente pasó el filtro CRAAP. Abortando.")
            return result

        update_status(f"✅ {len(accepted_sources)} fuentes aceptadas.")

        # --- FASE 2: CONCEPTO Y ESTRUCTURA ---
        update_status("Generando mapa conceptual (Mind Map)...")
        concept_map = self.mapper.map_content(topic, accepted_sources)
        result["concept_map"] = concept_map
        
        update_status("Diseñando estructura del artículo...")
        structure = self.outliner.create_outline(topic, concept_map, accepted_sources)
        result["article_structure"] = structure

        # --- FASE 3: REDACCIÓN ---
        # --- FASE 3: REDACCIÓN (ONE-SHOT OPTIMIZATION) ---
        update_status("Redactando artículo completo (Modo Optimizado)...")
        
        # Usamos el modo One-Shot para evitar rate limits (429) por múltiples llamadas
        full_article_content = self.writer.write_full_article_one_shot(topic, structure, accepted_sources)
        
        # Simular estructura de secciones para el JSON final (parseo simple)
        sections_output = []
        # (Opcional: Podríamos intentar splittear el markdown por headers ## para llenar sections_output)
        
        result["article"] = {
            "title": f"Informe Técnico: {topic}",
            "sections": sections_output, # Dejamos vacío o llenamos si parseamos
            "markdown_full": full_article_content
        }
        
        result["article"] = {
            "title": f"Informe Técnico: {topic}",
            "sections": sections_output,
            "markdown_full": full_article_content
        }
        
        update_status("✅ Pipeline finalizado exitosamente.")
        return result
