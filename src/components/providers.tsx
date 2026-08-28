import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 12_000,
            refetchOnWindowFocus: false,
            retry: 2,
            retryDelay: 700,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>
        {children}
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            className:
              "bg-surface text-fg border border-border font-sans text-sm",
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
