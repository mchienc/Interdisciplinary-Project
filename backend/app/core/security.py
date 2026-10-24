import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "hanoi_tourism_sdss_secret_key_2026_super_secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def hash_password(password: str) -> str:
    """Mã hóa mật khẩu bằng chuẩn PBKDF2-HMAC-SHA256 (NIST standard, 100.000 rounds)"""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}:{key.hex()}"

def verify_password(stored_password: str, provided_password: str) -> bool:
    """Kiểm tra mật khẩu nhập vào khớp với chuỗi mã hóa lưu trong CSDL"""
    try:
        salt, key_hex = stored_password.split(':')
        key = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Tạo JWT access token có hạn sử dụng"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Giải mã và xác thực chữ ký JWT access token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None
