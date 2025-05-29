
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Calendar from "./pages/Calendar";
import Communications from "./pages/Communications";
import Dashboard from "./pages/Dashboard";
import InterviewPractice from "./pages/InterviewPractice";
import LeetcodePatterns from "./pages/LeetcodePatterns";
import MobileJobs from "./pages/MobileJobs";
import Networking from "./pages/Networking";
import NetworkingTools from "./pages/NetworkingTools";
import NotFound from "./pages/NotFound";
import Referrals from "./pages/Referrals";
import ResumePost from "./pages/ResumePost";
import ResumeTools from "./pages/ResumeTools";
import SalaryNegotiations from "./pages/SalaryNegotiations";
import { AuthProvider } from "./contexts/AuthContext";
import OnboardingGuard from "./components/auth/OnboardingGuard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <OnboardingGuard>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/mobile-jobs" element={<MobileJobs />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/communications" element={<Communications />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/interview-practice" element={<InterviewPractice />} />
                  <Route path="/leetcode-patterns" element={<LeetcodePatterns />} />
                  <Route path="/networking" element={<Networking />} />
                  <Route path="/networking-tools" element={<NetworkingTools />} />
                  <Route path="/referrals" element={<Referrals />} />
                  <Route path="/resume-post" element={<ResumePost />} />
                  <Route path="/resume-tools" element={<ResumeTools />} />
                  <Route path="/salary-negotiations" element={<SalaryNegotiations />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </OnboardingGuard>
              <Toaster />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
