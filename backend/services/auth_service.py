import os
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

logger = logging.getLogger(__name__)

JWT_SECRET                   = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM                = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES  = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS    = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int, email: str, remember_me: bool = False) -> tuple[str, int]:
    if remember_me:
        expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        expires_in    = REFRESH_TOKEN_EXPIRE_DAYS * 86400
    else:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expires_in    = ACCESS_TOKEN_EXPIRE_MINUTES * 60

    expire  = datetime.now(timezone.utc) + expires_delta
    payload = {
        "sub":   str(user_id),
        "email": email,
        "exp":   expire,
        "iat":   datetime.now(timezone.utc),
        "type":  "access",
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token, expires_in


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("sub") is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_by_email(db: Session, email: str):
    from models.user_model import User
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_id(db: Session, user_id: int):
    from models.user_model import User
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, name: str, email: str, plain_password: str):
    from models.user_model import User

    if get_user_by_email(db, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=name.strip(),
        email=email.lower().strip(),
        hashed_password=hash_password(plain_password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("New user registered: id=%s email=%s", user.id, user.email)
    return user


def authenticate_user(db: Session, email: str, plain_password: str):
    user = get_user_by_email(db, email)

    if not user:
        dummy = hash_password("dummy-timing-protection-string")
        verify_password("wrong", dummy)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(plain_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    return user


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_token(credentials.credentials)


def get_current_user_from_db(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
):
    from database import SessionLocal
    payload = get_current_user(credentials)
    user_id = int(payload["sub"])

    db = SessionLocal()
    try:
        user = get_user_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or deactivated.",
            )
        return user
    finally:
        db.close()


def require_admin(current_user=Depends(get_current_user_from_db)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user
