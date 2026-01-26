
import requests

BASE = "http://127.0.0.1:8000"
ENDPOINT = f"{BASE}/api/agents/research"

tests = ["bombas", "nfpa", "bavaria"]

for q in tests:
    payload = {"query": q, "top_k": 5, "model_preference": "auto"}
    try:
        r = requests.post(ENDPOINT, json=payload, timeout=90)
        print("\n==============================")
        print("QUERY:", q)
        print("STATUS:", r.status_code)
        if r.status_code != 200:
            print(r.text)
            continue
        data = r.json()
        print("PROVIDER:", data.get("provider"))
        print("FACETS:", data.get("facets"))
        print("CITATIONS:", len(data.get("citations", [])))
        if data.get("citations"):
            c0 = data["citations"][0]
            print("C0.title:", c0.get("title"))
            print("C0.uri:", c0.get("uri"))
        print("\nANSWER (first 500 chars):")
        print((data.get("answer","")[:500] + "...") if len(data.get("answer","")) > 500 else data.get("answer",""))
    except Exception as e:
        print(f"\n==============================\nQUERY: {q}\nERROR: {e}")
