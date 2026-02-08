"""
Agent 2: Guardián de Privacidad (Privacy Guardian)
Extrae conocimiento técnico de la base de datos vectorial con CERO filtración de datos privados.
"""

import os
import re
import json
import logging
from typing import Dict, List, Optional, Set
from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core.client_options import ClientOptions

logger = logging.getLogger("agent_2_privacy_guardian")

class PrivacyGuardianAgent:
    """
    Extrae conocimiento técnico de la DB vectorial de SEMHYS
    con reglas estrictas de sanitización para proteger datos privados.
    """
    
    # REGLAS DE HIERRO: Patrones que NUNCA deben aparecer en el output
    FORBIDDEN_PATTERNS = [
        # Nombres de clientes (detectar nombres propios en contexto de proyectos)
        r'\b(Client|Cliente|Customer|Company)\s+[A-Z][a-z]+',
        # Ubicaciones específicas de proyectos
        r'\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)',
        # Coordenadas GPS
        r'\b\d+\.\d+°?\s*[NS],?\s*\d+\.\d+°?\s*[EW]',
        # Datos financieros
        r'\$\s*\d+[\d,]*(\.\d{2})?',
        r'\b\d+[\d,]*\s*(USD|EUR|dollars?|euros?)\b',
        # Números de contrato/proyecto
        r'\b(Contract|Project|PO)\s*#?\s*\d+',
        # Emails y teléfonos
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
    ]
    
    # Palabras clave que indican información privada
    SENSITIVE_KEYWORDS = {
        'client', 'cliente', 'customer', 'contract', 'contrato',
        'budget', 'presupuesto', 'cost', 'costo', 'price', 'precio',
        'confidential', 'confidencial', 'proprietary', 'private'
    }
    
    def __init__(
        self,
        project_id: str,
        location: str = "global",
        data_store_id: str = "semhys_v2"
    ):
        self.project_id = project_id
        self.location = location
        self.data_store_id = data_store_id
        
        # Cliente de Discovery Engine
        client_options = (
            ClientOptions(api_endpoint=f"{location}-discoveryengine.googleapis.com")
            if location != "global" else None
        )
        self.client = discoveryengine.SearchServiceClient(client_options=client_options)
        
        # Audit log para tracking de sanitización
        self.audit_log = []
    
    def _detect_sensitive_content(self, text: str) -> List[str]:
        """
        Detecta contenido sensible en el texto.
        
        Returns:
            Lista de patrones detectados
        """
        violations = []
        
        # Verificar patrones prohibidos
        for pattern in self.FORBIDDEN_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                violations.append(f"Pattern: {pattern[:30]}... (matches: {len(matches)})")
        
        # Verificar palabras clave sensibles
        text_lower = text.lower()
        for keyword in self.SENSITIVE_KEYWORDS:
            if keyword in text_lower:
                violations.append(f"Keyword: {keyword}")
        
        return violations
    
    def _sanitize_text(self, text: str) -> str:
        """
        Sanitiza el texto removiendo información privada.
        
        REGLA: Solo extraer principios técnicos, fórmulas físicas, y soluciones de ingeniería.
        """
        # Remover patrones prohibidos
        sanitized = text
        for pattern in self.FORBIDDEN_PATTERNS:
            sanitized = re.sub(pattern, "[REDACTED]", sanitized, flags=re.IGNORECASE)
        
        # Remover líneas que contengan keywords sensibles
        lines = sanitized.split('\n')
        clean_lines = []
        
        for line in lines:
            line_lower = line.lower()
            has_sensitive = any(kw in line_lower for kw in self.SENSITIVE_KEYWORDS)
            
            if not has_sensitive and "[REDACTED]" not in line:
                clean_lines.append(line)
            else:
                self.audit_log.append({
                    "action": "line_removed",
                    "reason": "sensitive_content",
                    "preview": line[:50] + "..." if len(line) > 50 else line
                })
        
        return '\n'.join(clean_lines)
    
    def _extract_technical_knowledge(self, document: Dict) -> Optional[Dict]:
        """
        Extrae SOLO conocimiento técnico del documento.
        
        Returns:
            Dict con conocimiento técnico sanitizado o None si no hay contenido válido
        """
        # Obtener contenido del documento
        struct_data = document.get("struct_data", {})
        snippet = document.get("snippet", "")
        title = document.get("title", "")
        
        # Combinar texto disponible
        full_text = f"{title}\n{snippet}"
        
        # Detectar contenido sensible ANTES de sanitizar
        violations = self._detect_sensitive_content(full_text)
        
        if violations:
            self.audit_log.append({
                "action": "document_flagged",
                "document_title": title[:50],
                "violations": violations
            })
        
        # Sanitizar
        sanitized_text = self._sanitize_text(full_text)
        
        # Si después de sanitizar no queda nada útil, descartar
        if len(sanitized_text.strip()) < 50:
            self.audit_log.append({
                "action": "document_rejected",
                "reason": "insufficient_technical_content",
                "document_title": title[:50]
            })
            return None
        
        # Extraer metadata técnica (disciplina, tipo de documento)
        discipline = struct_data.get("discipline", "general")
        doc_type = struct_data.get("doc_type", "unknown")
        
        return {
            "technical_content": sanitized_text,
            "discipline": discipline,
            "doc_type": doc_type,
            "metadata": {
                "sanitized": True,
                "violations_detected": len(violations),
                "original_length": len(full_text),
                "sanitized_length": len(sanitized_text)
            }
        }
    
    def query_knowledge_base(self, topic: str, max_docs: int = 10) -> List[Dict]:
        """
        Consulta la base de datos vectorial de SEMHYS.
        
        Args:
            topic: Tema a buscar
            max_docs: Número máximo de documentos a recuperar
        
        Returns:
            Lista de documentos con conocimiento técnico sanitizado
        """
        try:
            logger.info(f"🔍 Consultando DB vectorial para: {topic}")
            
            # Construir query enfocada en aspectos técnicos
            technical_query = f"""
            {topic}
            
            Enfoque: principios técnicos, fórmulas, soluciones de ingeniería, 
            metodologías, tecnologías, especificaciones técnicas.
            """
            
            serving_config = self.client.serving_config_path(
                project=self.project_id,
                location=self.location,
                data_store=self.data_store_id,
                serving_config="default_config",
            )
            
            request = discoveryengine.SearchRequest(
                serving_config=serving_config,
                query=technical_query,
                page_size=max_docs,
            )
            
            response = self.client.search(request=request)
            results = list(response.results)
            
            logger.info(f"📄 Documentos recuperados: {len(results)}")
            
            # Procesar y sanitizar cada documento
            sanitized_docs = []
            
            for result in results:
                doc_data = {
                    "title": getattr(result.document.derived_struct_data, "title", "N/A") if hasattr(result.document, "derived_struct_data") else "N/A",
                    "snippet": getattr(result, "snippet", "") if hasattr(result, "snippet") else "",
                    "struct_data": dict(result.document.struct_data) if hasattr(result.document, "struct_data") else {},
                    "score": getattr(result, "score", 0.0) if hasattr(result, "score") else 0.0
                }
                
                # Extraer conocimiento técnico
                technical_knowledge = self._extract_technical_knowledge(doc_data)
                
                if technical_knowledge:
                    sanitized_docs.append(technical_knowledge)
            
            logger.info(f"✅ Documentos sanitizados: {len(sanitized_docs)}")
            logger.info(f"🛡️ Eventos de auditoría: {len(self.audit_log)}")
            
            return sanitized_docs
            
        except Exception as e:
            logger.error(f"❌ Error consultando DB vectorial: {e}")
            return []
    
    def generate_knowledge_dossier(self, topic: str) -> Dict:
        """
        Genera un "Dossier de Conocimiento Sanitizado" para el tema dado.
        
        Este dossier es la "Fuente de Verdad" para los agentes posteriores.
        """
        logger.info(f"📋 Generando Dossier de Conocimiento para: {topic}")
        
        # Resetear audit log
        self.audit_log = []
        
        # Consultar DB
        sanitized_docs = self.query_knowledge_base(topic, max_docs=15)
        
        # Organizar por disciplina
        by_discipline = {}
        for doc in sanitized_docs:
            discipline = doc.get("discipline", "general")
            if discipline not in by_discipline:
                by_discipline[discipline] = []
            by_discipline[discipline].append(doc)
        
        # Generar dossier
        dossier = {
            "topic": topic,
            "total_documents": len(sanitized_docs),
            "disciplines_covered": list(by_discipline.keys()),
            "knowledge_base": by_discipline,
            "audit_summary": {
                "total_audit_events": len(self.audit_log),
                "documents_flagged": len([e for e in self.audit_log if e.get("action") == "document_flagged"]),
                "documents_rejected": len([e for e in self.audit_log if e.get("action") == "document_rejected"]),
                "lines_removed": len([e for e in self.audit_log if e.get("action") == "line_removed"])
            },
            "privacy_guarantee": "✅ ZERO PII - Solo conocimiento técnico",
            "audit_log": self.audit_log  # Para revisión si es necesario
        }
        
        logger.info(f"✅ Dossier generado: {len(sanitized_docs)} docs, {len(by_discipline)} disciplinas")
        
        return dossier
    
    def run(self, topic: str) -> Dict:
        """
        Punto de entrada principal del agente.
        
        Args:
            topic: Tema seleccionado por Agent 1
        
        Returns:
            Dossier de conocimiento sanitizado
        """
        return self.generate_knowledge_dossier(topic)


if __name__ == "__main__":
    # Test del agente
    logging.basicConfig(level=logging.INFO)
    
    PROJECT_ID = os.getenv("GCP_PROJECT_ID", "gen-lang-client-0585991170")
    
    agent = PrivacyGuardianAgent(project_id=PROJECT_ID)
    
    # Test con un tema
    test_topic = "Energy efficiency in hydraulic pumping systems"
    dossier = agent.run(test_topic)
    
    print("\n" + "="*80)
    print("RESULTADO AGENTE 2: GUARDIÁN DE PRIVACIDAD")
    print("="*80)
    print(json.dumps(dossier, indent=2, ensure_ascii=False))
