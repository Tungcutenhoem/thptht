import logging
from app.core.config import settings


# Cấu hình logger
def get_logger(name: str) -> logging.Logger:
    # Tạo một logger mới với tên là name
    logger = logging.getLogger(name)

    # Thiết lập mức log mặc định là DEBUG
    logger.setLevel(logging.DEBUG)

    # Cấu hình format của log
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    formatter = logging.Formatter(log_format)

    # Cấu hình stream handler để ghi log ra console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Cấu hình file handler để ghi log vào file (tuỳ chọn)
    if settings.DEBUG:
        # Nếu DEBUG = True, ghi log vào file app.log
        file_handler = logging.FileHandler("app.log")
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger


# Khởi tạo logger cho ứng dụng
logger = get_logger(__name__)
