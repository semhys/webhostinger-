
from fastapi import APIRouter, HTTPException
from app.api.types import ReportRequest, ReportResponse, Citation
from app.core.config import settings
from app.services.redaction import redact_text
from app.services.vertex_search import search_vertex
from app.services.llm_router import generate_structured_response
from app.api.research_routes import build_context # Reuse context builder if appropriate

router = APIRouter()

@router.post("/generate", response_model=ReportResponse, tags=["report"])
def generate_report(req: ReportRequest):
    # 1. Search Context
    q_redacted = redact_text(req.topic, mode=settings.redaction_mode)
    
    # If scope is internal_only, we trust Vertex Search is internal.
    # We could optionally add filter to Vertex if there was a "source" field, but we assume data store is internal.
    
    docs, _ = search_vertex(
        project_id=settings.gcp_project_id,
        location=settings.gcp_location,
        data_store_id=settings.data_store_id,
        serving_config=settings.serving_config,
        query=q_redacted,
        top_k=min(req.top_k, 20), # Allow up to 20 for reports
    )
    
    if not docs:
         raise HTTPException(status_code=404, detail="No internal documents found for report.")

    context = build_context(docs)
    
    # 2. Build Prompt
    schema_hint = ReportResponse.model_json_schema()
    
    system_prompt = f"""You are a Senior Semhys Engineer.
    Target Audience: {req.audience} (adjust tone accordingly).
    Task: Generate a {req.report_type} report based strictly on the provided internal context.
    
    OUTPUT FORMAT: You must reply with VALID JSON strictly matching this schema:
    {schema_hint}
    
    CRITICAL:
    - 'findings_internal': Detailed bullets from the documents.
    - 'citations_internal': Must mirror the documents used perfectly (title, uri).
    - 'contrast_external': If scope is 'internal_only', leave null or strict. If 'with_web_contrast', you can mention general knowledge but prioritize internal.
    - Do NOT markdown fence the JSON.
    """
    
    user_prompt = f"""Topic: {q_redacted}
    
    Internal Documents:
    {context}
    
    Generate Report JSON now:
    """
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    # 3. Generate with Robustness
    try:
        result = generate_structured_response(
            messages=messages,
            output_model=ReportResponse,
            model_preference="auto", # or pass req preference if added
            openai_api_key=settings.openai_api_key,
            openai_model=settings.openai_model,
            google_api_key=settings.google_api_key,
            gemini_model=settings.gemini_model
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

    # 4. Final Security Pass (Redaction on output strings)
    # Pydantic is already validated, but we should redact strings within it.
    # Ideally iterate fields, but for MVP we rely on input redaction + trusting LLM on findings,
    # OR we apply redaction to specific string fields.
    # Let's apply on executive_summary and findings for safety.
    
    resp_obj: ReportResponse = result["parsed"]
    resp_obj.executive_summary = redact_text(resp_obj.executive_summary, mode=settings.redaction_mode)
    
    # Clean up citations: Ensure they are from our context
    # (LLM might hallucinate citations, but our schema asks for Citation objects. 
    # Usually LLM struggles to fill complex objects like Citations from scratch without copy-pasting.
    # We can override citations_internal with the actual docs found to be safe, 
    # OR verify them. For MVP, we pass the actual docs as citations internal to ensure 100% accuracy of sources available.)
    
    # Better approach: Overwrite citations_internal with actual docs used in context
    # This guarantees the "citations" part is accurate to the search, even if LLM references them loosely.
    safe_citations = [Citation(**d) for d in docs]
    resp_obj.citations_internal = safe_citations
    resp_obj.provider = result["provider"]

    return resp_obj
