from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Food Quality Classification API")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả origins trong môi trường dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import các routers
from app.api.v1.endpoints import classify

# Đăng ký các routers
app.include_router(
    classify.router,
    prefix="/api/v1/classify",
    tags=["classification"]
)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)