import sys
from pathlib import Path
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.database.session import get_db
    from backend.database.models import User
    from backend.services.auth_service import AuthService
except ImportError:
    from database.session import get_db
    from database.models import User
    from services.auth_service import AuthService

security_bearer = HTTPBearer(auto_error=False)

def extract_token_from_request(
    request: Request,
    bearer_creds: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Optional[str]:
    """Extracts JWT token from Authorization header or HttpOnly cookie."""
    if bearer_creds and bearer_creds.credentials:
        return bearer_creds.credentials
    
    # Browser authentication uses one HttpOnly access-token cookie
    cookie_token = request.cookies.get("khetsutra_token")
    if cookie_token:
        return cookie_token
        
    return None

def get_current_user(
    request: Request,
    token: Optional[str] = Depends(extract_token_from_request),
    db: Session = Depends(get_db)
) -> User:
    """Dependency that ensures request is authenticated via valid JWT."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please login.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = AuthService.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please login again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        uid_int = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification in token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == uid_int, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists or is deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

def get_optional_user(
    request: Request,
    token: Optional[str] = Depends(extract_token_from_request),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Non-blocking optional user identification."""
    if not token:
        return None
    payload = AuthService.decode_access_token(token)
    if not payload or not payload.get("sub"):
        return None
    try:
        uid = int(payload.get("sub"))
        return db.query(User).filter(User.id == uid, User.is_active == True).first()
    except Exception:
        return None
