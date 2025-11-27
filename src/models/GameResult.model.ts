import mongoose, { Schema, Document } from 'mongoose';
import { MiniGameType } from './GameSession.model';

export interface IGameResult extends Document {
  sessionId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  gameType: MiniGameType;
  score: number;
  rank: number;
  pointsEarned: number;
  xpEarned: number;
  stats: {
    accuracy?: number;
    speed?: number;
    distance?: number;
    time?: number;
    [key: string]: any;
  };
  rewards: {
    coins: number;
    seasonPassXp: number;
  };
  createdAt: Date;
}

const GameResultSchema = new Schema<IGameResult>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'GameSession', required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    gameType: { type: String, required: true },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
    pointsEarned: { type: Number, required: true },
    xpEarned: { type: Number, required: true },
    stats: { type: Schema.Types.Mixed, default: {} },
    rewards: {
      coins: { type: Number, default: 0 },
      seasonPassXp: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

GameResultSchema.index({ playerId: 1, createdAt: -1 });
GameResultSchema.index({ sessionId: 1 });

export const GameResult = mongoose.model<IGameResult>('GameResult', GameResultSchema);

