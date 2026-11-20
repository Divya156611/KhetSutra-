import os
import sys
import secrets
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

# Load .env specifically from backend directory
load_dotenv(dotenv_path=CURRENT_DIR / ".env")

def clean_env(val: Optional[str]) -> Optional[str]:
    if not val:
        return None
    val = val.strip()
    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
        val = val[1:-1].strip()
    return val if val else None

class Settings(BaseModel):
    APP_NAME: str = os.getenv("APP_NAME", "Kisan Mitra AI — Smart Farming Platform")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    VERSION: str = "2.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")
    
    # Security & JWT Auth
    SECRET_KEY: str = clean_env(os.getenv("SECRET_KEY")) or (
        secrets.token_hex(32) if os.getenv("ENVIRONMENT", "development").lower() != "production" else ""
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    # Allowed CORS Origins
    ALLOWED_ORIGINS_RAW: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    
    @property
    def allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS_RAW.split(",") if o.strip()]

    # Database: prioritize khetsutra.db, fallback to kisanmitra.db if present
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{CURRENT_DIR / 'khetsutra.db'}")
    
    # Optional External AI API Key
    GEMINI_API_KEY: Optional[str] = clean_env(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"))
    DATA_GOV_IN_API_KEY: Optional[str] = clean_env(os.getenv("DATA_GOV_IN_API_KEY"))
    OPENAI_API_KEY: Optional[str] = clean_env(os.getenv("OPENAI_API_KEY"))
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    
    # Weather
    WEATHER_PROVIDER: str = os.getenv("WEATHER_PROVIDER", "open-meteo")

    def validate_production_security(self):
        """Ensures production builds fail safely if insecure secrets are active."""
        if self.ENVIRONMENT.lower() == "production":
            if not self.SECRET_KEY or len(self.SECRET_KEY) < 32:
                raise ValueError("CRITICAL SECURITY ERROR: SECRET_KEY must be a strong random secret with 32+ characters in production.")

settings = Settings()
settings.validate_production_security()
