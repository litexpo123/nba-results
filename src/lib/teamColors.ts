export type TeamColors = {
  primary: string;
  secondary: string;
};

const NEUTRAL: TeamColors = {
  primary: '#6b7280',
  secondary: '#9ca3af',
};

const COLORS: Record<string, TeamColors> = {
  CLE: { primary: '#860038', secondary: '#FDBB30' },
  NYK: { primary: '#006BB6', secondary: '#F58426' },
  OKC: { primary: '#007AC1', secondary: '#EF3B24' },
  SAS: { primary: '#000000', secondary: '#C4CED4' },
};

export function getTeamColors(abbrev: string): TeamColors {
  return COLORS[abbrev.toUpperCase()] ?? NEUTRAL;
}
