import type { BoxScore } from '@/lib/espnClient';

import { PlayerHeadshot } from './PlayerHeadshot';

type TopScorerHeroProps = {
  topScorer: BoxScore['topScorer'];
};

export function TopScorerHero({ topScorer }: TopScorerHeroProps) {
  if (!topScorer.name) return null;
  return (
    <div className="flex items-center gap-4 rounded-md border bg-muted/30 p-4">
      <PlayerHeadshot src={topScorer.headshot} name={topScorer.name} size="md" />
      <div className="flex flex-col">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Top scorer</div>
        <div className="text-base font-semibold">{topScorer.name}</div>
        <div className="text-xs text-muted-foreground">{topScorer.teamAbbreviation}</div>
        <div className="mt-1 text-sm font-medium">{topScorer.statLine}</div>
      </div>
    </div>
  );
}
