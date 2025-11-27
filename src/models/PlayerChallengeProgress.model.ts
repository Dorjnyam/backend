import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerChallengeProgress extends Document {
  playerId: mongoose.Types.ObjectId;
  challengeId: string;
  date: Date;
  progress: number;
  completed: boolean;
  claimed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerChallengeProgressSchema = new Schema<IPlayerChallengeProgress>(
  {
    playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    challengeId: { type: String, required: true },
    date: { type: Date, required: true },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

PlayerChallengeProgressSchema.index({ playerId: 1, challengeId: 1, date: 1 }, { unique: true });

export const PlayerChallengeProgress = mongoose.model<IPlayerChallengeProgress>('PlayerChallengeProgress', PlayerChallengeProgressSchema);

