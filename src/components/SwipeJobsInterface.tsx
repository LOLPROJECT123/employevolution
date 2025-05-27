
import { useState } from 'react';
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, DollarSign, Building } from "lucide-react";

interface SwipeJobsInterfaceProps {
  jobs: Job[];
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  onReject: (job: Job) => void;
}

const SwipeJobsInterface = ({ jobs, onApply, onSave, onReject }: SwipeJobsInterfaceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!jobs.length) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-gray-500">No jobs available</p>
      </div>
    );
  }

  const currentJob = jobs[currentIndex];

  const handleNext = () => {
    if (currentIndex < jobs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleApply = () => {
    onApply(currentJob);
    handleNext();
  };

  const handleSave = () => {
    onSave(currentJob);
    handleNext();
  };

  const handleReject = () => {
    onReject(currentJob);
    handleNext();
  };

  if (!currentJob) return null;

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              {currentJob.company.substring(0, 2).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold">{currentJob.title}</h2>
            <p className="text-lg text-gray-600">{currentJob.company}</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{currentJob.location}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>${currentJob.salary.min.toLocaleString()} - ${currentJob.salary.max.toLocaleString()}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{currentJob.type}</Badge>
              <Badge variant="secondary">{currentJob.level}</Badge>
              {currentJob.remote && <Badge variant="outline">Remote</Badge>}
            </div>
            
            <p className="text-sm text-gray-700 line-clamp-3">
              {currentJob.description}
            </p>
            
            {currentJob.matchPercentage && (
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800">
                  {currentJob.matchPercentage}% Match
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center space-x-4 pt-6">
        <Button
          variant="outline"
          size="lg"
          onClick={handleReject}
          className="w-16 h-16 rounded-full border-red-200 text-red-600 hover:bg-red-50"
        >
          <X className="w-6 h-6" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleSave}
          className="w-16 h-16 rounded-full border-yellow-200 text-yellow-600 hover:bg-yellow-50"
        >
          <Heart className="w-6 h-6" />
        </Button>
        
        <Button
          size="lg"
          onClick={handleApply}
          className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700"
        >
          ✓
        </Button>
      </div>
      
      <div className="text-center pt-4">
        <p className="text-sm text-gray-500">
          {currentIndex + 1} of {jobs.length}
        </p>
      </div>
    </div>
  );
};

export default SwipeJobsInterface;
