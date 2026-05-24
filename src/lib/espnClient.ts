export type TeamSide = {
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  logo: string | null;
  score: number | null;
  isWinner: boolean;
};

export type GameStatus = {
  state: 'pre' | 'in' | 'post';
  name: string;
  detail: string | null;
};

export type Game = {
  id: string;
  startsAt: string;
  isPostseason: boolean;
  status: GameStatus;
  home: TeamSide;
  away: TeamSide;
};

export type PlayerStatLine = {
  playerId: string;
  name: string;
  headshot: string | null;
  minutes: string;
  points: number;
  rebounds: number;
  assists: number;
  fieldGoals: string;
  threePointers: string;
  freeThrows: string;
  plusMinus: number | null;
};

export type TeamBoxScore = {
  abbreviation: string;
  displayName: string;
  players: PlayerStatLine[];
  linePeriods: number[];
  total: number;
};

export type BoxScore = {
  gameId: string;
  teams: [TeamBoxScore, TeamBoxScore];
  topScorer: {
    name: string;
    teamAbbreviation: string;
    headshot: string | null;
    statLine: string;
  };
};

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

type EspnCompetitor = {
  id: string;
  homeAway: 'home' | 'away';
  winner?: boolean;
  score?: string;
  team: {
    abbreviation?: string;
    displayName?: string;
    shortDisplayName?: string;
    logo?: string;
    logos?: { href: string }[];
  };
};

type EspnEvent = {
  id: string;
  date: string;
  seasonType?: { id?: string; name?: string; slug?: string };
  competitions: Array<{
    competitors: EspnCompetitor[];
    status: {
      type: {
        state: string;
        name: string;
        detail?: string;
        shortDetail?: string;
      };
    };
  }>;
};

type EspnScheduleResponse = {
  events?: EspnEvent[];
};

function mapCompetitor(competitor: EspnCompetitor): TeamSide {
  const scoreRaw = competitor.score;
  const parsedScore = scoreRaw !== undefined && scoreRaw !== '' ? Number(scoreRaw) : NaN;
  const logoFromLogos = competitor.team.logos?.[0]?.href ?? null;
  return {
    abbreviation: competitor.team.abbreviation ?? '',
    displayName: competitor.team.displayName ?? '',
    shortDisplayName: competitor.team.shortDisplayName ?? competitor.team.displayName ?? '',
    logo: competitor.team.logo ?? logoFromLogos,
    score: Number.isFinite(parsedScore) ? parsedScore : null,
    isWinner: competitor.winner === true,
  };
}

function normalizeState(raw: string): GameStatus['state'] {
  if (raw === 'post' || raw === 'in' || raw === 'pre') return raw;
  return 'pre';
}

function isPostseason(event: EspnEvent): boolean {
  const seasonType = event.seasonType;
  if (!seasonType) return false;
  if (seasonType.id === '3') return true;
  if (seasonType.slug === 'post-season') return true;
  if (typeof seasonType.name === 'string' && seasonType.name.toLowerCase().includes('post')) {
    return true;
  }
  return false;
}

function mapEvent(event: EspnEvent): Game | null {
  const competition = event.competitions?.[0];
  if (!competition) return null;
  const home = competition.competitors.find((c) => c.homeAway === 'home');
  const away = competition.competitors.find((c) => c.homeAway === 'away');
  if (!home || !away) return null;

  const statusType = competition.status.type;
  return {
    id: event.id,
    startsAt: event.date,
    isPostseason: isPostseason(event),
    status: {
      state: normalizeState(statusType.state),
      name: statusType.name,
      detail: statusType.shortDetail ?? statusType.detail ?? null,
    },
    home: mapCompetitor(home),
    away: mapCompetitor(away),
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export async function getTeamSchedule(teamAbbrev: string): Promise<Game[]> {
  const url = `${BASE_URL}/teams/${teamAbbrev.toLowerCase()}/schedule`;
  const data = await fetchJson<EspnScheduleResponse>(url);
  const events = data.events ?? [];
  const games: Game[] = [];
  for (const event of events) {
    const mapped = mapEvent(event);
    if (mapped) games.push(mapped);
  }
  return games;
}

export async function getGameSummary(_gameId: string): Promise<BoxScore> {
  throw new Error('getGameSummary is not implemented in the tracer slice — see issue #2');
}
