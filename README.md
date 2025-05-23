# ai-sys
hệ thống phân loại chất lượng thực phẩm
link dockerhub: https://hub.docker.com/repositories/quangllm

Dự án này bao gồm 3 dịch vụ:

🧠 backend: API FastAPI xử lý logic

🌐 frontend: Giao diện người dùng

🛢️ db: MySQL database

📦 Yêu cầu hệ thống
Trước khi bắt đầu, đảm bảo rằng bạn đã cài:

* Docker

* Docker Compose

Kiểm tra bằng lệnh:
docker --version
docker compose version

🚀 **Cách chạy ứng dụng**
Bước 1: Tạo thư mục dự án & chuyển vào. Ví dụ:
mkdir ai-system
cd ai-system

Bước 2: Tải file docker-compose.yml được cung cấp. Chuyển vào thư mục dự án.

Bước 3: Sau khi đã làm các bước trên gõ lệnh docker compose up -d vào terminal. Chờ trong vài phút.

Bước 4: Sau khi đã hiện ra link.

🌐 Truy cập ứng dụng
Frontend: http://localhost:3000

Backend API: http://localhost:8000/docs
