# Frontend Integration Guide - Physical Asia Game Backend

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Authentication](#authentication)
4. [API Client Setup](#api-client-setup)
5. [API Endpoints](#api-endpoints)
6. [WebSocket Integration](#websocket-integration)
7. [Error Handling](#error-handling)
8. [Example Code](#example-code)
9. [TypeScript Types](#typescript-types)
10. [Best Practices](#best-practices)

---

## Overview

Physical Asia Game Backend нь:
- **Base URL**: `http://localhost:5000` (development) (or 5001)
- **API Prefix**: `/api`
- **WebSocket URL**: `http://localhost:5000` (or 5001)
- **Authentication**: JWT Bearer Token
- **Response Format**: JSON

### Response Structure

Бүх API response дараах форматтай:

```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string
}

// Error Response
{
  success: false,
  error: string
}
```

---

## Environment Setup

### 1. Environment Variables

Frontend `.env` файлд:

```env
# Backend API
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=http://localhost:5000

# Or for Next.js
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### 2. CORS Configuration

Backend нь бүх origin-д зөвшөөрөгдсөн (development). Production дээр тодорхой origin-уудыг зөвшөөрөх хэрэгтэй.

---

## Authentication

### 1. Register

**Endpoint:** `POST /api/auth/register`

**Request:**
```typescript
interface RegisterRequest {
  username: string;
  email: string;
  password: string; // min 6 characters
}
```

**Response:**
```typescript
interface RegisterResponse {
  success: true;
  data: {
    player: {
      id: string;
      username: string;
      email: string;
    };
    token: string; // JWT token
  };
}
```

**Example:**
```typescript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('token', data.data.token);
  localStorage.setItem('playerId', data.data.player.id);
}
```

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  success: true;
  data: {
    player: {
      id: string;
      username: string;
      email: string;
      level: number;
      totalPoints: number;
    };
    token: string;
  };
}
```

**Example:**
```typescript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('token', data.data.token);
  localStorage.setItem('playerId', data.data.player.id);
}
```

### 3. Token Management

**Token хадгалах:**
```typescript
// localStorage ашиглах
localStorage.setItem('token', token);

// Эсвэл sessionStorage
sessionStorage.setItem('token', token);

// Эсвэл cookie (httpOnly cookie дэмжихгүй)
document.cookie = `token=${token}; path=/; max-age=604800`; // 7 days
```

**Token авах:**
```typescript
const token = localStorage.getItem('token');
```

**Token устгах:**
```typescript
localStorage.removeItem('token');
localStorage.removeItem('playerId');
```

---

## API Client Setup

### React Example

```typescript
// api/client.ts
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_URL);
```

### Axios Example

```typescript
// api/axios.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token нэмэх
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token хүчингүй - logout хийх
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
```

---

## API Endpoints

### Authentication

#### Register
```typescript
POST /api/auth/register
Body: { username, email, password }
Response: { success, data: { player, token } }
```

#### Login
```typescript
POST /api/auth/login
Body: { email, password }
Response: { success, data: { player, token } }
```

### Player

#### Get Player Profile
```typescript
GET /api/player/:id
Headers: { Authorization: Bearer {token} }
Response: { success, data: Player }
```

#### Get Player Stats
```typescript
GET /api/player/:id/stats
Headers: { Authorization: Bearer {token} }
Response: { success, data: PlayerStats[] }
```

#### Update Player Profile
```typescript
PATCH /api/player/:id
Headers: { Authorization: Bearer {token} }
Body: { avatar }
Response: { success, data: Player }
```

### Game

#### Create Game Session
```typescript
POST /api/game/session/create
Headers: { Authorization: Bearer {token} }
Body: { gameType, mode, seasonId }
Response: { success, data: GameSession }
```

#### Get Session Details
```typescript
GET /api/game/session/:id
Headers: { Authorization: Bearer {token} }
Response: { success, data: GameSession }
```

#### Submit Game Result
```typescript
POST /api/game/session/:id/result
Headers: { Authorization: Bearer {token} }
Body: { score, stats, rank }
Response: { success, data: GameResult }
```

### Daily Challenge

#### Get Daily Challenges
```typescript
GET /api/challenge/daily
Headers: { Authorization: Bearer {token} }
Response: { success, data: DailyChallenge }
```

#### Get Player Progress
```typescript
GET /api/challenge/progress
Headers: { Authorization: Bearer {token} }
Response: { success, data: ChallengeProgress[] }
```

#### Claim Reward
```typescript
POST /api/challenge/:id/claim
Headers: { Authorization: Bearer {token} }
Response: { success, message: 'Reward claimed' }
```

### Leaderboard

#### Get Global Leaderboard
```typescript
GET /api/leaderboard/global?limit=100&redis=true
Headers: { Authorization: Bearer {token} }
Response: { success, data: LeaderboardEntry[] }
```

#### Get Season Leaderboard
```typescript
GET /api/leaderboard/season/:id?limit=100
Headers: { Authorization: Bearer {token} }
Response: { success, data: LeaderboardEntry[] }
```

#### Get Game Leaderboard
```typescript
GET /api/leaderboard/game/:type?limit=100
Headers: { Authorization: Bearer {token} }
Response: { success, data: LeaderboardEntry[] }
```

#### Get Player Rank
```typescript
GET /api/leaderboard/player/:id/rank?redis=true
Headers: { Authorization: Bearer {token} }
Response: { success, data: { rank: number } }
```

#### Get Nearby Players
```typescript
GET /api/leaderboard/player/:id/nearby
Headers: { Authorization: Bearer {token} }
Response: { success, data: LeaderboardEntry[] }
```

### Tournament

#### List Tournaments
```typescript
GET /api/tournament/list
Headers: { Authorization: Bearer {token} }
Response: { success, data: Tournament[] }
```

#### Register for Tournament
```typescript
POST /api/tournament/:id/register
Headers: { Authorization: Bearer {token} }
Response: { success, message: 'Registered successfully' }
```

#### Get Tournament Bracket
```typescript
GET /api/tournament/:id/bracket
Headers: { Authorization: Bearer {token} }
Response: { success, data: Bracket }
```

---

## WebSocket Integration

### Socket.IO Client Setup

```bash
npm install socket.io-client
```

### Connection

```typescript
// websocket/client.ts
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

class WebSocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(WS_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Game Events
  joinGame(sessionId: string, playerId: string) {
    this.socket?.emit('game:join', { sessionId, playerId });
  }

  leaveGame(sessionId: string, playerId: string) {
    this.socket?.emit('game:leave', { sessionId, playerId });
  }

  updateGameState(sessionId: string, playerId: string, state: any) {
    this.socket?.emit('game:update', { sessionId, playerId, state });
  }

  onGameState(callback: (data: any) => void) {
    this.socket?.on('game:state', callback);
  }

  onGameFinished(callback: (data: any) => void) {
    this.socket?.on('game:finished', callback);
  }

  onPlayerJoined(callback: (data: any) => void) {
    this.socket?.on('player:joined', callback);
  }

  onPlayerLeft(callback: (data: any) => void) {
    this.socket?.on('player:left', callback);
  }

  // Matchmaking Events
  joinMatchmaking(playerId: string, gameType: string, mode: string) {
    this.socket?.emit('matchmaking:join', { playerId, gameType, mode });
  }

  onMatchmakingQueued(callback: (data: { position: number }) => void) {
    this.socket?.on('matchmaking:queued', callback);
  }

  onMatchmakingFound(callback: (data: { sessionId: string; opponent: string }) => void) {
    this.socket?.on('matchmaking:found', callback);
  }

  // Leaderboard Events
  onLeaderboardUpdate(callback: (data: any) => void) {
    this.socket?.on('leaderboard:update', callback);
  }
}

export const wsClient = new WebSocketClient();
```

### React Hook Example

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { wsClient } from '../websocket/client';

export function useWebSocket(token: string | null) {
  const isConnected = useRef(false);

  useEffect(() => {
    if (token && !isConnected.current) {
      wsClient.connect(token);
      isConnected.current = true;

      return () => {
        wsClient.disconnect();
        isConnected.current = false;
      };
    }
  }, [token]);

  return wsClient;
}
```

### WebSocket Events

#### Client → Server

```typescript
// Join game session
socket.emit('game:join', {
  sessionId: string,
  playerId: string
});

// Leave game session
socket.emit('game:leave', {
  sessionId: string,
  playerId: string
});

// Update game state
socket.emit('game:update', {
  sessionId: string,
  playerId: string,
  state: any
});

// Join matchmaking queue
socket.emit('matchmaking:join', {
  playerId: string,
  gameType: 'running' | 'jumping' | 'throwing' | 'balance' | 'endurance',
  mode: '1v1' | 'battle-royale' | 'tournament'
});
```

#### Server → Client

```typescript
// Player joined
socket.on('player:joined', (data: {
  playerId: string;
  socketId: string;
}) => {
  console.log('Player joined:', data);
});

// Player left
socket.on('player:left', (data: {
  playerId: string;
}) => {
  console.log('Player left:', data);
});

// Game state update
socket.on('game:state', (data: {
  playerId: string;
  state: any;
  timestamp: number;
}) => {
  console.log('Game state:', data);
});

// Game finished
socket.on('game:finished', (data: {
  sessionId: string;
  results: GameResult;
}) => {
  console.log('Game finished:', data);
});

// Matchmaking queued
socket.on('matchmaking:queued', (data: {
  position: number;
}) => {
  console.log('Queue position:', data.position);
});

// Match found
socket.on('matchmaking:found', (data: {
  sessionId: string;
  opponent: string;
}) => {
  console.log('Match found:', data);
});

// Leaderboard update
socket.on('leaderboard:update', (data: {
  type: string;
  data: any;
}) => {
  console.log('Leaderboard updated:', data);
});
```

---

## Error Handling

### API Error Handler

```typescript
// utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleApiError(response: Response) {
  if (!response.ok) {
    const data = await response.json();
    throw new ApiError(
      response.status,
      data.error || 'Request failed',
      data
    );
  }
  return response.json();
}
```

### React Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Example Code

### Complete React Example

```typescript
// App.tsx
import React, { useState, useEffect } from 'react';
import { apiClient } from './api/client';
import { wsClient } from './websocket/client';

interface Challenge {
  challengeId: string;
  title: string;
  description: string;
  reward: {
    coins: number;
    xp: number;
  };
  progress: number;
  completed: boolean;
}

function App() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      wsClient.connect(token);
    }

    return () => {
      wsClient.disconnect();
    };
  }, [token]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{
        success: boolean;
        data: {
          challenges: Challenge[];
        };
      }>('/api/challenge/daily');

      if (response.success) {
        setChallenges(response.data.challenges);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (challengeId: string) => {
    try {
      await apiClient.post(`/api/challenge/${challengeId}/claim`);
      loadChallenges(); // Refresh
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Daily Challenges</h1>
      {challenges.map((challenge) => (
        <div key={challenge.challengeId}>
          <h3>{challenge.title}</h3>
          <p>{challenge.description}</p>
          <p>Progress: {challenge.progress}</p>
          {challenge.completed && !challenge.claimed && (
            <button onClick={() => claimReward(challenge.challengeId)}>
              Claim Reward
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
```

---

## TypeScript Types

### Complete Type Definitions

```typescript
// types/api.ts

// Authentication
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    player: {
      id: string;
      username: string;
      email: string;
      level?: number;
      totalPoints?: number;
    };
    token: string;
  };
}

// Player
export interface Player {
  id: string;
  username: string;
  email: string;
  avatar: {
    imageUrl: string;
    frameId?: string;
  };
  level: number;
  xp: number;
  totalPoints: number;
  rank: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  coins: number;
}

// Challenge
export interface Challenge {
  challengeId: string;
  type: 'play_games' | 'win_games' | 'score_points' | 'streak' | 'special';
  gameType?: 'running' | 'jumping' | 'throwing' | 'balance' | 'endurance';
  title: string;
  description: string;
  requirement: {
    field: string;
    value: number;
  };
  reward: {
    coins: number;
    xp: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChallengeProgress extends Challenge {
  progress: number;
  completed: boolean;
  claimed: boolean;
}

// Game
export interface GameSession {
  _id: string;
  gameType: string;
  mode: string;
  players: Array<{
    playerId: string;
    username: string;
    avatar: string;
  }>;
  status: 'waiting' | 'countdown' | 'active' | 'finished' | 'cancelled';
  startedAt?: string;
  endedAt?: string;
  winnerId?: string;
}

export interface GameResult {
  _id: string;
  sessionId: string;
  playerId: string;
  gameType: string;
  score: number;
  rank: number;
  pointsEarned: number;
  xpEarned: number;
  stats: Record<string, any>;
  rewards: {
    coins: number;
    seasonPassXp: number;
  };
}

// Leaderboard
export interface LeaderboardEntry {
  playerId: string;
  username: string;
  avatar: string;
  points: number;
  rank: number;
}

// Tournament
export interface Tournament {
  _id: string;
  name: string;
  gameType: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'registration' | 'active' | 'finished' | 'cancelled';
  participants: Array<{
    playerId: string;
    registeredAt: string;
  }>;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

---

## Best Practices

### 1. Token Refresh

```typescript
// Token 7 хоног хүчинтэй. Хэрэв хүчингүй бол дахин login хийх
if (error.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

### 2. Request Retry

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Request failed after retries');
}
```

### 3. Loading States

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleRequest = async () => {
  setLoading(true);
  setError(null);
  try {
    // API call
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 4. Optimistic Updates

```typescript
// UI-г шууд шинэчлэх, дараа нь server-тэй sync хийх
const claimReward = async (challengeId: string) => {
  // Optimistic update
  setChallenges(prev => prev.map(c => 
    c.challengeId === challengeId 
      ? { ...c, claimed: true }
      : c
  ));

  try {
    await apiClient.post(`/api/challenge/${challengeId}/claim`);
  } catch (err) {
    // Rollback on error
    loadChallenges();
  }
};
```

### 5. WebSocket Reconnection

```typescript
wsClient.socket?.on('disconnect', () => {
  // Auto reconnect after 1 second
  setTimeout(() => {
    const token = localStorage.getItem('token');
    if (token) {
      wsClient.connect(token);
    }
  }, 1000);
});
```

---

## Testing

### Mock API for Testing

```typescript
// __mocks__/api.ts
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};
```

### Example Test

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { apiClient } from '../api/client';
import App from '../App';

jest.mock('../api/client');

test('loads challenges', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({
    success: true,
    data: {
      challenges: [
        {
          challengeId: 'play-3-games',
          title: 'Play 3 Games',
          progress: 0,
          completed: false
        }
      ]
    }
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText('Play 3 Games')).toBeInTheDocument();
  });
});
```

---

## Production Checklist

- [ ] Environment variables тохируулах
- [ ] CORS origin-уудыг тодорхойлох
- [ ] HTTPS ашиглах
- [ ] Token refresh механизм нэмэх
- [ ] Error logging (Sentry, etc.)
- [ ] API rate limiting харгалзах
- [ ] WebSocket reconnection логик
- [ ] Loading states
- [ ] Error boundaries
- [ ] TypeScript types бүхэлд нь

---

## Support

Асуулт байвал:
- Swagger UI: `http://localhost:5000/api-docs`
- API Documentation: `http://localhost:5000/api-docs.json`
- Health Check: `http://localhost:5000/health`

