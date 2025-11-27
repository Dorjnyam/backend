# Integration Checklist - Matchmaking & 2-Player Game

## ✅ Already Done (You Have)
- [x] Login API
- [x] Register API  
- [x] Leaderboard API

## 🎯 What You Need to Do (In Order)

### STEP 1: Install Dependencies (5 minutes)
```bash
npm install socket.io-client
```

---

### STEP 2: WebSocket Service (15 minutes)
**File**: `src/services/websocket.service.ts`

**What to do:**
1. Copy code from `MATCHMAKING_INTEGRATION_GUIDE.md` → Phase 1, Step 1.2
2. Update login function to connect WebSocket after login
3. Update logout function to disconnect WebSocket

**Test**: Check browser console for "✅ WebSocket connected"

---

### STEP 3: Matchmaking Hook (20 minutes)
**File**: `src/hooks/useMatchmaking.ts`

**What to do:**
1. Copy code from `MATCHMAKING_INTEGRATION_GUIDE.md` → Phase 2, Step 2.1
2. Create hook file

**Test**: Hook should export `joinQueue`, `leaveQueue`, `resetMatch`

---

### STEP 4: Matchmaking UI (30 minutes)
**File**: `src/components/Matchmaking.tsx`

**What to do:**
1. Copy code from `MATCHMAKING_INTEGRATION_GUIDE.md` → Phase 2, Step 2.2
2. Add to your app (create route or page)
3. Style it

**Test**: 
- Click "Find Match" → Should show "Searching..."
- Open 2 browsers → Should find match

---

### STEP 5: Game Session Hook (25 minutes)
**File**: `src/hooks/useGameSession.ts`

**What to do:**
1. Copy code from `MATCHMAKING_INTEGRATION_GUIDE.md` → Phase 3, Step 3.1
2. Create hook file

**Test**: Hook should handle session events

---

### STEP 6: Game Component (30 minutes)
**File**: `src/components/Game.tsx`

**What to do:**
1. Copy code from `MATCHMAKING_INTEGRATION_GUIDE.md` → Phase 3, Step 3.2
2. Create game route: `/game/:sessionId`
3. Add game logic (your game mechanics)

**Test**: 
- Navigate to game after match found
- Should see both players
- Should receive real-time updates

---

### STEP 7: Submit Results (15 minutes)
**File**: `src/services/game.service.ts`

**What to do:**
1. Copy code from `MATCHMAKING_INTEGRATION_GUIDE.md` → Phase 4, Step 4.1
2. Call `submitGameResult` when game ends

**Test**: Submit result → Check API response

---

## 📋 Quick Copy-Paste Checklist

### Files to Create:
1. [ ] `src/services/websocket.service.ts`
2. [ ] `src/hooks/useMatchmaking.ts`
3. [ ] `src/components/Matchmaking.tsx`
4. [ ] `src/hooks/useGameSession.ts`
5. [ ] `src/components/Game.tsx`
6. [ ] `src/services/game.service.ts`

### Files to Update:
1. [ ] Login function → Add WebSocket connect
2. [ ] Logout function → Add WebSocket disconnect
3. [ ] App routing → Add `/matchmaking` and `/game/:sessionId` routes

---

## 🚀 Testing Flow

### Test 1: WebSocket Connection
1. Login
2. Check console: "✅ WebSocket connected"
3. ✅ Pass

### Test 2: Matchmaking
1. Open 2 browsers (or 2 tabs in incognito)
2. Login both
3. Click "Find Match" on both
4. Should find match within seconds
5. ✅ Pass

### Test 3: Game Session
1. After match found, navigate to game
2. Should see both players
3. Send game update → Other player should receive
4. ✅ Pass

### Test 4: Game Results
1. Finish game
2. Submit result
3. Check leaderboard updated
4. ✅ Pass

---

## ⚡ Quick Start (Copy This)

### 1. After Login:
```typescript
import { websocketService } from './services/websocket.service';

// After successful login
websocketService.connect(data.data.token);
```

### 2. Matchmaking Page:
```typescript
import { Matchmaking } from './components/Matchmaking';

// In your router
<Route path="/matchmaking" element={<Matchmaking />} />
```

### 3. Game Page:
```typescript
import { Game } from './components/Game';

// In your router
<Route path="/game/:sessionId" element={<Game />} />
```

---

## 🐛 Common Issues

### Issue 1: WebSocket Not Connecting
**Solution**: Check token is passed in `auth.token`

### Issue 2: Match Not Found
**Solution**: 
- Open 2 browsers/tabs
- Both must be logged in
- Both must click "Find Match"

### Issue 3: Game Updates Not Received
**Solution**: 
- Check both players joined session
- Check `game:join` event sent
- Check `game:update` event received

---

## 📚 Full Documentation

See **[MATCHMAKING_INTEGRATION_GUIDE.md](./MATCHMAKING_INTEGRATION_GUIDE.md)** for complete code examples.

---

**Estimated Time**: 2-3 hours for complete integration

**Priority**: 
1. WebSocket Setup (REQUIRED)
2. Matchmaking (CORE FEATURE)
3. Game Session (CORE FEATURE)
4. Results (COMPLETE FLOW)

