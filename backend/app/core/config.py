import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Resolves to project root .env regardless of which directory uvicorn is started from.
        # On Render.com, no .env file exists — env vars are injected directly, which takes precedence.
        env_file=os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Project
    PROJECT_NAME: str = "OpsAI"
    PROJECT_VERSION: str = "1.0.0"

    # Database — individual parts used to build URL locally
    POSTGRES_USER: str = "opsai_user"
    POSTGRES_PASSWORD: str = "opsai_pass"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "opsai"

    # Render.com injects DATABASE_URL directly — this overrides the constructed URL
    DATABASE_URL: Optional[str] = None

    # AI
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    MODEL_NAME: str = "openai/gpt-4o-mini"

    # Celery / Redis
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "a_very_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS — comma-separated list of allowed origins (single env var works on Render)
    CORS_ORIGINS: str = "http://localhost:3000"

    @model_validator(mode="after")
    def build_database_url(self) -> "Settings":
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        return self

    def get_cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
