
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import OnboardingGuard from "./components/auth/OnboardingGuard";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import InterviewPractice from "./pages/InterviewPractice";
import ResumeTools from "./pages/ResumeTools";
import Networking from "./pages/Networking";
import NetworkingTools from "./pages/NetworkingTools";
import Referrals from "./pages/Referrals";
import SalaryNegotiations from "./pages/SalaryNegotiations";
import JobAlerts from "./pages/JobAlerts";
import Auth from "./pages/Auth";
import CompleteProfile from "./pages/CompleteProfile";
import EnhancedCompleteProfile from "./pages/EnhancedCompleteProfile";
import ResumePost from "./pages/ResumePost";
import LeetcodePatterns from "./pages/LeetcodePatterns";
import Calendar from "./pages/Calendar";
import Communications from "./pages/Communications";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - accessible without authentication */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Profile completion routes - protected but bypass onboarding guard */}
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
            
            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <Dashboard />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <Jobs />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/applications" element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <Applications />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/interview-practice" element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <InterviewPractice />
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
            <Route path="/resume-tools/:tab" element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <ResumeTools />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/resume-forum" element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <ResumePost />
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
            <Route path="/salary-negotiations" element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <SalaryNegotiations />
                </OnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/job-alerts" element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <JobAlerts />
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
          </Routes>
          <PWAInstallPrompt />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
