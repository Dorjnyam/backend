# Matchmaking & 2-Player Game Integration Guide

## 📋 Integration Priority List

### ✅ Already Integrated (You Have)
1. ✅ Login (`POST /api/auth/login`)
2. ✅ Register (`POST /api/auth/register`)
3. ✅ Leaderboard (`GET /api/leaderboard/*`)

### 🎯 Next Steps (Priority Order)

#### Phase 1: WebSocket Setup (FIRST - Required)
1. **Socket.IO Client Installation**
2. **WebSocket Connection Setup**
3. **Authentication with WebSocket**

#### Phase 2: Matchmaking (SECOND)
4. **Join Matchmaking Queue**
5. **Handle Match Found**
6. **Matchmaking UI**

#### Phase 3: Game Session (THIRD)
7. **Join Game Session**
8. **Real-time Game Updates**
9. **Game State Synchronization**

#### Phase 4: Game Results (FOURTH)
10. **Submit Game Result**
11. **Display Results**
12. **Update Leaderboard**

---

## 🚀 Phase 1: WebSocket Setup

### Step 1.1: Install Socket.IO Client

```bash
npm install socket.io-client
```

### Step 1.2: Create WebSocket Service

**File: `src/services/websocket.service.ts`** (or `services/socket.ts`)

```typescript
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  // Connect to WebSocket server
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Already connected');
      return;
    }

    this.token = token;

    this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Emit event
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket not connected');
    }
  }

  // Listen to event
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
```

### Step 1.3: Connect After Login

**Update your login function:**

```typescript
import { websocketService } from './services/websocket.service';

async function handleLogin(email: string, password: string) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success && data.data.token) {
      // Store token
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('playerId', data.data.player.id);

      // Connect WebSocket AFTER login
      websocketService.connect(data.data.token);

      return data;
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

### Step 1.4: Disconnect on Logout

```typescript
function handleLogout() {
  // Disconnect WebSocket
  websocketService.disconnect();
  
  // Clear storage
  localStorage.removeItem('token');
  localStorage.removeItem('playerId');
}
```

---

## 🎮 Phase 2: Matchmaking

### Step 2.1: Create Matchmaking Hook

**File: `src/hooks/useMatchmaking.ts`** (React) or component

```typescript
import { useState, useEffect } from 'react';
import { websocketService } from '../services/websocket.service';

interface MatchmakingState {
  isSearching: boolean;
  queuePosition: number | null;
  matchFound: boolean;
  sessionId: string | null;
  opponentId: string | null;
  error: string | null;
}

export function useMatchmaking() {
  const [state, setState] = useState<MatchmakingState>({
    isSearching: false,
    queuePosition: null,
    matchFound: false,
    sessionId: null,
    opponentId: null,
    error: null
  });

  const socket = websocketService.getSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for queue position updates
    socket.on('matchmaking:queued', (data: { position: number }) => {
      setState(prev => ({
        ...prev,
        queuePosition: data.position,
        isSearching: true
      }));
    });

    // Listen for match found
    socket.on('matchmaking:found', (data: { sessionId: string; opponent: string }) => {
      setState(prev => ({
        ...prev,
        matchFound: true,
        sessionId: data.sessionId,
        opponentId: data.opponent,
        isSearching: false,
        queuePosition: null
      }));
    });

    // Cleanup
    return () => {
      socket.off('matchmaking:queued');
      socket.off('matchmaking:found');
    };
  }, [socket]);

  // Join matchmaking queue
  const joinQueue = (gameType: string, mode: string = 'ranked') => {
    if (!socket?.connected) {
      setState(prev => ({ ...prev, error: 'WebSocket not connected' }));
      return;
    }

    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      setState(prev => ({ ...prev, error: 'Player not logged in' }));
      return;
    }

    setState(prev => ({
      ...prev,
      isSearching: true,
      queuePosition: null,
      matchFound: false,
      error: null
    }));

     socket.emit('matchmaking:join', {
       playerId,
       gameType, // 'running', 'jumping', 'throwing', 'balance', 'endurance'
       mode      // 'ranked' or 'casual' (both map to '1v1' on backend)
     });
  };

  // Leave matchmaking queue
  const leaveQueue = (gameType: string, mode: string = 'ranked') => {
    if (!socket?.connected) return;

    socket.emit('matchmaking:leave', { gameType, mode });

    setState({
      isSearching: false,
      queuePosition: null,
      matchFound: false,
      sessionId: null,
      opponentId: null,
      error: null
    });
  };

  // Reset state after match
  const resetMatch = () => {
    setState({
      isSearching: false,
      queuePosition: null,
      matchFound: false,
      sessionId: null,
      opponentId: null,
      error: null
    });
  };

  return {
    ...state,
    joinQueue,
    leaveQueue,
    resetMatch
  };
}
```

### Step 2.2: Create Matchmaking UI Component

**File: `src/components/Matchmaking.tsx`**

```typescript
import React, { useState } from 'react';
import { useMatchmaking } from '../hooks/useMatchmaking';

export function Matchmaking() {
  const [gameType, setGameType] = useState<string>('running');
  const [mode, setMode] = useState<string>('ranked');
  
  const {
    isSearching,
    queuePosition,
    matchFound,
    sessionId,
    opponentId,
    error,
    joinQueue,
    leaveQueue,
    resetMatch
  } = useMatchmaking();

  const handleStartSearch = () => {
    joinQueue(gameType, mode);
  };

  const handleCancelSearch = () => {
    leaveQueue(gameType, mode);
  };

  if (matchFound && sessionId) {
    return (
      <div className="matchmaking-found">
        <h2>Match Found! 🎮</h2>
        <p>Session ID: {sessionId}</p>
        <p>Opponent ID: {opponentId}</p>
        <button onClick={() => window.location.href = `/game/${sessionId}`}>
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="matchmaking">
      <h2>Find Match</h2>
      
      {error && <div className="error">{error}</div>}

      {!isSearching ? (
        <>
           <div>
             <label>Game Type:</label>
             <select value={gameType} onChange={(e) => setGameType(e.target.value)}>
               <option value="running">Running</option>
               <option value="jumping">Jumping</option>
               <option value="throwing">Throwing</option>
               <option value="balance">Balance</option>
               <option value="endurance">Endurance</option>
             </select>
             <small>Note: Only these game types are supported</small>
           </div>

           <div>
             <label>Mode:</label>
             <select value={mode} onChange={(e) => setMode(e.target.value)}>
               <option value="ranked">Ranked (1v1)</option>
               <option value="casual">Casual (1v1)</option>
             </select>
             <small>Note: 'ranked' and 'casual' both map to '1v1' mode</small>
           </div>

          <button onClick={handleStartSearch}>
            Find Match
          </button>
        </>
      ) : (
        <>
          <div className="searching">
            <p>🔍 Searching for opponent...</p>
            {queuePosition !== null && (
              <p>Position in queue: {queuePosition}</p>
            )}
            <div className="spinner"></div>
          </div>
          <button onClick={handleCancelSearch}>
            Cancel Search
          </button>
        </>
      )}
    </div>
  );
}
```

---

## 🎯 Phase 3: Game Session

### Step 3.1: Create Game Session Hook

**File: `src/hooks/useGameSession.ts`**

```typescript
import { useState, useEffect } from 'react';
import { websocketService } from '../services/websocket.service';

interface GameState {
  sessionId: string | null;
  players: Array<{ playerId: string; username: string; avatar: string }>;
  gameState: any;
  isReady: boolean;
  gameStarted: boolean;
  gameFinished: boolean;
}

export function useGameSession(sessionId: string | null) {
  const [gameState, setGameState] = useState<GameState>({
    sessionId: null,
    players: [],
    gameState: null,
    isReady: false,
    gameStarted: false,
    gameFinished: false
  });

  const socket = websocketService.getSocket();
  const playerId = localStorage.getItem('playerId');

  useEffect(() => {
    if (!socket || !sessionId) return;

    // Join game session
    socket.emit('game:join', {
      sessionId,
      playerId
    });

    // Listen for player joined
    socket.on('player:joined', (data: { playerId: string; socketId: string }) => {
      console.log('Player joined:', data);
      // Fetch session details from API
      fetchSessionDetails();
    });

    // Listen for game state updates
    socket.on('game:state', (data: { playerId: string; state: any; timestamp: number }) => {
      setGameState(prev => ({
        ...prev,
        gameState: data.state
      }));
    });

    // Listen for game finished
    socket.on('game:finished', (data: { sessionId: string; results: any }) => {
      setGameState(prev => ({
        ...prev,
        gameFinished: true
      }));
    });

    // Cleanup
    return () => {
      if (sessionId && playerId) {
        socket.emit('game:leave', { sessionId, playerId });
      }
      socket.off('player:joined');
      socket.off('game:state');
      socket.off('game:finished');
    };
  }, [socket, sessionId, playerId]);

  // Fetch session details from API
  const fetchSessionDetails = async () => {
    if (!sessionId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/game/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setGameState(prev => ({
          ...prev,
          sessionId: data.data._id,
          players: data.data.players,
          isReady: true
        }));
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  // Send game update
  const sendGameUpdate = (state: any) => {
    if (!socket || !sessionId || !playerId) return;

    socket.emit('game:update', {
      sessionId,
      playerId,
      state
    });
  };

  // Start game
  const startGame = () => {
    setGameState(prev => ({ ...prev, gameStarted: true }));
  };

  return {
    ...gameState,
    sendGameUpdate,
    startGame
  };
}
```

### Step 3.2: Create Game Component

**File: `src/components/Game.tsx`**

```typescript
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameSession } from '../hooks/useGameSession';

export function Game() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    players,
    gameState,
    isReady,
    gameStarted,
    gameFinished,
    sendGameUpdate,
    startGame
  } = useGameSession(sessionId || null);

  // Example: Send game update when user performs action
  const handleGameAction = (action: string) => {
    sendGameUpdate({
      action,
      timestamp: Date.now()
    });
  };

  if (!isReady) {
    return <div>Loading game session...</div>;
  }

  if (gameFinished) {
    return <div>Game Finished! Check results.</div>;
  }

  return (
    <div className="game">
      <h2>Game Session: {sessionId}</h2>
      
      <div className="players">
        {players.map((player, index) => (
          <div key={index} className="player">
            <img src={player.avatar} alt={player.username} />
            <p>{player.username}</p>
          </div>
        ))}
      </div>

      {!gameStarted ? (
        <button onClick={startGame}>Start Game</button>
      ) : (
        <div className="game-area">
          <p>Game State: {JSON.stringify(gameState)}</p>
          <button onClick={() => handleGameAction('jump')}>Jump</button>
          <button onClick={() => handleGameAction('run')}>Run</button>
        </div>
      )}
    </div>
  );
}
```

---

## 🏆 Phase 4: Game Results

### Step 4.1: Submit Game Result

**File: `src/services/game.service.ts`**

```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function submitGameResult(sessionId: string, result: {
  score: number;
  time: number;
  actions: any[];
}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/game/session/${sessionId}/result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      score: result.score,
      time: result.time,
      actions: result.actions
    })
  });

  const data = await response.json();
  return data;
}
```

### Step 4.2: Handle Game Finish

**Update Game Component:**

```typescript
import { submitGameResult } from '../services/game.service';

// In Game component
const handleGameFinish = async (finalScore: number, gameTime: number) => {
  if (!sessionId) return;

  try {
    const result = await submitGameResult(sessionId, {
      score: finalScore,
      time: gameTime,
      actions: [] // Your game actions
    });

    if (result.success) {
      // Navigate to results page
      window.location.href = `/results/${sessionId}`;
    }
  } catch (error) {
    console.error('Error submitting result:', error);
  }
};
```

---

## 📝 Complete Integration Checklist

### Phase 1: WebSocket Setup ✅
- [ ] Install `socket.io-client`
- [ ] Create `websocket.service.ts`
- [ ] Connect WebSocket after login
- [ ] Disconnect WebSocket on logout
- [ ] Test connection

### Phase 2: Matchmaking ✅
- [ ] Create `useMatchmaking` hook
- [ ] Create Matchmaking UI component
- [ ] Handle `matchmaking:queued` event
- [ ] Handle `matchmaking:found` event
- [ ] Test matchmaking flow

### Phase 3: Game Session ✅
- [ ] Create `useGameSession` hook
- [ ] Create Game component
- [ ] Handle `game:join` event
- [ ] Handle `game:state` updates
- [ ] Send game updates
- [ ] Test real-time updates

### Phase 4: Game Results ✅
- [ ] Create game result submission
- [ ] Handle `game:finished` event
- [ ] Display results
- [ ] Update leaderboard
- [ ] Test complete flow

---

## 🎯 Quick Start Example

### Complete Flow:

```typescript
// 1. Login (you already have this)
const login = async () => {
  const response = await fetch('/api/auth/login', {...});
  const data = await response.json();
  
  // 2. Connect WebSocket
  websocketService.connect(data.data.token);
};

// 3. Find Match
const { joinQueue } = useMatchmaking();
joinQueue('running', 'ranked');

// 4. When match found, navigate to game
// Matchmaking component handles this automatically

// 5. In Game component, use useGameSession hook
// It handles all game events automatically
```

---

## 🔧 Environment Variables

Make sure your `.env` has:

```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_WS_URL=http://localhost:5001
```

---

## 📚 API Endpoints You'll Need

1. **Get Session Details**: `GET /api/game/session/:id`
2. **Submit Result**: `POST /api/game/session/:id/result`
3. **Get Player Info**: `GET /api/player/:id` (for opponent info)

---

## ⚠️ Important Notes

1. **WebSocket Authentication**: Token-г `auth.token`-д дамжуулах (required)
2. **Session Management**: Session ID-г URL эсвэл state-д хадгалах
3. **Error Handling**: WebSocket disconnect-д handle хийх
4. **Reconnection**: Socket.IO auto-reconnect ашиглах
5. **Cleanup**: Component unmount-д event listeners устгах

---

**Дүгнэлт**: Энэ guide-ийг дагаж, matchmaking болон 2-player game functionality-г integrate хийх. Phase 1-ээс эхлээд дараалан хийх.

