import { describe, it, expect } from 'vitest';
import type { Game, GameStatus } from './espnClient';
import { classifyGame } from './gameStateClassifier';

function makeGame(status: GameStatus): Game {
  return {
    id: 'g',
    startsAt: '2026-05-20T00:00:00Z',
    isPostseason: true,
    status,
    home: {
      abbreviation: 'OKC',
      displayName: 'OKC',
      shortDisplayName: 'OKC',
      logo: null,
      score: null,
      isWinner: false,
    },
    away: {
      abbreviation: 'SAS',
      displayName: 'SAS',
      shortDisplayName: 'SAS',
      logo: null,
      score: null,
      isWinner: false,
    },
  };
}

describe('classifyGame', () => {
  it("maps state 'post' to 'final'", () => {
    expect(
      classifyGame(makeGame({ state: 'post', name: 'STATUS_FINAL', detail: 'Final' })),
    ).toBe('final');
  });

  it("maps state 'in' to 'in-progress'", () => {
    expect(
      classifyGame(makeGame({ state: 'in', name: 'STATUS_IN_PROGRESS', detail: 'Q3 04:12' })),
    ).toBe('in-progress');
  });

  it("maps state 'pre' to 'scheduled'", () => {
    expect(
      classifyGame(
        makeGame({ state: 'pre', name: 'STATUS_SCHEDULED', detail: 'Tue, 8:00 PM ET' }),
      ),
    ).toBe('scheduled');
  });

  // Postponed games are normalized to 'pre' by espnClient (any non pre/in/post
  // state collapses to 'pre'); the classifier then sees them as 'scheduled'.
  // This test pins that mapping by passing the normalized state directly.
  it("classifies postponed games as 'scheduled' (via 'pre' normalization upstream)", () => {
    expect(
      classifyGame(
        makeGame({ state: 'pre', name: 'STATUS_POSTPONED', detail: 'Postponed' }),
      ),
    ).toBe('scheduled');
  });

  it("falls back to 'scheduled' for unrecognized states", () => {
    expect(
      classifyGame(
        makeGame({
          state: 'unknown' as GameStatus['state'],
          name: 'STATUS_SOMETHING_NEW',
          detail: null,
        }),
      ),
    ).toBe('scheduled');
  });
});
