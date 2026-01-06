import vertexai
from vertexai.generative_models import GenerativeModel
import os

PROJECT_ID = "gen-lang-client-0585991170"
LOCATION = "us-central1"

print(f"Diagnostico FINAL Vertex AI para {PROJECT_ID}")

try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    
    # Probamos SOLO el modelo corregido
    name = "gemini-1.5-flash"
    
    print(f"\nProbando modelo: {name}...")
    try:
        model = GenerativeModel(name)
        response = model.generate_content("Hola, ¿funcionas?")
        print(f"✅ {name}: ÉXITO ROTUNDO (Respuesta: {response.text})")
    except Exception as e:
        print(f"❌ {name}: FALLÓ ({str(e)})")

except Exception as e:
    print(f"Error general: {e}")
