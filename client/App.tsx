import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { FinanceProvider } from "@/context/FinanceContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import FinancialInput from "./pages/FinancialInput";
import SavingsStrategies from "./pages/SavingsStrategies";
import ChartsAnalytics from "./pages/ChartsAnalytics";
import InvestmentAdvice from "./pages/InvestmentAdvice";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <FinanceProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/financial-input" element={<FinancialInput />} />
                  <Route path="/savings-strategies" element={<SavingsStrategies />} />
                  <Route path="/charts" element={<ChartsAnalytics />} />
                  <Route path="/investment" element={<InvestmentAdvice />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </FinanceProvider>
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
