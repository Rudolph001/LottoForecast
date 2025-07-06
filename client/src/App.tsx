import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Dashboard } from "@/pages/dashboard";
import { Route, Router } from "wouter";
import NotFound from "@/pages/not-found";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/model" component={Dashboard} />
          <Route path="/predictions" component={Dashboard} />
          <Route path="/analysis" component={Dashboard} />
          <Route path="/converter" component={Dashboard} />
          <Route path="/budget" component={Dashboard} />
          <Route component={NotFound} />
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;