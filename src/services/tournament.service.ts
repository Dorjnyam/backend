import { Tournament, Player } from '../models';

export async function createTournament(data: {
  name: string;
  gameType: string;
  seasonId: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxParticipants: number;
}): Promise<any> {
  return await Tournament.create({
    ...data,
    status: 'upcoming',
    participants: [],
    bracket: undefined
  });
}

export async function registerForTournament(tournamentId: string, playerId: string): Promise<void> {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  if (tournament.participants.length >= tournament.maxParticipants) {
    throw new Error('Tournament is full');
  }

  if (tournament.participants.some(p => p.playerId.toString() === playerId)) {
    throw new Error('Already registered');
  }

  tournament.participants.push({
    playerId: playerId as any,
    registeredAt: new Date()
  });

  await tournament.save();
}

export async function generateBracket(tournamentId: string): Promise<void> {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  const participants = tournament.participants;
  const numRounds = Math.ceil(Math.log2(participants.length));
  const rounds: any[] = [];

  let currentRound = participants.map((p, i) => ({
    matchId: `match-${i}`,
    player1Id: p.playerId,
    status: 'pending' as const
  }));

  for (let round = 0; round < numRounds; round++) {
    rounds.push({
      roundNumber: round + 1,
      matches: currentRound
    });

    if (currentRound.length === 1) break;

    const nextRound: any[] = [];
    for (let i = 0; i < currentRound.length; i += 2) {
      nextRound.push({
        matchId: `match-${round + 1}-${i / 2}`,
        status: 'pending' as const
      });
    }
    currentRound = nextRound;
  }

  tournament.bracket = { rounds };
  tournament.status = 'active';
  await tournament.save();
}

