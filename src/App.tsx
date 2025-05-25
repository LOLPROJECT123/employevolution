
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { JobApplicationProvider } from "@/contexts/JobApplicationContext";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobAutomation from "./pages/JobAutomation";
import ResumePost from "./pages/ResumePost";
import Networking from "./pages/Networking";
import Dashboard from "./pages/Dashboard";
import ResumeTools from "./pages/ResumeTools";
import InterviewPractice from "./pages/InterviewPractice";
import Referrals from "./pages/Referrals";
import SalaryNegotiations from "./pages/SalaryNegotiations";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <JobApplicationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/job-automation" element={<JobAutomation />} />
                <Route path="/resume-post" element={<ResumePost />} />
                <Route path="/networking" element={<Networking />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/resume-tools" element={<ResumeTools />} />
                <Route path="/resume-tools/:tab" element={<ResumeTools />} />
                <Route path="/interview-practice" element={<InterviewPractice />} />
                <Route path="/referrals" element={<Referrals />} />
                <Route path="/salary-negotiations" element={<SalaryNegotiations />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth" element={<Auth />} />
              </Routes>
            </BrowserRouter>
          </JobApplicationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
