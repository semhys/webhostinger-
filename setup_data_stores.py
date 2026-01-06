from google.cloud import discoveryengine
from google.api_core.client_options import ClientOptions
import os

PROJECT_ID = "gen-lang-client-0585991170"
LOCATION = "global"  # Discovery Engine suele requerir global setup para data stores
BUCKET_NAME = "semhys-data-2025"

def create_data_store(ds_id, display_name, folder_path):
    client_options = (
        ClientOptions(api_endpoint=f"{LOCATION}-discoveryengine.googleapis.com")
        if LOCATION != "global"
        else None
    )
    
    client = discoveryengine.DataStoreServiceClient(client_options=client_options)
    
    parent = f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection"
    
    data_store = discoveryengine.DataStore(
        display_name=display_name,
        industry_vertical=discoveryengine.IndustryVertical.GENERIC,
        content_config=discoveryengine.DataStore.ContentConfig.CONTENT_REQUIRED,
        solution_types=[discoveryengine.SolutionType.SOLUTION_TYPE_SEARCH],
    )

    request = discoveryengine.CreateDataStoreRequest(
        parent=parent,
        data_store=data_store,
        data_store_id=ds_id,
    )

    print(f"Creando Data Store '{display_name}' ({ds_id})...")
    try:
        operation = client.create_data_store(request=request)
        response = operation.result()
        print(f"✅ Data Store creado: {response.name}")
        return response.name
    except Exception as e:
        print(f"⚠️ Error intentando crear {ds_id} (quizás ya existe): {e}")
        return None

# Nombres definidos para la arquitectura Dual
STORES = [
    {
        "id": "semhys-comercial",
        "name": "Semhys Comercial (Publico)",
        "path": f"gs://{BUCKET_NAME}/comercial/*.pdf" # Patrón de ejemplo
    },
    {
        "id": "semhys-investigacion",
        "name": "Semhys Investigación (Admin)",
        "path": f"gs://{BUCKET_NAME}/investigacion/*.pdf"
    }
]

if __name__ == "__main__":
    print(f"Iniciando configuración de Agentes Duales para: {PROJECT_ID}")
    
    for store in STORES:
        create_data_store(store["id"], store["name"], store["path"])
        
    print("\n⚠️ IMPORTANTE: Este script crea los 'contenedores'.")
    print("Ahora debes ir a Google Cloud Console para VINCULAR las carpetas del bucket a estos Data Stores manualmente")
    print("o usar un script de importación de documentos (más complejo).")
    print(f"Estructura esperada en bucket {BUCKET_NAME}:")
    print("  /comercial/      -> Info para clientes")
    print("  /investigacion/  -> Info confidencial")
