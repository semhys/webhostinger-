from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core.client_options import ClientOptions
import time

PROJECT_ID = "semhys-chat"
LOCATION = "global"
DATA_STORE_ID = "semhys-investigacion"
# Importante: Usar wildcard para todos los PDFs
GCS_URI = "gs://semhys-data-2025/*" # IMPORTAR TODO (Cualquier extensión) 

def import_documents():
    print(f"🚀 Iniciando importación para: {DATA_STORE_ID}")
    
    client_options = (
        ClientOptions(api_endpoint=f"{LOCATION}-discoveryengine.googleapis.com")
        if LOCATION != "global" else None
    )
    
    client = discoveryengine.DocumentServiceClient(client_options=client_options)
    
    parent = f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{DATA_STORE_ID}/branches/0"
    
    request = discoveryengine.ImportDocumentsRequest(
        parent=parent,
        gcs_source=discoveryengine.GcsSource(
            input_uris=[GCS_URI],
            data_schema="content" # Esquema para documentos no estructurados (PDFs)
        ),
        reconciliation_mode=discoveryengine.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL
    )
    
    try:
        operation = client.import_documents(request=request)
        print(f"⏳ Operación de importación iniciada: {operation.operation.name}")
        print("Esperando a que termine (esto puede tomar unos segundos)...")
        
        response = operation.result()
        print("✅ Importación COMPLETADA exitosamente.")
        
        # Métrica de éxito
        if response.error_samples:
            print("⚠️ Hubo algunos errores con archivos específicos:")
            for error in response.error_samples:
                print(f" - {error}")
        else:
            print(f"📄 Se procesaron los documentos correctamente.")

    except Exception as e:
        print(f"❌ Error en la importación: {e}")

if __name__ == "__main__":
    import_documents()
