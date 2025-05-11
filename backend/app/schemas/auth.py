from pydantic import BaseModel, EmailStr
from typing import Optional

# Schema dùng để đăng ký người dùng mới
class UserCreate(BaseModel):
    username: str  # Tên người dùng
    email: EmailStr  # Địa chỉ email người dùng
    password: str  # Mật khẩu người dùng

    class Config:
        orm_mode = True  # Cho phép chuyển đổi giữa Pydantic models và ORM models

# Schema dùng để đăng nhập người dùng
class UserLogin(BaseModel):
    username: str  # Tên người dùng hoặc email
    password: str  # Mật khẩu

    class Config:
        orm_mode = True

# Schema trả về sau khi người dùng đăng nhập thành công (chứa token JWT)
class Token(BaseModel):
    access_token: str  # Token xác thực
    token_type: str = "bearer"  # Loại token (bearer)

# Schema thông tin người dùng
class User(BaseModel):
    id: int  # ID người dùng
    username: str  # Tên người dùng
    email: EmailStr  # Địa chỉ email người dùng

    class Config:
        orm_mode = True
