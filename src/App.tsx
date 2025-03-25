
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { isMobileApp, isChromeExtension } from "./utils/mobileUtils";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InterviewPractice from "./pages/InterviewPractice";
import Referrals from "./pages/Referrals";
import Jobs from "./pages/Jobs";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ResumeTools from "./pages/ResumeTools";
import LeetcodePatterns from "./pages/LeetcodePatterns";
import SalaryNegotiations from "./pages/SalaryNegotiations";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => {
  const [environment, setEnvironment] = useState<'web' | 'mobile' | 'extension'>('web');

  useEffect(() => {
    // Detect what environment we're running in
    if (isChromeExtension()) {
      setEnvironment('extension');
      console.log("Running as Chrome extension");
    } else if (isMobileApp()) {
      setEnvironment('mobile');
      console.log("Running as mobile app");
    } else {
      setEnvironment('web');
      console.log("Running as web app");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/interview-practice" element={<InterviewPractice />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/resume-tools" element={<ResumeTools />} />
              <Route path="/leetcode-patterns" element={<LeetcodePatterns />} />
              <Route path="/salary-negotiations" element={<SalaryNegotiations />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
