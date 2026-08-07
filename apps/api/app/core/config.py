from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = "TodayPick API"
    app_version: str = "0.1.0"
    api_prefix: str = ""
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])


settings = Settings()
