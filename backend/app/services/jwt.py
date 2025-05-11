from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.core.config import settings
from typing import Optional

# Cấu hình JWT
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Thời gian hết hạn của token (tính bằng phút)


# Hàm tạo access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Tạo một JWT access token từ dữ liệu đầu vào.

    :param data: Dữ liệu cần mã hóa vào token, ví dụ như user info
    :param expires_delta: Thời gian hết hạn của token. Nếu không có, sẽ sử dụng mặc định là 30 phút.
    :return: Chuỗi token
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})

    # Tạo và mã hóa token
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Hàm giải mã token và lấy payload
def decode_access_token(token: str) -> dict:
    """
    Giải mã JWT và trả về payload.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise JWTError("Token is invalid or expired")


# Hàm lấy thông tin user từ token
def get_user_from_token(token: str) -> dict:
    """
    Lấy thông tin user từ token, trường 'sub' lưu trữ tên người dùng.
    """
    payload = decode_access_token(token)
    return payload.get("sub")
