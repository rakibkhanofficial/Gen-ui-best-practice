from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    GEMINI_API_KEY: Optional[str] = None
    BACKEND_PORT: int = 8000
    DATABASE_URL: str = "postgresql://postgres:postgrespassword@localhost:5432/genui_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ("../.env", ".env")
        extra = "ignore"


settings = Settings()

