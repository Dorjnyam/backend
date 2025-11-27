import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { CHALLENGE_POOL } from '../config/challenge-pool';

dotenv.config();

async function seedChallenges() {
  try {
    await connectDatabase();
    
    console.log('📝 Challenge pool loaded:');
    console.log(`   Total challenges: ${CHALLENGE_POOL.length}`);
    console.log(`   Easy: ${CHALLENGE_POOL.filter(c => c.difficulty === 'easy').length}`);
    console.log(`   Medium: ${CHALLENGE_POOL.filter(c => c.difficulty === 'medium').length}`);
    console.log(`   Hard: ${CHALLENGE_POOL.filter(c => c.difficulty === 'hard').length}`);
    
    console.log('\n📋 Available challenges:');
    CHALLENGE_POOL.forEach((challenge, index) => {
      console.log(`   ${index + 1}. [${challenge.difficulty.toUpperCase()}] ${challenge.title} - ${challenge.reward.coins} coins, ${challenge.reward.xp} XP`);
    });
    
    console.log('\n✅ Challenge pool ready!');
    console.log('💡 Daily challenges will be randomly selected from this pool.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedChallenges();

