# Swagger API Documentation Guide

## Swagger UI Access

Server ажиллаж байгаа үед Swagger UI-г дараах хаягаар нээх:

```
http://localhost:5000/api-docs
```

## Features

- ✅ **Interactive API Documentation** - Бүх endpoint-уудыг харах, тест хийх
- ✅ **JWT Authentication** - Token-ээр шууд тест хийх
- ✅ **Request/Response Examples** - Жишээ request/response
- ✅ **Schema Definitions** - Data model-ууд

## Usage

### 1. Swagger UI нээх

Browser дээр: `http://localhost:5000/api-docs`

### 2. Authentication

1. **Register эсвэл Login хийх:**
   - `/api/auth/register` эсвэл `/api/auth/login` endpoint ашиглах
   - Response-оос `token` авна

2. **Swagger UI дээр Authorize:**
   - Swagger UI-ийн баруун дээд буланд **"Authorize"** товч дарах
   - `bearerAuth` дээр **"Authorize"** дарах
   - Token оруулах: `Bearer {your_token}` эсвэл зөвхөн `{your_token}`
   - **"Authorize"** дарах
   - **"Close"** дарах

### 3. API Test хийх

1. Endpoint сонгох (жишээ: `GET /api/challenge/daily`)
2. **"Try it out"** дарах
3. Parameters (хэрэв байвал) оруулах
4. **"Execute"** дарах
5. Response харах

## Available Endpoints

### Authentication
- `POST /api/auth/register` - Шинэ хэрэглэгч бүртгэх
- `POST /api/auth/login` - Нэвтрэх

### Daily Challenge
- `GET /api/challenge/daily` - Өдрийн challenge-ууд авах
- `GET /api/challenge/progress` - Тоглогчийн явц харах
- `POST /api/challenge/{id}/claim` - Шагнал авах

## Swagger JSON

Swagger specification JSON файлыг дараах хаягаар авах:

```
http://localhost:5000/api-docs.json
```

## Adding New Endpoints

Шинэ endpoint нэмэхдээ route файлд Swagger annotations нэмэх:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Your endpoint description
 *     tags: [Your Tag]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
router.get('/your-endpoint', middleware, handler);
```

## Swagger Annotations Reference

### Basic Endpoint
```typescript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     summary: Short description
 *     tags: [Tag Name]
 */
```

### With Authentication
```typescript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     security:
 *       - bearerAuth: []
 */
```

### With Request Body
```typescript
/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 */
```

### With Path Parameters
```typescript
/**
 * @swagger
 * /api/endpoint/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
```

### Response Schemas
```typescript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 */
```

## Tips

1. **Token авч авах:** Login/Register хийхэд response-оос token авна
2. **Token хадгалах:** Swagger UI дээр Authorize хийсний дараа бүх request-д автоматаар token нэмэгдэнэ
3. **Schema харах:** Components → Schemas дээр бүх data model-ууд байна
4. **Example ашиглах:** Request body дээр "Example" сонгох

## Production

Production дээр Swagger UI-г нуух хэрэгтэй бол:

```typescript
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}
```

