import type { SeriesConfig } from '@/config/series';
import { useSeriesGames } from '@/hooks/useSeriesGames';

import { Card, CardContent } from './ui/card';
import { GameRow } from './GameRow';
import { MatchupHero } from './MatchupHero';

type SeriesCardProps = {
  series: SeriesConfig;
};

export function SeriesCard({ series }: SeriesCardProps) {
  const { data, isLoading, isError } = useSeriesGames(series);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Loading {series.label}…
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">
          Couldn't load {series.label}.
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <MatchupHero teamA={series.teamA} teamB={series.teamB} games={[]} />
        <CardContent className="text-center text-sm text-muted-foreground">
          No playoff games scheduled yet between {series.teamA} and {series.teamB}.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <MatchupHero teamA={series.teamA} teamB={series.teamB} games={data} />
      <CardContent>
        <div className="flex flex-col gap-3">
          {data.map((game) => (
            <GameRow key={game.id} game={game} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
