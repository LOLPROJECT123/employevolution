
import React from 'react';
import { Job } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Users, 
  ExternalLink,
  Heart,
  Briefcase,
  GraduationCap,
  CheckCircle
} from 'lucide-react';
import { JobMatchAnalysis } from '@/components/jobs/JobMatchAnalysis';
import { useAuth } from '@/hooks/useAuth';

interface JobDetailViewProps {
  job: Job | null;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
}

export const JobDetailView = ({ job, onApply, onSave }: JobDetailViewProps) => {
  const { userProfile } = useAuth();

  if (!job) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Selected</h3>
          <p className="text-gray-500">Select a job from the list to view details</p>
        </div>
      </div>
    );
  }

  // Calculate mock match score based on job data
  const calculateMatchScore = () => {
    // Create a mock user profile structure for compatibility
    const mockUserProfile = {
      profile: {
        skills: [] as string[]
      }
    };
    
    const userSkills = mockUserProfile.profile?.skills || [];
    const jobSkills = job.skills || [];
    
    const matchingSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    const missingSkills = jobSkills.filter(skill => 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    const skillsPercentage = jobSkills.length > 0 
      ? Math.round((matchingSkills.length / jobSkills.length) * 100)
      : 100;

    return {
      overall: job.matchPercentage || skillsPercentage,
      skills: skillsPercentage,
      experience: skillsPercentage > 60,
      education: skillsPercentage > 50,
      location: !job.remote ? job.location.toLowerCase().includes('austin') : true,
      missingSkills: missingSkills.slice(0, 6),
      matchingSkills: matchingSkills.slice(0, 8)
    };
  };

  const matchScore = calculateMatchScore();

  const formatSalary = (salary: Job['salary']) => {
    if (!salary || salary.min === 0) return 'Not specified';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    if (salary.min === salary.max) {
      return formatter.format(salary.min);
    }
    
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <JobMatchAnalysis 
          job={job}
          userProfile={userProfile}
          matchScore={matchScore}
        />
      </div>
    </ScrollArea>
  );
};
