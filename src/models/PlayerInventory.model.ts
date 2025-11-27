import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerInventory extends Document {
  playerId: mongoose.Types.ObjectId;
  items: Array<{
    itemId: string;
    itemType: 'avatar' | 'frame' | 'emote' | 'badge';
    quantity: number;
    acquiredAt: Date;
  }>;
  equipped: {
    avatar?: string;
    frame?: string;
    emote?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PlayerInventorySchema = new Schema<IPlayerInventory>(
  {
    playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true, unique: true },
    items: [{
      itemId: { type: String, required: true },
      itemType: { type: String, required: true, enum: ['avatar', 'frame', 'emote', 'badge'] },
      quantity: { type: Number, default: 1 },
      acquiredAt: { type: Date, default: Date.now }
    }],
    equipped: {
      avatar: { type: String },
      frame: { type: String },
      emote: { type: String }
    }
  },
  { timestamps: true }
);

export const PlayerInventory = mongoose.model<IPlayerInventory>('PlayerInventory', PlayerInventorySchema);

