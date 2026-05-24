import type { Game } from '@/lib/espnClient';
import { useGameSummary } from '@/hooks/useGameSummary';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { TopScorerHero } from './TopScorerHero';
import { LineScore } from './LineScore';
import { PlayerStatsTable } from './PlayerStatsTable';

type BoxScoreDialogProps = {
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BoxScoreDialog({ game, open, onOpenChange }: BoxScoreDialogProps) {
  const { data, isLoading, isError } = useGameSummary(game.id, open);

  const title = `${game.away.shortDisplayName || game.away.abbreviation} @ ${
    game.home.shortDisplayName || game.home.abbreviation
  }`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading box score…</div>
        ) : null}
        {isError || (!isLoading && !data) ? (
          <div className="py-10 text-center text-sm text-destructive">
            Couldn't load box score.
          </div>
        ) : null}
        {data ? (
          <div className="space-y-6">
            <TopScorerHero topScorer={data.topScorer} />
            <LineScore teams={data.teams} />
            <div className="space-y-6">
              {data.teams.map((team) => (
                <PlayerStatsTable key={team.abbreviation} team={team} />
              ))}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
