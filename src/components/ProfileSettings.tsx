
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, X, Plus } from 'lucide-react';
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

  // Skills and languages states
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [languages, setLanguages] = useState<string[]>(['English', 'Spanish']);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingLanguages, setEditingLanguages] = useState(false);

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

  const addSkill = () => {
    if (newSkill.trim() === '') return;
    
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      toast({
        title: 'Skill Added',
        description: `${newSkill.trim()} has been added to your skills.`,
      });
    } else {
      toast({
        title: 'Skill Already Exists',
        description: 'This skill is already in your list.',
        variant: 'destructive',
      });
    }
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
    toast({
      title: 'Skill Removed',
      description: `${skillToRemove} has been removed from your skills.`,
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() === '') return;
    
    if (!languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      toast({
        title: 'Language Added',
        description: `${newLanguage.trim()} has been added to your languages.`,
      });
    } else {
      toast({
        title: 'Language Already Exists',
        description: 'This language is already in your list.',
        variant: 'destructive',
      });
    }
    setNewLanguage('');
  };

  const removeLanguage = (languageToRemove: string) => {
    setLanguages(languages.filter(language => language !== languageToRemove));
    toast({
      title: 'Language Removed',
      description: `${languageToRemove} has been removed from your languages.`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, addFunction: () => void) => {
    if (e.key === 'Enter') {
      addFunction();
    }
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
          <div className="flex justify-between items-center">
            <CardTitle>Skills</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setEditingSkills(!editingSkills)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {editingSkills ? 'Done' : 'Edit'}
            </Button>
          </div>
          <CardDescription>Add or remove professional skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className={`px-3 py-1 rounded-full text-sm ${editingSkills ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} flex items-center`}
              >
                {skill}
                {editingSkills && (
                  <button 
                    onClick={() => removeSkill(skill)} 
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {editingSkills && (
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a new skill"
                onKeyDown={(e) => handleKeyDown(e, addSkill)}
              />
              <Button onClick={addSkill} className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Languages</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setEditingLanguages(!editingLanguages)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {editingLanguages ? 'Done' : 'Edit'}
            </Button>
          </div>
          <CardDescription>Add or remove languages you speak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {languages.map((language, index) => (
              <div 
                key={index} 
                className={`px-3 py-1 rounded-full text-sm ${editingLanguages ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} flex items-center`}
              >
                {language}
                {editingLanguages && (
                  <button 
                    onClick={() => removeLanguage(language)} 
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {editingLanguages && (
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add a new language"
                onKeyDown={(e) => handleKeyDown(e, addLanguage)}
              />
              <Button onClick={addLanguage} className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
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
