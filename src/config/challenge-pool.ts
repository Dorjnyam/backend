import { MiniGameType } from '../models/GameSession.model';
import { ChallengeType } from '../models/DailyChallenge.model';

export interface ChallengeTemplate {
  challengeId: string;
  type: ChallengeType;
  gameType?: MiniGameType;
  title: string;
  description: string;
  requirement: {
    field: string;
    value: number;
  };
  reward: {
    coins: number;
    xp: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export const CHALLENGE_POOL: ChallengeTemplate[] = [
  // Easy Challenges
  {
    challengeId: 'play-3-games',
    type: 'play_games',
    title: '3 Тоглоом Тогло',
    description: 'Өнөөдөр 3 тоглоом тогло',
    requirement: { field: 'gamesPlayed', value: 3 },
    reward: { coins: 50, xp: 100 },
    difficulty: 'easy'
  },
  {
    challengeId: 'play-5-games',
    type: 'play_games',
    title: '5 Тоглоом Тогло',
    description: 'Өнөөдөр 5 тоглоом тогло',
    requirement: { field: 'gamesPlayed', value: 5 },
    reward: { coins: 80, xp: 150 },
    difficulty: 'easy'
  },
  {
    challengeId: 'win-1-game',
    type: 'win_games',
    title: '1 Хожло',
    description: 'Өнөөдөр дор хаяж 1 удаа хожло',
    requirement: { field: 'wins', value: 1 },
    reward: { coins: 100, xp: 200 },
    difficulty: 'easy'
  },
  {
    challengeId: 'score-200-points',
    type: 'score_points',
    title: '200 Оноо Цуглуулаа',
    description: 'Өнөөдөр 200 оноо цуглуулаа',
    requirement: { field: 'points', value: 200 },
    reward: { coins: 60, xp: 120 },
    difficulty: 'easy'
  },

  // Medium Challenges
  {
    challengeId: 'win-3-games',
    type: 'win_games',
    title: '3 Хожло',
    description: 'Өнөөдөр 3 удаа хожло',
    requirement: { field: 'wins', value: 3 },
    reward: { coins: 200, xp: 400 },
    difficulty: 'medium'
  },
  {
    challengeId: 'score-500-points',
    type: 'score_points',
    title: '500 Оноо Цуглуулаа',
    description: 'Өнөөдөр 500 оноо цуглуулаа',
    requirement: { field: 'points', value: 500 },
    reward: { coins: 150, xp: 300 },
    difficulty: 'medium'
  },
  {
    challengeId: 'play-10-games',
    type: 'play_games',
    title: '10 Тоглоом Тогло',
    description: 'Өнөөдөр 10 тоглоом тогло',
    requirement: { field: 'gamesPlayed', value: 10 },
    reward: { coins: 180, xp: 350 },
    difficulty: 'medium'
  },
  {
    challengeId: 'win-streak-2',
    type: 'streak',
    title: '2 Давааны Хожил',
    description: 'Дараалсан 2 хожил',
    requirement: { field: 'winStreak', value: 2 },
    reward: { coins: 120, xp: 250 },
    difficulty: 'medium'
  },
  {
    challengeId: 'running-3-wins',
    type: 'win_games',
    gameType: 'running',
    title: 'Гүйлтийн 3 Хожил',
    description: 'Гүйлтийн тоглоомд 3 удаа хожло',
    requirement: { field: 'wins', value: 3 },
    reward: { coins: 180, xp: 350 },
    difficulty: 'medium'
  },
  {
    challengeId: 'jumping-2-wins',
    type: 'win_games',
    gameType: 'jumping',
    title: 'Үсрэлтийн 2 Хожил',
    description: 'Үсрэлтийн тоглоомд 2 удаа хожло',
    requirement: { field: 'wins', value: 2 },
    reward: { coins: 150, xp: 300 },
    difficulty: 'medium'
  },

  // Hard Challenges
  {
    challengeId: 'win-5-games',
    type: 'win_games',
    title: '5 Хожло',
    description: 'Өнөөдөр 5 удаа хожло',
    requirement: { field: 'wins', value: 5 },
    reward: { coins: 300, xp: 600 },
    difficulty: 'hard'
  },
  {
    challengeId: 'score-1000-points',
    type: 'score_points',
    title: '1000 Оноо Цуглуулаа',
    description: 'Өнөөдөр 1000 оноо цуглуулаа',
    requirement: { field: 'points', value: 1000 },
    reward: { coins: 250, xp: 500 },
    difficulty: 'hard'
  },
  {
    challengeId: 'win-streak-3',
    type: 'streak',
    title: '3 Давааны Хожил',
    description: 'Дараалсан 3 хожил',
    requirement: { field: 'winStreak', value: 3 },
    reward: { coins: 200, xp: 400 },
    difficulty: 'hard'
  },
  {
    challengeId: 'play-15-games',
    type: 'play_games',
    title: '15 Тоглоом Тогло',
    description: 'Өнөөдөр 15 тоглоом тогло',
    requirement: { field: 'gamesPlayed', value: 15 },
    reward: { coins: 220, xp: 450 },
    difficulty: 'hard'
  },
  {
    challengeId: 'throwing-5-wins',
    type: 'win_games',
    gameType: 'throwing',
    title: 'Шидэлтийн 5 Хожил',
    description: 'Шидэлтийн тоглоомд 5 удаа хожло',
    requirement: { field: 'wins', value: 5 },
    reward: { coins: 280, xp: 550 },
    difficulty: 'hard'
  },
  {
    challengeId: 'balance-3-wins',
    type: 'win_games',
    gameType: 'balance',
    title: 'Тэнцвэрийн 3 Хожил',
    description: 'Тэнцвэрийн тоглоомд 3 удаа хожло',
    requirement: { field: 'wins', value: 3 },
    reward: { coins: 200, xp: 400 },
    difficulty: 'hard'
  },
  {
    challengeId: 'endurance-2-wins',
    type: 'win_games',
    gameType: 'endurance',
    title: 'Тэсвэрийн 2 Хожил',
    description: 'Тэсвэрийн тоглоомд 2 удаа хожло',
    requirement: { field: 'wins', value: 2 },
    reward: { coins: 180, xp: 350 },
    difficulty: 'hard'
  },

  // Special Challenges
  {
    challengeId: 'perfect-score',
    type: 'special',
    title: 'Төгс Оноо',
    description: 'Нэг тоглоомд 1000+ оноо ав',
    requirement: { field: 'maxScore', value: 1000 },
    reward: { coins: 500, xp: 1000 },
    difficulty: 'hard'
  },
  {
    challengeId: 'all-games-played',
    type: 'special',
    title: 'Бүх Төрлийн Тоглоом',
    description: 'Бүх 5 төрлийн тоглоомд тогло',
    requirement: { field: 'gameTypesPlayed', value: 5 },
    reward: { coins: 400, xp: 800 },
    difficulty: 'hard'
  }
];

export function getRandomChallenges(count: number = 3): ChallengeTemplate[] {
  const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5);
  
  const easy = shuffled.filter(c => c.difficulty === 'easy');
  const medium = shuffled.filter(c => c.difficulty === 'medium');
  const hard = shuffled.filter(c => c.difficulty === 'hard');
  
  const selected: ChallengeTemplate[] = [];
  
  if (count >= 1 && easy.length > 0) {
    selected.push(easy[Math.floor(Math.random() * easy.length)]);
  }
  if (count >= 2 && medium.length > 0) {
    selected.push(medium[Math.floor(Math.random() * medium.length)]);
  }
  if (count >= 3 && hard.length > 0) {
    selected.push(hard[Math.floor(Math.random() * hard.length)]);
  }
  
  while (selected.length < count && shuffled.length > 0) {
    const random = shuffled[Math.floor(Math.random() * shuffled.length)];
    if (!selected.find(c => c.challengeId === random.challengeId)) {
      selected.push(random);
    }
  }
  
  return selected.slice(0, count);
}

