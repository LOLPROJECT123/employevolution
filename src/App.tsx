
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { JobApplicationProvider } from "./contexts/JobApplicationContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProfileCompletionGuard from "./components/auth/ProfileCompletionGuard";
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
import PWAInstallPrompt from "./components/PWAInstallPrompt";

// Create QueryClient instance outside of component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <JobApplicationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes - accessible without authentication */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Profile route - protected but not requiring profile completion */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Protected routes - require authentication AND profile completion */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <Dashboard />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/jobs" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <Jobs />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/applications" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <Applications />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/interview-practice" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <InterviewPractice />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/resume-tools" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <ResumeTools />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/resume-tools/:tab" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <ResumeTools />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/networking" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <Networking />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/networking-tools" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <NetworkingTools />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/referrals" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <Referrals />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/salary-negotiations" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <SalaryNegotiations />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/job-alerts" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <JobAlerts />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                
                {/* Redirect old profile completion route to new profile page */}
                <Route path="/complete-profile" element={
                  <ProtectedRoute>
                    <Navigate to="/profile" replace />
                  </ProtectedRoute>
                } />
              </Routes>
              <PWAInstallPrompt />
            </BrowserRouter>
          </JobApplicationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
