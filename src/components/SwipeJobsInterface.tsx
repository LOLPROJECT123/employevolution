
import { useState, useEffect } from 'react';
import { Job } from "@/types/job";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Check, Building2, MapPin, Briefcase, DollarSign, Clock, Zap } from "lucide-react";
import { motion, PanInfo } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/utils/dateUtils";
import { Badge } from "@/components/ui/badge";

interface SwipeJobsInterfaceProps {
  jobs: Job[];
  onApply: (job: Job) => void;
  onSkip: () => void;
  onSave: (job: Job) => void; // Add missing onSave prop
  onClose: () => void; // Add missing onClose prop
}

const SwipeJobsInterface = ({ jobs, onApply, onSkip }: SwipeJobsInterfaceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const currentJob = jobs[currentIndex];

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleSwipe("right");
    } else if (info.offset.x < -100) {
      handleSwipe("left");
    }
  };

  const handleSwipe = (dir: "left" | "right") => {
    setDirection(dir);
    
    if (dir === "right") {
      // Apply to the job when swiped right
      handleApply();
    } else {
      // Skip the job when swiped left
      handleSkip();
    }
    
    // Reset and move to next job
    setTimeout(() => {
      setDirection(null);
      if (currentIndex < jobs.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast({
          title: "You've Reviewed All Available Jobs",
          description: "Check Back Later For More Opportunities",
        });
      }
    }, 300);
  };

  const handleApply = () => {
    // Display success message and call the onApply callback
    if (!currentJob) return;
    
    toast({
      title: "Applied Successfully!",
      description: `Your Application To ${currentJob.company} For ${currentJob.title} Has Been Submitted.`,
      variant: "default",
    });
    onApply(currentJob);
  };

  const handleSkip = () => {
    // Display info message and call the onSkip callback
    if (!currentJob) return;
    
    toast({
      title: "Job Skipped",
      description: `You Skipped ${currentJob.title} At ${currentJob.company}`,
      variant: "default",
    });
    onSkip(); // Call the onSkip function without arguments
  };

  if (!currentJob) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No More Jobs</h3>
        <p className="text-muted-foreground text-center">
          You've Gone Through All The Available Jobs. Check Back Later For New Opportunities.
        </p>
      </div>
    );
  }

  // Safely format the postedAt field
  const timeAgo = currentJob.postedAt ? formatRelativeTime(currentJob.postedAt) : 'Recently';
  
  const formattedSalary = `${currentJob.salary.currency}${currentJob.salary.min.toLocaleString()} - ${currentJob.salary.currency}${currentJob.salary.max.toLocaleString()}`;

  // Get match color based on percentage
  const getMatchColor = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getMatchBgColor = (percentage?: number) => {
    if (!percentage) return "bg-gray-100 dark:bg-gray-800";
    if (percentage >= 70) return "bg-green-50 dark:bg-green-900/30";
    if (percentage >= 50) return "bg-amber-50 dark:bg-amber-900/30";
    return "bg-red-50 dark:bg-red-900/30";
  };

  // Swipe direction animation values
  const xPosition = direction === "left" ? -1000 : direction === "right" ? 1000 : 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-lg font-medium mb-3 text-center">
        Swipe Right To Apply, Left To Skip
      </p>
      
      <motion.div
        className="relative"
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={{ x: xPosition }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700 shadow-md rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">{currentJob.title}</h2>
              
              <div className="flex items-start justify-between mt-3">
                {/* Company Info with flex-col */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{currentJob.company}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{currentJob.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm capitalize">{currentJob.level} • {currentJob.type}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{formattedSalary}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Posted {timeAgo}</span>
                  </div>
                </div>
                
                {/* Match Percentage Badge - Positioned to the right of company info */}
                {currentJob.matchPercentage !== undefined && (
                  <div className="ml-2 flex-shrink-0">
                    <Badge variant="outline" className={`flex items-center px-3 py-2 ${getMatchBgColor(currentJob.matchPercentage)} ${getMatchColor(currentJob.matchPercentage)} text-base font-medium rounded-md`}>
                      {currentJob.matchPercentage}% Match
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4 mb-4">
              <div>
                <h3 className="text-lg font-medium mb-2">About This Role</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentJob.description}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {currentJob.skills.slice(0, 5).map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm capitalize"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Apply button */}
            <Button 
              className="w-full py-6 text-base font-medium shadow-md rounded-lg bg-blue-600 hover:bg-blue-700"
              size="lg"
              onClick={handleApply}
            >
              <Zap className="w-5 h-5 mr-2" />
              Apply Now
            </Button>
          </CardContent>
          
          <CardFooter className="border-t pt-3 pb-3 flex justify-center">
            <div className="flex justify-between w-full max-w-[200px]">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full h-12 w-12 bg-red-50 hover:bg-red-100 border border-red-100 shadow-sm"
                onClick={() => handleSwipe("left")}
              >
                <X className="h-6 w-6 text-red-500" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full h-12 w-12 bg-green-50 hover:bg-green-100 border border-green-100 shadow-sm"
                onClick={() => handleSwipe("right")}
              >
                <Check className="h-6 w-6 text-green-500" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      <div className="text-center mt-4 text-sm text-gray-500">
        Job {currentIndex + 1} of {jobs.length}
      </div>
    </div>
  );
};

export default SwipeJobsInterface;
