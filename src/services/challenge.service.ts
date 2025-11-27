import { DailyChallenge, PlayerChallengeProgress, Player } from '../models';
import { getRandomChallenges } from '../config/challenge-pool';

export async function getDailyChallenges(): Promise<any> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let challenges = await DailyChallenge.findOne({ date: today });

  if (!challenges) {
    const randomChallenges = getRandomChallenges(3);
    
    challenges = await DailyChallenge.create({
      date: today,
      challenges: randomChallenges
    });
  }

  return challenges;
}

export async function getPlayerChallengeProgress(playerId: string): Promise<any[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenges = await getDailyChallenges();
  const progress = await PlayerChallengeProgress.find({
    playerId,
    date: today
  });

  return challenges.challenges.map((challenge: any) => {
    const playerProgress = progress.find(p => p.challengeId === challenge.challengeId);
    return {
      ...challenge,
      progress: playerProgress?.progress || 0,
      completed: playerProgress?.completed || false,
      claimed: playerProgress?.claimed || false
    };
  });
}

export async function updateChallengeProgress(
  playerId: string,
  challengeId: string,
  increment: number = 1
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const progress = await PlayerChallengeProgress.findOneAndUpdate(
    { playerId, challengeId, date: today },
    { $inc: { progress: increment } },
    { upsert: true, new: true }
  );

  const challenges = await getDailyChallenges();
  const challenge = challenges.challenges.find((c: any) => c.challengeId === challengeId);

  if (challenge && progress.progress >= challenge.requirement.value && !progress.completed) {
    progress.completed = true;
    progress.completedAt = new Date();
    await progress.save();
  }
}

export async function claimChallengeReward(playerId: string, challengeId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const progress = await PlayerChallengeProgress.findOne({
    playerId,
    challengeId,
    date: today
  });

  if (!progress || !progress.completed || progress.claimed) {
    throw new Error('Cannot claim reward');
  }

  const challenges = await getDailyChallenges();
  const challenge = challenges.challenges.find((c: any) => c.challengeId === challengeId);

  if (challenge) {
    await Player.findByIdAndUpdate(playerId, {
      $inc: {
        coins: challenge.reward.coins,
        xp: challenge.reward.xp
      }
    });

    progress.claimed = true;
    await progress.save();
  }
}

