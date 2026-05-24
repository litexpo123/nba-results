import type { Game, TeamSide } from '@/lib/espnClient';
import { formatGameStart } from '@/lib/dateFormatter';
import { classifyGame } from '@/lib/gameStateClassifier';
import { getTeamColors } from '@/lib/teamColors';
import { cn } from '@/lib/utils';

import { TeamLogo } from './TeamLogo';

type GameRowProps = {
  game: Game;
};

type TeamRowProps = {
  side: TeamSide;
  isFinal: boolean;
};

function TeamRow({ side, isFinal }: TeamRowProps) {
  const colors = getTeamColors(side.abbreviation);
  return (
    <div
      className="flex items-center justify-between border-l-4 py-2 pl-3 pr-4"
      style={{ borderLeftColor: colors.primary }}
    >
      <div className="flex items-center gap-3">
        <TeamLogo src={side.logo} abbreviation={side.abbreviation} size="md" />
        <div className="text-sm font-medium">{side.shortDisplayName || side.abbreviation}</div>
      </div>
      {isFinal && side.score !== null ? (
        <div
          className={cn('text-lg font-semibold tabular-nums')}
          style={side.isWinner ? { color: colors.primary } : undefined}
        >
          {side.score}
        </div>
      ) : null}
    </div>
  );
}

export function GameRow({ game }: GameRowProps) {
  const state = classifyGame(game);
  const isFinal = state === 'final';
  const isScheduled = state === 'scheduled';

  return (
    <div className={cn('rounded-md border bg-card', isScheduled && 'opacity-60')}>
      <TeamRow side={game.away} isFinal={isFinal} />
      <div className="border-t" />
      <TeamRow side={game.home} isFinal={isFinal} />
      {isScheduled ? (
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          {formatGameStart(game.startsAt)}
        </div>
      ) : null}
      {state === 'in-progress' ? (
        <div className="border-t px-4 py-2 text-xs font-medium text-primary">
          {game.status.detail ?? 'In progress'}
        </div>
      ) : null}
    </div>
  );
}
