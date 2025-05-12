import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Thông tin cơ sở dữ liệu
    DATABASE_URL: str = "postgresql://user:password@localhost/dbname"

    # Thông tin JWT
    SECRET_KEY: str = "your_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # thời gian hết hạn của token (phút)

    # Các cấu hình khác
    DEBUG: bool = False

    # Đọc từ file .env
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Khởi tạo đối tượng settings
settings = Settings()
