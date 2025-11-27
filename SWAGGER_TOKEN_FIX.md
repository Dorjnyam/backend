# Swagger Token Fix Guide

## Асуудал: "Failed to fetch" алдаа

### Шалтгаан:
1. Token-д хоосон зай байна (`Bearer    eyJ...`)
2. Swagger UI token format буруу

### Шийдэл:

#### 1. Token зөв оруулах

Swagger UI дээр **Authorize** хийхдээ:

**❌ Буруу:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
эсвэл
```
Bearer    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ Зөв:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(Зөвхөн token, "Bearer" prefix хэрэггүй)

#### 2. Алхам алхамаар:

1. **Login/Register хийх:**
   - `POST /api/auth/login` эсвэл `POST /api/auth/register`
   - Response-оос `token` хуулах

2. **Authorize хийх:**
   - Swagger UI-ийн баруун дээд буланд **"Authorize"** 🔒 товч дарах
   - `bearerAuth` дээр **"Authorize"** дарах
   - **Value** талбарт зөвхөн token оруулах (Bearer биш):
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJJZCI6IjY3OGFiY2RlZjEyMzQ1NiIsImlhdCI6MTczMjc5ODQ4NywiZXhwIjoxNzMzMzk4NDg3fQ.abc123...
     ```
   - **"Authorize"** дарах
   - **"Close"** дарах

3. **Endpoint тест хийх:**
   - Одоо `GET /api/challenge/daily` ажиллах ёстой

### 3. Хэрэв асуудал үргэлжилвэл:

#### Browser Console шалгах:
1. F12 дарж Developer Tools нээх
2. Console tab дээр алдаа харах
3. Network tab дээр request шалгах:
   - Request Headers дээр `Authorization: Bearer {token}` байх ёстой
   - Хэрэв хоосон зай байвал token дахин оруулах

#### Server Log шалгах:
- Terminal дээр server log харах
- Authentication алдаа байгаа эсэхийг шалгах

#### Token format шалгах:
- Token нь 3 хэсгээс бүрдэнэ (header.payload.signature)
- Жишээ: `eyJ...abc.def123.ghi456`
- Хэрэв token богино эсвэл буруу форматтай бол дахин login хийх

### 4. Alternative: Postman ашиглах

Хэрэв Swagger UI ажиллахгүй бол Postman ашиглах:

1. Postman collection import: `postman/DailyChallenge.postman_collection.json`
2. Register/Login хийх
3. Token автоматаар хадгалагдана
4. Challenge endpoint-ууд тест хийх

### 5. Quick Test:

```bash
# Terminal дээр curl ашиглах
curl -X GET http://localhost:5000/api/challenge/daily \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Хэрэв энэ ажиллаж байвал Swagger UI-ийн token format асуудал байна.

### 6. Server Restart:

Заримдаа server restart хийхэд асуудал шийдэгддэг:

```bash
# Terminal дээр Ctrl+C дарах
npm run dev
```

### 7. Browser Cache:

Browser cache цэвэрлэх:
- Ctrl + Shift + Delete
- Cached images and files сонгох
- Clear data

Дараа нь Swagger UI дахин нээх: `http://localhost:5000/api-docs`

