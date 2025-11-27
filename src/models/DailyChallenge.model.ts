import mongoose, { Schema, Document } from 'mongoose';
import { MiniGameType } from './GameSession.model';

export type ChallengeType = 'play_games' | 'win_games' | 'score_points' | 'streak' | 'special';

export interface IDailyChallenge extends Document {
  date: Date;
  challenges: Array<{
    challengeId: string;
    type: ChallengeType;
    gameType?: MiniGameType;
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
  }>;
  createdAt: Date;
}

const DailyChallengeSchema = new Schema<IDailyChallenge>(
  {
    date: { type: Date, required: true, unique: true },
    challenges: [{
      challengeId: { type: String, required: true },
      type: { type: String, required: true, enum: ['play_games', 'win_games', 'score_points', 'streak', 'special'] },
      gameType: { type: String },
      title: { type: String, required: true },
      description: { type: String, required: true },
      requirement: {
        field: { type: String, required: true },
        value: { type: Number, required: true }
      },
      reward: {
        coins: { type: Number, default: 0 },
        xp: { type: Number, default: 0 }
      },
      difficulty: { type: String, default: 'easy', enum: ['easy', 'medium', 'hard'] }
    }]
  },
  { timestamps: true }
);

export const DailyChallenge = mongoose.model<IDailyChallenge>('DailyChallenge', DailyChallengeSchema);

