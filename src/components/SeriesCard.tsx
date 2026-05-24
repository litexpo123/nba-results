import type { SeriesConfig } from '@/config/series';
import { useSeriesGames } from '@/hooks/useSeriesGames';
import { buildYoutubeSearchUrl } from '@/lib/youtubeSearch';

import { Card, CardContent } from './ui/card';
import { ErrorMessage } from './ErrorMessage';
import { GameRow } from './GameRow';
import { MatchupHero } from './MatchupHero';
import { Spinner } from './Spinner';

type SeriesCardProps = {
  series: SeriesConfig;
};

export function SeriesCard({ series }: SeriesCardProps) {
  const { data, isLoading, isError } = useSeriesGames(series);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Spinner label={`Loading ${series.label}`} />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <ErrorMessage message="Couldn't load games" />
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
          {data.map((game, index) => {
            const gameNumber = index + 1;
            const youtubeSearchUrl = buildYoutubeSearchUrl(game, gameNumber);
            return (
              <GameRow key={game.id} game={game} youtubeSearchUrl={youtubeSearchUrl} />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
