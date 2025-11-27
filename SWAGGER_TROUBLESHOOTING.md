# Swagger UI Troubleshooting Guide

## "Failed to fetch" алдаа засах

### 1. Authentication Token оруулах

Swagger UI дээр endpoint ашиглахын тулд эхлээд **JWT token** оруулах хэрэгтэй:

#### Алхам:
1. **Login эсвэл Register хийх:**
   - `/api/auth/login` эсвэл `/api/auth/register` endpoint ашиглах
   - Response-оос `token` авна

2. **Swagger UI дээр Authorize:**
   - Swagger UI-ийн баруун дээд буланд **"Authorize"** 🔒 товч дарах
   - `bearerAuth` дээр **"Authorize"** дарах
   - Token оруулах: 
     - Зөвхөн token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - Эсвэл `Bearer {token}` формат
   - **"Authorize"** дарах
   - **"Close"** дарах

3. **Endpoint тест хийх:**
   - Одоо бүх authenticated endpoint-ууд ажиллах ёстой

### 2. CORS алдаа засах

Хэрэв CORS алдаа гарвал:

1. **Server restart хийх:**
   ```bash
   npm run dev
   ```

2. **Browser cache цэвэрлэх:**
   - Ctrl + Shift + Delete
   - Cache цэвэрлэх

3. **Browser дээр нээх:**
   - `http://localhost:5000/api-docs`
   - `http://127.0.0.1:5000/api-docs` (хэрэв localhost ажиллахгүй бол)

### 3. Server ажиллаж байгаа эсэхийг шалгах

```bash
# Health check
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "mongodb": "connected",
  "redis": "ready"
}
```

### 4. Common Issues

#### Issue 1: "Undocumented" response
**Шалтгаан:** Swagger annotation буруу эсвэл байхгүй
**Шийдэл:** Route файлд `@swagger` annotation шалгах

#### Issue 2: 401 Unauthorized
**Шалтгаан:** Token оруулаагүй эсвэл хүчингүй token
**Шийдэл:** 
- Login хийж шинэ token авах
- Swagger UI дээр Authorize хийх

#### Issue 3: Network Error
**Шалтгаан:** Server ажиллахгүй байна
**Шийдэл:**
- Terminal дээр server log шалгах
- Port 5000 дээр process ажиллаж байгаа эсэхийг шалгах

### 5. Quick Test Steps

1. **Server ажиллуулах:**
   ```bash
   npm run dev
   ```

2. **Browser дээр нээх:**
   ```
   http://localhost:5000/api-docs
   ```

3. **Register хийх:**
   - `POST /api/auth/register`
   - Body:
     ```json
     {
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Response-оос `token` авна

4. **Authorize хийх:**
   - "Authorize" товч дарах
   - Token оруулах
   - "Authorize" дарах

5. **Challenge endpoint тест хийх:**
   - `GET /api/challenge/daily`
   - "Try it out" → "Execute"

### 6. Alternative: Postman ашиглах

Хэрэв Swagger UI ажиллахгүй бол Postman ашиглах:

1. Postman collection import хийх: `postman/DailyChallenge.postman_collection.json`
2. Register/Login хийх
3. Token автоматаар хадгалагдана
4. Challenge endpoint-ууд тест хийх

Дэлгэрэнгүй: [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)

### 7. Debug Tips

**Browser Console шалгах:**
- F12 дарж Developer Tools нээх
- Console tab дээр алдаа харах
- Network tab дээр request/response харах

**Server Log шалгах:**
- Terminal дээр server log харах
- Алдааны мэдээлэл харах

