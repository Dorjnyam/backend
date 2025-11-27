import * as cron from 'node-cron';
import { Season } from '../models';

export function startSeasonJob() {
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Checking seasons...');
    try {
      const now = new Date();

      await Season.updateMany(
        {
          endDate: { $lt: now },
          isActive: true
        },
        { isActive: false }
      );

      await Season.updateOne(
        {
          startDate: { $lte: now },
          endDate: { $gte: now },
          isActive: false
        },
        { isActive: true }
      );

      console.log('✅ Seasons updated');
    } catch (error) {
      console.error('❌ Season update failed:', error);
    }
  });

  console.log('📅 Season job started (daily at midnight)');
}

