import os
from typing import List

class Settings:
    # App settings
    APP_NAME: str = "Telegram Message Viewer"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./telegram_viewer.db")
    DATABASE_NAME: str = "telegram_viewer.db"
    
    # Security settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    # Telegram API settings
    TELEGRAM_API_ID: int = int(os.getenv("TELEGRAM_API_ID", "0"))
    TELEGRAM_API_HASH: str = os.getenv("TELEGRAM_API_HASH", "")
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Add production origins from environment
    if os.getenv("FRONTEND_URL"):
        ALLOWED_ORIGINS.append(os.getenv("FRONTEND_URL"))
    
    @property
    def telegram_configured(self) -> bool:
        """Check if Telegram API credentials are configured"""
        return self.TELEGRAM_API_ID > 0 and len(self.TELEGRAM_API_HASH) > 0

# Create settings instance
settings = Settings()

# Validate configuration on startup
def validate_config():
    """Validate required configuration"""
    errors = []
    
    if not settings.telegram_configured:
        errors.append("TELEGRAM_API_ID and TELEGRAM_API_HASH must be configured")
    
    if settings.JWT_SECRET == "your-secret-key-change-in-production":
        errors.append("JWT_SECRET should be changed from default value")
    
    if errors:
        print("⚠️  Configuration warnings:")
        for error in errors:
            print(f"   - {error}")
        
        if not settings.telegram_configured:
            print("\n📝 To get Telegram API credentials:")
            print("   1. Go to https://my.telegram.org")
            print("   2. Log in with your phone number")
            print("   3. Go to 'API Development tools'")
            print("   4. Create a new application")
            print("   5. Add API_ID and API_HASH to your .env file")
    
    return len(errors) == 0