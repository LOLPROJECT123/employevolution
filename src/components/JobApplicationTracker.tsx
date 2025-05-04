
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Briefcase,
  Calendar,
  ChevronRight,
  MessageSquare,
  X,
  CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Job, JobApplicationStatus } from "@/types/job";
import { ExtendedJob } from "@/types/jobExtensions";
import { updateApplicationStatus } from "@/utils/syncUtils";
import { toast } from "sonner";

interface JobApplicationTrackerProps {
  job: ExtendedJob;
  onStatusChange?: (jobId: string, status: JobApplicationStatus) => void;
}

interface ApplicationStage {
  id: JobApplicationStatus;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const JobApplicationTracker: React.FC<JobApplicationTrackerProps> = ({
  job,
  onStatusChange
}) => {
  const [currentStatus, setCurrentStatus] = useState<JobApplicationStatus>(job.status || 'saved');
  const [updating, setUpdating] = useState<boolean>(false);
  
  const applicationStages: ApplicationStage[] = [
    {
      id: 'saved',
      name: 'Saved',
      icon: <Briefcase className="h-4 w-4" />,
      description: 'Job saved to review'
    },
    {
      id: 'applied',
      name: 'Applied',
      icon: <CheckSquare className="h-4 w-4" />,
      description: 'Application submitted'
    },
    {
      id: 'interviewing',
      name: 'Interviewing',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Interview scheduled'
    },
    {
      id: 'offered',
      name: 'Offered',
      icon: <MessageSquare className="h-4 w-4" />,
      description: 'Offer received'
    },
    {
      id: 'accepted',
      name: 'Accepted',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Offer accepted'
    },
    {
      id: 'rejected',
      name: 'Rejected',
      icon: <X className="h-4 w-4" />,
      description: 'Application rejected'
    }
  ];
  
  const stageToProgress = (stage: JobApplicationStatus): number => {
    switch(stage) {
      case 'saved': return 0;
      case 'applied': return 25;
      case 'interviewing':
      case 'interview': return 50;
      case 'offered':
      case 'offer': return 75;
      case 'accepted': return 100;
      case 'rejected': return 0;
      default: return 0;
    }
  };
  
  const getStatusColor = (status: JobApplicationStatus): string => {
    switch(status) {
      case 'saved': return 'bg-blue-500';
      case 'applied': return 'bg-purple-500';
      case 'interviewing':
      case 'interview': return 'bg-orange-500';
      case 'offered':
      case 'offer': return 'bg-amber-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };
  
  const getStatusBadgeClass = (status: JobApplicationStatus): string => {
    switch(status) {
      case 'saved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'applied': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'interviewing':
      case 'interview': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'offered':
      case 'offer': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  const updateStatus = async (newStatus: JobApplicationStatus) => {
    if (newStatus === currentStatus) return;
    
    setUpdating(true);
    
    try {
      // Update in Chrome extension (if available)
      const extensionUpdated = await updateApplicationStatus(job.id, newStatus);
      
      // Update locally regardless of extension status
      setCurrentStatus(newStatus);
      
      if (onStatusChange) {
        onStatusChange(job.id, newStatus);
      }
      
      toast.success(`Application status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update application status");
      console.error("Error updating application status:", error);
    } finally {
      setUpdating(false);
    }
  };
  
  const isActiveStatus = (status: JobApplicationStatus): boolean => {
    return status === currentStatus;
  };
  
  const isTerminalStatus = (status: JobApplicationStatus): boolean => {
    return status === 'accepted' || status === 'rejected';
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-gray-200">Application Progress</h3>
        <Badge className={getStatusBadgeClass(currentStatus)}>
          {applicationStages.find(s => s.id === currentStatus)?.name}
        </Badge>
      </div>
      
      {currentStatus !== 'rejected' && (
        <div className="space-y-1">
          <Progress 
            value={stageToProgress(currentStatus)} 
            className="h-2" 
            // Fix: using className for the indicator instead of indicatorClassName
            className={`h-2 ${getStatusColor(currentStatus)}`}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Saved</span>
            <span>Applied</span>
            <span>Interview</span>
            <span>Offer</span>
            <span>Accepted</span>
          </div>
        </div>
      )}
      
      <div className="grid gap-2 mt-4">
        {applicationStages
          .filter(stage => stage.id !== currentStatus)
          .filter(stage => !isTerminalStatus(currentStatus) || stage.id === 'saved')
          .map((stage) => (
            <Button
              key={stage.id}
              variant={isActiveStatus(stage.id) ? "default" : "outline"}
              size="sm"
              className="justify-start gap-2"
              disabled={updating || (isTerminalStatus(currentStatus) && stage.id !== 'saved')}
              onClick={() => updateStatus(stage.id)}
            >
              <div className="flex-1 flex items-center">
                {stage.icon}
                <span className="ml-2">{stage.name}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </Button>
          ))}
      </div>
      
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
        <Clock className="h-3 w-3" />
        <span>
          {currentStatus !== 'saved' 
            ? `Applied ${job.appliedAt ? new Date(job.appliedAt).toLocaleDateString() : 'recently'}`
            : 'Not applied yet'}
        </span>
      </div>
    </Card>
  );
};

export default JobApplicationTracker;
