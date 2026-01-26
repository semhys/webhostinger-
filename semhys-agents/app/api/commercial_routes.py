
from fastapi import APIRouter, HTTPException
from app.api.types import CommercialRequest, CommercialResponse
from app.core.config import settings
from app.services.redaction import redact_text
from app.services.vertex_search import search_vertex
from app.api.research_routes import build_context
from app.services.llm_router import generate_structured_response
import re
import logging

logger = logging.getLogger("semhys-commercial")
router = APIRouter()

def kill_switch_scan(text: str) -> bool:
    # Block internal references even if "internal intelligence"
    bad_patterns = [
        r"gs://",
        r"\.pdf\b", r"\.docx\b", r"\.xlsx\b", r"\.pptx\b",
    ]
    return any(re.search(p, text, re.IGNORECASE) for p in bad_patterns)

@router.post("/analyze", response_model=CommercialResponse, tags=["commercial"])
def commercial_analyze(req: CommercialRequest):
    topic_redacted = redact_text(req.topic, mode=settings.redaction_mode)

    # 1) Retrieve internal context
    docs, _ = search_vertex(
        project_id=settings.gcp_project_id,
        location=settings.gcp_location,
        data_store_id=settings.data_store_id,
        serving_config=settings.serving_config,
        query=topic_redacted,
        top_k=req.top_k,
    )
    if not docs:
        raise HTTPException(status_code=404, detail="No internal documents found for commercial analysis.")

    context = build_context(docs)

    # 2) Prompt
    schema_hint = CommercialResponse.model_json_schema()

    privacy_clause = ""
    if req.strict_privacy:
        privacy_clause = """
PRIVACY RULES (STRICT):
- DO NOT output any internal URIs (gs://...), file names, or document titles.
- DO NOT output any client names or proper nouns that look like projects.
- Use internal context ONLY to infer generalized commercial opportunities.
- Output must be safe to paste into an internal CRM note without exposing sources.
"""

    system_prompt = f"""You are a Senior Industrial Commercial Analyst for SEMHYS.
Audience: {req.audience}

{privacy_clause}

TASK:
Analyze the internal context and produce COMMERCIAL OPPORTUNITIES:
- Convert technical signals into sellable product/service opportunities.
- Include urgency, margin range (if reasonable), and recommended action.
- Be practical (what to sell, to whom, why now).

OUTPUT:
Return ONLY valid JSON matching this schema (no markdown, no code fences):
{schema_hint}
"""

    user_prompt = f"""Topic: {topic_redacted}

Internal Context (READ ONLY - DO NOT CITE/EXPOSE):
{context}

Generate JSON now:
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    # 3) Structured generation w/ retry/repair (re-use your robust router)
    try:
        result = generate_structured_response(
            messages=messages,
            output_model=CommercialResponse,
            model_preference="auto",
            openai_api_key=settings.openai_api_key,
            openai_model=settings.openai_model,
            google_api_key=settings.google_api_key,
            gemini_model=settings.gemini_model,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Commercial generation failed: {str(e)}")

    resp: CommercialResponse = result["parsed"]

    # 4) Kill-switch (hard safety)
    raw_blob = (resp.model_dump_json() if hasattr(resp, "model_dump_json") else str(resp))
    if kill_switch_scan(raw_blob):
        logger.error("Kill-switch triggered: internal reference detected in CommercialResponse.")
        # attempt one regeneration
        messages.append({"role": "assistant", "content": result.get("raw_text", "")})
        messages.append({"role": "user", "content": "Privacy violation. Regenerate. Remove ALL internal URIs/file names/client names. JSON only."})

        try:
            result2 = generate_structured_response(
                messages=messages,
                output_model=CommercialResponse,
                model_preference="auto",
                openai_api_key=settings.openai_api_key,
                openai_model=settings.openai_model,
                google_api_key=settings.google_api_key,
                gemini_model=settings.gemini_model,
                max_retries=0,
            )
            resp = result2["parsed"]
            raw_blob2 = (resp.model_dump_json() if hasattr(resp, "model_dump_json") else str(resp))
            if kill_switch_scan(raw_blob2):
                raise HTTPException(status_code=400, detail="Privacy violation: unable to generate safe commercial output.")
            result = result2
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Commercial regeneration failed: {str(e)}")

    # 5) Final sanitize (belt & suspenders)
    # NOTE: keep it simple for MVP; sanitize key fields only
    for op in resp.opportunities:
        op.category = redact_text(op.category, mode="strict")
        op.problem_detected = redact_text(op.problem_detected, mode="strict")
        op.product_or_service = redact_text(op.product_or_service, mode="strict")
        op.why_now = redact_text(op.why_now, mode="strict")
        op.target_client_type = redact_text(op.target_client_type, mode="strict")
        op.recommended_action = redact_text(op.recommended_action, mode="strict")

    resp.provider = result["provider"]
    return resp
