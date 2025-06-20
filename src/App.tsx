
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { appInitializationService } from "@/services/appInitializationService";
import Index from "@/pages/Index";

function App() {
  useEffect(() => {
    // Initialize the application services
    appInitializationService.initialize();
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route index element={<Index />} />
      </Routes>
    </TooltipProvider>
  );
}

export default App;
