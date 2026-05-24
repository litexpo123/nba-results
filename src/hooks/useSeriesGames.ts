import { useQuery } from '@tanstack/react-query';

import type { SeriesConfig } from '@/config/series';
import { getTeamSchedule, type Game } from '@/lib/espnClient';
import { matchSeries } from '@/lib/seriesMatcher';

export function useSeriesGames(series: SeriesConfig) {
  return useQuery<Game[]>({
    queryKey: ['series-schedule', series.teamA, series.teamB],
    queryFn: async () => {
      const schedule = await getTeamSchedule(series.teamA);
      return matchSeries(schedule, series.teamB);
    },
  });
}
