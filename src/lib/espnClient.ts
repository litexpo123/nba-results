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

type EspnAthleteEntry = {
  active?: boolean;
  starter?: boolean;
  didNotPlay?: boolean;
  athlete?: {
    id?: string | number;
    displayName?: string;
    shortName?: string;
    headshot?: { href?: string } | string;
  };
  stats?: string[];
};

type EspnPlayerStatBlock = {
  names?: string[];
  keys?: string[];
  labels?: string[];
  athletes?: EspnAthleteEntry[];
};

type EspnPlayersGroup = {
  team?: {
    id?: string;
    abbreviation?: string;
    displayName?: string;
  };
  statistics?: EspnPlayerStatBlock[];
};

type EspnSummaryCompetitor = {
  id?: string;
  homeAway?: 'home' | 'away';
  score?: string;
  linescores?: Array<{ value?: number }>;
  team?: {
    id?: string;
    abbreviation?: string;
    displayName?: string;
  };
};

type EspnSummaryResponse = {
  header?: {
    id?: string;
    competitions?: Array<{
      competitors?: EspnSummaryCompetitor[];
    }>;
  };
  boxscore?: {
    players?: EspnPlayersGroup[];
  };
};

const STAT_ALIASES: Record<keyof StatIndex, string[]> = {
  minutes: ['MIN'],
  points: ['PTS'],
  rebounds: ['REB'],
  assists: ['AST'],
  fieldGoals: ['FG'],
  threePointers: ['3PT', '3P'],
  freeThrows: ['FT'],
  plusMinus: ['+/-', '+/−'],
};

type StatIndex = {
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  fieldGoals: number;
  threePointers: number;
  freeThrows: number;
  plusMinus: number;
};

function buildStatIndex(headers: string[] | undefined): StatIndex {
  const labels = (headers ?? []).map((label) => label.toUpperCase());
  const find = (aliases: string[]): number => {
    for (const alias of aliases) {
      const i = labels.indexOf(alias.toUpperCase());
      if (i >= 0) return i;
    }
    return -1;
  };
  return {
    minutes: find(STAT_ALIASES.minutes),
    points: find(STAT_ALIASES.points),
    rebounds: find(STAT_ALIASES.rebounds),
    assists: find(STAT_ALIASES.assists),
    fieldGoals: find(STAT_ALIASES.fieldGoals),
    threePointers: find(STAT_ALIASES.threePointers),
    freeThrows: find(STAT_ALIASES.freeThrows),
    plusMinus: find(STAT_ALIASES.plusMinus),
  };
}

function statAt(stats: string[] | undefined, index: number, fallback = ''): string {
  if (!stats || index < 0 || index >= stats.length) return fallback;
  return stats[index] ?? fallback;
}

function toIntOr(value: string, fallback: number): number {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableInt(value: string): number | null {
  if (value === '' || value === '-' || value === '--') return null;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractHeadshot(athlete: EspnAthleteEntry['athlete']): string | null {
  if (!athlete) return null;
  const h = athlete.headshot;
  if (!h) return null;
  if (typeof h === 'string') return h || null;
  return h.href ?? null;
}

function mapPlayers(group: EspnPlayersGroup): PlayerStatLine[] {
  const block = group.statistics?.[0];
  if (!block) return [];
  const headers = block.names ?? block.labels ?? [];
  const index = buildStatIndex(headers);
  const players: PlayerStatLine[] = [];
  for (const entry of block.athletes ?? []) {
    if (entry.didNotPlay === true) continue;
    const athlete = entry.athlete;
    if (!athlete) continue;
    const stats = entry.stats;
    players.push({
      playerId: String(athlete.id ?? ''),
      name: athlete.displayName ?? athlete.shortName ?? '',
      headshot: extractHeadshot(athlete),
      minutes: statAt(stats, index.minutes, '0'),
      points: toIntOr(statAt(stats, index.points, '0'), 0),
      rebounds: toIntOr(statAt(stats, index.rebounds, '0'), 0),
      assists: toIntOr(statAt(stats, index.assists, '0'), 0),
      fieldGoals: statAt(stats, index.fieldGoals, '0-0'),
      threePointers: statAt(stats, index.threePointers, '0-0'),
      freeThrows: statAt(stats, index.freeThrows, '0-0'),
      plusMinus: toNullableInt(statAt(stats, index.plusMinus, '')),
    });
  }
  return players;
}

function findCompetitor(
  competitors: EspnSummaryCompetitor[] | undefined,
  abbreviation: string,
): EspnSummaryCompetitor | undefined {
  const target = abbreviation.toUpperCase();
  return competitors?.find((c) => (c.team?.abbreviation ?? '').toUpperCase() === target);
}

function mapTeamBoxScore(
  group: EspnPlayersGroup,
  competitor: EspnSummaryCompetitor | undefined,
): TeamBoxScore {
  const abbreviation = group.team?.abbreviation ?? competitor?.team?.abbreviation ?? '';
  const displayName = group.team?.displayName ?? competitor?.team?.displayName ?? abbreviation;
  const players = mapPlayers(group);
  const linePeriods = (competitor?.linescores ?? [])
    .map((p) => p.value)
    .filter((v): v is number => typeof v === 'number');
  const total =
    competitor?.score !== undefined && competitor.score !== ''
      ? toIntOr(competitor.score, 0)
      : linePeriods.reduce((sum, v) => sum + v, 0);
  return { abbreviation, displayName, players, linePeriods, total };
}

function pickTopScorer(teams: [TeamBoxScore, TeamBoxScore]): BoxScore['topScorer'] {
  let best: { player: PlayerStatLine; teamAbbreviation: string } | null = null;
  for (const team of teams) {
    for (const player of team.players) {
      if (!best || player.points > best.player.points) {
        best = { player, teamAbbreviation: team.abbreviation };
      }
    }
  }
  if (!best) {
    return { name: '', teamAbbreviation: '', headshot: null, statLine: '' };
  }
  const { player, teamAbbreviation } = best;
  const statLine = `${player.points} PTS · ${player.rebounds} REB · ${player.assists} AST`;
  return {
    name: player.name,
    teamAbbreviation,
    headshot: player.headshot,
    statLine,
  };
}

export async function getGameSummary(gameId: string): Promise<BoxScore> {
  const url = `${BASE_URL}/summary?event=${encodeURIComponent(gameId)}`;
  const data = await fetchJson<EspnSummaryResponse>(url);
  const playerGroups = data.boxscore?.players ?? [];
  if (playerGroups.length < 2) {
    throw new Error('ESPN summary missing player data for both teams');
  }
  const competitors = data.header?.competitions?.[0]?.competitors;
  const teamA = mapTeamBoxScore(
    playerGroups[0],
    findCompetitor(competitors, playerGroups[0].team?.abbreviation ?? ''),
  );
  const teamB = mapTeamBoxScore(
    playerGroups[1],
    findCompetitor(competitors, playerGroups[1].team?.abbreviation ?? ''),
  );
  const teams: [TeamBoxScore, TeamBoxScore] = [teamA, teamB];
  return {
    gameId: data.header?.id ?? gameId,
    teams,
    topScorer: pickTopScorer(teams),
  };
}
