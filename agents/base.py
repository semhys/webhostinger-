
from abc import ABC, abstractmethod
import logging
from typing import List, Optional
import vertexai
from vertexai.generative_models import GenerativeModel as VertexModel
import google.generativeai as genai
from utils.security import SecuritySanitizer
import streamlit as st

logger = logging.getLogger("semhys-agents")

class SemhysAgent(ABC):
    """
    Clase base para todos los agentes de EcoSemhys.
    Soporta Backend Híbrido: Vertex AI (Empresarial) o Google AI (API Key Personal).
    """

    def __init__(self, name: str, model_version: str = "gemini-1.5-flash", temperature: float = 0.2):
        self.name = name
        self.model_version = model_version
        self.temperature = temperature
        self.model = None
        self.backend = "vertex" # 'vertex' or 'apikey'
        self._initialize_model()

    def _initialize_model(self):
        # 1. Intentar buscar API KEY
        api_key = None
        try:
            if "GEMINI_API_KEY" in st.session_state and st.session_state["GEMINI_API_KEY"]:
                api_key = st.session_state["GEMINI_API_KEY"]
            elif "gemini_api_key" in st.secrets:
                api_key = st.secrets["gemini_api_key"]
        except:
            pass 

        if api_key:
            try:
                # ESTRATEGIA: Usar REST API directo.
                from utils.simple_ai import SimpleGenAIModel
                import time
                import random
                
                # ESTRATEGIA: Obtener lista real de modelos disponibles para esta cuenta
                from utils.simple_ai import SimpleGenAIModel
                import requests
                
                st.sidebar.markdown("---")
                st.sidebar.caption("📋 **Modelos Disponibles (Cuenta):**")
                
                # 1. Obtener lista desde Google y aplicar WHITELIST FINAL (EXACT MATCH COMPREHENSIVE)
                # Solo permitimos modelos de TEXTO probados y versiones estables.
                # Bloqueamos 'lite', 'image', 'audio', 'preview' raros.
                KNOWN_WORKING_EXACT = {
                    # Familia 2.0
                    "gemini-2.0-flash-exp",
                    "gemini-2.0-flash",
                    
                    # Familia 1.5 Flash (Rapidez y Cuota)
                    "gemini-1.5-flash",
                    "gemini-1.5-flash-001",
                    "gemini-1.5-flash-002",
                    "gemini-1.5-flash-8b",
                    
                    # Familia 1.5 Pro (Razonamiento)
                    "gemini-1.5-pro",
                    "gemini-1.5-pro-001",
                    "gemini-1.5-pro-002",
                    
                    # Legacy
                    "gemini-pro"
                }
                
                available_models = []
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
                    r = requests.get(url)
                    if r.status_code == 200:
                        data = r.json().get("models", [])
                        for m in data:
                            name = m['name'].replace("models/", "")
                            # Filtrar solo si soporta generateContent y es conocido
                            if "generateContent" in m.get("supportedGenerationMethods", []):
                                # Check vs Whitelist (EXACT MATCH)
                                if name in KNOWN_WORKING_EXACT:
                                    available_models.append(name)
                    else:
                        st.sidebar.error(f"Error listando: {r.status_code}")
                except Exception as e:
                    st.sidebar.error(f"Error conexión: {e}")

                # 2. Mostrar y probar
                selected_model = None
                
                # Priorizar 2.0 y luego 1.5
                priority_order = ["gemini-2.0-flash-exp", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro"]
                
                # Ordenar la lista real poniendo los prioritarios primero
                sorted_models = []
                for p in priority_order:
                    if p in available_models:
                        sorted_models.append(p)
                # Agregar el resto
                for m in available_models:
                    if m not in sorted_models:
                        sorted_models.append(m)
                        
                if not sorted_models:
                    # Fallback si falla el listado
                    sorted_models = priority_order

                # GUARDAR CANDIDATOS PARA FALLBACK
                self.fallback_candidates = []
                for m_name in sorted_models:
                     if "vision" not in m_name and "gemma" not in m_name:
                         self.fallback_candidates.append(m_name)
                
                # Seleccionar el primero
                if self.fallback_candidates:
                    selected_model = self.fallback_candidates[0]
                    # Remover el actual de la lista de pendientes para no repetirlo inmediatamente si falla
                    # (Opcional: se puede dejar para reintentar más tarde, pero aquí rotaremos)
                else:
                     st.sidebar.error("⚠️ Ningún modelo pasó el test. Usando Flash 2.0 por defecto.")
                     selected_model = "gemini-2.0-flash-exp" 
                     self.fallback_candidates = ["gemini-2.0-flash-exp"]

                self.model_name_current = selected_model
                self.model = SimpleGenAIModel(
                    model_name=selected_model,
                    api_key=api_key,
                    system_instruction=self.get_system_instruction()
                )
                self.backend = "apikey" 
                self.api_key = api_key # Save for re-init
                logger.info(f"🤖 Agente '{self.name}' (REST API): OK (Modelo: {selected_model})")
                return
            except Exception as e:
                logger.error(f"❌ Falló init REST API: {e}")

        # 2. Fallback a Vertex AI (Default)
        try:
            vertex = "gemini-1.0-pro" if "1.0" in self.model_version else self.model_version
            self.model = VertexModel(
                vertex,
                system_instruction=self.get_system_instruction()
            )
            self.backend = "vertex"
            logger.info(f"🤖 Agente '{self.name}' inicializado con Vertex AI.")
            print(f"DEBUG: Agente {self.name} usando Vertex AI.")
        except Exception as e:
            logger.error(f"❌ Error iniciando agente {self.name} con Vertex: {e}")
            self.model = None

    @abstractmethod
    def get_system_instruction(self) -> str:
        """Cada agente debe definir su propia personalidad e instrucciones base."""
        pass

    def generate(self, prompt: str, context: str = "") -> str:
        """Método principal para generar respuesta."""
        if not self.model:
            return "Error: Agente no inicializado (Modelo offline)."

        full_prompt = f"{prompt}\n\nContexto Adicional:\n{context}" if context else prompt
        
        # Retry logic for Rate Limits (429) & Model Fallback
        # Dynamic retries: Give enough chances to cycle through ALL candidates + buffers
        candidate_count = len(self.fallback_candidates) if hasattr(self, "fallback_candidates") else 1
        max_retries = max(3, candidate_count + 3)
        
        retry_delay = 5
        tried_models_log = []

        for attempt in range(max_retries + 1):
            current_model_name = self.model_name_current if hasattr(self, 'model_name_current') else 'Vertex/Default'
            tried_models_log.append(current_model_name)
            
            try:
                # 1. Generación
                # Check if model object has generate_content (it should)
                response = self.model.generate_content(
                    full_prompt,
                    generation_config={"temperature": self.temperature, "max_output_tokens": 2048}
                )
                raw_text = response.text

                # 2. ANOMIMIZACIÓN OBLIGATORIA (Capa de salida)
                safe_text = SecuritySanitizer.sanitize(raw_text)
                return safe_text

            except Exception as e:
                error_str = str(e)
                # Detectar 429 (Quota) o 500 (Internal Error que a veces pide cambio de modelo)
                if "429" in error_str or "quota" in error_str.lower() or "500" in error_str:
                    
                    print(f"[{self.name}] ⚠️ Error {error_str} con {current_model_name}")
                    
                    # INTENTAR ROTACIÓN DE MODELO (Solo si estamos en modo API Key)
                    if self.backend == "apikey" and hasattr(self, "fallback_candidates") and len(self.fallback_candidates) > 1:
                        # Mover el actual al final (round robin) o simplemente tomar el siguiente
                        old_model = self.fallback_candidates.pop(0)
                        self.fallback_candidates.append(old_model)
                        
                        next_model = self.fallback_candidates[0]
                        print(f"[{self.name}] 🔄 ROTANDO MODELO: {old_model} -> {next_model}")
                        
                        # Re-inicializar cliente
                        try:
                            from utils.simple_ai import SimpleGenAIModel
                            new_client = SimpleGenAIModel(
                                model_name=next_model,
                                api_key=self.api_key,
                                system_instruction=self.get_system_instruction()
                            )
                            # Verificar que el cliente funciona (opcional, lightweight)
                            self.model = new_client
                            self.model_name_current = next_model
                            
                            print(f"[{self.name}] ✅ Cambio exitoso a {next_model}. Reintentando...")
                            import time
                            time.sleep(2) 
                            continue # Reintentar loop con nuevo modelo
                        except Exception as switch_e:
                            print(f"[{self.name}] ❌ Error cambiando modelo: {switch_e}. Intentando siguiente...")
                            # Si falla el cambio, el loop continuará y caerá en el backoff tradicional o siguiente intento

                    # Si no se pudo rotar (o es Vertex), usar Backoff tradicional
                    if attempt < max_retries:
                        import time
                        logger.warning(f"⚠️ Rate Limit (429) en {self.name}. Reintentando en {retry_delay}s...")
                        print(f"[{self.name}] ⏳ Esperando {retry_delay}s para reintentar ({attempt+1}/{max_retries})...")
                        time.sleep(retry_delay)
                        retry_delay *= 2 # Exponential backoff
                        continue
                
                logger.error(f"Error generando con {self.name}: {e}")
                return f"(Error en agente {self.name}: {str(e)})"

        return f"(Error Fatal: Se agotaron los {max_retries} intentos. Modelos probados: {', '.join(tried_models_log)}.)"
