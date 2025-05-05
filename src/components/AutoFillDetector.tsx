
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';

interface AutoFillDetectorProps {
  onToggleAutofill: (enabled: boolean) => void;
}

const AutoFillDetector: React.FC<AutoFillDetectorProps> = ({ onToggleAutofill }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  
  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    onToggleAutofill(checked);
  };
  
  return (
    <Card className="p-4 flex justify-between items-center bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
      <div className="flex items-center gap-2">
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
          <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 className="font-medium text-sm">Auto-Fill Application</h4>
          <p className="text-xs text-muted-foreground">
            Automatically fill out job applications with your profile data
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="auto-fill" className="sr-only">
          Enable Auto-Fill
        </Label>
        <Switch
          id="auto-fill"
          checked={isEnabled}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>
    </Card>
  );
};

export default AutoFillDetector;
