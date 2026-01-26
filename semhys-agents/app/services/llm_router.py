from __future__ import annotations
import json
import re
import logging
from typing import Any, Dict, List, Optional, Type

from pydantic import BaseModel, ValidationError

logger = logging.getLogger("semhys-llm")

JSON_BLOCK_RE = re.compile(r"\{.*\}", re.DOTALL)

def _extract_json(text: str) -> dict:
    """
    Best-effort JSON extraction:
    - If text is pure JSON -> parse
    - Else grab first {...} block -> parse
    """
    text = (text or "").strip()
    if not text:
        raise ValueError("Empty model output")

    # Try direct
    try:
        return json.loads(text)
    except Exception:
        pass

    # Try find first JSON object
    m = JSON_BLOCK_RE.search(text)
    if not m:
        raise ValueError("No JSON object found in model output")

    candidate = m.group(0)
    return json.loads(candidate)

def _repair_messages(messages: List[dict], schema_hint: str) -> List[dict]:
    """
    Adds a repair instruction to the conversation.
    """
    repair = (
        "Your previous response was invalid or incomplete JSON.\n"
        "Return ONLY valid JSON. No markdown. No comments.\n"
        "It MUST match this schema exactly:\n"
        f"{schema_hint}\n"
        "Return JSON now."
    )
    return messages + [{"role": "user", "content": repair}]

def generate_response(
    messages: List[Dict[str, str]],
    model_preference: str,
    openai_api_key: Optional[str],
    openai_model: str,
    google_api_key: Optional[str],
    gemini_model: str,
    json_mode: bool = False
) -> Dict[str, Any]:
    """
    Legacy/Simple generation wrapper for compatibility.
    Re-implements logic similar to original but uses the new _call helpers if possible,
    or keeps basic text generation for the Research agent.
    For MVP simplicity, we re-implement standard text generation here reusing the robust calls
    but without schema validation.
    """
    errors = []
    
    # Helper wrappers that don't enforce schema (just text or basic json_object)
    def call_openai():
        if not openai_api_key: raise RuntimeError("OPENAI_API_KEY missing")
        from openai import OpenAI
        client = OpenAI(api_key=openai_api_key)
        resp = client.chat.completions.create(
            model=openai_model,
            messages=messages,
            response_format={"type": "json_object"} if json_mode else None,
            temperature=0.2
        )
        return resp.choices[0].message.content or ""

    def call_gemini():
        if not google_api_key: raise RuntimeError("GOOGLE_API_KEY missing")
        import google.generativeai as genai
        genai.configure(api_key=google_api_key)
        # Flatten prompt
        prompt = "\n".join([f"{m.get('role','').upper()}: {m.get('content','')}" for m in messages])
        gmodel = genai.GenerativeModel(gemini_model)
        generation_config = {"temperature": 0.2}
        if json_mode: generation_config["response_mime_type"] = "application/json"
        
        resp = gmodel.generate_content(prompt, generation_config=generation_config)
        return (resp.text or "").strip()

    # Routing Logic (Simplified)
    providers = []
    if model_preference == "auto":
        providers = ["openai", "gemini"] if openai_api_key else ["gemini"]
    elif model_preference == "openai":
        providers = ["openai", "gemini"]
    elif model_preference == "gemini":
        providers = ["gemini", "openai"]
    
    for provider in providers:
        try:
            if provider == "openai":
                text = call_openai()
                return {"provider": "openai", "text": text, "errors": errors}
            elif provider == "gemini":
                text = call_gemini()
                return {"provider": "gemini", "text": text, "errors": errors}
        except Exception as e:
            errors.append(f"{provider}: {e}")
            logger.warning(f"Provider {provider} failed: {e}")
    
    raise RuntimeError(f"All providers failed: {'; '.join(errors)}")

def generate_structured_response(
    *,
    messages: List[Dict[str, str]],
    output_model: Type[BaseModel],
    model_preference: str,
    openai_api_key: Optional[str],
    openai_model: str,
    google_api_key: Optional[str],
    gemini_model: str,
    max_retries: int = 2,
) -> Dict[str, Any]:
    """
    Returns:
    {
      "provider": "openai"|"gemini",
      "raw_text": "...",
      "parsed": output_model instance
    }
    """
    schema_hint = json.dumps(output_model.model_json_schema(), ensure_ascii=False)

    last_err: Optional[Exception] = None
    cur_messages = messages

    for attempt in range(max_retries + 1):
        try:
            if model_preference in ("auto", "openai") and openai_api_key:
                raw = _call_openai_json(
                    messages=cur_messages,
                    api_key=openai_api_key,
                    model=openai_model,
                    schema_json=output_model.model_json_schema(),
                )
                data = _extract_json(raw)
                parsed = output_model.model_validate(data)
                return {"provider": "openai", "raw_text": raw, "parsed": parsed}

            if model_preference in ("gemini", "auto") and google_api_key:
                # If auto and we reached here, it means openai failed or wasn't preferred/avail
                # But 'auto' logic usually prefers openai first.
                
                # Check explicit preference flow:
                # If pref=openai, checked above. If failed, loop continues? 
                # The user logic had 'fallback'. The provided snippet simplifies this.
                # Let's implement robust fallback:
                pass 

            # Let's retry the user's provided logic flow strictly but ensure fallback exists
            # The user's snippet was a bit repetitive. Let's consolidate:
            
            # 1. Decide provider order
            providers_to_try = []
            if model_preference == "auto":
                if openai_api_key: providers_to_try.append("openai")
                if google_api_key: providers_to_try.append("gemini")
            elif model_preference == "openai":
                if openai_api_key: providers_to_try.append("openai")
                if google_api_key: providers_to_try.append("gemini")
            elif model_preference == "gemini":
                if google_api_key: providers_to_try.append("gemini")
                if openai_api_key: providers_to_try.append("openai")

            for provider in providers_to_try:
                try:
                    raw = ""
                    if provider == "openai":
                        raw = _call_openai_json(
                            messages=cur_messages,
                            api_key=openai_api_key,
                            model=openai_model,
                            schema_json=output_model.model_json_schema(),
                        )
                    elif provider == "gemini":
                        raw = _call_gemini_json(
                            messages=cur_messages,
                            api_key=google_api_key,
                            model=gemini_model,
                        )
                    
                    data = _extract_json(raw)
                    parsed = output_model.model_validate(data)
                    return {"provider": provider, "raw_text": raw, "parsed": parsed}

                except Exception as provider_err:
                    logger.warning(f"Provider {provider} failed in structured gen: {provider_err}")
                    continue # Try next provider in this attempt

            # If all providers failed in this attempt (likely validation error if raw was obtained)
            # Actually if validation error happens, it's raised above and caught below?
            # Wait, the try/except above catches Provider connection errors mostly.
            # If _extract_json or model_validate fails, it raises.
            # We need to catch Validation/Decode errors to trigger 'Attempt Retry (Repair)' loop.
            
            # Re-raise to trigger the outer except loop for 'attempt' retry
            raise ValueError("All providers failed or returned invalid JSON")

        except (ValidationError, json.JSONDecodeError, ValueError) as e:
            last_err = e
            logger.warning(f"Structured JSON failed attempt={attempt}: {e}")
            if attempt < max_retries:
                cur_messages = _repair_messages(cur_messages, schema_hint)
                continue
            break
        except Exception as e:
            # Critical unexpected error: don't crash uvicorn, bubble as controlled error
            last_err = e
            logger.exception(f"Unexpected LLM error attempt={attempt}: {e}")
            break

    raise RuntimeError(f"generate_structured_response failed: {last_err}")

def _call_openai_json(*, messages, api_key, model, schema_json) -> str:
    """
    IMPORTANT: Use OpenAI structured outputs if available.
    If not available in your installed SDK version, fall back to json_object.
    """
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY missing")

    from openai import OpenAI
    client = OpenAI(api_key=api_key)

    # Preferred: JSON Schema (Structured Outputs)
    try:
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "SemhysStructuredOutput",
                    "schema": schema_json,
                    "strict": True
                },
            },
            temperature=0.2,
        )
        return resp.choices[0].message.content or ""
    except Exception as e:
        # Fallback: json_object
        logger.warning(f"OpenAI json_schema failed, fallback json_object. err={e}")
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        return resp.choices[0].message.content or ""

def _call_gemini_json(*, messages, api_key, model) -> str:
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY missing")

    import google.generativeai as genai
    genai.configure(api_key=api_key)

    # Flatten messages into a single prompt (or map roles if you already do)
    prompt = []
    for m in messages:
        role = m.get("role")
        content = m.get("content", "")
        prompt.append(f"{role.upper()}:\n{content}\n")
    prompt = "\n".join(prompt)

    gmodel = genai.GenerativeModel(model)
    resp = gmodel.generate_content(
        prompt,
        generation_config={
            "temperature": 0.2,
            "response_mime_type": "application/json",
        },
    )
    return (resp.text or "").strip()
