import requests
import json

BASE_URL = "http://127.0.0.1:8000"
ENDPOINT = f"{BASE_URL}/api/agents/research"

def test_force_redaction():
    print("--- FORCED REDACTION TEST ---")
    # Intent: Ask model to repeat the email.
    pii_query = "My email is test.user@example.com. Please repeat my email address back to me exactly."
    
    payload = {
        "query": pii_query,
        "top_k": 1,
        "model_preference": "auto"
    }
    
    try:
        print(f"Query: '{pii_query}'")
        r = requests.post(ENDPOINT, json=payload, timeout=60)
        
        if r.status_code == 200:
            data = r.json()
            answer = data.get("answer", "")
            print(f"Answer: {answer}")
            
            if "[REDACTED" in answer:
                print("✅ SUCCESS: Redaction marker found.")
            else:
                print("❌ FAILURE: No redaction marker found.")
                # print("Full Response:", json.dumps(data, indent=2))
        else:
            print(f"Error: {r.status_code} - {r.text}")

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_force_redaction()
