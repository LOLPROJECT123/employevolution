
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
import Auth from "./pages/Auth";
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
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/interview-practice" element={<InterviewPractice />} />
            <Route path="/resume-tools" element={<ResumeTools />} />
            <Route path="/resume-tools/:tab" element={<ResumeTools />} />
            <Route path="/networking" element={<Networking />} />
            <Route path="/networking-tools" element={<NetworkingTools />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/salary-negotiations" element={<SalaryNegotiations />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
          <PWAInstallPrompt />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
