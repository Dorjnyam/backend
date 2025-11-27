import mongoose, { Schema, Document } from 'mongoose';

export type MiniGameType = 'running' | 'jumping' | 'throwing' | 'balance' | 'endurance';
export type GameMode = '1v1' | 'battle-royale' | 'tournament';
export type SessionStatus = 'waiting' | 'countdown' | 'active' | 'finished' | 'cancelled';

export interface IGameSession extends Document {
  gameType: MiniGameType;
  mode: GameMode;
  seasonId: mongoose.Types.ObjectId;
  players: Array<{
    playerId: mongoose.Types.ObjectId;
    username: string;
    avatar: string;
  }>;
  status: SessionStatus;
  startedAt?: Date;
  endedAt?: Date;
  winnerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GameSessionSchema = new Schema<IGameSession>(
  {
    gameType: { type: String, required: true, enum: ['running', 'jumping', 'throwing', 'balance', 'endurance'] },
    mode: { type: String, required: true, enum: ['1v1', 'battle-royale', 'tournament'] },
    seasonId: { type: Schema.Types.ObjectId, ref: 'Season', required: true },
    players: [{
      playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
      username: { type: String, required: true },
      avatar: { type: String, required: true }
    }],
    status: { type: String, default: 'waiting', enum: ['waiting', 'countdown', 'active', 'finished', 'cancelled'] },
    startedAt: { type: Date },
    endedAt: { type: Date },
    winnerId: { type: Schema.Types.ObjectId, ref: 'Player' }
  },
  { timestamps: true }
);

export const GameSession = mongoose.model<IGameSession>('GameSession', GameSessionSchema);

