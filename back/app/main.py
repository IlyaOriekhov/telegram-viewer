from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers and config
from .routers import auth, telegram
from .database import init_database
from .config import settings, validate_config

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.VERSION}...")
    
    # Validate configuration
    config_valid = validate_config()
    if not config_valid and not settings.DEBUG:
        print("❌ Configuration validation failed!")
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
        "telegram_configured": settings.telegram_configured
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