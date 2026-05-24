import { useQuery } from '@tanstack/react-query';

import { getGameSummary, type BoxScore } from '@/lib/espnClient';

export function useGameSummary(gameId: string, enabled: boolean) {
  return useQuery<BoxScore>({
    queryKey: ['game-summary', gameId],
    queryFn: () => getGameSummary(gameId),
    enabled,
  });
}
