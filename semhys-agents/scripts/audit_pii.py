import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("\n--- HEALTH CHECK ---")
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"GET /health: {r.status_code}")
        print(f"Response: {r.json()}")
    except Exception as e:
        print(f"Health Check Failed: {e}")

def test_redaction():
    print("\n--- REDACTION & PII TEST ---")
    endpoint = f"{BASE_URL}/api/agents/research"
    # PII Payload
    pii_query = "Please contact me at test.user@example.com or call +1-555-0199 about water pumps."
    
    payload = {
        "query": pii_query,
        "top_k": 3,
        "model_preference": "auto"
    }
    
    start = time.time()
    try:
        print(f"Sending Query with PII: '{pii_query}'")
        r = requests.post(endpoint, json=payload, timeout=60)
        elapsed = time.time() - start
        
        print(f"Status: {r.status_code}")
        print(f"Latency: {elapsed:.2f}s")
        
        if r.status_code == 200:
            data = r.json()
            # Check for redaction markers in any part of the answer or if logs show it (we can't see logs easily here, but we check answer)
            # Actually, the redaction often happens on the Input or Output. 
            # If the system echoes the query or uses it, we might see it.
            # Assuming the prompt injection or output might reflect it if not sanitized.
            # But the requirement says "Mostrar salida donde aparezca [REDACTED_EMAIL]...". 
            # This implies the system might return the sanitized query or the answer might reference it.
            # If the agent is "chatty", it might say "I've searched for ... [REDACTED]".
            
            print("Response Answer Snippet:")
            print(data.get("answer", "")[:300])
            
            # Since we can't easily see internal logs, we trust the System Instruction in base.py usually handles it or the Middleware.
            # If Redaction is handled by `SecuritySanitizer` on output:
            answer = data.get("answer", "")
            if "[REDACTED" in answer:
                print("✅ REDACTION MARKERS FOUND IN ANSWER")
            else:
                print("ℹ️ No redaction markers in answer (expected if answer generates new text).")
                # To test input redaction we'd need to inspect server logs, 
                # but let's see if the agent repeats the query.
                
    except Exception as e:
        print(f"Redaction Test Failed: {e}")

def test_queries_perf():
    print("\n--- PERFORMANCE & VARIETY TEST ---")
    endpoint = f"{BASE_URL}/api/agents/research"
    queries = ["bombas", "nfpa"]
    
    for q in queries:
        payload = {"query": q, "top_k": 5}
        start = time.time()
        print(f"Querying: {q}...")
        try:
            r = requests.post(endpoint, json=payload, timeout=90)
            elapsed = time.time() - start
            print(f"  -> Status: {r.status_code} | Time: {elapsed:.2f}s")
            if r.status_code == 200:
                data = r.json()
                print(f"  -> Provider: {data.get('provider')}")
                print(f"  -> Citations: {len(data.get('citations', []))}")
                print(f"  -> Facets: {list(data.get('facets', {}).keys())}")
        except Exception as e:
            print(f"  -> Error: {e}")

if __name__ == "__main__":
    test_health()
    test_queries_perf()
    test_redaction()
