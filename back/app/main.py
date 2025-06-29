import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

try:
    from dotenv import load_dotenv
    
    env_path = Path(__file__).parent / '.env'
    print(f"🔍 Шукаємо .env файл за адресою: {env_path}")
    print(f"🔍 Файл існує: {env_path.exists()}")
    
    if env_path.exists():
        result = load_dotenv(env_path)
        print(f"📁 Результат завантаження .env: {result}")
        
        with open(env_path, 'r') as f:
            content = f.read()
            print(f"📄 Вміст .env файлу:")
            print(content)
    else:
        print("❌ .env файл не знайдено!")
        
except ImportError:
    print("❌ python-dotenv не встановлено! Встановіть: pip install python-dotenv")

print("\n🔧 Перевірка змінних середовища:")
print(f"TELEGRAM_API_ID: {os.getenv('TELEGRAM_API_ID', 'НЕ ЗНАЙДЕНО')}")
print(f"TELEGRAM_API_HASH: {os.getenv('TELEGRAM_API_HASH', 'НЕ ЗНАЙДЕНО')}")
print(f"JWT_SECRET: {os.getenv('JWT_SECRET', 'НЕ ЗНАЙДЕНО')}")
print(f"DEBUG: {os.getenv('DEBUG', 'НЕ ЗНАЙДЕНО')}")

from .routers import auth, telegram
from .database import init_database
from .config import settings, validate_config

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.VERSION}...")
    
    print(f"🔧 Налаштування:")
    print(f"   - TELEGRAM_API_ID: {settings.TELEGRAM_API_ID}")
    print(f"   - TELEGRAM_API_HASH: {'*' * len(settings.TELEGRAM_API_HASH) if settings.TELEGRAM_API_HASH else 'НЕ ВСТАНОВЛЕНО'}")
    print(f"   - JWT_SECRET: {'*' * 20 if settings.JWT_SECRET != 'your-secret-key-change-in-production' else 'ДЕФОЛТНИЙ!'}")
    print(f"   - telegram_configured: {settings.telegram_configured}")
    
    # Validate configuration
    config_valid = validate_config()
    if not config_valid and not settings.DEBUG:
        print("Configuration validation failed!")
        # raise SystemExit(1)  # Закоментуйте цей рядок
    
    # Initialize database
    init_database()
    print("✅ Database initialized")
    
    yield
    # Shutdown
    print("🛑 Shutting down...")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="API for viewing Telegram messages and chats",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(telegram.router, prefix="/api")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": settings.APP_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "running",
        "telegram_configured": settings.telegram_configured,
        "debug_info": {
            "api_id_set": settings.TELEGRAM_API_ID > 0,
            "api_hash_set": len(settings.TELEGRAM_API_HASH) > 0,
            "jwt_secret_changed": settings.JWT_SECRET != "your-secret-key-change-in-production"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=settings.DEBUG,
        log_level="info"
    )