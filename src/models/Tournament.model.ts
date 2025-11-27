import mongoose, { Schema, Document } from 'mongoose';
import { MiniGameType } from './GameSession.model';

export type TournamentStatus = 'upcoming' | 'registration' | 'active' | 'finished' | 'cancelled';

export interface ITournament extends Document {
  name: string;
  gameType: MiniGameType;
  seasonId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxParticipants: number;
  status: TournamentStatus;
  participants: Array<{
    playerId: mongoose.Types.ObjectId;
    registeredAt: Date;
  }>;
  bracket?: {
    rounds: Array<{
      roundNumber: number;
      matches: Array<{
        matchId: string;
        player1Id?: mongoose.Types.ObjectId;
        player2Id?: mongoose.Types.ObjectId;
        winnerId?: mongoose.Types.ObjectId;
        status: 'pending' | 'completed';
      }>;
    }>;
  };
  rewards: {
    first: { coins: number; xp: number };
    second: { coins: number; xp: number };
    third: { coins: number; xp: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true },
    gameType: { type: String, required: true },
    seasonId: { type: Schema.Types.ObjectId, ref: 'Season', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    maxParticipants: { type: Number, default: 16 },
    status: { type: String, default: 'upcoming', enum: ['upcoming', 'registration', 'active', 'finished', 'cancelled'] },
    participants: [{
      playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
      registeredAt: { type: Date, default: Date.now }
    }],
    bracket: { type: Schema.Types.Mixed },
    rewards: {
      first: {
        coins: { type: Number, default: 5000 },
        xp: { type: Number, default: 10000 }
      },
      second: {
        coins: { type: Number, default: 3000 },
        xp: { type: Number, default: 6000 }
      },
      third: {
        coins: { type: Number, default: 1000 },
        xp: { type: Number, default: 3000 }
      }
    }
  },
  { timestamps: true }
);

export const Tournament = mongoose.model<ITournament>('Tournament', TournamentSchema);

