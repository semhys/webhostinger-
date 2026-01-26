
import requests, json, re

BASE = "http://127.0.0.1:8000"

def assert_no_leaks(text: str):
    assert "gs://" not in text.lower()
    assert re.search(r"\.pdf\b|\.(docx|xlsx|pptx)\b", text.lower()) is None

def main():
    print("Sending Commercial Analysis Request...")
    payload = {
        "topic": "bombas y mantenimiento industrial",
        "top_k": 10,
        "audience": "internal_sales",
        "strict_privacy": True
    }
    try:
        r = requests.post(f"{BASE}/api/commercial/analyze", json=payload, timeout=120)
        print("STATUS:", r.status_code)
        
        if r.status_code != 200:
            print("ERROR RESPONSE:", r.text[:1200])
            return

        data = r.json()
        print("✅ Response received.")
        
        assert "opportunities" in data
        opts = data["opportunities"]
        assert isinstance(opts, list)
        print(f"✅ Found {len(opts)} opportunities.")
        
        if len(opts) > 0:
            print(f"   Example Op: {opts[0].get('product_or_service')} | Margin: {opts[0].get('estimated_margin')}")

        blob = json.dumps(data, ensure_ascii=False)
        assert_no_leaks(blob)

        print("✅ Commercial Agent OK (no leaks)")

    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    main()
