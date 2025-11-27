import * as cron from 'node-cron';
import { DailyChallenge } from '../models';
import { getRandomChallenges } from '../config/challenge-pool';

export function startDailyChallengeJob() {
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Generating daily challenges...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const exists = await DailyChallenge.findOne({ date: today });
      if (exists) {
        console.log('✅ Daily challenges already exist');
        return;
      }

      const randomChallenges = getRandomChallenges(3);
      
      await DailyChallenge.create({
        date: today,
        challenges: randomChallenges
      });

      console.log(`✅ Daily challenges generated (${randomChallenges.length} challenges)`);
      console.log(`   - ${randomChallenges.map(c => c.title).join(', ')}`);
    } catch (error) {
      console.error('❌ Daily challenge generation failed:', error);
    }
  });

  console.log('🎯 Daily challenge job started (daily at midnight)');
}

