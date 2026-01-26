
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # GCP / Vertex
    gcp_project_id: str = Field(..., alias="GCP_PROJECT_ID")
    gcp_location: str = Field("global", alias="GCP_LOCATION")
    data_store_id: str = Field(..., alias="DATA_STORE_ID")
    serving_config: str = Field("default_config", alias="SERVING_CONFIG")

    # LLMs
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    openai_model: str = Field("gpt-4o-mini", alias="OPENAI_MODEL")

    google_api_key: str | None = Field(default=None, alias="GOOGLE_API_KEY")
    gemini_model: str = Field("gemini-1.5-flash", alias="GEMINI_MODEL")

    # Behavior
    redaction_mode: str = Field("strict", alias="REDACTION_MODE")
    top_k_default: int = Field(8, alias="TOP_K_DEFAULT")
    max_context_docs: int = Field(8, alias="MAX_CONTEXT_DOCS")

settings = Settings()
