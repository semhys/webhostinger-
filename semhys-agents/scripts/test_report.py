
import requests
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test-report")

BASE = "http://127.0.0.1:8000"
ENDPOINT = f"{BASE}/api/reports/generate"

def test_report_generation():
    # Payload targeting known docs (bombas/NFPA)
    payload = {
      "topic": "bombas contra incendio normativa",
      "scope": "internal_only",
      "top_k": 5,
      "report_type": "technical",
      "audience": "engineer"
    }
    
    print(f"Sending Report Request: {payload['topic']}")
    try:
        r = requests.post(ENDPOINT, json=payload, timeout=120)
        
        if r.status_code != 200:
            print(f"FAILED: {r.status_code}")
            print(r.text)
            return
            
        data = r.json()
        print("✅ Status 200")
        
        # 1. Structure Check
        keys = ["executive_summary", "findings_internal", "citations_internal", "conclusions"]
        missing = [k for k in keys if k not in data]
        if missing:
             print(f"❌ Missing JSON keys: {missing}")
        else:
             print("✅ JSON Schema Validated")
             
        # 2. Content Quality
        print("\n--- Executive Summary ---")
        print(data["executive_summary"][:300] + "...")
        
        print(f"\n✅ Findings: {len(data['findings_internal'])}")
        print(f"✅ Conclusions: {len(data['conclusions'])}")
        
        # 3. Citation Check
        citations = data.get("citations_internal", [])
        print(f"✅ Citations: {len(citations)}")
        
        has_gs = False
        if citations:
            print(f"   First Citation: {citations[0].get('title')} ({citations[0].get('year')})")
            print(f"   URI: {citations[0].get('uri')}")
            for c in citations:
                if "gs://" in c.get("uri", ""):
                    has_gs = True
        
        if has_gs:
            print("✅ Internal URIs detected (gs://).")
        else:
            print("⚠️ No gs:// URIs found. Check if context was retrieved.")

    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    test_report_generation()
