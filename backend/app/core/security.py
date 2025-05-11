from datetime import datetime, timedelta
from typing import Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.models.user import User
from app.core.config import settings  # Lấy các cấu hình từ file config (chẳng hạn như SECRET_KEY)

# Sử dụng Passlib để mã hóa và kiểm tra mật khẩu
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Cấu hình cho JWT
SECRET_KEY = settings.SECRET_KEY  # Key bí mật để tạo JWT
ALGORITHM = "HS256"  # Thuật toán mã hóa JWT
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Thời gian hết hạn của token (ở đây là 30 phút)

# Hàm mã hóa mật khẩu
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Hàm kiểm tra mật khẩu
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Hàm tạo JWT (trả về access token)
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})  # Thêm thời gian hết hạn vào payload
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Hàm giải mã JWT và xác minh tính hợp lệ của nó
def verify_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload if payload["exp"] >= datetime.utcnow() else None
    except JWTError:
        return None

# Hàm lấy user từ token (dùng trong xác thực)
def get_user_from_token(db, token: str) -> Union[User, None]:
    try:
        payload = verify_access_token(token)
        if payload is None:
            return None
        user_id = payload.get("sub")  # 'sub' là ID của người dùng trong payload
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except JWTError:
        return None
