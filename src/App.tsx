
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import ResumeTools from "./pages/ResumeTools";
import Auth from "./pages/Auth";
import JobAlerts from "./pages/JobAlerts";
import Referrals from "./pages/Referrals";
import SalaryNegotiations from "./pages/SalaryNegotiations";
import CompleteProfile from "./pages/CompleteProfile";
import InterviewPractice from "./pages/InterviewPractice";
import LeetcodePatterns from "./pages/LeetcodePatterns";
import ResumePost from "./pages/ResumePost";
import Networking from "./pages/Networking";
import NetworkingTools from "./pages/NetworkingTools";
import Communications from "./pages/Communications";
import NotFound from "./pages/NotFound";
import EnhancedCompleteProfile from "./pages/EnhancedCompleteProfile";
import MobileJobs from "./pages/MobileJobs";
import OfflineFirstPages from "./pages/OfflineFirstPages";

// Analytics pages
import PredictiveAnalytics from "./pages/analytics/PredictiveAnalytics";
import MarketTrends from "./pages/analytics/MarketTrends";
import SalaryInsights from "./pages/analytics/SalaryInsights";

// Collaboration pages
import DocumentsHub from "./pages/collaboration/DocumentsHub";
import TeamsManagement from "./pages/collaboration/TeamsManagement";
import PeerReviews from "./pages/collaboration/PeerReviews";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import OnboardingGuard from "./components/auth/OnboardingGuard";
import { EnhancedErrorBoundary } from "./components/error/EnhancedErrorBoundary";
import { EnhancedDeepLinkHandler } from "./components/navigation/EnhancedDeepLinkHandler";
import { useMobile } from "./hooks/use-mobile";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <EnhancedErrorBoundary>
            <BrowserRouter>
              <AuthContextProvider>
                <EnhancedDeepLinkHandler>
                  <OnboardingGuard>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/mobile-jobs" element={<MobileJobs />} />
                      <Route path="/offline" element={<OfflineFirstPages />} />

                      {/* Protected routes */}
                      <Route path="/jobs" element={
                        <ProtectedRoute>
                          <Jobs />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/applications" element={
                        <ProtectedRoute>
                          <Applications />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/calendar" element={
                        <ProtectedRoute>
                          <Calendar />
                        </ProtectedRoute>
                      } />
                      <Route path="/resume-tools" element={
                        <ProtectedRoute>
                          <ResumeTools />
                        </ProtectedRoute>
                      } />
                      <Route path="/job-alerts" element={
                        <ProtectedRoute>
                          <JobAlerts />
                        </ProtectedRoute>
                      } />
                      <Route path="/referrals" element={
                        <ProtectedRoute>
                          <Referrals />
                        </ProtectedRoute>
                      } />
                      <Route path="/salary-negotiations" element={
                        <ProtectedRoute>
                          <SalaryNegotiations />
                        </ProtectedRoute>
                      } />
                      <Route path="/complete-profile" element={
                        <ProtectedRoute>
                          <CompleteProfile />
                        </ProtectedRoute>
                      } />
                      <Route path="/enhanced-complete-profile" element={
                        <ProtectedRoute>
                          <EnhancedCompleteProfile />
                        </ProtectedRoute>
                      } />
                      <Route path="/interview-practice" element={
                        <ProtectedRoute>
                          <InterviewPractice />
                        </ProtectedRoute>
                      } />
                      <Route path="/leetcode-patterns" element={
                        <ProtectedRoute>
                          <LeetcodePatterns />
                        </ProtectedRoute>
                      } />
                      <Route path="/resume-forum" element={
                        <ProtectedRoute>
                          <ResumePost />
                        </ProtectedRoute>
                      } />
                      <Route path="/networking" element={
                        <ProtectedRoute>
                          <Networking />
                        </ProtectedRoute>
                      } />
                      <Route path="/networking-tools" element={
                        <ProtectedRoute>
                          <NetworkingTools />
                        </ProtectedRoute>
                      } />
                      <Route path="/communications" element={
                        <ProtectedRoute>
                          <Communications />
                        </ProtectedRoute>
                      } />

                      {/* Analytics routes */}
                      <Route path="/analytics/predictive" element={
                        <ProtectedRoute>
                          <PredictiveAnalytics />
                        </ProtectedRoute>
                      } />
                      <Route path="/analytics/market-trends" element={
                        <ProtectedRoute>
                          <MarketTrends />
                        </ProtectedRoute>
                      } />
                      <Route path="/analytics/salary-insights" element={
                        <ProtectedRoute>
                          <SalaryInsights />
                        </ProtectedRoute>
                      } />

                      {/* Collaboration routes */}
                      <Route path="/collaboration/documents" element={
                        <ProtectedRoute>
                          <DocumentsHub />
                        </ProtectedRoute>
                      } />
                      <Route path="/collaboration/teams" element={
                        <ProtectedRoute>
                          <TeamsManagement />
                        </ProtectedRoute>
                      } />
                      <Route path="/collaboration/reviews" element={
                        <ProtectedRoute>
                          <PeerReviews />
                        </ProtectedRoute>
                      } />

                      {/* 404 route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </OnboardingGuard>
                </EnhancedDeepLinkHandler>
              </AuthContextProvider>
            </BrowserRouter>
          </EnhancedErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
