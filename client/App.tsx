import "./global.css";

import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FinanceProvider } from "@/context/FinanceContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import FinancialInput from "./pages/FinancialInput";
import SavingsStrategies from "./pages/SavingsStrategies";
import ChartsAnalytics from "./pages/ChartsAnalytics";
import InvestmentAdvice from "./pages/InvestmentAdvice";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ContactUs from "./pages/ContactUs";

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/financial-input" element={<FinancialInput />} />
          <Route path="/savings-strategies" element={<SavingsStrategies />} />
          <Route path="/charts" element={<ChartsAnalytics />} />
          <Route path="/investment" element={<InvestmentAdvice />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FinanceProvider>
          <Toaster />
          <Sonner />
          <App />
        </FinanceProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </I18nextProvider>
);
