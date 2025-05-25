# ai-sys
hệ thống phân loại chất lượng thực phẩm
# Tên thành viên:
* Nguyễn Bá Quang - 23020412
* Vũ Minh Sơn - 23020424
* Mai Minh Tùng - 23020432
* Phạm Thế Trung - 
* Nguyễn Hoàng Tú - 
# Mô tả dự án:
### 📦 **MÔ TẢ DỰ ÁN: Hệ Thống Phân Loại Chất Lượng Thực Phẩm (Food Quality Classification System)**

---

#### 🏗 **1. Mục tiêu dự án**

Xây dựng một hệ thống web giúp người dùng kiểm tra **chất lượng cà chua** dựa trên hình ảnh, video hoặc luồng webcam.
Người dùng có thể:
* ✅ Tải lên **ảnh** thực phẩm để phân loại
* ✅ Tải lên **video** và nhận kết quả phân loại trên từng khung hình (frame)
* ✅ Sử dụng **webcam** để kiểm tra chất lượng thực phẩm theo thời gian thực

Hệ thống cung cấp một **giao diện admin** để thêm, sửa, xóa dữ liệu.

---

#### 🌐 **2. Kiến trúc tổng quan**

* **Frontend (React, Vite):**
  Giao diện người dùng, nơi thực hiện các thao tác upload, xem kết quả, và điều khiển webcam.

* **Backend (FastAPI):**
  Cung cấp API để nhận dữ liệu, chạy mô hình AI, lưu trữ và quản lý dữ liệu phân loại.

* **Database (PostgreSQL/MySQL):**
  Lưu trữ thông tin người dùng.

* **Docker:**
  Triển khai frontend + backend + database dễ dàng, nhất quán.

---

#### 🖼 **3. Frontend (User Interface)**

✅ **Chức năng chính:**

* Chọn loại đầu vào (ảnh, video, webcam)
* Hiển thị kết quả phân loại và độ tin cậy
* Giao diện trực quan, dễ dùng, phản hồi nhanh
* Trang admin riêng

✅ **Thư mục quan trọng:**

| Thư mục/File     | Vai trò                                 |
| ---------------- | --------------------------------------- |
| `InputControls/` | Chọn loại input, điều khiển file/webcam |
| `MediaDisplay/`  | Hiển thị ảnh, video, hoặc webcam stream |
| `Results/`       | Hiển thị kết quả phân loại chi tiết     |
| `hooks/`         | Xử lý logic: webcam, video              |
| `contexts/`      | Quản lý trạng thái toàn cục             |
| `services/`      | Tương tác với API backend               |
| `pages/`         | Các trang chính: phân loại, admin       |

✅ **Luồng hoạt động:**

1. User chọn input (ảnh/video/webcam)
2. Frontend lấy dữ liệu từ input
3. Frontend gửi dữ liệu đến API backend
4. Nhận kết quả phân loại và hiển thị

---

#### ⚙ **4. Backend (FastAPI)**

✅ **Chức năng chính:**

* Nhận ảnh hoặc frame từ frontend
* Chạy inference qua mô hình AI để phân loại
* Trả kết quả nhanh, tối ưu real-time cho video/webcam
* Cung cấp API riêng cho admin
* Xử lý xác thực (JWT) cho admin endpoint

✅ **Các endpoint chính:**

| Endpoint                                   | Mô tả                                |
| ------------------------------------------ | ------------------------------------ |
| `POST /api/classify/image`                 | Nhận ảnh tĩnh                        |
| `POST /api/classify/frame`                 | Nhận frame từ video/webcam           |
| `POST /api/classify/video-file` (tùy chọn) | Nhận file video để phân loại toàn bộ |
| `POST /api/auth/login` (nếu có admin)      | Đăng nhập admin                      |
| `GET /api/admin/stats`                     | Lấy thống kê tổng quát               |
| `GET /api/admin/classifications`           | Lấy danh sách phân loại              |
| `DELETE /api/admin/classifications/{id}`   | Xóa bản ghi phân loại                |

✅ **Lưu ý quan trọng:**

* Hỗ trợ **CORS** đầy đủ để frontend có thể gửi request.
* Tối ưu **thời gian phản hồi** cho từng frame/video để tránh lag.
* Có thể mở rộng **WebcamSocket** nếu muốn real-time mượt hơn (nâng cao).

---

#### 🧠 **5. AI & Model**

* Mô hình AI phân loại chất lượng thực phẩm có thể là:

  * YOLO-v12
  * accuracy 0.96

---


#### 📦 **6. Triển khai & DevOps**

* Dockerfile có sẵn cho frontend + backend để triển khai dễ dàng.
* Có thể chạy local qua Docker Compose hoặc deploy lên cloud (Render, Railway, etc.).
* File `.env` chứa các thông tin quan trọng: DB connection, secret keys, etc.

---

#### 📈 **7. Kết quả kỳ vọng**

* ✅ Người dùng có thể nhanh chóng phân loại thực phẩm từ ảnh, video hoặc webcam.
* ✅ Giao diện admin trực quan, dễ quản lý.
* ✅ Backend phản hồi nhanh, hỗ trợ tải lớn và dễ mở rộng.
* ✅ Dễ dàng deploy, scale khi cần thiết.

---


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
