import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from './trpc';
import AppShell from './AppShell';

export default function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
  }));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: '/trpc' })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
