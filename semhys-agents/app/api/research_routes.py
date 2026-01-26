
from fastapi import APIRouter, HTTPException
from app.api.types import ResearchRequest, ResearchResponse, Citation
from app.core.config import settings
from app.services.redaction import redact_text
from app.services.vertex_search import search_vertex
from app.services.llm_router import generate_response

router = APIRouter()

SYSTEM_PROMPT = """Eres un analista técnico interno de Semhys.
Reglas obligatorias:
1) No inventes: usa SOLO la evidencia entregada como contexto.
2) Cuando afirmes algo técnico, apóyalo citando documentos (título + uri) incluidos.
3) No reveles información sensible completa (emails, teléfonos, IDs).
4) Si la evidencia no alcanza, dilo y sugiere qué buscar.
Formato:
- Respuesta breve y accionable.
- Luego: "Citas:" con lista numerada (title + uri).
"""

def build_context(docs):
    lines = []
    for i, d in enumerate(docs, 1):
        sd = d.get("struct_data", {}) or {}
        lines.append(
            f"[{i}] TITLE: {d.get('title')}\n"
            f"URI: {d.get('uri')}\n"
            f"META: discipline={sd.get('discipline')} project={sd.get('project')} doc_type={sd.get('doc_type')} year={sd.get('year')}\n"
            f"SNIPPET: {d.get('snippet','')}\n"
        )
    return "\n---\n".join(lines)

@router.post("/research", response_model=ResearchResponse)
def research(req: ResearchRequest):
    q_redacted = redact_text(req.query, mode=settings.redaction_mode)

    docs, facets = search_vertex(
        project_id=settings.gcp_project_id,
        location=settings.gcp_location,
        data_store_id=settings.data_store_id,
        serving_config=settings.serving_config,
        query=q_redacted,
        top_k=min(req.top_k, settings.max_context_docs),
    )

    if not docs:
        raise HTTPException(status_code=404, detail="No documents found for query.")

    context = build_context(docs)

    user_prompt = f"""Consulta del usuario (redactada si aplica):
{q_redacted}

Contexto de documentos (usa esto como evidencia):
{context}

Tarea:
- Responde con conclusiones basadas en evidencia.
- Si hay conflicto entre documentos, dilo.
- No divulgues contenido sensible.
"""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    try:
        llm = generate_response(
            messages=messages,
            model_preference=req.model_preference,
            openai_api_key=settings.openai_api_key,
            openai_model=settings.openai_model,
            google_api_key=settings.google_api_key,
            gemini_model=settings.gemini_model,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    citations = [Citation(**d) for d in docs]

    warnings = []
    if all(len(v) == 0 for v in facets.values()):
        warnings.append("Facets appear empty. Ensure schema fields are set as facetable/filterable in the data store schema.")

    return ResearchResponse(
        provider=llm["provider"],
        answer=redact_text(llm["text"], mode=settings.redaction_mode),
        citations=citations,
        facets=facets,
        warnings=warnings + llm.get("errors", []),
    )
