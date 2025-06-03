import { useRoutes } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationStateProvider } from "@/hooks/useNavigationState";
import { ThemeProvider } from "next-themes";
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

function App() {
  const routes = useRoutes([
    {
      path: '/',
      element: <Index />
    },
    {
      path: '/auth',
      element: <Auth />
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <Dashboard />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/jobs',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <Jobs />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/mobile-jobs',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <MobileJobs />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/applications',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <Applications />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/profile',
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      )
    },
    {
      path: '/complete-profile',
      element: (
        <ProtectedRoute>
          <CompleteProfile />
        </ProtectedRoute>
      )
    },
    {
      path: '/enhanced-complete-profile',
      element: (
        <ProtectedRoute>
          <EnhancedCompleteProfile />
        </ProtectedRoute>
      )
    },
    {
      path: '/resume-tools',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <ResumeTools />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/interview-practice',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <InterviewPractice />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/leetcode-patterns',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <LeetcodePatterns />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/networking-tools',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <NetworkingTools />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/networking',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <Networking />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/referrals',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <Referrals />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/salary-negotiations',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <SalaryNegotiations />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/job-alerts',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <JobAlerts />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/communications',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <Communications />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/calendar',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <Calendar />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/resume-post',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <ResumePost />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/collaboration/documents',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <DocumentsHub />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/collaboration/reviews',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <PeerReviews />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/collaboration/teams',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <TeamsManagement />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/analytics/market-trends',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <MarketTrends />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/analytics/predictive',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <PredictiveAnalytics />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/analytics/salary',
      element: (
        <ProtectedRoute>
          <OnboardingGuard>
            <SalaryInsights />
          </OnboardingGuard>
        </ProtectedRoute>
      )
    },
    {
      path: '/mobile-features',
      element: <AdvancedMobileFeatures />
    },
    {
      path: '/offline',
      element: <OfflineFirstPages />
    },
    {
      path: '*',
      element: <NotFound />
    }
  ]);

  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationStateProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <div className="min-h-screen bg-background">
                    <Navbar />
                    <MobileHeader title="EmployEvolution" />
                    
                    {routes}
                  </div>
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
