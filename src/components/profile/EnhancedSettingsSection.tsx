
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Settings, Mail, Lock, Save } from 'lucide-react';

interface EmailPreferences {
  job_alerts: boolean;
  newsletters: boolean;
  account_updates: boolean;
  marketing_emails: boolean;
}

const EnhancedSettingsSection = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [emailPrefs, setEmailPrefs] = useState<EmailPreferences>({
    job_alerts: true,
    newsletters: true,
    account_updates: true,
    marketing_emails: false
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (user) {
      loadEmailPreferences();
    }
  }, [user]);

  const loadEmailPreferences = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setEmailPrefs({
        job_alerts: data.job_alerts,
        newsletters: data.newsletters,
        account_updates: data.account_updates,
        marketing_emails: data.marketing_emails
      });
    }
  };

  const updateEmailPreferences = async (newPrefs: EmailPreferences) => {
    if (!user) return;

    const { error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: user.id,
        ...newPrefs
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update email preferences",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Email preferences updated"
      });
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwords.new
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully"
      });
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  const changeEmail = async () => {
    if (!newEmail.trim()) return;

    const { error } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Check your email to confirm the change"
      });
      setNewEmail('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Preferences */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Email Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Job Alerts</p>
                <p className="text-sm text-gray-500">Get notified about new job opportunities</p>
              </div>
              <Switch
                checked={emailPrefs.job_alerts}
                onCheckedChange={(checked) => {
                  const newPrefs = { ...emailPrefs, job_alerts: checked };
                  setEmailPrefs(newPrefs);
                  updateEmailPreferences(newPrefs);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Newsletters</p>
                <p className="text-sm text-gray-500">Receive our weekly newsletter</p>
              </div>
              <Switch
                checked={emailPrefs.newsletters}
                onCheckedChange={(checked) => {
                  const newPrefs = { ...emailPrefs, newsletters: checked };
                  setEmailPrefs(newPrefs);
                  updateEmailPreferences(newPrefs);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Updates</p>
                <p className="text-sm text-gray-500">Important account notifications</p>
              </div>
              <Switch
                checked={emailPrefs.account_updates}
                onCheckedChange={(checked) => {
                  const newPrefs = { ...emailPrefs, account_updates: checked };
                  setEmailPrefs(newPrefs);
                  updateEmailPreferences(newPrefs);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-gray-500">Product updates and promotions</p>
              </div>
              <Switch
                checked={emailPrefs.marketing_emails}
                onCheckedChange={(checked) => {
                  const newPrefs = { ...emailPrefs, marketing_emails: checked };
                  setEmailPrefs(newPrefs);
                  updateEmailPreferences(newPrefs);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-500" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
            />
          </div>
          <Button onClick={changePassword} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Change Email */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Change Email Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Email</Label>
            <Input
              value={user?.email || ''}
              disabled
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}
            />
          </div>
          <div>
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
            />
          </div>
          <Button onClick={changeEmail} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Update Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSettingsSection;
