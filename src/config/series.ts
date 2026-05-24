export type SeriesConfig = {
  id: 'east' | 'west';
  label: string;
  teamA: string;
  teamB: string;
  /** YouTube video IDs (not URLs); keys are 1-based game numbers. */
  highlights: Readonly<Record<number, string>>;
};

export const SERIES: readonly SeriesConfig[] = [
  {
    id: 'east',
    label: 'Eastern Conference Finals',
    teamA: 'CLE',
    teamB: 'NY',
    highlights: {},
  },
  {
    id: 'west',
    label: 'Western Conference Finals',
    teamA: 'OKC',
    teamB: 'SA',
    highlights: {},
  },
] as const;
