import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { JobApplicationProvider } from "@/contexts/JobApplicationContext";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import ResumeTools from "./pages/ResumeTools";
import Networking from "./pages/Networking";
import Dashboard from "./pages/Dashboard";
import InterviewPractice from "./pages/InterviewPractice";
import Referrals from "./pages/Referrals";
import SalaryNegotiations from "./pages/SalaryNegotiations";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Calendar from "./pages/Calendar";
import Communications from "./pages/Communications";
import SecurityMiddleware from "@/components/security/SecurityMiddleware";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <JobApplicationProvider>
            <SecurityMiddleware>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Jobs />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/resume-tools" element={<ResumeTools />} />
                  <Route path="/resume-tools/:tab" element={<ResumeTools />} />
                  <Route path="/networking" element={<Networking />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/communications" element={<Communications />} />
                  <Route path="/interview-practice" element={<InterviewPractice />} />
                  <Route path="/referrals" element={<Referrals />} />
                  <Route path="/salary-negotiations" element={<SalaryNegotiations />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/auth" element={<Auth />} />
                </Routes>
              </BrowserRouter>
            </SecurityMiddleware>
          </JobApplicationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
