import mongoose, { Schema, Document } from 'mongoose';
import { MiniGameType } from './GameSession.model';

export interface IPlayerStats extends Document {
  playerId: mongoose.Types.ObjectId;
  gameType: MiniGameType;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerStatsSchema = new Schema<IPlayerStats>(
  {
    playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    gameType: { type: String, required: true },
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastPlayedAt: { type: Date }
  },
  { timestamps: true }
);

PlayerStatsSchema.index({ playerId: 1, gameType: 1 }, { unique: true });

export const PlayerStats = mongoose.model<IPlayerStats>('PlayerStats', PlayerStatsSchema);

