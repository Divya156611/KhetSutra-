import os
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
import bcrypt

try:
    from backend.config import settings
except ImportError:
    from config import settings

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Secure bcrypt password hashing."""
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify plain password against stored bcrypt or legacy salted hash."""
        if not plain_password or not hashed_password:
            return False
        try:
            # 1. Check bcrypt
            if hashed_password.startswith("$2a$") or hashed_password.startswith("$2b$"):
                return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
            
            # 2. Legacy salt$sha256 fallback
            if "$" in hashed_password:
                salt, stored_hash = hashed_password.split("$", 1)
                candidate_hash = hashlib.sha256((salt + plain_password).encode('utf-8')).hexdigest()
                return candidate_hash == stored_hash

            return False
        except Exception:
            return False

    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create signed HS256 JWT access token."""
        to_encode = data.copy()
        now = datetime.now(timezone.utc)
        if expires_delta:
            expire = now + expires_delta
        else:
            expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": int(expire.timestamp()),
            "iat": int(now.timestamp())
        })
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
        """Decode and validate JWT access token."""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except (jwt.PyJWTError, Exception):
            return None

