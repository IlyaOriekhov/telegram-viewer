#!/usr/bin/env python3
"""
Simple script to run the Telegram Message Viewer API
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"🚀 Starting {settings.APP_NAME} v{settings.VERSION}")
    print(f"📍 Server will run on http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API docs available at http://{settings.HOST}:{settings.PORT}/docs")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug"
    )