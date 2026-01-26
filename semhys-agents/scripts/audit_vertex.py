import os
import time
from dotenv import load_dotenv
from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core.client_options import ClientOptions

load_dotenv()

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
LOCATION = os.getenv("GCP_LOCATION", "global")
DATA_STORE_ID = os.getenv("DATA_STORE_ID")

def verify_vertex_search():
    print(f"--- VERTEX AI SEARCH AUDIT ---")
    print(f"Project: {PROJECT_ID}")
    print(f"Data Store: {DATA_STORE_ID}")
    
    client_options = (
        ClientOptions(api_endpoint=f"{LOCATION}-discoveryengine.googleapis.com")
        if LOCATION != "global"
        else None
    )
    
    client = discoveryengine.SearchServiceClient(client_options=client_options)
    serving_config = f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{DATA_STORE_ID}/servingConfigs/default_search"
    
    queries = ["bombas", "nfpa", "bavaria"]
    
    for q in queries:
        print(f"\nScanning Query: '{q}'...")
        start_time = time.time()
        try:
            request = discoveryengine.SearchRequest(
                serving_config=serving_config,
                query=q,
                page_size=2,
                query_expansion_spec=discoveryengine.SearchRequest.QueryExpansionSpec(
                    condition=discoveryengine.SearchRequest.QueryExpansionSpec.Condition.AUTO,
                ),
                spell_correction_spec=discoveryengine.SearchRequest.SpellCorrectionSpec(
                    mode=discoveryengine.SearchRequest.SpellCorrectionSpec.Mode.AUTO
                ),
            )
            response = client.search(request=request)
            elapsed = time.time() - start_time
            print(f"  -> Time: {elapsed:.2f}s | Results: {len(response.results)}")
            
            if response.results:
                r = response.results[0]
                doc_data = r.document.struct_data
                print(f"  -> First Result Title: {doc_data.get('title', 'N/A')}")
                print(f"  -> StructData Keys Found: {list(doc_data.keys())}")
                
                # Check for critical fields
                required_fields = ['discipline', 'project', 'doc_type', 'year', 'uri']
                found_fields = {k: v for k, v in doc_data.items() if k in required_fields}
                print(f"  -> Critical Fields: {found_fields}")
                
                # Facet check (if available in summary, though usually requires aggregation in request)
                # Just checking struct data presence is enough for valid indexing verification.
            else:
                print("  -> NO RESULTS FOUND.")
                
        except Exception as e:
            print(f"  -> ERROR: {e}")

if __name__ == "__main__":
    verify_vertex_search()
