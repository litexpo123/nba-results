import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SeriesTabs } from '@/components/SeriesTabs';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-3xl">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight">NBA Conference Finals</h1>
          </header>
          <SeriesTabs />
        </div>
      </div>
    </QueryClientProvider>
  );
}
