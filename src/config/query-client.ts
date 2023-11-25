import { QueryClient, keepPreviousData } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 60000,
      staleTime: 40000,
      refetchOnMount: false,
      placeholderData: keepPreviousData,
    },
  },
});
