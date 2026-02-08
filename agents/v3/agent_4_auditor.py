"""
Agent 4: Auditor (Anti-Hallucination Verification System)
Valida cada dato del artículo con Temperature: 0 y rechaza contenido no verificable.
"""

import os
import json
import logging
import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import vertexai
from vertexai.generative_models import GenerativeModel

logger = logging.getLogger("agent_4_auditor")

class AuditorAgent:
    """
    Sistema de verificación anti-alucinaciones.
    Valida cada afirmación técnica contra las fuentes del dossier.
    """
    
    def __init__(self, project_id: str, location: str = "us-central1"):
        self.project_id = project_id
        self.location = location
        vertexai.init(project=project_id, location=location)
        
        # Modelo con Temperature: 0 para máxima precisión
        self.model = GenerativeModel("gemini-1.5-flash")
        
        # Log de verificación
        self.verification_log = []
    
    def extract_claims(self, article_text: str) -> List[str]:
        """
        Extrae afirmaciones técnicas del artículo que requieren verificación.
        """
        prompt = f"""
        Actúa como un auditor técnico.
        
        ARTÍCULO:
        {article_text}
        
        TAREA:
        Extrae todas las afirmaciones técnicas que requieren verificación.
        
        Incluye:
        - Datos numéricos (porcentajes, mediciones, etc.)
        - Afirmaciones sobre tecnologías o métodos
        - Comparaciones técnicas
        - Principios físicos o fórmulas
        
        Excluye:
        - Opiniones generales
        - Afirmaciones obvias
        
        FORMATO JSON:
        {{
            "claims": [
                {{
                    "claim_id": 1,
                    "claim_text": "texto de la afirmación",
                    "claim_type": "numerical/technical/comparative/principle",
                    "section": "sección donde aparece"
                }}
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.0,  # TEMPERATURA CERO para precisión
                    "top_p": 1.0,
                    "max_output_tokens": 2048,
                }
            )
            
            result_text = response.text.strip()
            if result_text.startswith("```json"):
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif result_text.startswith("```"):
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            claims_data = json.loads(result_text)
            claims = claims_data.get("claims", [])
            
            logger.info(f"🔍 Afirmaciones extraídas: {len(claims)}")
            return claims
            
        except Exception as e:
            logger.error(f"Error extrayendo afirmaciones: {e}")
            return []
    
    def verify_claim(self, claim: Dict, dossier: Dict) -> Dict:
        """
        Verifica una afirmación individual contra el dossier.
        
        Returns:
            Dict con resultado de verificación
        """
        claim_text = claim.get("claim_text", "")
        claim_id = claim.get("claim_id", 0)
        
        # Construir contexto de verificación desde el dossier
        knowledge_base = dossier.get("knowledge_base", {})
        all_technical_content = []
        
        for discipline, docs in knowledge_base.items():
            for doc in docs:
                all_technical_content.append(doc.get("technical_content", ""))
        
        sources_context = "\n\n".join(all_technical_content)
        
        prompt = f"""
        Actúa como un auditor técnico riguroso.
        
        FUENTES VERIFICADAS (Dossier de Conocimiento):
        {sources_context}
        
        AFIRMACIÓN A VERIFICAR:
        "{claim_text}"
        
        TAREA:
        Determina si esta afirmación es verificable con las fuentes proporcionadas.
        
        CRITERIOS:
        - ¿La afirmación está respaldada por las fuentes?
        - ¿Los datos numéricos coinciden?
        - ¿Los principios técnicos son correctos?
        
        FORMATO JSON:
        {{
            "verified": true/false,
            "confidence": 0.0-1.0,
            "supporting_evidence": "cita textual de la fuente que respalda (si verified=true)",
            "issue": "descripción del problema (si verified=false)",
            "recommendation": "mantener/modificar/eliminar"
        }}
        """
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.0,  # TEMPERATURA CERO
                    "top_p": 1.0,
                    "max_output_tokens": 1024,
                }
            )
            
            result_text = response.text.strip()
            if result_text.startswith("```json"):
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif result_text.startswith("```"):
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            verification = json.loads(result_text)
            verification["claim_id"] = claim_id
            verification["claim_text"] = claim_text
            
            # Log
            status = "✅ VERIFICADA" if verification.get("verified") else "❌ NO VERIFICABLE"
            logger.info(f"{status} - Claim #{claim_id}: {claim_text[:60]}...")
            
            self.verification_log.append(verification)
            
            return verification
            
        except Exception as e:
            logger.error(f"Error verificando claim #{claim_id}: {e}")
            return {
                "claim_id": claim_id,
                "claim_text": claim_text,
                "verified": False,
                "confidence": 0.0,
                "issue": f"Error de verificación: {str(e)}",
                "recommendation": "eliminar"
            }
    
    def generate_references_section(self, dossier: Dict) -> str:
        """
        Genera la sección de Referencias Técnicas basada en el dossier.
        """
        references = []
        ref_num = 1
        
        knowledge_base = dossier.get("knowledge_base", {})
        
        for discipline, docs in knowledge_base.items():
            for doc in docs:
                doc_type = doc.get("doc_type", "Technical Document")
                references.append(f"[{ref_num}] {doc_type.title()} - {discipline.title()} Engineering")
                ref_num += 1
        
        if not references:
            references.append("[1] SEMHYS Internal Technical Documentation")
        
        references_section = "\n## Referencias Técnicas\n\n"
        references_section += "\n".join(references)
        references_section += "\n\n*Todas las referencias provienen de la base de conocimiento técnico de SEMHYS.*"
        
        return references_section
    
    def audit_article(self, article: Dict, dossier: Dict) -> Dict:
        """
        Audita el artículo completo.
        
        Returns:
            Dict con artículo auditado y reporte de verificación
        """
        logger.info("🔍 Iniciando auditoría anti-alucinaciones...")
        
        # Resetear log
        self.verification_log = []
        
        article_text = article.get("full_text", "")
        
        # Extraer afirmaciones
        claims = self.extract_claims(article_text)
        
        # Verificar cada afirmación
        verifications = []
        for claim in claims:
            verification = self.verify_claim(claim, dossier)
            verifications.append(verification)
        
        # Calcular estadísticas
        total_claims = len(verifications)
        verified_claims = len([v for v in verifications if v.get("verified")])
        unverified_claims = total_claims - verified_claims
        
        verification_rate = (verified_claims / total_claims * 100) if total_claims > 0 else 0
        
        # Determinar si el artículo pasa la auditoría
        # REGLA: Mínimo 80% de afirmaciones verificadas
        MINIMUM_VERIFICATION_RATE = 80.0
        
        passed_audit = verification_rate >= MINIMUM_VERIFICATION_RATE
        
        # Generar sección de referencias
        references_section = self.generate_references_section(dossier)
        
        # Si pasa la auditoría, agregar referencias al artículo
        audited_article = article.copy()
        if passed_audit:
            audited_article["full_text"] = article_text + "\n\n" + references_section
            audited_article["metadata"]["references_added"] = True
            audited_article["metadata"]["audit_passed"] = True
        else:
            audited_article["metadata"]["audit_passed"] = False
        
        # Reporte de auditoría
        audit_report = {
            "audit_status": "PASSED" if passed_audit else "FAILED",
            "verification_rate": round(verification_rate, 2),
            "total_claims": total_claims,
            "verified_claims": verified_claims,
            "unverified_claims": unverified_claims,
            "minimum_required_rate": MINIMUM_VERIFICATION_RATE,
            "verifications": verifications,
            "recommendations": self._generate_recommendations(verifications),
            "audited_at": datetime.now().isoformat()
        }
        
        logger.info(f"{'✅' if passed_audit else '❌'} Auditoría completada: {verification_rate:.1f}% verificado")
        
        return {
            "audited_article": audited_article,
            "audit_report": audit_report,
            "passed": passed_audit
        }
    
    def _generate_recommendations(self, verifications: List[Dict]) -> List[str]:
        """
        Genera recomendaciones basadas en los resultados de verificación.
        """
        recommendations = []
        
        to_eliminate = [v for v in verifications if v.get("recommendation") == "eliminar"]
        to_modify = [v for v in verifications if v.get("recommendation") == "modificar"]
        
        if to_eliminate:
            recommendations.append(f"Eliminar {len(to_eliminate)} afirmaciones no verificables")
        
        if to_modify:
            recommendations.append(f"Modificar {len(to_modify)} afirmaciones para mayor precisión")
        
        if not to_eliminate and not to_modify:
            recommendations.append("Artículo técnicamente sólido, listo para publicación")
        
        return recommendations
    
    def run(self, article: Dict, dossier: Dict) -> Dict:
        """
        Punto de entrada principal del agente.
        
        Args:
            article: Artículo generado por Agent 3
            dossier: Dossier de conocimiento de Agent 2
        
        Returns:
            Artículo auditado con reporte de verificación
        """
        return self.audit_article(article, dossier)


if __name__ == "__main__":
    # Test del agente
    logging.basicConfig(level=logging.INFO)
    
    PROJECT_ID = os.getenv("GCP_PROJECT_ID", "gen-lang-client-0585991170")
    
    # Mock article para testing
    mock_article = {
        "title": "Energy Efficiency in Hydraulic Systems",
        "full_text": """# Energy Efficiency in Hydraulic Systems
        
Variable frequency drives (VFDs) can reduce energy consumption by up to 50% in centrifugal pumps.
Modern hydraulic systems achieve efficiency ratings of 85-90%.
        """,
        "metadata": {}
    }
    
    mock_dossier = {
        "knowledge_base": {
            "hydraulics": [
                {
                    "technical_content": "VFDs reduce energy consumption in pumps by 40-50%",
                    "doc_type": "technical_report"
                }
            ]
        }
    }
    
    agent = AuditorAgent(project_id=PROJECT_ID)
    result = agent.run(mock_article, mock_dossier)
    
    print("\n" + "="*80)
    print("RESULTADO AGENTE 4: AUDITOR")
    print("="*80)
    print(json.dumps(result, indent=2, ensure_ascii=False))
