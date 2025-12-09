export interface Player {
  id: string;
  name: string;
  position: string;
  pointsScored: number;
}

export interface Team {
  id: string;
  name: string;
  players: Player[]; // Liste des joueurs
  points: number; // League points (3 for 3-0/3-1, 2 for 3-2, 1 for 2-3, 0 for loss)
  matchesPlayed: number;
  setsWon: number;
  setsLost: number;
  pointsWon: number; // Small points within sets
  pointsLost: number;
}

export interface SetScore {
  teamA: number;
  teamB: number;
}

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  sets: SetScore[];
  currentSet: number; // 0-indexed (0 = 1st set)
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  winnerId?: string;
  round?: string;
}

export interface Tournament {
  id: string;
  name: string;
  createdAt: number;
  teams: Team[];
  matches: Match[];
}

export enum ViewState {
  TOURNAMENT_LIST = 'TOURNAMENT_LIST',
  DASHBOARD = 'DASHBOARD',
  RANKINGS = 'RANKINGS',
  MATCHES = 'MATCHES',
  SETUP = 'SETUP'
}