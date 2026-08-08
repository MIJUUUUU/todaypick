import os

from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = "TodayPick API"
    app_version: str = "0.1.0"
    api_prefix: str = ""
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])
    external_recipe_fallback_enabled: bool = True
    external_recipe_min_results: int = 3
    openai_api_key: str = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    openai_model: str = Field(default_factory=lambda: os.getenv("OPENAI_MODEL", "gpt-5-mini"))
    ai_reason_enabled: bool = Field(default_factory=lambda: os.getenv("AI_REASON_ENABLED", "false").lower() == "true")


settings = Settings()
