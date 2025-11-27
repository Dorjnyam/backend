import * as cron from 'node-cron';
import { updateLeaderboardRedis } from '../services/leaderboard-redis.service';
import { gameConfig } from '../config/game-config';

export function startLeaderboardJob() {
  const intervalMinutes = gameConfig.leaderboard.updateInterval;

  cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
    console.log('🔄 Updating leaderboard...');
    try {
      await updateLeaderboardRedis();
      console.log('✅ Leaderboard updated');
    } catch (error) {
      console.error('❌ Leaderboard update failed:', error);
    }
  });

  console.log(`📊 Leaderboard job started (every ${intervalMinutes} minutes)`);
}

