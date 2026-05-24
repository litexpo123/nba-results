import type { Game } from '@/lib/espnClient';
import { classifyGame } from '@/lib/gameStateClassifier';

import { TeamLogo } from './TeamLogo';

type MatchupHeroProps = {
  teamA: string;
  teamB: string;
  games: Game[];
};

type SeriesScore = {
  teamAWins: number;
  teamBWins: number;
};

function computeSeriesScore(games: Game[], teamA: string, teamB: string): SeriesScore {
  let teamAWins = 0;
  let teamBWins = 0;
  for (const game of games) {
    if (classifyGame(game) !== 'final') continue;
    const winner = [game.home, game.away].find((side) => side.isWinner);
    if (!winner) continue;
    const abbr = winner.abbreviation.toUpperCase();
    if (abbr === teamA.toUpperCase()) teamAWins += 1;
    else if (abbr === teamB.toUpperCase()) teamBWins += 1;
  }
  return { teamAWins, teamBWins };
}

function pickSide(games: Game[], abbrev: string) {
  for (const game of games) {
    if (game.home.abbreviation.toUpperCase() === abbrev.toUpperCase()) return game.home;
    if (game.away.abbreviation.toUpperCase() === abbrev.toUpperCase()) return game.away;
  }
  return null;
}

function formatSeriesScoreLine(
  score: SeriesScore,
  teamADisplay: string,
  teamBDisplay: string,
): string {
  const { teamAWins, teamBWins } = score;
  if (teamAWins === 0 && teamBWins === 0) return 'Series tied 0-0';
  if (teamAWins === teamBWins) return `Series tied ${teamAWins}-${teamBWins}`;
  if (teamAWins > teamBWins) return `${teamADisplay} leads ${teamAWins}-${teamBWins}`;
  return `${teamBDisplay} leads ${teamBWins}-${teamAWins}`;
}

export function MatchupHero({ teamA, teamB, games }: MatchupHeroProps) {
  const sideA = pickSide(games, teamA);
  const sideB = pickSide(games, teamB);
  const score = computeSeriesScore(games, teamA, teamB);

  const nameA = sideA?.shortDisplayName ?? teamA;
  const nameB = sideB?.shortDisplayName ?? teamB;

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <TeamLogo src={sideA?.logo ?? null} abbreviation={teamA} size="lg" />
          <div className="text-sm font-medium">{nameA}</div>
        </div>
        <div className="text-2xl font-semibold text-muted-foreground">vs</div>
        <div className="flex flex-col items-center gap-2">
          <TeamLogo src={sideB?.logo ?? null} abbreviation={teamB} size="lg" />
          <div className="text-sm font-medium">{nameB}</div>
        </div>
      </div>
      <div className="text-base font-medium">
        {formatSeriesScoreLine(score, nameA, nameB)}
      </div>
    </div>
  );
}
