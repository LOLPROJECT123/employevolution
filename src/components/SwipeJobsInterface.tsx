
import { useState, useEffect } from 'react';
import { Job } from "@/types/job";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Check, Building2, MapPin, Briefcase, DollarSign } from "lucide-react";
import { motion, PanInfo } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface SwipeJobsInterfaceProps {
  jobs: Job[];
  onApply: (job: Job) => void;
  onSkip: (job: Job) => void;
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
    toast({
      title: "Applied Successfully!",
      description: `Your Application To ${currentJob.company} For ${currentJob.title} Has Been Submitted.`,
      variant: "default",
    });
    onApply(currentJob);
  };

  const handleSkip = () => {
    // Display info message and call the onSkip callback
    toast({
      title: "Job Skipped",
      description: `You Skipped ${currentJob.title} At ${currentJob.company}`,
      variant: "default",
    });
    onSkip(currentJob);
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

  const formattedSalary = `${currentJob.salary.currency}${currentJob.salary.min.toLocaleString()} - ${currentJob.salary.currency}${currentJob.salary.max.toLocaleString()}`;

  // Swipe direction animation values
  const xPosition = direction === "left" ? -1000 : direction === "right" ? 1000 : 0;

  return (
    <div className="w-full max-w-md mx-auto pb-8">
      {/* Job Count Display Section - Added above the swipe instructions */}
      <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold">Found {jobs.length} Matching Jobs</h3>
        <p className="text-sm text-muted-foreground">Displaying Jobs That Match Your Search Criteria.</p>
      </div>
      
      <h3 className="text-xl font-semibold mb-4 text-center">
        Swipe Right To Apply, Left To Skip
      </h3>
      
      <motion.div
        className="relative"
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={{ x: xPosition }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 h-[calc(100vh-250px)] flex flex-col">
          <CardContent className="flex-1 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">{currentJob.title}</h2>
              <div className="flex items-center text-muted-foreground">
                <Building2 className="w-4 h-4 mr-2" />
                <span>{currentJob.company}</span>
              </div>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{currentJob.location}</span>
              </div>
              <div className="flex items-center text-muted-foreground mt-1">
                <Briefcase className="w-4 h-4 mr-2" />
                <span className="capitalize">{currentJob.level} • {currentJob.type}</span>
              </div>
              <div className="flex items-center text-muted-foreground mt-1">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>{formattedSalary}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">About This Role</h3>
              <p className="text-muted-foreground">
                {currentJob.description.substring(0, 200)}...
              </p>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {currentJob.skills.slice(0, 5).map((skill, index) => (
                    <div key={index} className="px-3 py-1 rounded-full bg-secondary/70 text-sm capitalize">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4 pb-4">
            <div className="flex justify-between w-full">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full h-16 w-16 bg-red-100 hover:bg-red-200 border-none"
                onClick={() => handleSwipe("left")}
              >
                <X className="h-8 w-8 text-red-500" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full h-16 w-16 bg-green-100 hover:bg-green-200 border-none"
                onClick={() => handleSwipe("right")}
              >
                <Check className="h-8 w-8 text-green-500" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      <div className="text-center mt-4 text-muted-foreground">
        Job {currentIndex + 1} Of {jobs.length}
      </div>
    </div>
  );
};

export default SwipeJobsInterface;
