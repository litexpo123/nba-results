import type { Game } from './espnClient';

function teamLabel(side: Game['home']): string {
  return side.shortDisplayName || side.displayName;
}

export function buildYoutubeSearchUrl(game: Game, gameNumber: number): string {
  const away = teamLabel(game.away);
  const home = teamLabel(game.home);
  const year = new Date(game.startsAt).getUTCFullYear();
  const query = `${away} vs ${home} Game ${gameNumber} ${year} NBA Playoffs`;
  const params = new URLSearchParams({ search_query: query });
  return `https://www.youtube.com/results?${params.toString()}`;
}
