from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from ..db import get_db
from ..models.user_trip import User
from ..schemas.auth_trip import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse, GoogleAuthRequest
from ..core.security import hash_password, verify_password, create_access_token
from ..core.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Xác thực & Người dùng (Auth)"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """Đăng ký tài khoản mới cho du khách"""
    email_clean = req.email.strip().lower()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác."
        )
    
    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu phải có ít nhất 6 ký tự."
        )

    # Phân quyền: nếu là email quản trị đặc biệt thì gán admin, còn lại là traveler
    role = "admin" if email_clean.startswith("admin@") else "traveler"

    new_user = User(
        email=email_clean,
        hashed_password=hash_password(req.password),
        full_name=req.full_name.strip() or "Du Khách Thủ Đô",
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role, "email": new_user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**new_user.to_dict())
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    """Đăng nhập bằng Email và Mật khẩu"""
    email_clean = req.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(user.hashed_password, req.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email hoặc mật khẩu không chính xác. Vui lòng thử lại."
        )
    
    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user.to_dict())
    )

@router.post("/google", response_model=TokenResponse)
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Đăng nhập hoặc Đăng ký liên kết tài khoản Google OAuth"""
    import secrets
    import urllib.request
    import json

    email = req.email
    full_name = req.full_name or "Du Khách Google"
    avatar_url = req.avatar_url

    # Nếu Frontend truyền Google ID Token (Google Identity Services)
    if req.credential and not email:
        try:
            verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={req.credential}"
            with urllib.request.urlopen(verify_url, timeout=5) as resp:
                g_data = json.loads(resp.read().decode("utf-8"))
                email = g_data.get("email")
                full_name = g_data.get("name") or full_name
                avatar_url = g_data.get("picture") or avatar_url
        except Exception:
            try:
                import jwt
                payload = jwt.decode(req.credential, options={"verify_signature": False})
                email = payload.get("email")
                full_name = payload.get("name") or full_name
                avatar_url = payload.get("picture") or avatar_url
            except Exception:
                pass

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xác thực thông tin tài khoản Google. Vui lòng thử lại."
        )

    email_clean = email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if user:
        # Nếu user đã tồn tại, đồng bộ avatar và provider
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        user.auth_provider = "google"
        db.commit()
        db.refresh(user)
    else:
        # Tự động tạo người dùng mới từ tài khoản Google
        role = "admin" if email_clean.startswith("admin@") else "traveler"
        random_pwd = secrets.token_urlsafe(16)
        user = User(
            email=email_clean,
            hashed_password=hash_password(random_pwd),
            full_name=full_name.strip() or "Du Khách Google",
            role=role,
            avatar_url=avatar_url,
            auth_provider="google"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user.to_dict())
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Lấy thông tin hồ sơ của tài khoản đang đăng nhập"""
    return UserResponse(**user.to_dict())
