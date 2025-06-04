
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Edit, Camera } from 'lucide-react';

interface ModernProfileHeaderProps {
  name: string;
  email: string;
  jobStatus: string;
  completionPercentage: number;
  showToRecruiters: boolean;
  onToggleShowToRecruiters: (value: boolean) => void;
  onToggleJobSearch: (value: boolean) => void;
  jobSearchActive: boolean;
}

const ModernProfileHeader = ({
  name,
  email,
  jobStatus,
  completionPercentage,
  showToRecruiters,
  onToggleShowToRecruiters,
  onToggleJobSearch,
  jobSearchActive
}: ModernProfileHeaderProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actively looking':
        return 'bg-green-500';
      case 'Open to opportunities':
        return 'bg-blue-500';
      case 'Not looking':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-blue-500">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-600 text-white text-xl font-semibold">
                  {getInitials(name || 'User')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold">{name || 'Complete Your Profile'}</h1>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-400">{email}</p>
              <Badge className={`${getStatusColor(jobStatus)} text-white`}>
                {jobStatus || 'Set Job Status'}
              </Badge>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-300">Show profile to recruiters</span>
              <Switch
                checked={showToRecruiters}
                onCheckedChange={onToggleShowToRecruiters}
              />
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-300">Job search status</span>
              <Switch
                checked={jobSearchActive}
                onCheckedChange={onToggleJobSearch}
              />
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Profile Completion</span>
            <span className="text-sm font-semibold text-blue-400">{completionPercentage}%</span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-2 bg-gray-800"
          />
          {completionPercentage < 100 && (
            <p className="text-xs text-gray-400">
              Complete your profile to increase visibility to recruiters
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernProfileHeader;
