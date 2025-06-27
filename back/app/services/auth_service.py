import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from ..database import UserDB
from ..config import settings

security = HTTPBearer()

class AuthService:
    @staticmethod
    def create_access_token(user_id: int) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
        payload = {
            "user_id": user_id,
            "exp": expire,
            "iat": datetime.utcnow()
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def verify_token(token: str) -> int:
        """Verify JWT token and return user ID"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload.get("user_id")
            
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload"
                )
            
            return user_id
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

    @staticmethod
    def register_user(username: str, password: str) -> dict:
        """Register new user"""
        # Check if username already exists
        if UserDB.username_exists(username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        # Validate password strength
        if len(password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        
        # Create user
        try:
            user_id = UserDB.create_user(username, password)
            token = AuthService.create_access_token(user_id)
            
            return {
                "access_token": token,
                "token_type": "bearer",
                "message": "User registered successfully"
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )

    @staticmethod
    def login_user(username: str, password: str) -> dict:
        """Login user and return token"""
        user = UserDB.get_user_by_credentials(username, password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        token = AuthService.create_access_token(user["id"])
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "message": "Login successful"
        }

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """Dependency to get current authenticated user ID"""
    return AuthService.verify_token(credentials.credentials)

def get_current_user(user_id: int = Depends(get_current_user_id)) -> dict:
    """Dependency to get current authenticated user data"""
    user = UserDB.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user