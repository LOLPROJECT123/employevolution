
"use client"

import { OnboardingStep } from '@/types/dashboard';
import ProgressTracker from '../layout/ProgressTracker';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  currentStepIndex: number;
  onCompleteStep: (stepId: string) => void;
}

const OnboardingFlow = ({ steps, currentStepIndex, onCompleteStep }: OnboardingFlowProps) => {
  const completedSteps = steps.filter(step => step.isCompleted).length;
  
  return (
    <Card className="mb-8">
      <CardHeader className="pb-0">
        <CardTitle>Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ProgressTracker 
          currentStep={completedSteps} 
          totalSteps={steps.length} 
          label="Profile completion" 
        />

        <div className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50"
            >
              <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center ${
                step.isCompleted 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{step.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                {!step.isCompleted && (
                  <Button 
                    size="sm" 
                    variant={index === currentStepIndex ? "default" : "outline"}
                    onClick={() => onCompleteStep(step.id)}
                  >
                    {index === currentStepIndex ? 'Complete This Step' : 'Start'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="font-medium">Profile progress</p>
            <p className="text-sm text-muted-foreground">
              {completedSteps}/{steps.length} steps completed
            </p>
          </div>
          <div className="text-primary font-medium">
            {Math.round((completedSteps / steps.length) * 100)}% complete
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingFlow;
