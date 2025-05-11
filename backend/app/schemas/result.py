from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ClassificationResultBase(BaseModel):
    # Đây là lớp cơ sở cho tất cả các result
    image_url: str  # Đường dẫn hoặc URL tới ảnh đã phân loại
    classification: str  # Loại phân loại (ví dụ: "fruit", "vegetable")
    confidence: float  # Độ tin cậy của phân loại (0.0 - 1.0)
    created_at: datetime  # Thời gian phân loại được tạo ra

    class Config:
        orm_mode = True  # Điều này cho phép Pydantic làm việc với các đối tượng SQLAlchemy (ORM)

class ClassificationResultResponse(ClassificationResultBase):
    # Kết quả trả về khi người dùng yêu cầu danh sách phân loại
    id: int  # ID của kết quả phân loại trong cơ sở dữ liệu

    class Config:
        orm_mode = True  # Đảm bảo rằng dữ liệu từ ORM được chuyển đổi đúng

class ClassificationResultCreate(BaseModel):
    # Được sử dụng khi tạo mới một kết quả phân loại
    image_url: str
    classification: str
    confidence: float

    class Config:
        orm_mode = True

class ClassificationResultUpdate(BaseModel):
    # Được sử dụng khi cập nhật kết quả phân loại
    classification: Optional[str] = None
    confidence: Optional[float] = None

    class Config:
        orm_mode = True
