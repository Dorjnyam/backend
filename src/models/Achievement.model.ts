import mongoose, { Schema, Document } from 'mongoose';

export type AchievementType = 'games_played' | 'wins' | 'points' | 'streak' | 'special';

export interface IAchievement extends Document {
  name: string;
  description: string;
  type: AchievementType;
  requirement: {
    field: string;
    value: number;
  };
  reward: {
    coins: number;
    xp: number;
    badge?: string;
  };
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true, enum: ['games_played', 'wins', 'points', 'streak', 'special'] },
    requirement: {
      field: { type: String, required: true },
      value: { type: Number, required: true }
    },
    reward: {
      coins: { type: Number, default: 0 },
      xp: { type: Number, default: 0 },
      badge: { type: String }
    },
    icon: { type: String, required: true },
    rarity: { type: String, default: 'common', enum: ['common', 'rare', 'epic', 'legendary'] }
  },
  { timestamps: true }
);

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);

