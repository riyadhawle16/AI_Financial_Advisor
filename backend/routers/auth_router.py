"""
Auth router — /auth/register, /auth/login, /auth/me, /auth/logout,
              /auth/change-password
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.auth_schema import (
    RegisterRequest, LoginRequest, ChangePasswordRequest,
    TokenResponse, UserResponse, MessageResponse
)
from services.auth_service import (
    create_user, authenticate_user, create_access_token,
    get_current_user_from_db, hash_password, verify_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _user_response(user) -> UserResponse:
    """Helper — build UserResponse from ORM object (includes role)."""
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        is_active=user.is_active,
        role=user.role,
        created_at=user.created_at.isoformat(),
    )


# ── POST /auth/register ───────────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Create a new account.
    - Validates password strength (8+ chars, upper, lower, digit, special)
    - Hashes password with bcrypt before storing
    - Returns JWT immediately so user is logged in after signup
    - New users always get role='user'
    """
    user = create_user(db=db, name=body.name, email=body.email, plain_password=body.password)
    token, expires_in = create_access_token(user.id, user.email, remember_me=False)
    return TokenResponse(access_token=token, expires_in=expires_in, user=_user_response(user))


# ── POST /auth/login ──────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Log in with email + password.
    remember_me=true  → token valid 30 days  (localStorage)
    remember_me=false → token valid 60 mins  (sessionStorage)
    """
    user = authenticate_user(db, body.email, body.password)
    token, expires_in = create_access_token(user.id, user.email, body.remember_me)
    return TokenResponse(access_token=token, expires_in=expires_in, user=_user_response(user))


# ── GET /auth/me ──────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user_from_db)):
    """Returns the authenticated user's full profile including role."""
    return _user_response(current_user)


# ── POST /auth/logout ─────────────────────────────────────────────────────────
@router.post("/logout", response_model=MessageResponse)
def logout(current_user=Depends(get_current_user_from_db)):
    """Stateless logout — client deletes the token. Server confirms it was valid."""
    return MessageResponse(message="Logged out successfully.", success=True)


# ── POST /auth/change-password ────────────────────────────────────────────────
@router.post("/change-password", response_model=MessageResponse)
def change_password(
    body: ChangePasswordRequest,
    current_user=Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    """Change password — requires current password for verification."""
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    current_user.hashed_password = hash_password(body.new_password)
    db.add(current_user)
    db.commit()
    return MessageResponse(message="Password changed successfully.", success=True)
