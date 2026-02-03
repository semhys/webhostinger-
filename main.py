import os
import logging
from typing import List, Optional, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part
from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core.client_options import ClientOptions

# --- CONFIGURACIÓN ---
# --- CONFIGURACIÓN ---
PROJECT_ID = os.getenv("PROJECT_ID", "semhys-chat")
LOCATION = os.getenv("LOCATION", "us-central1")
DATA_STORE_ID = os.getenv("DATA_STORE_ID", "semhys-investigacion") 

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("semhys-backend")

# --- BÚSQUEDA EN DATA STORE (MEMORIA) ---
def search_data_store(query: str):
    """Busca documentos en el Data Store de Vertex AI."""
    try:
        # Configurar cliente (Global required for Discovery Engine mostly)
        client_options = (
            ClientOptions(api_endpoint=f"global-discoveryengine.googleapis.com")
            if LOCATION != "global" else None
        )
        client = discoveryengine.SearchServiceClient(client_options=client_options)
        
        serving_config = client.serving_config_path(
            project=PROJECT_ID,
            location="global", # Data Stores suelen ser globales
            data_store=DATA_STORE_ID,
            serving_config="default_config",
        )
        
        request = discoveryengine.SearchRequest(
            serving_config=serving_config,
            query=query,
            page_size=3,
            content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
                snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
                    return_snippet=True
                )
            )
        )
        
        response = client.search(request)
        
        results_text = ""
        for result in response.results:
            title = result.document.derived_struct_data.get('title', 'Documento sin título')
            # Intentar obtener snippet
            snippet = ""
            try:
                snippet = result.document.derived_struct_data.get('snippets', [])[0].get('snippet', '')
            except:
                pass
            results_text += f"- **{title}**: ...{snippet}...\n"
            
        return results_text if results_text else "No se encontraron documentos relevantes."
        
    except Exception as e:
        logger.error(f"Error buscando en Data Store: {e}")
        return f"(Error accediendo a memoria: {e})"

# --- MODELO DE EMERGENCIA (OFFLINE) ---
class OfflineModel:
    def generate_content(self, prompt):
        return type('obj', (object,), {'text': "OFFLINE_RESPONSE_MARKER"})

# --- GESTOR DE MODELOS INTELIGENTE ---
ACTIVE_MODEL = None
ACTIVE_MODEL_NAME = "offline"

def initialize_vertex():
    global ACTIVE_MODEL, ACTIVE_MODEL_NAME
    
    candidates = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro", "chat-bison@002"]
    
    try:
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        for name in candidates:
            try:
                model = GenerativeModel(name)
                model.generate_content("Ping")
                ACTIVE_MODEL = model
                ACTIVE_MODEL_NAME = name
                logger.info(f"✅ CONECTADO A: {name}")
                return
            except Exception as e:
                logger.warning(f"❌ {name} falló: {e}")
    except Exception as e:
        logger.error(f"Vertex Init falló: {e}")
    
    # 3. Si todo falla, usar Offline
    logger.error("⚠️ ACTIVANDO MODELO OFFLINE DE EMERGENCIA")
    ACTIVE_MODEL = OfflineModel()
    ACTIVE_MODEL_NAME = "offline-mode"

# Inicializar al arranque
initialize_vertex()

app = FastAPI(title="Semhys Chat API (Unkillable)", version="3.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    language: str = "es"

class ChatResponse(BaseModel):
    response: str
    metadata: Optional[Dict[str, Any]] = None

@app.get("/api/health")
async def root():
    return {
        "status": "ok", 
        "service": "Semhys AI Backend", 
        "model": ACTIVE_MODEL_NAME,
        "data_store": DATA_STORE_ID
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Recuperar Contexto (SIEMPRE INTENTAR)
        context = search_data_store(request.message)
        
        # 2. Construir Respuesta
        response_text = ""
        
        if ACTIVE_MODEL_NAME == "offline-mode":
            # Si el modelo falla, devolvemos los DATOS directamente.
            response_text = (
                f"⚠️ **Modo Datos Directos**: El 'Cerebro' (Gemini) no responde (Error 404), "
                f"pero tu **Memoria (Data Store)** funciona perfectamente.\n\n"
                f"Esto es lo que encontré en tus documentos sobre tu consulta:\n\n{context}\n\n"
                f"*(Nota: No puedo resumir esto sin Gemini, pero aquí tienes la evidencia cruda).*"
            )
        else:
            # Si hay modelo, le damos el contexto para que responda bonito
            full_prompt = (
                f"Eres el Ingeniero de Semhys. Usa la siguiente información REAL de la base de datos para responder:\n"
                f"--- CONTEXTO ---\n{context}\n----------------\n"
                f"Pregunta del Usuario: {request.message}"
            )
            response = ACTIVE_MODEL.generate_content(full_prompt)
            response_text = response.text

        return ChatResponse(
            response=response_text,
            metadata={"model": ACTIVE_MODEL_NAME, "context_found": len(context) > 0}
        )

    except Exception as e:
        logger.error(f"Error en chat: {e}")
        return ChatResponse(
            response=f"⚠️ Error Crítico en Chat: {str(e)}",
            metadata={"status": "crash"}
        )

app.mount("/", StaticFiles(directory=".", html=True), name="static")
