# Matchmaking Validation Fix

## 🐛 Error Fixed

**Error**: `ValidationError: GameSession validation failed`

### Issues Found:
1. ❌ `gameType: 'cargo-push'` - Not a valid enum value
2. ❌ `mode: 'ranked'` - Not a valid enum value  
3. ❌ `players.0.avatar` - Empty string (required field)
4. ❌ `players.1.avatar` - Empty string (required field)

---

## ✅ Fixes Applied

### 1. GameType Validation
**Valid values**: `'running' | 'jumping' | 'throwing' | 'balance' | 'endurance'`

**Fix**: Backend now validates and defaults to `'running'` if invalid.

### 2. Mode Validation & Mapping
**Valid values**: `'1v1' | 'battle-royale' | 'tournament'`

**Fix**: 
- `'ranked'` → maps to `'1v1'`
- `'casual'` → maps to `'1v1'`
- Invalid values → defaults to `'1v1'`

### 3. Avatar Fallback
**Fix**: If player avatar is empty, uses default placeholder:
```typescript
const avatar = player.avatar?.imageUrl || 'https://via.placeholder.com/150';
```

---

## 📝 Frontend Requirements

### Valid Game Types (Use These):
```typescript
type GameType = 'running' | 'jumping' | 'throwing' | 'balance' | 'endurance';
```

### Valid Modes (Frontend can use):
```typescript
// Frontend can send:
type FrontendMode = 'ranked' | 'casual';

// Backend maps to:
type BackendMode = '1v1' | 'battle-royale' | 'tournament';
```

### Example:
```typescript
// Frontend
socket.emit('matchmaking:join', {
  playerId: '...',
  gameType: 'running',  // ✅ Valid
  mode: 'ranked'        // ✅ Will map to '1v1'
});

// Backend automatically:
// - Validates gameType
// - Maps 'ranked'/'casual' → '1v1'
// - Provides default avatar if missing
```

---

## ⚠️ Important Notes

1. **GameType**: Only use the 5 valid types listed above
2. **Mode**: Use 'ranked' or 'casual' (both work, map to '1v1')
3. **Avatar**: Backend handles empty avatars automatically
4. **Validation**: Backend validates and provides defaults for invalid values

---

## 🧪 Testing

After fix, test with:
```typescript
// Valid request
socket.emit('matchmaking:join', {
  playerId: '...',
  gameType: 'running',
  mode: 'ranked'
});

// Invalid gameType (will default to 'running')
socket.emit('matchmaking:join', {
  playerId: '...',
  gameType: 'cargo-push',  // ❌ Invalid, defaults to 'running'
  mode: 'ranked'
});
```

---

**Дүгнэлт**: Backend одоо validation хийж, invalid values-д default өгч байна. Frontend-д зөвхөн valid game types ашиглах.

