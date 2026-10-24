import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgis_password@localhost:5432/webgis_db"
)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

Base = declarative_base()

# Kiểm tra kết nối CSDL và fallback thông minh
engine = None
SessionLocal = None
is_sqlite = False

def create_app_engine():
    global engine, SessionLocal, is_sqlite
    
    # 1. Thử kết nối PostgreSQL nếu được cấu hình
    if "postgresql" in DATABASE_URL:
        # Kiểm tra nhanh socket port để không bị lag nếu Postgres chưa bật
        import socket
        from urllib.parse import urlparse
        
        is_port_open = False
        try:
            parsed = urlparse(DATABASE_URL)
            host = parsed.hostname or "localhost"
            port = parsed.port or 5432
            with socket.create_connection((host, port), timeout=0.3):
                is_port_open = True
        except Exception:
            is_port_open = False

        if is_port_open:
            try:
                test_engine = create_engine(
                    DATABASE_URL,
                    pool_size=5,
                    max_overflow=10,
                    pool_pre_ping=True,
                    connect_args={"connect_timeout": 2}
                )
                with test_engine.connect() as conn:
                    pass
                engine = test_engine
                SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
                is_sqlite = False
                logger.info("Successfully connected to PostgreSQL/PostGIS database.")
                return
            except Exception as e:
                logger.warning(f"PostgreSQL connection failed ({e}). Falling back to local persistent SQLite.")
        else:
            logger.info("PostgreSQL port is not listening. Falling back instantly to local persistent SQLite.")

    # 2. Fallback sang file SQLite cục bộ (lưu bền vững, không mất khi restart)
    sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "webgis_local.db"))
    engine = create_engine(
        f"sqlite:///{sqlite_path}",
        connect_args={"check_same_thread": False}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    is_sqlite = True
    logger.info(f"Using persistent SQLite database at: {sqlite_path}")

create_app_engine()

def get_db():
    """Dependency cung cấp session CSDL cho FastAPI endpoint"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Khởi tạo cấu trúc bảng và nạp dữ liệu mẫu ban đầu"""
    try:
        from .models.user_trip import User, SavedTrip
        # Chỉ tạo các bảng User và SavedTrip nếu là SQLite để tránh lỗi SpatiaLite với Geometry
        if is_sqlite:
            Base.metadata.create_all(bind=engine, tables=[User.__table__, SavedTrip.__table__])
            # Tự động cập nhật cột mới nếu bảng SQLite đã tồn tại từ phiên bản cũ
            with engine.connect() as conn:
                for col, col_type in [
                    ("likes_count", "INTEGER DEFAULT 0"),
                    ("clones_count", "INTEGER DEFAULT 0"),
                    ("tags", "VARCHAR(255) DEFAULT 'Hà Nội'"),
                    ("summary", "TEXT DEFAULT ''")
                ]:
                    try:
                        conn.exec_driver_sql(f"ALTER TABLE saved_trips ADD COLUMN {col} {col_type};")
                    except Exception:
                        pass
        else:
            Base.metadata.create_all(bind=engine)

        # Seed tài khoản mặc định
        db = SessionLocal()
        try:
            from .core.security import hash_password
            admin_user = db.query(User).filter(User.email == "admin@hanoitravel.vn").first()
            if not admin_user:
                admin_user = User(
                    email="admin@hanoitravel.vn",
                    hashed_password=hash_password("admin123"),
                    full_name="Quản Trị Viên Du Lịch Hà Nội",
                    role="admin"
                )
                db.add(admin_user)

            admin_example = db.query(User).filter(User.email == "admin@example.com").first()
            if not admin_example:
                admin_example = User(
                    email="admin@example.com",
                    hashed_password=hash_password("admin123"),
                    full_name="Quản Trị Viên Hệ Thống",
                    role="admin"
                )
                db.add(admin_example)
            elif admin_example.role != "admin":
                admin_example.role = "admin"
                admin_example.hashed_password = hash_password("admin123")

            tourist_user = db.query(User).filter(User.email == "tourist@hanoitravel.vn").first()
            if not tourist_user:
                tourist_user = User(
                    email="tourist@hanoitravel.vn",
                    hashed_password=hash_password("tourist123"),
                    full_name="Nguyễn Văn Du Khách",
                    role="traveler"
                )
                db.add(tourist_user)

            db.commit()
            logger.info("Default seed accounts (Admin & Tourist) verified.")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error initializing DB schema or seed data: {e}")
