"""
Orchestrator V4: Coordina la ejecución secuencial de los agentes autónomos
"""

import os
import json
import logging
from typing import Dict, Optional
from datetime import datetime
import sys

# Agregar directorio padre al path para imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar agentes
from agent_1_market_intelligence import MarketIntelligenceAgent
from agent_2_privacy_guardian import PrivacyGuardianAgent
from agent_3_notebook_synthesizer import NotebookSynthesizerAgent
from agent_4_auditor import AuditorAgent

logger = logging.getLogger("orchestrator_v4")

class AgentOrchestrator:
    """
    Orquestador maestro del pipeline de agentes autónomos.
    Coordina la ejecución secuencial y maneja el flujo de datos.
    """
    
    def __init__(self, project_id: str, location: str = "us-central1"):
        self.project_id = project_id
        self.location = location
        
        # Inicializar agentes
        logger.info("🚀 Inicializando agentes...")
        self.agent_1 = MarketIntelligenceAgent(project_id, location)
        self.agent_2 = PrivacyGuardianAgent(project_id, location="global")
        self.agent_3 = NotebookSynthesizerAgent(project_id, location)
        self.agent_4 = AuditorAgent(project_id, location)
        
        # Pipeline state
        self.pipeline_state = {
            "started_at": None,
            "completed_at": None,
            "status": "idle",
            "current_agent": None,
            "results": {}
        }
    
    def run_pipeline(
        self,
        manual_topic: Optional[str] = None,
        save_output: bool = True
    ) -> Dict:
        """
        Ejecuta el pipeline completo de generación de contenido.
        
        Args:
            manual_topic: Tema manual desde panel de control (opcional)
            save_output: Si True, guarda resultados en archivos JSON
        
        Returns:
            Dict con resultados completos del pipeline
        """
        logger.info("="*80)
        logger.info("🚀 INICIANDO PIPELINE DE GENERACIÓN DE CONTENIDO")
        logger.info("="*80)
        
        self.pipeline_state["started_at"] = datetime.now().isoformat()
        self.pipeline_state["status"] = "running"
        
        try:
            # ========== AGENT 1: OJEADOR GLOBAL ==========
            logger.info("\n" + "="*80)
            logger.info("🔍 AGENTE 1: OJEADOR GLOBAL (Market Intelligence)")
            logger.info("="*80)
            
            self.pipeline_state["current_agent"] = "agent_1"
            agent_1_result = self.agent_1.run(override_topic=manual_topic)
            self.pipeline_state["results"]["agent_1"] = agent_1_result
            
            selected_topic = agent_1_result["selected_topic"]["title"]
            logger.info(f"✅ Tema seleccionado: {selected_topic}")
            
            # ========== AGENT 2: GUARDIÁN DE PRIVACIDAD ==========
            logger.info("\n" + "="*80)
            logger.info("🛡️ AGENTE 2: GUARDIÁN DE PRIVACIDAD (Privacy Guardian)")
            logger.info("="*80)
            
            self.pipeline_state["current_agent"] = "agent_2"
            agent_2_result = self.agent_2.run(selected_topic)
            self.pipeline_state["results"]["agent_2"] = agent_2_result
            
            logger.info(f"✅ Dossier generado: {agent_2_result['total_documents']} documentos")
            logger.info(f"🛡️ {agent_2_result['privacy_guarantee']}")
            
            # ========== AGENT 3: NÚCLEO NOTEBOOK ==========
            logger.info("\n" + "="*80)
            logger.info("📝 AGENTE 3: NÚCLEO NOTEBOOK (Technical Synthesizer)")
            logger.info("="*80)
            
            self.pipeline_state["current_agent"] = "agent_3"
            agent_3_result = self.agent_3.run(selected_topic, agent_2_result)
            self.pipeline_state["results"]["agent_3"] = agent_3_result
            
            article = agent_3_result["article"]
            logger.info(f"✅ Artículo generado: {article['title']}")
            logger.info(f"📊 {article['metadata']['word_count']} palabras, {article['metadata']['sections_count']} secciones")
            
            # ========== AGENT 4: AUDITOR ==========
            logger.info("\n" + "="*80)
            logger.info("🔍 AGENTE 4: AUDITOR (Anti-Hallucination Verification)")
            logger.info("="*80)
            
            self.pipeline_state["current_agent"] = "agent_4"
            agent_4_result = self.agent_4.run(article, agent_2_result)
            self.pipeline_state["results"]["agent_4"] = agent_4_result
            
            audit_report = agent_4_result["audit_report"]
            logger.info(f"{'✅' if agent_4_result['passed'] else '❌'} Auditoría: {audit_report['audit_status']}")
            logger.info(f"📊 Verificación: {audit_report['verification_rate']}% ({audit_report['verified_claims']}/{audit_report['total_claims']} afirmaciones)")
            
            # Verificar si pasó la auditoría
            if not agent_4_result["passed"]:
                logger.warning("⚠️ ARTÍCULO NO PASÓ LA AUDITORÍA")
                logger.warning(f"Recomendaciones: {', '.join(audit_report['recommendations'])}")
                
                self.pipeline_state["status"] = "failed_audit"
                self.pipeline_state["completed_at"] = datetime.now().isoformat()
                
                return {
                    "status": "failed",
                    "reason": "audit_failed",
                    "audit_report": audit_report,
                    "pipeline_state": self.pipeline_state
                }
            
            # ========== PIPELINE COMPLETADO ==========
            logger.info("\n" + "="*80)
            logger.info("✅ PIPELINE COMPLETADO EXITOSAMENTE")
            logger.info("="*80)
            
            self.pipeline_state["status"] = "completed"
            self.pipeline_state["completed_at"] = datetime.now().isoformat()
            
            # Resultado final
            final_result = {
                "status": "success",
                "topic": selected_topic,
                "article": agent_4_result["audited_article"],
                "audit_report": audit_report,
                "metadata": {
                    "started_at": self.pipeline_state["started_at"],
                    "completed_at": self.pipeline_state["completed_at"],
                    "total_documents_analyzed": agent_2_result["total_documents"],
                    "disciplines_covered": agent_2_result["disciplines_covered"],
                    "privacy_guarantee": agent_2_result["privacy_guarantee"]
                }
            }
            
            # Guardar resultados si se solicita
            if save_output:
                self._save_results(final_result)
            
            return final_result
            
        except Exception as e:
            logger.error(f"❌ ERROR EN PIPELINE: {e}")
            import traceback
            traceback.print_exc()
            
            self.pipeline_state["status"] = "error"
            self.pipeline_state["error"] = str(e)
            self.pipeline_state["completed_at"] = datetime.now().isoformat()
            
            return {
                "status": "error",
                "error": str(e),
                "pipeline_state": self.pipeline_state
            }
    
    def _save_results(self, result: Dict):
        """
        Guarda los resultados del pipeline en archivos.
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Crear directorio de outputs si no existe
        output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "pipeline_outputs")
        os.makedirs(output_dir, exist_ok=True)
        
        # Guardar resultado completo (JSON)
        result_file = os.path.join(output_dir, f"pipeline_result_{timestamp}.json")
        with open(result_file, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        logger.info(f"💾 Resultado guardado: {result_file}")
        
        # Guardar artículo (Markdown)
        article_file = os.path.join(output_dir, f"article_{timestamp}.md")
        with open(article_file, "w", encoding="utf-8") as f:
            f.write(result["article"]["full_text"])
        logger.info(f"📄 Artículo guardado: {article_file}")
        
        # Guardar reporte de auditoría (JSON)
        audit_file = os.path.join(output_dir, f"audit_report_{timestamp}.json")
        with open(audit_file, "w", encoding="utf-8") as f:
            json.dump(result["audit_report"], f, indent=2, ensure_ascii=False)
        logger.info(f"🔍 Reporte de auditoría guardado: {audit_file}")


def main():
    """
    Punto de entrada principal para ejecución standalone.
    """
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    PROJECT_ID = os.getenv("GCP_PROJECT_ID", "gen-lang-client-0585991170")
    
    # Crear orquestador
    orchestrator = AgentOrchestrator(project_id=PROJECT_ID)
    
    # Ejecutar pipeline
    # Puedes pasar un tema manual aquí si lo deseas
    manual_topic = os.getenv("MANUAL_TOPIC", None)
    
    result = orchestrator.run_pipeline(manual_topic=manual_topic, save_output=True)
    
    # Mostrar resumen
    print("\n" + "="*80)
    print("RESUMEN DEL PIPELINE")
    print("="*80)
    print(f"Status: {result['status']}")
    
    if result["status"] == "success":
        print(f"Tema: {result['topic']}")
        print(f"Título del artículo: {result['article']['title']}")
        print(f"Palabras: {result['article']['metadata']['word_count']}")
        print(f"Tasa de verificación: {result['audit_report']['verification_rate']}%")
        print(f"Documentos analizados: {result['metadata']['total_documents_analyzed']}")
        print(f"\n{result['metadata']['privacy_guarantee']}")
    else:
        print(f"Razón del fallo: {result.get('reason', 'unknown')}")
        if "error" in result:
            print(f"Error: {result['error']}")


if __name__ == "__main__":
    main()
