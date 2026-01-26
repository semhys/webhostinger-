
from fastapi import APIRouter, HTTPException
from app.api.types import BlogRequest, BlogResponse
from app.core.config import settings
from app.services.redaction import redact_text
from app.services.vertex_search import search_vertex
from app.services.llm_router import generate_structured_response
from app.api.research_routes import build_context
import re
import logging

logger = logging.getLogger("semhys-blog")

router = APIRouter()

def kill_switch_scan(text: str) -> bool:
    """
    Layer 2: Hard Filter.
    Returns True if sensitive content detected (gs:// or internal filenames).
    """
    bad_patterns = [
        r"gs://",
        r"\.pdf\b", r"\.docx\b", r"\.xlsx\b",
        r"BAVARIA", r"RCI", # Add dynamic blocking if needed
    ]
    for p in bad_patterns:
        if re.search(p, text, re.IGNORECASE):
            logger.warning(f"Blocking blog output due to pattern match: {p}")
            return True
    return False

@router.post("/generate", response_model=BlogResponse, tags=["blog"])
def generate_blog(req: BlogRequest):
    # 1. Search Context (if allowed)
    context = ""
    if req.use_internal:
        q_redacted = redact_text(req.topic, mode=settings.redaction_mode)
        docs, _ = search_vertex(
            project_id=settings.gcp_project_id,
            location=settings.gcp_location,
            data_store_id=settings.data_store_id,
            serving_config=settings.serving_config,
            query=q_redacted,
            top_k=5,
        )
        if docs:
            # We build context but instruct to NOT cite it explicitly
            context = build_context(docs)
    
    # 2. Build Prompt (Layer 1: System Instruction)
    schema_hint = BlogResponse.model_json_schema()
    
    system_prompt_privacy = ""
    if req.privacy_mode == "strict":
        system_prompt_privacy = """
        PRIVACY NOTICE: STRICT.
        - You may use the internal context for understanding ONLY.
        - DO NOT mention any file names, URIs (gs://), or Client Names (Bavaria, etc).
        - DO NOT quote internal documents directly.
        - Write generally about the topic for a public audience.
        """

    system_prompt = f"""You are an Expert Technical Blog Writer.
    Angle: {req.angle}
    Keywords: {', '.join(req.seo_keywords)}
    
    {system_prompt_privacy}
    
    OUTPUT FORMAT: JSON matching strictly:
    {schema_hint}
    """
    
    user_prompt = f"""Topic: {req.topic}
    
    Context (Read Only - Do Not Cite):
    {context}
    
    Generate Blog JSON:
    """
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    # 3. Generate
    try:
        result = generate_structured_response(
            messages=messages,
            output_model=BlogResponse,
            model_preference="auto",
            openai_api_key=settings.openai_api_key,
            openai_model=settings.openai_model,
            google_api_key=settings.google_api_key,
            gemini_model=settings.gemini_model
        )
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Blog generation failed: {str(e)}")
         
    resp_obj: BlogResponse = result["parsed"]
    
    # 4. Layer 2: Hard Kill-Switch
    # If content contains restricted patterns, we could retry or fail.
    # Simple strategy: Fail safe (or remove sentences, but stripping is risky).
    # MVP: Check and Fail/Blank
    if kill_switch_scan(resp_obj.content_markdown) or kill_switch_scan(resp_obj.title):
        logger.error("Kill-Switch triggered on blog content.")
        # Optional: Retry logic could go here. For now, strict fail-safe.
        # Let's try to redact locally just in case instead of hard error, 
        # but the prompt asked for "Block and regenerate" (1 time).
        # Since `generate_structured_response` does retry for valid JSON, 
        # implementing logic here for CONTENT regeneration is complex without passing callables.
        # We will do a simple manual Replace for MVP to ensure safety, or raise Error.
        # User said "bloquea y regenera automáticamente (1 vez)".
        
        # Simple regeneration attempt:
        logger.info("Attempting regeneration for privacy...")
        messages.append({"role": "assistant", "content": result["raw_text"]})
        messages.append({"role": "user", "content": "You violated privacy rules (mentioned internal names/URIs). Regenerate strictly complying with NO internal mentions."})
        
        try:
             result = generate_structured_response(
                messages=messages,
                output_model=BlogResponse,
                model_preference="auto",
                openai_api_key=settings.openai_api_key,
                openai_model=settings.openai_model,
                google_api_key=settings.google_api_key,
                gemini_model=settings.gemini_model,
                max_retries=0 # Don't loop infinitely
            )
             resp_obj = result["parsed"]
             # Check again
             if kill_switch_scan(resp_obj.content_markdown):
                 raise HTTPException(status_code=400, detail="Privacy Violation: Unable to generate safe content.")
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"Regeneration failed: {e}")

    # 5. Layer 3: Strict Redaction (Blind Sanitize)
    resp_obj.content_markdown = redact_text(resp_obj.content_markdown, mode="strict")
    resp_obj.title = redact_text(resp_obj.title, mode="strict")
    resp_obj.meta_description = redact_text(resp_obj.meta_description, mode="strict")
    
    resp_obj.provider = result["provider"]
    return resp_obj
