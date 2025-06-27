import asyncio
from typing import Dict, List, Optional, Any
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError
from fastapi import HTTPException, status

from ..database import TelegramDB
from ..config import settings

class TelegramService:
    # Store temporary clients during authentication process
    _temp_clients: Dict[str, TelegramClient] = {}

    @classmethod
    def _get_client_key(cls, user_id: int, phone_number: str) -> str:
        """Generate unique key for temporary client storage"""
        return f"{user_id}_{phone_number}"

    @classmethod
    async def send_code(cls, user_id: int, phone_number: str) -> dict:
        """Send verification code to phone number"""
        if not settings.telegram_configured:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Telegram API credentials not configured"
            )
            
        try:
            client = TelegramClient(StringSession(), settings.TELEGRAM_API_ID, settings.TELEGRAM_API_HASH)
            await client.connect()
            
            if not await client.is_user_authorized():
                await client.send_code_request(phone_number)
            
            # Store client temporarily for code verification
            client_key = cls._get_client_key(user_id, phone_number)
            cls._temp_clients[client_key] = client
            
            return {
                "message": "Verification code sent to your phone",
                "requires_code": True
            }
            
        except Exception as e:
            await client.disconnect()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to send code: {str(e)}"
            )

    @classmethod
    async def verify_code(cls, user_id: int, phone_number: str, code: str, password: Optional[str] = None) -> dict:
        """Verify phone code and optional 2FA password"""
        client_key = cls._get_client_key(user_id, phone_number)
        
        if client_key not in cls._temp_clients:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active connection found. Please request a new code."
            )
        
        client = cls._temp_clients[client_key]
        
        try:
            # Try to sign in with the code
            await client.sign_in(phone_number, code)
            
        except SessionPasswordNeededError:
            if not password:
                return {
                    "message": "Two-factor authentication password required",
                    "requires_password": True
                }
            
            # Sign in with 2FA password
            try:
                await client.sign_in(password=password)
            except Exception as e:
                await client.disconnect()
                del cls._temp_clients[client_key]
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid 2FA password"
                )
                
        except PhoneCodeInvalidError:
            await client.disconnect()
            del cls._temp_clients[client_key]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        except Exception as e:
            await client.disconnect()
            del cls._temp_clients[client_key]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Authentication failed: {str(e)}"
            )
        
        # Save session to database
        try:
            session_string = client.session.save()
            TelegramDB.save_session(user_id, session_string, phone_number)
            
            # Clean up temporary client
            await client.disconnect()
            del cls._temp_clients[client_key]
            
            return {"message": "Telegram account connected successfully"}
            
        except Exception as e:
            await client.disconnect()
            del cls._temp_clients[client_key]
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save session"
            )

    @classmethod
    async def get_chats(cls, user_id: int) -> List[dict]:
        """Get list of user's chats"""
        session_data = TelegramDB.get_active_session(user_id)
        
        if not session_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active Telegram session found"
            )
        
        client = None
        try:
            client = TelegramClient(StringSession(session_data["session_string"]), settings.TELEGRAM_API_ID, settings.TELEGRAM_API_HASH)
            await client.connect()
            
            if not await client.is_user_authorized():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Telegram session expired. Please reconnect."
                )
            
            chats = []
            async for dialog in client.iter_dialogs(limit=100):
                chat_type = "user"
                if dialog.is_channel:
                    chat_type = "channel"
                elif dialog.is_group:
                    chat_type = "group"
                
                chats.append({
                    "id": dialog.id,
                    "title": dialog.title or "Unnamed Chat",
                    "type": chat_type,
                    "unread_count": dialog.unread_count
                })
            
            return chats
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to load chats: {str(e)}"
            )
        finally:
            if client:
                await client.disconnect()

    @classmethod
    async def get_messages(cls, user_id: int, chat_id: int, limit: int = 50) -> List[dict]:
        """Get messages from a specific chat"""
        session_data = TelegramDB.get_active_session(user_id)
        
        if not session_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active Telegram session found"
            )
        
        client = None
        try:
            client = TelegramClient(StringSession(session_data["session_string"]), settings.TELEGRAM_API_ID, settings.TELEGRAM_API_HASH)
            await client.connect()
            
            if not await client.is_user_authorized():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Telegram session expired. Please reconnect."
                )
            
            messages = []
            async for message in client.iter_messages(chat_id, limit=limit):
                from_user = "Unknown"
                from_user_id = None
                
                if message.sender:
                    if hasattr(message.sender, 'first_name') and message.sender.first_name:
                        from_user = message.sender.first_name
                        if hasattr(message.sender, 'last_name') and message.sender.last_name:
                            from_user += f" {message.sender.last_name}"
                    elif hasattr(message.sender, 'title') and message.sender.title:
                        from_user = message.sender.title
                    elif hasattr(message.sender, 'username') and message.sender.username:
                        from_user = f"@{message.sender.username}"
                    
                    from_user_id = message.sender_id
                
                message_text = message.text or "[Media/System message]"
                if hasattr(message, 'media') and message.media:
                    if message.photo:
                        message_text = "[Photo]"
                    elif message.video:
                        message_text = "[Video]" 
                    elif message.document:
                        message_text = "[Document]"
                    elif message.voice:
                        message_text = "[Voice message]"
                    elif message.sticker:
                        message_text = "[Sticker]"
                
                messages.append({
                    "id": message.id,
                    "text": message_text,
                    "date": message.date.isoformat(),
                    "from_user": from_user,
                    "from_user_id": from_user_id
                })
            
            return messages
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to load messages: {str(e)}"
            )
        finally:
            if client:
                await client.disconnect()

    @classmethod
    def disconnect_user(cls, user_id: int) -> dict:
        """Disconnect user's Telegram session"""
        success = TelegramDB.deactivate_sessions(user_id)
        
        if success:
            return {"message": "Telegram account disconnected successfully"}
        else:
            return {"message": "No active sessions found"}

    @classmethod
    def get_status(cls, user_id: int) -> dict:
        """Get user's Telegram connection status"""
        session_data = TelegramDB.get_active_session(user_id)
        
        return {
            "connected": session_data is not None,
            "phone_number": session_data["phone_number"] if session_data else None
        }