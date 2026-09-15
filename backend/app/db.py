import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgis_password@localhost:5432/webgis_db"
)

# Khởi tạo SQLAlchemy Engine với connection pool
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency cung cấp session CSDL cho FastAPI endpoint"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
