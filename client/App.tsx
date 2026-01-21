import "./global.css";

import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FinanceProvider } from "@/context/FinanceContext";

const App = () => {
  return (
    <div>
      <h1>Testing App with Providers</h1>
    </div>
  );
};

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FinanceProvider>
        <Toaster />
        <Sonner />
        <App />
      </FinanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
