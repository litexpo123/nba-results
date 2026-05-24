import { SERIES } from '@/config/series';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SeriesCard } from './SeriesCard';

export function SeriesTabs() {
  const defaultId = SERIES[0]?.id ?? 'east';
  return (
    <Tabs defaultValue={defaultId} className="w-full">
      <TabsList className="mx-auto flex">
        {SERIES.map((series) => (
          <TabsTrigger key={series.id} value={series.id}>
            {series.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {SERIES.map((series) => (
        <TabsContent key={series.id} value={series.id} className="mt-4">
          <SeriesCard series={series} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
