
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationStateProvider } from "@/hooks/useNavigationState";
import { ThemeProvider } from "next-themes";
import { useMobile } from "@/hooks/use-mobile";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OnboardingGuard from "@/components/auth/OnboardingGuard";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import MobileJobs from "./pages/MobileJobs";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import CompleteProfile from "./pages/CompleteProfile";
import EnhancedCompleteProfile from "./pages/EnhancedCompleteProfile";
import ResumeTools from "./pages/ResumeTools";
import InterviewPractice from "./pages/InterviewPractice";
import LeetcodePatterns from "./pages/LeetcodePatterns";
import NetworkingTools from "./pages/NetworkingTools";
import Networking from "./pages/Networking";
import Referrals from "./pages/Referrals";
import SalaryNegotiations from "./pages/SalaryNegotiations";
import JobAlerts from "./pages/JobAlerts";
import Communications from "./pages/Communications";
import Calendar from "./pages/Calendar";
import ResumePost from "./pages/ResumePost";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DocumentsHub from "./pages/collaboration/DocumentsHub";
import PeerReviews from "./pages/collaboration/PeerReviews";
import TeamsManagement from "./pages/collaboration/TeamsManagement";
import MarketTrends from "./pages/analytics/MarketTrends";
import PredictiveAnalytics from "./pages/analytics/PredictiveAnalytics";
import SalaryInsights from "./pages/analytics/SalaryInsights";
import AdvancedMobileFeatures from './pages/AdvancedMobileFeatures';
import OfflineFirstPages from './pages/OfflineFirstPages';
import "./App.css";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isMobile = useMobile();
  
  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Streamline';
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/jobs') return 'Jobs';
    if (path === '/mobile-jobs') return 'Jobs';
    if (path === '/applications') return 'Applications';
    if (path === '/profile') return 'Profile';
    if (path === '/complete-profile') return 'Complete Profile';
    if (path === '/enhanced-complete-profile') return 'Enhanced Profile';
    if (path === '/resume-tools') return 'Resume Tools';
    if (path === '/interview-practice') return 'Interview Practice';
    if (path === '/leetcode-patterns') return 'LeetCode Patterns';
    if (path === '/networking-tools') return 'Networking Tools';
    if (path === '/networking') return 'Networking';
    if (path === '/referrals') return 'Referrals';
    if (path === '/salary-negotiations') return 'Salary Negotiations';
    if (path === '/job-alerts') return 'Job Alerts';
    if (path === '/communications') return 'Communications';
    if (path === '/calendar') return 'Calendar';
    if (path === '/resume-post') return 'Resume Post';
    if (path === '/collaboration/documents') return 'Documents';
    if (path === '/collaboration/reviews') return 'Peer Reviews';
    if (path === '/collaboration/teams') return 'Teams';
    if (path === '/analytics/market-trends') return 'Market Trends';
    if (path === '/analytics/predictive') return 'Predictive Analytics';
    if (path === '/analytics/salary') return 'Salary Insights';
    if (path === '/mobile-features') return 'Mobile Features';
    if (path === '/offline') return 'Offline Features';
    return 'Streamline';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Conditional Navigation */}
      {isMobile ? (
        <MobileHeader title={getPageTitle()} />
      ) : (
        <Navbar />
      )}
      
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <Dashboard />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/jobs" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <Jobs />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mobile-jobs" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <MobileJobs />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/applications" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <Applications />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/complete-profile" 
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/enhanced-complete-profile" 
          element={
            <ProtectedRoute>
              <EnhancedCompleteProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume-tools" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <ResumeTools />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/interview-practice" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <InterviewPractice />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leetcode-patterns" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <LeetcodePatterns />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/networking-tools" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <NetworkingTools />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/networking" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <Networking />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/referrals" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <Referrals />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/salary-negotiations" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <SalaryNegotiations />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/job-alerts" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <JobAlerts />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/communications" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <Communications />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <Calendar />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume-post" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <ResumePost />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/collaboration/documents" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <DocumentsHub />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/collaboration/reviews" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <PeerReviews />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/collaboration/teams" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <TeamsManagement />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics/market-trends" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <MarketTrends />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics/predictive" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <PredictiveAnalytics />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics/salary" 
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <SalaryInsights />
              </OnboardingGuard>
            </ProtectedRoute>
          } 
        />
        <Route path="/mobile-features" element={<AdvancedMobileFeatures />} />
        <Route path="/offline" element={<OfflineFirstPages />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationStateProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </NavigationStateProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
