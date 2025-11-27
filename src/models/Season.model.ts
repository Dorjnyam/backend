import mongoose, { Schema, Document } from 'mongoose';

export interface ISeason extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  rewards: {
    top1: { coins: number; xp: number };
    top10: { coins: number; xp: number };
    top100: { coins: number; xp: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

const SeasonSchema = new Schema<ISeason>(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    rewards: {
      top1: {
        coins: { type: Number, default: 1000 },
        xp: { type: Number, default: 5000 }
      },
      top10: {
        coins: { type: Number, default: 500 },
        xp: { type: Number, default: 2500 }
      },
      top100: {
        coins: { type: Number, default: 100 },
        xp: { type: Number, default: 1000 }
      }
    }
  },
  { timestamps: true }
);

export const Season = mongoose.model<ISeason>('Season', SeasonSchema);

