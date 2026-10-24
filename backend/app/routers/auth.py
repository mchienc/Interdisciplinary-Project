from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from ..db import get_db
from ..models.user_trip import User
from ..schemas.auth_trip import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
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

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Lấy thông tin hồ sơ của tài khoản đang đăng nhập"""
    return UserResponse(**user.to_dict())
