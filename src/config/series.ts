export type SeriesConfig = {
  id: 'east' | 'west';
  label: string;
  teamA: string;
  teamB: string;
};

export const SERIES: readonly SeriesConfig[] = [
  { id: 'east', label: 'Eastern Conference Finals', teamA: 'CLE', teamB: 'NYK' },
  { id: 'west', label: 'Western Conference Finals', teamA: 'OKC', teamB: 'SAS' },
] as const;
