# 🐳 Docker Setup — Cloth E-commerce

## Cấu trúc thư mục sau khi tổ chức

```
project-root/
├── docker-compose.yml
├── .env                     ← copy từ .env.example, điền thật
├── .env.example
│
├── backend/                 ← toàn bộ code Django
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── manage.py
│   ├── ecommerce_backend/
│   │   └── settings.py      ← cập nhật theo settings_prod snippet
│   └── ...
│
└── frontend/                ← toàn bộ code React/Vite
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── package.json
    └── ...
```

## Bước 1 — Chuẩn bị

### Copy và điền .env
```bash
cp .env.example .env
# Sửa SECRET_KEY, POSTGRES_PASSWORD, SEPAY_WEBHOOK_API_KEY
```

### Cập nhật settings.py (backend)
Thêm vào cuối `ecommerce_backend/settings.py`:
```python
import os
SECRET_KEY    = os.environ.get("SECRET_KEY", SECRET_KEY)
DEBUG         = os.environ.get("DEBUG", "False") == "True"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")

# Database — đọc từ env khi chạy Docker
if os.environ.get("DATABASE_URL"):
    import dj_database_url
    DATABASES = {"default": dj_database_url.config(env="DATABASE_URL")}

CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS", "http://localhost"
).split(",")
STATIC_ROOT = BASE_DIR / "staticfiles"
```

Thêm vào `requirements.txt`:
```
gunicorn
dj-database-url
psycopg2-binary
python-decouple
```

### Cập nhật VITE_API_URL (frontend)
Tạo `frontend/.env.production`:
```
VITE_API_URL=http://localhost:8000/api
VITE_BANK_NUMBER=9968083967
VITE_BANK_NAME=VCB
VITE_ACCOUNT_NAME=NGUYEN DINH TRONG
```

## Bước 2 — Chạy

```bash
# Build và khởi động toàn bộ
docker compose up --build

# Chạy nền (detached)
docker compose up --build -d

# Xem log
docker compose logs -f

# Dừng
docker compose down
```

## Bước 3 — Tạo superuser Django

```bash
docker compose exec backend python manage.py createsuperuser
```

## Bước 4 — Truy cập

| Service         | URL                          |
|-----------------|------------------------------|
| Frontend        | http://localhost             |
| Backend API     | http://localhost:8000/api    |
| Django Admin    | http://localhost:8000/admin  |
| PostgreSQL      | localhost:5432               |

## Lệnh hữu ích

```bash
# Migrate DB
docker compose exec backend python manage.py migrate

# Tạo data mẫu
docker compose exec backend python manage.py loaddata fixtures.json

# Xem DB
docker compose exec db psql -U postgres -d ecommerce_db

# Rebuild chỉ frontend
docker compose up --build frontend

# Xem dung lượng volumes
docker volume ls
```

## Ghi chú Production

- Thay `DEBUG=False` trong `.env`
- Dùng domain thật trong `ALLOWED_HOSTS` và `CORS_ALLOWED_ORIGINS`
- Đặt `SECRET_KEY` ngẫu nhiên mạnh (50+ ký tự)
- Cân nhắc thêm Nginx reverse proxy phía trước nếu cần SSL