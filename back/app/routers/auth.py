from fastapi import APIRouter, Depends, HTTPException, status
from ..models.user import UserCreate, UserLogin, Token, UserResponse
from ..services.auth_service import AuthService, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    return AuthService.register_user(user_data.username, user_data.password)

@router.post("/login", response_model=Token) 
async def login(user_data: UserLogin):
    """Login user and return access token"""
    return AuthService.login_user(user_data.username, user_data.password)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)"""
    return {"message": "Logged out successfully"}