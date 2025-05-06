
"use client"

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WelcomeBanner from '@/components/features/WelcomeBanner';
import StreakCard from '@/components/features/StreakCard';
import FeatureCards from '@/components/features/FeatureCards';
import OnboardingFlow from '@/components/features/OnboardingFlow';
import MatchesSection from '@/components/features/MatchesSection';
import { OnboardingStep, Match } from '@/types/dashboard';
import { toast } from 'sonner';

const DashboardHome = () => {
  // Mock data - in a real app this would come from API
  const [user] = useState({
    name: "Jessica",
    streak: 3,
    isAllStar: false
  });

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add your personal information and work history.',
      isCompleted: true
    },
    {
      id: 'resume',
      title: 'Upload your resume',
      description: 'Upload your resume to help us match you with the right jobs.',
      isCompleted: true
    },
    {
      id: 'preferences',
      title: 'Set your job preferences',
      description: 'Tell us what kind of jobs you're looking for.',
      isCompleted: true
    },
    {
      id: 'skills',
      title: 'Add your skills',
      description: 'List your skills to improve job matching.',
      isCompleted: true
    },
    {
      id: 'connect',
      title: 'Connect social profiles',
      description: 'Link your LinkedIn or GitHub to enhance your profile.',
      isCompleted: true
    },
    {
      id: 'alerts',
      title: 'Set up job alerts',
      description: 'Get notified when new matching jobs are posted.',
      isCompleted: false
    }
  ]);

  const [matches] = useState<Match[]>([
    {
      id: '1',
      title: 'Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      matchPercentage: 92
    },
    {
      id: '2',
      title: 'Frontend Developer',
      company: 'UX Solutions',
      location: 'Remote',
      matchPercentage: 88
    },
    {
      id: '3',
      title: 'Full Stack Developer',
      company: 'Startup Inc.',
      location: 'Austin, TX',
      matchPercentage: 76
    }
  ]);

  const handleCompleteStep = (stepId: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, isCompleted: true } : step
    ));
    toast.success('Step completed!');
  };

  const currentStepIndex = steps.findIndex(step => !step.isCompleted);

  return (
    <DashboardLayout>
      <WelcomeBanner userName={user.name} />
      
      <StreakCard daysStreak={user.streak} isAllStar={user.isAllStar} />
      
      <div className="my-8">
        <h2 className="text-xl font-semibold mb-4">Explore Features</h2>
        <FeatureCards />
      </div>
      
      <MatchesSection matches={matches} />
      
      <OnboardingFlow 
        steps={steps}
        currentStepIndex={currentStepIndex}
        onCompleteStep={handleCompleteStep}
      />
    </DashboardLayout>
  );
};

export default DashboardHome;
