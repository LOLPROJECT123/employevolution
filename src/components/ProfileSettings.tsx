
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProfileSettings = () => {
  const { toast } = useToast();
  const [emailPreference, setEmailPreference] = useState<'daily' | 'weekly' | 'never'>('never');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Email state
  const [email, setEmail] = useState('user@example.com');

  const handleEmailPreferenceChange = (preference: 'daily' | 'weekly' | 'never') => {
    setEmailPreference(preference);
    toast({
      title: 'Email Preferences Updated',
      description: `You will now receive job emails ${preference}.`,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'All password fields are required.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Password Updated',
      description: 'Your password has been successfully changed.',
    });
    
    // Reset fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Email Updated',
      description: 'Your email has been successfully changed.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>
            Get emails with new jobs that match your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={emailPreference === 'daily' ? 'default' : 'outline'}
              onClick={() => handleEmailPreferenceChange('daily')}
              className="w-full justify-start"
            >
              {emailPreference === 'daily' && <Check className="mr-2 h-4 w-4" />}
              Daily
            </Button>
            <Button
              variant={emailPreference === 'weekly' ? 'default' : 'outline'}
              onClick={() => handleEmailPreferenceChange('weekly')}
              className="w-full justify-start"
            >
              {emailPreference === 'weekly' && <Check className="mr-2 h-4 w-4" />}
              Weekly
            </Button>
            <Button
              variant={emailPreference === 'never' ? 'default' : 'outline'}
              onClick={() => handleEmailPreferenceChange('never')}
              className="w-full justify-start bg-cyan-500 hover:bg-cyan-600"
              style={{
                backgroundColor: emailPreference === 'never' ? '#06b6d4' : '',
                color: emailPreference === 'never' ? 'white' : ''
              }}
            >
              {emailPreference === 'never' && <Check className="mr-2 h-4 w-4" />}
              Never
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <Input
                id="current-password"
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Change Email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
