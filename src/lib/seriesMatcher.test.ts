import { describe, it, expect } from 'vitest';
import type { Game } from './espnClient';
import { matchSeries } from './seriesMatcher';

function makeGame(args: {
  id: string;
  startsAt: string;
  isPostseason: boolean;
  homeAbbrev: string;
  awayAbbrev: string;
}): Game {
  return {
    id: args.id,
    startsAt: args.startsAt,
    isPostseason: args.isPostseason,
    status: { state: 'pre', name: 'STATUS_SCHEDULED', detail: null },
    home: {
      abbreviation: args.homeAbbrev,
      displayName: args.homeAbbrev,
      shortDisplayName: args.homeAbbrev,
      logo: null,
      score: null,
      isWinner: false,
    },
    away: {
      abbreviation: args.awayAbbrev,
      displayName: args.awayAbbrev,
      shortDisplayName: args.awayAbbrev,
      logo: null,
      score: null,
      isWinner: false,
    },
  };
}

describe('matchSeries', () => {
  it('excludes regular-season games even against the right opponent', () => {
    const schedule = [
      makeGame({
        id: 'rs-1',
        startsAt: '2026-01-15T00:00:00Z',
        isPostseason: false,
        homeAbbrev: 'OKC',
        awayAbbrev: 'SAS',
      }),
    ];

    expect(matchSeries(schedule, 'SAS')).toEqual([]);
  });

  it('excludes playoff games against other opponents', () => {
    const schedule = [
      makeGame({
        id: 'po-vs-other',
        startsAt: '2026-05-01T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'OKC',
        awayAbbrev: 'DEN',
      }),
    ];

    expect(matchSeries(schedule, 'SAS')).toEqual([]);
  });

  it('matches when the named opponent is either home or away', () => {
    const schedule = [
      makeGame({
        id: 'home-opp',
        startsAt: '2026-05-20T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'SAS',
        awayAbbrev: 'OKC',
      }),
      makeGame({
        id: 'away-opp',
        startsAt: '2026-05-22T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'OKC',
        awayAbbrev: 'SAS',
      }),
    ];

    const result = matchSeries(schedule, 'SAS');
    expect(result.map((g) => g.id)).toEqual(['home-opp', 'away-opp']);
  });

  it('is case-insensitive on the opponent argument and stored abbreviations', () => {
    const schedule = [
      makeGame({
        id: 'po-1',
        startsAt: '2026-05-20T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'okc',
        awayAbbrev: 'sas',
      }),
    ];

    expect(matchSeries(schedule, 'sas').map((g) => g.id)).toEqual(['po-1']);
    expect(matchSeries(schedule, 'SAS').map((g) => g.id)).toEqual(['po-1']);
  });

  it('sorts matched games chronologically by startsAt', () => {
    const schedule = [
      makeGame({
        id: 'g3',
        startsAt: '2026-05-26T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'OKC',
        awayAbbrev: 'SAS',
      }),
      makeGame({
        id: 'g1',
        startsAt: '2026-05-20T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'SAS',
        awayAbbrev: 'OKC',
      }),
      makeGame({
        id: 'g2',
        startsAt: '2026-05-22T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'OKC',
        awayAbbrev: 'SAS',
      }),
    ];

    expect(matchSeries(schedule, 'SAS').map((g) => g.id)).toEqual(['g1', 'g2', 'g3']);
  });

  it('filters a mixed schedule down to just the targeted series in order', () => {
    const schedule = [
      makeGame({
        id: 'rs-vs-sas',
        startsAt: '2026-01-10T00:00:00Z',
        isPostseason: false,
        homeAbbrev: 'OKC',
        awayAbbrev: 'SAS',
      }),
      makeGame({
        id: 'po-vs-den-g1',
        startsAt: '2026-04-20T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'OKC',
        awayAbbrev: 'DEN',
      }),
      makeGame({
        id: 'po-vs-sas-g2',
        startsAt: '2026-05-22T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'OKC',
        awayAbbrev: 'SAS',
      }),
      makeGame({
        id: 'po-vs-sas-g1',
        startsAt: '2026-05-20T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'SAS',
        awayAbbrev: 'OKC',
      }),
    ];

    expect(matchSeries(schedule, 'SAS').map((g) => g.id)).toEqual([
      'po-vs-sas-g1',
      'po-vs-sas-g2',
    ]);
  });

  it('does not mutate the input array order', () => {
    const schedule = [
      makeGame({
        id: 'g2',
        startsAt: '2026-05-22T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'OKC',
        awayAbbrev: 'SAS',
      }),
      makeGame({
        id: 'g1',
        startsAt: '2026-05-20T00:00:00Z',
        isPostseason: true,
        homeAbbrev: 'SAS',
        awayAbbrev: 'OKC',
      }),
    ];
    const originalOrder = schedule.map((g) => g.id);

    matchSeries(schedule, 'SAS');

    expect(schedule.map((g) => g.id)).toEqual(originalOrder);
  });
});
