# Quick Fix - Swagger UI "Failed to fetch"

## Асуудал:
Token-д хоосон зай байна: `Bearer    eyJ...`

## Шийдэл:

### 1. Token зөв оруулах (ХАМГИЙН ЧУХАЛ!)

Swagger UI дээр **Authorize** хийхдээ:

**❌ БУРУУ:**
- Value талбарт: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Эсвэл: `Bearer    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**✅ ЗӨВ:**
- Value талбарт: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJJZCI6IjY3OGFiY2RlZjEyMzQ1NiIsImlhdCI6MTczMjc5ODQ4NywiZXhwIjoxNzMzMzk4NDg3fQ.abc123...`
- **Зөвхөн token, "Bearer" бичэхгүй!**

### 2. Алхам алхамаар:

1. **Login хийх:**
   ```
   POST /api/auth/login
   Body: {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
   - Response-оос `token` хуулах

2. **Authorize хийх:**
   - Swagger UI-ийн баруун дээд буланд **"Authorize"** 🔒 товч дарах
   - `bearerAuth` дээр **"Authorize"** дарах
   - **Value** талбарт **ЗӨВХӨН TOKEN** оруулах (Bearer биш!)
   - **"Authorize"** дарах
   - **"Close"** дарах

3. **Endpoint тест хийх:**
   - `GET /api/challenge/daily`
   - **"Try it out"** → **"Execute"**

### 3. Хэрэв асуудал үргэлжилвэл:

#### Browser Console шалгах:
1. **F12** дарж Developer Tools нээх
2. **Console** tab дээр алдаа харах
3. **Network** tab дээр:
   - Request сонгох
   - **Headers** харах
   - `Authorization` header шалгах:
     - ✅ Зөв: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - ❌ Буруу: `Authorization: Bearer    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Server ажиллаж байгаа эсэхийг шалгах:
- Terminal дээр server log харах
- Хэрэв server ажиллахгүй байвал:
  ```bash
  npm run dev
  ```

#### Token дахин оруулах:
1. **Authorize** дахин нээх
2. **Logout** хийх (хэрэв байвал)
3. Token-ийг **зөвхөн token** хэлбэрээр дахин оруулах
4. **Authorize** дарах

### 4. Alternative: Postman ашиглах

Swagger UI ажиллахгүй бол Postman ашиглах:

1. Postman collection import: `postman/DailyChallenge.postman_collection.json`
2. Register/Login хийх
3. Token автоматаар хадгалагдана
4. Challenge endpoint-ууд тест хийх

### 5. Visual Guide:

```
Swagger UI Authorize Dialog:
┌─────────────────────────────────┐
│ Available authorizations       │
├─────────────────────────────────┤
│ bearerAuth (http, Bearer)      │
│                                 │
│ Value: [________________]      │ ← ЭНД ЗӨВХӨН TOKEN ОРУУЛАХ
│                                 │    (Bearer биш!)
│                                 │
│ [Authorize] [Close]            │
└─────────────────────────────────┘
```

**Token оруулах жишээ:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJJZCI6IjY3OGFiY2RlZjEyMzQ1NiIsImlhdCI6MTczMjc5ODQ4NywiZXhwIjoxNzMzMzk4NDg3fQ.abc123def456ghi789
```

### 6. Server Restart:

```bash
# Terminal дээр
Ctrl+C  # Server зогсоох
npm run dev  # Дахин эхлүүлэх
```

### 7. Browser Cache:

- **Ctrl + Shift + Delete**
- **Cached images and files** сонгох
- **Clear data**
- Swagger UI дахин нээх: `http://localhost:5000/api-docs`

## Хамгийн чухал:

**Swagger UI дээр token оруулахдаа "Bearer" бичэхгүй! Зөвхөн token оруулах!**

Swagger UI автоматаар "Bearer " prefix нэмдэг, тиймээс хэрэв та "Bearer " бичвэл "Bearer Bearer token" болно.

