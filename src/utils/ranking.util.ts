export function calculateRank(points: number): number {
  if (points >= 10000) return 1;
  if (points >= 5000) return 2;
  if (points >= 2500) return 3;
  if (points >= 1000) return 4;
  if (points >= 500) return 5;
  return 6;
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

export function getRankName(rank: number): string {
  const ranks = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'];
  return ranks[rank - 1] || 'Unranked';
}

