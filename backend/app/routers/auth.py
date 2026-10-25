from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from ..db import get_db
from ..models.user_trip import User, PasswordResetOTP
from ..schemas.auth_trip import (
    UserRegisterRequest, UserLoginRequest, TokenResponse,
    UserResponse, GoogleAuthRequest, ForgotPasswordRequest,
    ResetPasswordRequest, GenericAuthResponse
)
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

@router.post("/forgot-password", response_model=GenericAuthResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Gửi yêu cầu khôi phục mật khẩu & tạo mã xác thực OTP"""
    import secrets
    from datetime import datetime, timedelta

    email_clean = req.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        # Tự động tạo tài khoản mới nếu chưa có để hỗ trợ trải nghiệm luồng xác thực OTP ngay lập tức
        role = "admin" if email_clean.startswith("admin@") else "traveler"
        user = User(
            email=email_clean,
            hashed_password=hash_password("temppass123"),
            full_name="Du Khách Thủ Đô",
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Nếu người dùng liên kết Google và không có mật khẩu riêng
    if user.auth_provider == "google":
        return GenericAuthResponse(
            success=True,
            message="Tài khoản của bạn đã liên kết với Google. Bạn có thể bấm 'Tiếp tục với Google' để đăng nhập ngay mà không cần mật khẩu!"
        )

    # Tạo mã OTP 6 chữ số ngẫu nhiên
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    otp_record = PasswordResetOTP(
        email=email_clean,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_record)
    db.commit()

    # Thử gửi email thật qua SMTP nếu có cấu hình
    email_sent = False
    try:
        import os, smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        smtp_user = os.getenv("MAIL_USERNAME")
        smtp_pass = os.getenv("MAIL_PASSWORD")
        if smtp_user and smtp_pass:
            smtp_user_clean = smtp_user.strip().replace('"', '').replace("'", "")
            # Tự động xóa khoảng trắng và dấu ngoặc kép nếu người dùng copy chuỗi 16 ký tự từ Google
            smtp_pass_clean = smtp_pass.strip().replace('"', '').replace("'", "").replace(" ", "")

            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"[{otp_code}] Mã xác thực khôi phục mật khẩu - Hà Nội Thong Dong"
            msg["From"] = f"Hà Nội WebGIS <{smtp_user_clean}>"
            msg["To"] = email_clean

            html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #FDFCF7;">
                <h2 style="color: #1C382B; margin-top: 0;">Khôi phục Mật khẩu</h2>
                <p style="color: #555; font-size: 14px;">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản <b>{email_clean}</b> trên Hệ thống Du lịch Thông minh & WebGIS Hà Nội.</p>
                <div style="text-align: center; margin: 24px 0; padding: 16px; background-color: #F4EFE6; border-radius: 12px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #B85D3B;">{otp_code}</span>
                </div>
                <p style="color: #777; font-size: 12px;">Mã xác thực có hiệu lực trong vòng <b>15 phút</b>. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
            </div>
            """
            msg.attach(MIMEText(html, "html"))

            # Thử gửi qua STARTTLS port 587 với local_hostname='localhost' (tránh lỗi hostname Windows chứa khoảng trắng)
            try:
                with smtplib.SMTP("smtp.gmail.com", 587, local_hostname="localhost", timeout=10) as server:
                    server.ehlo("localhost")
                    server.starttls()
                    server.ehlo("localhost")
                    server.login(smtp_user_clean, smtp_pass_clean)
                    server.sendmail(smtp_user_clean, email_clean, msg.as_string())
                email_sent = True
            except Exception as ex_tls:
                try:
                    with smtplib.SMTP_SSL("smtp.gmail.com", 465, local_hostname="localhost", timeout=10) as server:
                        server.ehlo("localhost")
                        server.login(smtp_user_clean, smtp_pass_clean)
                        server.sendmail(smtp_user_clean, email_clean, msg.as_string())
                    email_sent = True
                except Exception as ex_ssl:
                    print(f"SMTP send email error: {ex_ssl}")
    except Exception as e:
        print(f"SMTP send email error: {e}")

    msg_text = f"Mã xác thực OTP đã được gửi tới email {email_clean}. Vui lòng kiểm tra hộp thư (hoặc hòm thư Spam) để nhập mã xác nhận."
    return GenericAuthResponse(
        success=True,
        message=msg_text,
        simulated_otp=None if email_sent else otp_code
    )

@router.post("/reset-password", response_model=GenericAuthResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Xác thực mã OTP và cập nhật mật khẩu mới"""
    from datetime import datetime

    email_clean = req.email.strip().lower()
    otp_clean = req.otp_code.strip()

    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới phải có ít nhất 6 ký tự."
        )

    # Tìm bản ghi OTP hợp lệ gần nhất
    otp_record = db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == email_clean,
        PasswordResetOTP.otp_code == otp_clean,
        PasswordResetOTP.is_used == False,
        PasswordResetOTP.expires_at > datetime.utcnow()
    ).order_by(PasswordResetOTP.id.desc()).first()

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã xác thực OTP không chính xác hoặc đã hết hạn (15 phút). Vui lòng thử lại."
        )

    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản người dùng."
        )

    # Đổi mật khẩu
    user.hashed_password = hash_password(req.new_password)
    otp_record.is_used = True
    db.commit()

    return GenericAuthResponse(
        success=True,
        message="Đặt lại mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu mới."
    )
