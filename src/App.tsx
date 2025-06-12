
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import EnhancedCompleteProfile from './pages/EnhancedCompleteProfile';
import ResumeTools from './pages/ResumeTools';
import InterviewPractice from './pages/InterviewPractice';
import SalaryNegotiations from './pages/SalaryNegotiations';
import Networking from './pages/Networking';
import NetworkingTools from './pages/NetworkingTools';
import JobAlerts from './pages/JobAlerts';
import Calendar from './pages/Calendar';
import Communications from './pages/Communications';
import Referrals from './pages/Referrals';
import LeetcodePatterns from './pages/LeetcodePatterns';
import MobileJobs from './pages/MobileJobs';
import NotFound from './pages/NotFound';
import ResumePost from './pages/ResumePost';
import { ProfileCompletionGuard } from './components/auth/ProfileCompletionGuard';
import { OnboardingGuard } from './components/auth/OnboardingGuard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useMobile } from './hooks/use-mobile';

function App() {
  const isMobile = useMobile();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
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
        <Route path="/profile" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <Profile />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <Dashboard />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/jobs" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                {isMobile ? <MobileJobs /> : <Jobs />}
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/applications" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <Applications />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/resume-tools" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <ResumeTools />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/resume-tools/:tab" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <ResumeTools />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/interview-practice" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <InterviewPractice />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/salary-negotiations" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <SalaryNegotiations />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/networking" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <Networking />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/networking-tools" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <NetworkingTools />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/job-alerts" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <JobAlerts />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <Calendar />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/communications" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <Communications />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/referrals" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <Referrals />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/leetcode-patterns" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <LeetcodePatterns />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="/resume-post" element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfileCompletionGuard>
                <ResumePost />
              </ProfileCompletionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
