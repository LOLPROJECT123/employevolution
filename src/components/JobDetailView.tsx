
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
import { useUserSkills } from '@/hooks/useUserSkills';
import { unifiedSkillsMatchingService } from '@/services/unifiedSkillsMatchingService';

interface JobDetailViewProps {
  job: Job | null;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
}

export const JobDetailView = ({ job, onApply, onSave }: JobDetailViewProps) => {
  const { userProfile } = useAuth();
  const { skills: userSkills, loading: skillsLoading } = useUserSkills();

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

  // Calculate match score using actual user skills for detailed analysis
  const calculateMatchScore = () => {
    if (skillsLoading) {
      return {
        overall: job.matchPercentage || 0,
        skills: job.matchPercentage || 0,
        experience: true,
        education: true,
        location: true,
        missingSkills: [],
        matchingSkills: []
      };
    }

    const jobSkills = job.skills || [];
    const skillsMatch = unifiedSkillsMatchingService.calculateSkillsMatch(jobSkills, userSkills);
    
    return {
      overall: skillsMatch.matchPercentage,
      skills: skillsMatch.matchPercentage,
      experience: skillsMatch.matchPercentage > 60,
      education: skillsMatch.matchPercentage > 50,
      location: !job.remote ? job.location.toLowerCase().includes('austin') : true,
      missingSkills: skillsMatch.missingSkills,
      matchingSkills: skillsMatch.matchingSkills
    };
  };

  const matchScore = calculateMatchScore();

  // Create a user object with real skills for JobMatchAnalysis compatibility
  const userWithRealSkills = userProfile ? {
    id: userProfile.id || '',
    email: userProfile.full_name || '',
    name: userProfile.full_name || '',
    profile: {
      skills: userSkills,
      experience: 'entry' as const,
      location: '',
      salary_range: { min: 0, max: 0 },
      preferences: {
        remote: false,
        job_types: [],
        industries: []
      }
    },
    created_at: new Date().toISOString()
  } : null;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <JobMatchAnalysis 
          job={job}
          userProfile={userWithRealSkills}
          matchScore={matchScore}
        />
      </div>
    </ScrollArea>
  );
};
