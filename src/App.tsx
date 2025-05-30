
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
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes - accessible to everyone */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes - require authentication and completed onboarding */}
                <Route path="/jobs" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <Jobs />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/mobile-jobs" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <MobileJobs />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <Profile />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <Calendar />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/communications" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <Communications />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <Dashboard />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/interview-practice" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <InterviewPractice />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/leetcode-patterns" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <LeetcodePatterns />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/networking" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <Networking />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/networking-tools" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <NetworkingTools />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/referrals" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <Referrals />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/resume-post" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <ResumePost />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/resume-tools" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <ResumeTools />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="/salary-negotiations" element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <SalaryNegotiations />
                    </OnboardingGuard>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
