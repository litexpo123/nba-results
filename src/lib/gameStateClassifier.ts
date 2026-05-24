import type { Game } from './espnClient';

export type GameState = 'final' | 'scheduled' | 'in-progress';

export function classifyGame(game: Game): GameState {
  const state = game.status.state;
  if (state === 'post') return 'final';
  if (state === 'in') return 'in-progress';
  return 'scheduled';
}
