import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  username: string;
  email: string;
  passwordHash: string;
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
  draws: number;
  coins: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatar: {
      imageUrl: { type: String, default: '' },
      frameId: { type: String }
    },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);

