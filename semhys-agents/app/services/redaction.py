
import re

EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE_RE = re.compile(r"(\+?\d{1,2}\s*)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}")
ID_RE = re.compile(r"\b([A-Z0-9]{12,}|[0-9]{9,})\b", re.IGNORECASE)

def redact_text(text: str, mode: str = "strict") -> str:
    if not text:
        return text

    out = text
    out = EMAIL_RE.sub("[REDACTED_EMAIL]", out)
    out = PHONE_RE.sub("[REDACTED_PHONE]", out)

    if mode == "strict":
        out = ID_RE.sub("[REDACTED_ID]", out)

    return out
