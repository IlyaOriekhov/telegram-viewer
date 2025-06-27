from fastapi import APIRouter, Depends, Query
from typing import List
from ..models.telegram import (
    TelegramConnect, 
    TelegramVerify, 
    ChatInfo, 
    MessageInfo, 
    TelegramStatus,
    ConnectResponse
)
from ..services.auth_service import get_current_user_id
from ..services.telegram_service import TelegramService

router = APIRouter(prefix="/telegram", tags=["Telegram"])

@router.post("/connect", response_model=ConnectResponse)
async def connect_telegram(
    phone_data: TelegramConnect, 
    user_id: int = Depends(get_current_user_id)
):
    """Send verification code to connect Telegram account"""
    return await TelegramService.send_code(user_id, phone_data.phone_number)

@router.post("/verify", response_model=dict)
async def verify_code(
    verify_data: TelegramVerify,
    user_id: int = Depends(get_current_user_id)
):
    """Verify phone code and connect Telegram account"""
    return await TelegramService.verify_code(
        user_id, 
        verify_data.phone_number, 
        verify_data.code,
        verify_data.password
    )

@router.get("/chats", response_model=List[ChatInfo])
async def get_chats(user_id: int = Depends(get_current_user_id)):
    """Get list of user's Telegram chats"""
    return await TelegramService.get_chats(user_id)

@router.get("/messages/{chat_id}", response_model=List[MessageInfo])
async def get_messages(
    chat_id: int,
    limit: int = Query(default=50, le=100, ge=1),
    user_id: int = Depends(get_current_user_id)
):
    """Get messages from a specific chat"""
    return await TelegramService.get_messages(user_id, chat_id, limit)

@router.post("/disconnect")
async def disconnect_telegram(user_id: int = Depends(get_current_user_id)):
    """Disconnect Telegram account"""
    return TelegramService.disconnect_user(user_id)

@router.get("/status", response_model=TelegramStatus)
async def get_telegram_status(user_id: int = Depends(get_current_user_id)):
    """Get Telegram connection status"""
    return TelegramService.get_status(user_id)