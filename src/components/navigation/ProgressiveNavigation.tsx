
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  path: string;
  isCompleted: boolean;
  isRequired: boolean;
  estimatedTime?: string;
}

interface ProgressiveNavigationProps {
  workflowId: string;
  steps: WorkflowStep[];
  onStepComplete: (stepId: string) => void;
  onWorkflowComplete: () => void;
}

export const ProgressiveNavigation: React.FC<ProgressiveNavigationProps> = ({
  workflowId,
  steps,
  onStepComplete,
  onWorkflowComplete
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Find current step based on location
  useEffect(() => {
    const currentIndex = steps.findIndex(step => step.path === location.pathname);
    if (currentIndex !== -1) {
      setCurrentStepIndex(currentIndex);
    }
  }, [location.pathname, steps]);

  // Check if workflow is complete
  useEffect(() => {
    const requiredSteps = steps.filter(step => step.isRequired);
    const completedRequiredSteps = requiredSteps.filter(step => step.isCompleted);
    
    if (requiredSteps.length > 0 && completedRequiredSteps.length === requiredSteps.length) {
      onWorkflowComplete();
    }
  }, [steps, onWorkflowComplete]);

  const currentStep = steps[currentStepIndex];
  const completedSteps = steps.filter(step => step.isCompleted).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const canGoPrevious = currentStepIndex > 0;
  const canGoNext = currentStepIndex < steps.length - 1;
  const nextStep = canGoNext ? steps[currentStepIndex + 1] : null;
  const previousStep = canGoPrevious ? steps[currentStepIndex - 1] : null;

  const handleStepClick = (step: WorkflowStep, index: number) => {
    // Only allow navigation to completed steps or the next uncompleted step
    const canNavigate = step.isCompleted || index <= getNextAvailableStepIndex();
    
    if (canNavigate) {
      navigate(step.path);
    }
  };

  const getNextAvailableStepIndex = (): number => {
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].isCompleted) {
        return i;
      }
    }
    return steps.length - 1;
  };

  const markCurrentStepComplete = () => {
    if (currentStep && !currentStep.isCompleted) {
      onStepComplete(currentStep.id);
    }
  };

  const navigateToNext = () => {
    if (nextStep) {
      navigate(nextStep.path);
    }
  };

  const navigateToPrevious = () => {
    if (previousStep) {
      navigate(previousStep.path);
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        Show Progress
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Workflow Progress</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedSteps} of {totalSteps} completed</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Current Step Info */}
        {currentStep && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start space-x-2">
              {currentStep.isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-primary mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-sm">{currentStep.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentStep.description}
                </p>
                {currentStep.estimatedTime && (
                  <Badge variant="secondary" className="text-xs mt-2">
                    ~{currentStep.estimatedTime}
                  </Badge>
                )}
              </div>
            </div>
            
            {!currentStep.isCompleted && (
              <Button
                size="sm"
                onClick={markCurrentStepComplete}
                className="w-full mt-3"
              >
                Mark Complete
              </Button>
            )}
          </div>
        )}

        {/* Step List */}
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const canNavigate = step.isCompleted || index <= getNextAvailableStepIndex();
            
            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step, index)}
                disabled={!canNavigate}
                className={`w-full flex items-center space-x-2 p-2 rounded text-left transition-colors ${
                  isActive 
                    ? 'bg-primary/10 border border-primary/30' 
                    : canNavigate
                      ? 'hover:bg-muted/50'
                      : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {step.isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium">{step.title}</div>
                  {step.isRequired && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToPrevious}
            disabled={!canGoPrevious}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            size="sm"
            onClick={navigateToNext}
            disabled={!canGoNext}
            className="flex-1"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressiveNavigation;
