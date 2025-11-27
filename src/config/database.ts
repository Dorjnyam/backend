import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/physical-game');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

