import type { Game } from './espnClient';

export function matchSeries(schedule: Game[], opponentAbbrev: string): Game[] {
  const opponent = opponentAbbrev.toUpperCase();
  return schedule
    .filter((game) => {
      if (!game.isPostseason) return false;
      const homeAbbr = game.home.abbreviation.toUpperCase();
      const awayAbbr = game.away.abbreviation.toUpperCase();
      return homeAbbr === opponent || awayAbbr === opponent;
    })
    .slice()
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
