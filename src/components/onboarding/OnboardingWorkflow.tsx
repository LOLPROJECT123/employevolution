
import React, { useState } from 'react';
import { ProgressiveNavigation } from '@/components/navigation/ProgressiveNavigation';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  path: string;
  isCompleted: boolean;
  isRequired: boolean;
  estimatedTime?: string;
}

export const OnboardingWorkflow: React.FC = () => {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'profile-setup',
      title: 'Complete Profile',
      description: 'Add your basic information and preferences',
      path: '/complete-profile',
      isCompleted: false,
      isRequired: true,
      estimatedTime: '5 mins'
    },
    {
      id: 'resume-upload',
      title: 'Upload Resume',
      description: 'Upload or create your resume',
      path: '/resume-tools',
      isCompleted: false,
      isRequired: true,
      estimatedTime: '3 mins'
    },
    {
      id: 'job-preferences',
      title: 'Set Job Preferences',
      description: 'Define your ideal job criteria',
      path: '/jobs',
      isCompleted: false,
      isRequired: true,
      estimatedTime: '2 mins'
    },
    {
      id: 'interview-practice',
      title: 'Try Interview Practice',
      description: 'Practice common interview questions',
      path: '/interview-practice',
      isCompleted: false,
      isRequired: false,
      estimatedTime: '10 mins'
    }
  ]);

  const handleStepComplete = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, isCompleted: true } : step
    ));
  };

  const handleWorkflowComplete = () => {
    console.log('Onboarding workflow completed!');
    // Redirect to dashboard or show completion message
  };

  return (
    <ProgressiveNavigation
      workflowId="onboarding"
      steps={steps}
      onStepComplete={handleStepComplete}
      onWorkflowComplete={handleWorkflowComplete}
    />
  );
};

export default OnboardingWorkflow;
