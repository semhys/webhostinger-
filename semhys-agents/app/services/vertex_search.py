
from typing import Any, Dict, List, Tuple
from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core.client_options import ClientOptions

def _client(location: str):
    if location == "global":
        return discoveryengine.SearchServiceClient()
    return discoveryengine.SearchServiceClient(
        client_options=ClientOptions(api_endpoint=f"{location}-discoveryengine.googleapis.com")
    )

def search_vertex(
    project_id: str,
    location: str,
    data_store_id: str,
    serving_config: str,
    query: str,
    top_k: int = 8,
) -> Tuple[List[Dict[str, Any]], Dict[str, List[str]]]:
    """
    Returns:
      docs: [{title, uri, snippet, score, struct_data}]
      facets: {"year":[...], "project":[...], ...} (derived from struct_data)
    """
    client = _client(location)
    sc_path = client.serving_config_path(
        project=project_id,
        location=location,
        data_store=data_store_id,
        serving_config=serving_config,
    )

    req = discoveryengine.SearchRequest(
        serving_config=sc_path,
        query=query,
        page_size=top_k,
    )

    resp = client.search(request=req)
    results = list(resp.results)

    docs: List[Dict[str, Any]] = []
    facets = {"year": [], "project": [], "doc_type": [], "discipline": []}

    def _add_facet(key: str, val: Any):
        if val is None:
            return
        s = str(val).strip()
        if not s:
            return
        if s not in facets[key]:
            facets[key].append(s)

    for r in results:
        d = r.document
        sd = d.struct_data or {}
        dd = d.derived_struct_data or {}

        # Prefer derived title if present
        title = dd.get("title") or sd.get("title") or "N/A"

        # Best-effort snippet extraction
        snippet = ""
        try:
            # Some responses include extractive segments; keep it safe.
            snippet = getattr(r, "snippet", "") or ""
        except Exception:
            snippet = ""

        # URI
        uri = "N/A"
        try:
            uri = d.content.uri
        except Exception:
            pass

        score = getattr(r, "score", None)

        doc = {
            "title": title,
            "uri": uri,
            "snippet": snippet,
            "score": score,
            "struct_data": {
                "title": sd.get("title"),
                "discipline": sd.get("discipline"),
                "project": sd.get("project"),
                "doc_type": sd.get("doc_type"),
                "year": sd.get("year"),
                "filename_original": sd.get("filename_original"),
            },
        }
        docs.append(doc)

        _add_facet("year", sd.get("year"))
        _add_facet("project", sd.get("project"))
        _add_facet("doc_type", sd.get("doc_type"))
        _add_facet("discipline", sd.get("discipline"))

    return docs, facets
