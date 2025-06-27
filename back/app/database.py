import sqlite3
from contextlib import contextmanager
import hashlib
from typing import Optional, List, Dict, Any

DATABASE_NAME = "telegram_viewer.db"

def init_database():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    #Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
        
    # Telegram sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS telegram_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_string TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    try:
        yield conn
    finally:
        conn.close()

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

class UserDB:
    @staticmethod
    def create_user(username: str, password: str) -> int:
        """Create a new user and return user ID"""
        password_hash = hash_password(password)
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                (username, password_hash)
            )
            conn.commit()
            return cursor.lastrowid

    @staticmethod
    def get_user_by_credentials(username: str, password: str) -> Optional[Dict[str, Any]]:
        """Get user by username and password"""
        password_hash = hash_password(password)
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, username, created_at FROM users WHERE username = ? AND password_hash = ?",
                (username, password_hash)
            )
            row = cursor.fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, username, created_at FROM users WHERE id = ?",
                (user_id,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None

    @staticmethod
    def username_exists(username: str) -> bool:
        """Check if username already exists"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
            return cursor.fetchone() is not None
        
class TelegramDB:
    @staticmethod
    def save_session(user_id: int, session_string: str, phone_number: str) -> int:
         """Save Telegram session and deactivate old ones"""
         with get_db_connection() as conn:
            cursor = conn.cursor()

            # Deactivate old sessions for this user
            cursor.execute(
                "UPDATE telegram_sessions SET is_active = FALSE WHERE user_id = ?",
                (user_id,)
            )
            
            # Insert new session
            cursor.execute(
                "INSERT INTO telegram_sessions (user_id, session_string, phone_number) VALUES (?, ?, ?)",
                (user_id, session_string, phone_number)
            )
            
            conn.commit()
            return cursor.lastrowid
    
    @staticmethod
    def get_active_session(user_id: int) -> Optional[Dict[str, Any]]:
        """Get active Telegram session for user"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM telegram_sessions WHERE user_id = ? AND is_active = TRUE",
                (user_id,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None
        
    @staticmethod
    def deactivate_sessions(user_id: int) -> bool:
        """Deactivate all Telegram sessions for user"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE telegram_sessions SET is_active = FALSE WHERE user_id = ?",
                (user_id,)
            )
            conn.commit()
            return cursor.rowcount > 0

# Initialize database on import
init_database()

