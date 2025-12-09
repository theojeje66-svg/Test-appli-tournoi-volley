export type Player = {
  id: string;
  name: string;
  position: string;
  pointsScored: number;
};

export type Team = {
  id: string;
  name: string;
  players: Player[];
  points: number;
  matchesPlayed: number;
  setsWon: number;
  setsLost: number;
  pointsWon: number;
  pointsLost: number;
};

export type SetScore = { teamA: number; teamB: number };

export type Match = {
  id: string;
  teamAId: string;
  teamBId: string;
  teamAName?: string;
  teamBName?: string;
  sets: SetScore[];
  currentSet: number;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  round?: string;
  winnerId?: string;
};

export type Tournament = {
  id: string;
  name: string;
  createdAt: number;
  teams: Team[];
  matches: Match[];
};

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  RANKINGS = 'RANKINGS',
  MATCHES = 'MATCHES',
  SETUP = 'SETUP'
}