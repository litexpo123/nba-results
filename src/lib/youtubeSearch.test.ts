import { describe, it, expect } from 'vitest';
import type { Game } from './espnClient';
import { buildYoutubeSearchUrl } from './youtubeSearch';

function makeGame(args: {
  startsAt: string;
  away: { displayName: string; shortDisplayName?: string };
  home: { displayName: string; shortDisplayName?: string };
}): Game {
  return {
    id: 'g-test',
    startsAt: args.startsAt,
    isPostseason: true,
    status: { state: 'post', name: 'STATUS_FINAL', detail: 'Final' },
    away: {
      abbreviation: 'AAA',
      displayName: args.away.displayName,
      shortDisplayName: args.away.shortDisplayName ?? '',
      logo: null,
      score: null,
      isWinner: false,
    },
    home: {
      abbreviation: 'HHH',
      displayName: args.home.displayName,
      shortDisplayName: args.home.shortDisplayName ?? '',
      logo: null,
      score: null,
      isWinner: false,
    },
  };
}

describe('buildYoutubeSearchUrl', () => {
  it('returns a YouTube search URL with host www.youtube.com and path /results', () => {
    const game = makeGame({
      startsAt: '2026-05-27T15:00:00Z',
      away: { displayName: 'New York Knicks', shortDisplayName: 'Knicks' },
      home: { displayName: 'Cleveland Cavaliers', shortDisplayName: 'Cavaliers' },
    });

    const url = new URL(buildYoutubeSearchUrl(game, 3));
    expect(url.host).toBe('www.youtube.com');
    expect(url.pathname).toBe('/results');
    expect(Array.from(url.searchParams.keys())).toEqual(['search_query']);
  });

  it('includes the exact tokens "<away short> vs <home short> Game N <year> NBA Playoffs" in order', () => {
    const game = makeGame({
      startsAt: '2026-05-27T15:00:00Z',
      away: { displayName: 'New York Knicks', shortDisplayName: 'Knicks' },
      home: { displayName: 'Cleveland Cavaliers', shortDisplayName: 'Cavaliers' },
    });

    const url = new URL(buildYoutubeSearchUrl(game, 3));
    expect(url.searchParams.get('search_query')).toBe('Knicks vs Cavaliers Game 3 2026 NBA Playoffs');
  });

  it('extracts the year from startsAt in UTC (no timezone drift)', () => {
    // 2024-12-31T23:30:00-05:00 (EST) === 2025-01-01T04:30:00Z (UTC).
    // We extract the UTC year so the query is deterministic across hosts.
    const game = makeGame({
      startsAt: '2025-01-01T04:30:00Z',
      away: { displayName: 'New York Knicks', shortDisplayName: 'Knicks' },
      home: { displayName: 'Cleveland Cavaliers', shortDisplayName: 'Cavaliers' },
    });

    expect(buildYoutubeSearchUrl(game, 1)).toContain('2025');
    expect(buildYoutubeSearchUrl(game, 1)).not.toContain('2024');
  });

  it('falls back to displayName when shortDisplayName is empty', () => {
    const game = makeGame({
      startsAt: '2026-05-27T15:00:00Z',
      away: { displayName: 'New York Knicks', shortDisplayName: '' },
      home: { displayName: 'Cleveland Cavaliers', shortDisplayName: '' },
    });

    const url = new URL(buildYoutubeSearchUrl(game, 2));
    expect(url.searchParams.get('search_query')).toBe(
      'New York Knicks vs Cleveland Cavaliers Game 2 2026 NBA Playoffs',
    );
  });

  it('encodes team names containing spaces without double-escaping', () => {
    const game = makeGame({
      startsAt: '2026-05-27T15:00:00Z',
      away: { displayName: 'Portland Trail Blazers', shortDisplayName: 'Trail Blazers' },
      home: { displayName: 'Oklahoma City Thunder', shortDisplayName: 'Thunder' },
    });

    const raw = buildYoutubeSearchUrl(game, 4);
    // Raw URL must not contain literal spaces in the query, nor double-encoded percent signs.
    const queryPart = raw.split('?')[1] ?? '';
    expect(queryPart).not.toContain(' ');
    expect(queryPart).not.toMatch(/%25(20|2B)/i);

    // Round-tripping through URL must yield the human-readable form.
    const url = new URL(raw);
    expect(url.searchParams.get('search_query')).toBe(
      'Trail Blazers vs Thunder Game 4 2026 NBA Playoffs',
    );
  });

  it('renders the game number literally as "Game N"', () => {
    const game = makeGame({
      startsAt: '2026-05-27T15:00:00Z',
      away: { displayName: 'Knicks', shortDisplayName: 'Knicks' },
      home: { displayName: 'Cavaliers', shortDisplayName: 'Cavaliers' },
    });

    const q = new URL(buildYoutubeSearchUrl(game, 7)).searchParams.get('search_query') ?? '';
    expect(q).toContain('Game 7');
  });

  it('produces the same URL for the same input on repeated calls (deterministic)', () => {
    const game = makeGame({
      startsAt: '2026-05-27T15:00:00Z',
      away: { displayName: 'New York Knicks', shortDisplayName: 'Knicks' },
      home: { displayName: 'Cleveland Cavaliers', shortDisplayName: 'Cavaliers' },
    });

    expect(buildYoutubeSearchUrl(game, 3)).toBe(buildYoutubeSearchUrl(game, 3));
  });
});
