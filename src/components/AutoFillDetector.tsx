
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { getUserProfile } from "@/utils/profileUtils";
import { 
  isExtensionAvailable,
  getExtensionSettings
} from "@/utils/syncUtils";
import { AlertCircle, CheckCircle, ChevronRight } from "lucide-react";

interface AutoFillDetectorProps {
  onToggleAutofill?: (enabled: boolean) => void;
}

const AutoFillDetector: React.FC<AutoFillDetectorProps> = ({ 
  onToggleAutofill 
}) => {
  const [extensionInstalled, setExtensionInstalled] = useState<boolean>(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState<boolean>(false);
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'detecting' | 'detected' | 'none'>('idle');
  const [formFields, setFormFields] = useState<number>(0);
  
  useEffect(() => {
    // Check if extension is installed
    const checkExtension = async () => {
      const available = isExtensionAvailable();
      setExtensionInstalled(available);
      
      if (available) {
        // Get extension settings
        const settings = await getExtensionSettings();
        if (settings) {
          setAutoFillEnabled(settings.preferredApplicationMethod === 'auto');
        }
      }
    };
    
    checkExtension();
  }, []);
  
  useEffect(() => {
    // Listen for messages from the extension
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      
      const message = event.data;
      if (message && message.type === 'STREAMLINE_FORM_DETECTED') {
        setDetectionStatus('detected');
        setFormFields(message.data?.fields || 0);
        toast.success("Application form detected!");
      }
    };
    
    window.addEventListener('message', handleExtensionMessage);
    
    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, []);
  
  const handleToggleAutofill = () => {
    const newValue = !autoFillEnabled;
    setAutoFillEnabled(newValue);
    
    if (onToggleAutofill) {
      onToggleAutofill(newValue);
    }
    
    // Send message to extension
    if (isExtensionAvailable() && window.chrome?.runtime) {
      window.chrome.runtime.sendMessage({
        action: 'setAutoFillPreference',
        enabled: newValue
      });
    }
  };
  
  const handleTriggerAutofill = () => {
    const userProfile = getUserProfile();
    
    if (!userProfile || !userProfile.firstName) {
      toast.error("Please complete your profile before using autofill");
      return;
    }
    
    // Send message to extension to trigger autofill
    if (isExtensionAvailable() && window.chrome?.runtime) {
      window.chrome.runtime.sendMessage({
        action: 'triggerAutofill',
        profile: userProfile
      }, (response) => {
        if (response?.success) {
          toast.success(`Successfully filled ${response.filledCount || 'multiple'} fields`);
        } else {
          toast.error("Failed to autofill form");
        }
      });
    }
  };
  
  if (!extensionInstalled) {
    return (
      <Card className="p-4 border-2 border-dashed border-amber-300 bg-amber-50 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-medium text-amber-800 dark:text-amber-200">Install Streamline Extension</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Install our Chrome extension to enable automatic job application form detection and one-click filling.
            </p>
            <Button 
              variant="outline" 
              className="mt-2 border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-800/50"
              onClick={() => window.open('https://chrome.google.com/webstore/detail/streamline-extension', '_blank')}
            >
              Install Extension
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  if (detectionStatus === 'detected') {
    return (
      <Card className="p-4 border-2 border-green-300 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-medium text-green-800 dark:text-green-200">Application Form Detected</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              We found a job application form with {formFields} fields that can be automatically filled.
            </p>
            <Button 
              variant="default" 
              className="mt-2 bg-green-600 hover:bg-green-700"
              onClick={handleTriggerAutofill}
            >
              Autofill Application
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Streamline Extension Active</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className={autoFillEnabled ? "bg-blue-100 dark:bg-blue-900/50" : ""}
          onClick={handleToggleAutofill}
        >
          {autoFillEnabled ? "Auto-fill ON" : "Auto-fill OFF"}
        </Button>
      </div>
    </Card>
  );
};

export default AutoFillDetector;
