# Postman Guide - Daily Challenge API Testing

## Setup

### 1. Postman Collection Import

1. Postman нээх
2. **Import** дээр дарах
3. `postman/DailyChallenge.postman_collection.json` файлыг сонгох
4. Import хийх

### 2. Environment Variables

Collection дээр **Variables** tab дээр:
- `base_url`: `http://localhost:5000` (default)
- `auth_token`: Автоматаар login/register хийхэд тохируулагдана
- `player_id`: Автоматаар тохируулагдана

## Testing Steps

### Step 1: Register (Шинэ хэрэглэгч бүртгэх)

**Request:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "player": {
      "id": "...",
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Эсвэл Login хийх:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Step 2: Get Daily Challenges (Өдрийн Challenge-ууд авах)

**Request:**
```
GET http://localhost:5000/api/challenge/daily
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "date": "2024-01-15T00:00:00.000Z",
    "challenges": [
      {
        "challengeId": "play-3-games",
        "type": "play_games",
        "title": "3 Тоглоом Тогло",
        "description": "Өнөөдөр 3 тоглоом тогло",
        "requirement": {
          "field": "gamesPlayed",
          "value": 3
        },
        "reward": {
          "coins": 50,
          "xp": 100
        },
        "difficulty": "easy"
      },
      {
        "challengeId": "win-3-games",
        "type": "win_games",
        "title": "3 Хожло",
        "description": "Өнөөдөр 3 удаа хожло",
        "requirement": {
          "field": "wins",
          "value": 3
        },
        "reward": {
          "coins": 200,
          "xp": 400
        },
        "difficulty": "medium"
      },
      {
        "challengeId": "score-1000-points",
        "type": "score_points",
        "title": "1000 Оноо Цуглуулаа",
        "description": "Өнөөдөр 1000 оноо цуглуулаа",
        "requirement": {
          "field": "points",
          "value": 1000
        },
        "reward": {
          "coins": 250,
          "xp": 500
        },
        "difficulty": "hard"
      }
    ]
  }
}
```

### Step 3: Get Player Challenge Progress (Тоглогчийн явц харах)

**Request:**
```
GET http://localhost:5000/api/challenge/progress
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "challengeId": "play-3-games",
      "type": "play_games",
      "title": "3 Тоглоом Тогло",
      "description": "Өнөөдөр 3 тоглоом тогло",
      "requirement": {
        "field": "gamesPlayed",
        "value": 3
      },
      "reward": {
        "coins": 50,
        "xp": 100
      },
      "difficulty": "easy",
      "progress": 0,
      "completed": false,
      "claimed": false
    },
    {
      "challengeId": "win-3-games",
      "type": "win_games",
      "title": "3 Хожло",
      "progress": 1,
      "completed": false,
      "claimed": false
    }
  ]
}
```

### Step 4: Claim Challenge Reward (Шагнал авах)

**Request:**
```
POST http://localhost:5000/api/challenge/play-3-games/claim
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Reward claimed"
}
```

**Error Response (if not completed):**
```json
{
  "success": false,
  "error": "Cannot claim reward"
}
```

## Manual Testing (Postman without Collection)

### 1. Register/Login

**Register:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Login:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Get Daily Challenges

- Method: `GET`
- URL: `http://localhost:5000/api/challenge/daily`
- Headers:
  - `Authorization: Bearer {token}` (login response-оос token авна)

### 3. Get Progress

- Method: `GET`
- URL: `http://localhost:5000/api/challenge/progress`
- Headers:
  - `Authorization: Bearer {token}`

### 4. Claim Reward

- Method: `POST`
- URL: `http://localhost:5000/api/challenge/{challengeId}/claim`
  - Example: `http://localhost:5000/api/challenge/play-3-games/claim`
- Headers:
  - `Authorization: Bearer {token}`

## Common Challenge IDs

- `play-3-games` - 3 тоглоом тогло
- `play-5-games` - 5 тоглоом тогло
- `win-1-game` - 1 хожло
- `win-3-games` - 3 хожло
- `score-200-points` - 200 оноо
- `score-500-points` - 500 оноо
- `score-1000-points` - 1000 оноо
- `win-streak-2` - 2 давааны хожил
- `running-3-wins` - Гүйлтийн 3 хожил

## Notes

- Бүх challenge endpoint-ууд JWT token шаарддаг
- Token-ийг login/register response-оос авна
- Challenge-ууд өдөр бүр санамсаргүй сонгогдоно
- Progress автоматаар game result submit хийхэд шинэчлэгдэнэ
- Challenge дууссаны дараа л reward claim хийж болно

