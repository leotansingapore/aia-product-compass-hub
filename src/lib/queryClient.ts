import { QueryClient } from "@tanstack/react-query";

// The app's one client. Its own module so code outside React (routePrefetch)
// can warm a query before the page that reads it has rendered.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,      // 2 min — avoid refetch on every navigation
      gcTime: 10 * 60 * 1000,         // 10 min — keep unused data in cache longer
      refetchOnWindowFocus: false,    // don't refetch when user switches tabs
      retry: 1,                       // single retry instead of default 3
    },
  },
});
