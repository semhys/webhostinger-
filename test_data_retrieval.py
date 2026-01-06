from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core.client_options import ClientOptions

PROJECT_ID = "semhys-chat"
LOCATION = "global"
DATA_STORE_ID = "semhys-investigacion" 

def search_sample():
    client_options = (
        ClientOptions(api_endpoint=f"{LOCATION}-discoveryengine.googleapis.com")
        if LOCATION != "global"
        else None
    )
    
    client = discoveryengine.SearchServiceClient(client_options=client_options)
    
    serving_config = client.serving_config_path(
        project=PROJECT_ID,
        location=LOCATION,
        data_store=DATA_STORE_ID,
        serving_config="default_config",
    )
    
    # Búsqueda genérica para ver si hay documentos indexados
    request = discoveryengine.SearchRequest(
        serving_config=serving_config,
        query="agua", # Término genérico de tu dominio
        page_size=3,
    )
    
    print(f"🔎 Consultando Data Store: {DATA_STORE_ID}...")
    try:
        response = client.search(request)
        print("✅ Conexión con Data Store EXITOSA.")
        if response.results:
            print(f"📄 Se encontraron {len(response.results)} documentos:")
            for result in response.results:
                print(f" - {result.document.name}")
        else:
            print("⚠️ Conexión OK, pero no se encontraron documentos indexados aún (puede tardar unos minutos).")
    except Exception as e:
        print(f"❌ Error consultando Data Store: {e}")

if __name__ == "__main__":
    search_sample()
