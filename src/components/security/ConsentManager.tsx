
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { gdprService, ConsentType } from '@/services/gdprService';
import { toast } from '@/hooks/use-toast';
import { Shield, Download, Trash2 } from 'lucide-react';

interface ConsentOption {
  type: ConsentType;
  title: string;
  description: string;
  required: boolean;
}

const CONSENT_OPTIONS: ConsentOption[] = [
  {
    type: 'terms',
    title: 'Terms of Service',
    description: 'Accept our terms of service and user agreement.',
    required: true
  },
  {
    type: 'privacy',
    title: 'Privacy Policy',
    description: 'Allow us to process your personal data as described in our privacy policy.',
    required: true
  },
  {
    type: 'marketing',
    title: 'Marketing Communications',
    description: 'Receive emails about new features, job opportunities, and platform updates.',
    required: false
  },
  {
    type: 'analytics',
    title: 'Analytics & Performance',
    description: 'Help us improve the platform by sharing anonymous usage data.',
    required: false
  },
  {
    type: 'cookies',
    title: 'Cookies & Tracking',
    description: 'Allow us to use cookies for functionality and analytics.',
    required: false
  }
];

const ConsentManager: React.FC = () => {
  const [consents, setConsents] = useState<Record<ConsentType, boolean>>({
    terms: false,
    privacy: false,
    marketing: false,
    analytics: false,
    cookies: false
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<ConsentType | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      const userConsents = await gdprService.getUserConsents();
      const consentMap: Record<ConsentType, boolean> = {
        terms: false,
        privacy: false,
        marketing: false,
        analytics: false,
        cookies: false
      };

      userConsents.forEach(consent => {
        consentMap[consent.consent_type] = consent.consented;
      });

      setConsents(consentMap);
    } catch (error) {
      console.error('Failed to load consents:', error);
      toast({
        title: "Failed to load consent preferences",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = async (type: ConsentType, value: boolean) => {
    setUpdating(type);
    try {
      await gdprService.recordConsent(type, value);
      setConsents(prev => ({ ...prev, [type]: value }));
      toast({
        title: "Consent updated",
        description: `Your ${type} consent has been ${value ? 'granted' : 'withdrawn'}.`,
      });
    } catch (error) {
      console.error('Failed to update consent:', error);
      toast({
        title: "Failed to update consent",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const data = await gdprService.exportUserData();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully",
        description: "Your data has been downloaded to your device.",
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: "Failed to export data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await gdprService.deleteUserData();
      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      // Redirect to homepage or login
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast({
        title: "Failed to delete account",
        description: "Please contact support for assistance.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading privacy settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Consent Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your privacy preferences and data processing consents.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {CONSENT_OPTIONS.map((option) => (
            <div key={option.type} className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <Label htmlFor={option.type} className="text-base font-medium">
                  {option.title}
                  {option.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              </div>
              <Switch
                id={option.type}
                checked={consents[option.type]}
                onCheckedChange={(value) => handleConsentChange(option.type, value)}
                disabled={updating === option.type || option.required}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Rights</CardTitle>
          <p className="text-sm text-muted-foreground">
            Exercise your rights under GDPR and other privacy regulations.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Export Your Data</h4>
              <p className="text-sm text-muted-foreground">
                Download a copy of all your personal data stored in our system.
              </p>
            </div>
            <Button
              onClick={handleExportData}
              disabled={exportLoading}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportLoading ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-600">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsentManager;
