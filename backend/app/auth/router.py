from secrets import compare_digest

from fastapi import APIRouter, HTTPException, status

from app.auth.schemas import LoginRequest, TokenResponse
from app.auth.security import create_access_token, verify_password
from app.core.config import get_settings

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    settings = get_settings()

    username_valid = compare_digest(
        payload.username.encode("utf-8"),
        settings.admin_username.encode("utf-8"),
    )

    password_valid = verify_password(
        payload.password,
        settings.admin_password_hash,
    )

    if not username_valid or not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos",
        )

    return TokenResponse(
        access_token=create_access_token(settings.admin_username),
    )