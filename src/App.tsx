
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import OnboardingGuard from "./components/auth/OnboardingGuard";
import { EnhancedErrorBoundary } from "./components/error/EnhancedErrorBoundary";
import { NavigationStateProvider } from "./components/navigation/NavigationStateManager";
import { DeepLinkHandler } from "./components/navigation/DeepLinkHandler";
import { TouchGestureHandler } from "./components/mobile/TouchGestureHandler";
import { AppTransitions } from "./components/mobile/AppTransitions";
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
import NotFound from "./pages/NotFound";
import AdvancedAnalyticsIntegration from "./components/analytics/AdvancedAnalyticsIntegration";
import SecurityDashboardEnhanced from "./components/security/SecurityDashboardEnhanced";
import OfflineFirstPages from "./pages/OfflineFirstPages";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import React from "react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NavigationStateProvider>
          <EnhancedErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <DeepLinkHandler>
                <TouchGestureHandler>
                  <AppTransitions>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      
                      {/* OAuth callback routes */}
                      <Route path="/auth/linkedin/callback" element={<Auth />} />
                      <Route path="/auth/google/callback" element={<Auth />} />
                      <Route path="/auth/outlook/callback" element={<Auth />} />
                      
                      {/* Profile completion routes */}
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
                      
                      {/* Main application routes */}
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
                      
                      {/* Enhanced feature routes */}
                      <Route path="/analytics" element={
                        <ProtectedRoute>
                          <OnboardingGuard>
                            <AdvancedAnalyticsIntegration />
                          </OnboardingGuard>
                        </ProtectedRoute>
                      } />
                      <Route path="/security" element={
                        <ProtectedRoute>
                          <OnboardingGuard>
                            <SecurityDashboardEnhanced />
                          </OnboardingGuard>
                        </ProtectedRoute>
                      } />
                      <Route path="/offline" element={
                        <ProtectedRoute>
                          <OnboardingGuard>
                            <OfflineFirstPages />
                          </OnboardingGuard>
                        </ProtectedRoute>
                      } />
                      
                      {/* Privacy and compliance routes */}
                      <Route path="/privacy" element={
                        <ProtectedRoute>
                          <OnboardingGuard>
                            {React.createElement(React.lazy(() => import('./components/privacy/PrivacyDashboard')))}
                          </OnboardingGuard>
                        </ProtectedRoute>
                      } />
                      <Route path="/audit-logs" element={
                        <ProtectedRoute>
                          <OnboardingGuard>
                            {React.createElement(React.lazy(() => import('./components/security/AuditLogDashboard')))}
                          </OnboardingGuard>
                        </ProtectedRoute>
                      } />
                      
                      {/* Catch-all route for 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppTransitions>
                </TouchGestureHandler>
              </DeepLinkHandler>
              <PWAInstallPrompt />
            </BrowserRouter>
          </EnhancedErrorBoundary>
        </NavigationStateProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
