from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TelegramConnect(BaseModel):
    phone_number: str

class TelegramVerify(BaseModel):
    phone_number: str
    code: str
    password: Optional[str] = None

class TelegramSession(BaseModel):
    id: int
    user_id: int
    phone_number: str
    is_active: bool
    created_at: datetime

class ChatInfo(BaseModel):
    id: int
    title: str
    type: str
    unread_count: Optional[int] = 0

class MessageInfo(BaseModel):
    id: int
    text: str
    date: datetime
    from_user: Optional[str] = None
    from_user_id: Optional[int] = None

class TelegramStatus(BaseModel):
    connected: bool
    phone_number: Optional[str] = None

class ConnectResponse(BaseModel):
    message: str
    requires_code: bool = False
    requires_password: bool = False