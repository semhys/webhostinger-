
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal
from app.core.config import settings

class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    top_k: int = Field(default=settings.top_k_default, ge=1, le=50)
    model_preference: str = Field(default="auto")  # openai|gemini|auto

class Citation(BaseModel):
    title: str
    uri: str
    snippet: str = ""
    score: Optional[float] = None
    struct_data: Dict[str, Any] = {}

class ResearchResponse(BaseModel):
    provider: str
    answer: str
    citations: List[Citation]
    facets: Dict[str, List[str]]
    warnings: List[str] = []

# --- Agent #2: Report ---
class ReportRequest(BaseModel):
    topic: str = Field(..., min_length=5)
    scope: str = Field("internal_only", pattern="^(internal_only|with_web_contrast)$")
    top_k: int = Field(default=8, ge=1, le=50)
    report_type: str = Field("technical", pattern="^(technical|executive|audit)$")
    audience: str = Field("engineer") # engineer | manager | client

class ReportResponse(BaseModel):
    executive_summary: str = ""
    findings_internal: List[str] = []
    contrast_external: Optional[str] = None
    conclusions: List[str] = []
    risks: List[str] = []
    recommendations: List[str] = []
    citations_internal: List[Citation] = []
    provider: str = "unknown"

# --- Agent #3: Blog ---
class BlogRequest(BaseModel):
    topic: str = Field(..., min_length=5)
    angle: str = Field(..., min_length=3) # e.g. "educational", "case_study"
    seo_keywords: List[str] = Field(default_factory=list)
    use_internal: bool = Field(True) # Use internal docs for context/accuracy
    privacy_mode: str = Field("strict", pattern="^strict$") # Always strict for now

class BlogResponse(BaseModel):
    title: str
    meta_description: str
    outline: List[str]
    content_markdown: str
    faq: List[Dict[str, str]] # [{"question": "...", "answer": "..."}]
    provider: str = "unknown"


# --- Agent #4: Commercial (Sales Intelligence) ---
class CommercialRequest(BaseModel):
    topic: str
    top_k: int = Field(default=10, ge=1, le=20)
    audience: Literal["internal_sales", "internal_exec"] = "internal_sales"
    strict_privacy: bool = True  # keep on by default

class Opportunity(BaseModel):
    category: str = ""
    problem_detected: str = ""
    product_or_service: str = ""
    why_now: str = ""
    urgency: Literal["Low", "Medium", "High"] = "Medium"
    estimated_margin: str = ""          # e.g., "35-55%"
    target_client_type: str = ""
    recommended_action: str = ""

class CommercialResponse(BaseModel):
    opportunities: List[Opportunity] = Field(default_factory=list)
    provider: str = "auto"
