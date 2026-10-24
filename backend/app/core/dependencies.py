from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from ..db import get_db
from ..models.user_trip import User
from .security import decode_access_token

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Dependency trích xuất và xác thực người dùng từ Bearer Token trong Header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu xác thực tài khoản (Thiếu Bearer Token)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập đã hết hạn hoặc token không hợp lệ",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Người dùng không tồn tại trong hệ thống",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency kiểm tra quyền Quản trị viên (Admin)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền quản trị viên để thực hiện thao tác này"
        )
    return current_user
