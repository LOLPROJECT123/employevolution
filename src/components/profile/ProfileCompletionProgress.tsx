
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, AlertCircle, Shield, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ProfileCompletionProgress as ProgressType } from '@/services/enhancedProfileCompletionService';

interface ProfileCompletionProgressProps {
  progress: ProgressType;
  currentTab?: string;
}

const ProfileCompletionProgress = ({ progress, currentTab }: ProfileCompletionProgressProps) => {
  const { theme } = useTheme();

  const sections = [
    { 
      key: 'contact', 
      label: 'Contact Information', 
      data: progress.sections.contact,
      tabValue: 'contact'
    },
    { 
      key: 'experience', 
      label: 'Experience & Education', 
      data: progress.sections.experience,
      tabValue: 'experience'
    },
    { 
      key: 'skills', 
      label: 'Skills & Languages', 
      data: progress.sections.skills,
      tabValue: 'skills'
    },
    { 
      key: 'preferences', 
      label: 'Job Preferences', 
      data: progress.sections.preferences,
      tabValue: 'preferences'
    },
    { 
      key: 'equalEmployment', 
      label: 'Equal Employment', 
      data: progress.sections.equalEmployment,
      tabValue: 'employment'
    },
    { 
      key: 'settings', 
      label: 'Settings', 
      data: progress.sections.settings,
      tabValue: 'settings'
    }
  ];

  return (
    <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} mb-6`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Profile Completion</h3>
            <span className="text-sm font-medium">
              {progress.sectionsComplete}/{progress.totalSections} sections complete
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress value={progress.overallPercentage} className="h-3" />
            <p className="text-sm text-gray-500">
              {progress.overallPercentage}% complete
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {sections.map((section) => (
              <div
                key={section.key}
                className={`p-3 rounded-lg border ${
                  currentTab === section.tabValue
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : theme === 'dark'
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {section.data.complete ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : section.data.percentage > 0 ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  {section.key === 'equalEmployment' && <Shield className="h-4 w-4 text-blue-400" />}
                  {section.key === 'settings' && <Settings className="h-4 w-4 text-blue-400" />}
                  <span className="font-medium text-sm">{section.label}</span>
                </div>
                
                {section.data.complete ? (
                  <p className="text-xs text-green-600 dark:text-green-400">Complete</p>
                ) : (
                  <div className="space-y-1">
                    <Progress value={section.data.percentage} className="h-2" />
                    <p className="text-xs text-gray-500">
                      Missing: {section.data.missingFields.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!progress.canCompleteProfile && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Complete all sections to access other features
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionProgress;
