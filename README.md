# LingoPeak — Nền Tảng Học Tiếng Anh Trực Tuyến Chuẩn CEFR

LingoPeak là nền tảng học tiếng Anh trực tuyến toàn diện, tích hợp lộ trình học tập từ A1 đến C2, kho ngân hàng đề thi chuẩn IELTS & TOEIC, và AI Tutor đồng hành sư phạm.

---

## 1. Yêu Cầu Môi Trường (System Requirements)

- **Node.js**: Phiên bản `v22.x` (LTS khuyến nghị, tương thích ESM và strip-types).
- **Package Manager**: `npm` phiên bản `10.x` hoặc `11.x`.
- **Docker** (Tùy chọn): Cho triển khai containerized trên Google Cloud Run, AWS ECS hoặc VPS.
- **Firebase CLI** (Tùy chọn): Phiên bản `>= 13.x` nếu triển khai Firebase Hosting & Firestore Rules.

---

## 2. Hướng Dẫn Cài Đặt (Installation)

Clone repository và cài đặt dependencies theo lockfile:

```bash
# Clone repository
git clone https://github.com/thanhtug07/LearnEL.git
cd LearnEL

# Cài đặt dependencies chính xác
npm ci
```

Sao chép tệp biến môi trường mẫu:

```bash
cp .env.example .env
```

---

## 3. Chạy Môi Trường Local (Local Development)

### Chế độ phát triển (Development with Vite HMR):
```bash
npm run dev
```
- Khởi động Express backend kết hợp Vite middleware tại: `http://localhost:3000`.
- Hỗ trợ Hot Module Replacement (HMR) cho giao diện React.

### Chạy kiểm tra kiểu dữ liệu (Type check):
```bash
npm run lint
```
- Thực thi `tsc --noEmit` để đảm bảo 100% type-safe không phát sinh lỗi.

---

## 4. Chạy Kiểm Thử (Testing)

LingoPeak được trang bị bộ kiểm thử tự động toàn diện gồm 15 test suites và 132 tests:

```bash
# Chạy toàn bộ 15 test suites
npm test

# Chạy riêng bộ kiểm thử Regression Gate
npx vitest run test/e2e-regression-gate.test.ts

# Chạy kiểm thử Production Readiness, Healthcheck & Security Headers
npx vitest run test/production-readiness.test.ts

# Chạy kiểm thử cách ly dữ liệu và đồng bộ tài khoản
npx vitest run test/account-isolation-and-sync.test.ts
```

---

## 5. Build Sản Phẩm (Production Build)

```bash
# Build frontend bundle tối ưu
npm run build
```

Kết quả build được tạo tại thư mục `dist/`:
- Tự động tách chunk theo route (Lazy Loading).
- Tách riêng thư viện nặng (`vendor-firebase`, `content-questions`, `content-tests`).
- Tạo CSS nén và `dist/index.html`.

---

## 6. Khởi Động Server Production (Production Run)

```bash
# Chạy server Express phục vụ static assets từ dist/
npm start
```
Server lắng nghe trên `http://0.0.0.0:3000` với:
- Phục vụ tĩnh `dist/` kèm SPA routing fallback (`/dashboard`, `/courses`, `/practice`, `/profile`...).
- API endpoint cho AI Tutor, Question review, và Health monitoring.
- Cơ chế Graceful Shutdown (`SIGTERM`, `SIGINT`).

---

## 7. Triển Khai Container (Docker & Cloud Run)

### Build Docker image:
```bash
docker build -t lingopeak:latest .
```

### Chạy container local:
```bash
docker run -d -p 3000:3000 --env-file .env --name lingopeak-app lingopeak:latest
```

### Triển khai Google Cloud Run:
```bash
gcloud run deploy lingopeak \
  --image gcr.io/PROJECT_ID/lingopeak:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080
```

---

## 8. Triển Khai Firebase Hosting & Firestore Rules

```bash
# Đăng nhập Firebase
npx firebase login

# Chọn project
npx firebase use iconic-timer-5hl8x

# Triển khai Firestore Security Rules
npx firebase deploy --only firestore:rules

# Triển khai Frontend lên Firebase Hosting
npx firebase deploy --only hosting
```

---

## 9. Danh Sách Biến Môi Trường (Environment Variables)

Xem chi tiết trong tệp [`.env.example`](./.env.example):

### Backend (Bảo mật - Chỉ cấu hình trên Server):
| Biến | Kiểu | Bắt buộc | Mặc định | Mô tả |
| :--- | :---: | :---: | :---: | :--- |
| `PORT` | Number | Không | `3000` | Cổng HTTP mà server lắng nghe. |
| `NODE_ENV` | String | **Có** | `production` | Chế độ môi trường (`production` / `development`). |
| `APP_URL` | String | Không | `http://localhost:3000` | URL công khai của ứng dụng. |
| `CORS_ORIGIN` | String | Không | `*` | Danh sách domain được phép gọi API (phân cách bằng dấu phẩy). |
| `GEMINI_API_KEY` | String | Khuyến nghị | Trống | API key Google Gemini. Nếu thiếu, hệ thống tự kích hoạt chế độ Fallback Sư Phạm Offline. |
| `FIREBASE_API_KEY` | String | Không | Fallback | Web API key dùng để xác thực token người dùng qua Identity Toolkit. |

### Frontend Client (`VITE_*` - Công khai trên trình duyệt):
| Biến | Kiểu | Mô tả |
| :--- | :---: | :--- |
| `VITE_FIREBASE_PROJECT_ID` | String | Project ID Firebase (`iconic-timer-5hl8x`). |
| `VITE_FIREBASE_API_KEY` | String | Web Client API Key Firebase. |
| `VITE_FIREBASE_AUTH_DOMAIN` | String | Domain xác thực Google OAuth. |
| `VITE_FIREBASE_DATABASE_ID` | String | Database ID Cloud Firestore. |

> [!WARNING]
> Tuyệt đối KHÔNG đặt các bí mật như private key, token quản trị, hoặc `GEMINI_API_KEY` vào các biến `VITE_*` vì chúng sẽ bị lộ trong mã nguồn JavaScript tải về trình duyệt.

---

## 10. Giám Sát Sức Khỏe Hệ Thống (Health Check)

Endpoint kiểm tra sẵn sàng hoạt động:
```http
GET /api/health
```

### Phản hồi mẫu khi hệ thống khỏe mạnh (`200 OK`):
```json
{
  "status": "ok",
  "health": "healthy",
  "timestamp": "2026-10-14T06:37:25.000Z",
  "checks": {
    "server": {
      "status": "up",
      "uptimeSeconds": 342,
      "environment": "production",
      "memory": { "rssMb": 85, "heapUsedMb": 42 }
    },
    "staticAssets": { "status": "ready" },
    "dependencies": {
      "geminiAi": { "status": "connected", "model": "gemini-3.8-flash" },
      "firebaseAuth": { "status": "configured" }
    }
  }
}
```

### Phản hồi khi thiếu Gemini API key (`200 OK` - Degraded):
- `health`: `"degraded"`
- Hệ thống thông báo rõ: `"Operating in pedagogical rule-based fallback mode"`, phân biệt rõ ràng máy chủ còn sống nhưng dịch vụ phụ thuộc đang chạy chế độ dự phòng.

### Phản hồi khi lỗi bản build trong production (`503 Service Unavailable`):
- `health`: `"unhealthy"`
- Cảnh báo bản build `dist/index.html` chưa được tạo.

---

## 11. Quy Trình Khôi Phục Khi Triển Khai Gặp Sự Cố (Rollback Procedure)

1. **Rollback Container (Cloud Run / Kubernetes)**:
   - Quay về revision ổn định gần nhất ngay lập tức:
     ```bash
     gcloud run services update-traffic lingopeak --to-revisions=LINGOPEAK_PREVIOUS_REVISION=100
     ```
2. **Rollback Firebase Hosting**:
   - Truy cập Firebase Console -> Hosting -> Release History -> Chọn bản phát hành trước và bấm **Rollback**, hoặc qua CLI:
     ```bash
     npx firebase hosting:clone iconic-timer-5hl8x:PREVIOUS_VERSION iconic-timer-5hl8x:live
     ```
3. **Rollback Mã Nguồn (Git)**:
   ```bash
   git revert a07c6b1
   git push origin main
   ```
4. **Bảo toàn dữ liệu người dùng**:
   - Tiến độ học tập và điểm thi được lưu theo UID người dùng trên Cloud Firestore (`users/{userId}/...`), việc deploy hoặc rollback mã nguồn frontend/backend **tuyệt đối không làm mất dữ liệu người dùng**.
