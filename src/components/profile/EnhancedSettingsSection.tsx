
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Settings, Mail, Lock, Zap, Globe, Plus, X, Save } from 'lucide-react';

interface EmailPreferences {
  job_alerts: boolean;
  newsletters: boolean;
  account_updates: boolean;
  marketing_emails: boolean;
}

interface Language {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Conversational' | 'Basic';
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
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [newLanguageProficiency, setNewLanguageProficiency] = useState<Language['proficiency']>('Conversational');
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (user) {
      loadEmailPreferences();
      loadSkills();
      loadLanguages();
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

  const loadSkills = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_skills')
      .select('skill')
      .eq('user_id', user.id);

    if (data) {
      setSkills(data.map(item => item.skill));
    }
  };

  const loadLanguages = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_languages')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      setLanguages(data.map(item => ({
        language: item.language,
        proficiency: item.proficiency as Language['proficiency']
      })));
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

  const addSkill = async () => {
    if (!newSkill.trim() || !user) return;

    const { error } = await supabase
      .from('user_skills')
      .insert({
        user_id: user.id,
        skill: newSkill.trim(),
        category: 'general'
      });

    if (!error) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      toast({
        title: "Success",
        description: "Skill added"
      });
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', user.id)
      .eq('skill', skillToRemove);

    if (!error) {
      setSkills(skills.filter(skill => skill !== skillToRemove));
      toast({
        title: "Success",
        description: "Skill removed"
      });
    }
  };

  const addLanguage = async () => {
    if (!newLanguage.trim() || !user) return;

    const { error } = await supabase
      .from('user_languages')
      .insert({
        user_id: user.id,
        language: newLanguage.trim(),
        proficiency: newLanguageProficiency
      });

    if (!error) {
      setLanguages([...languages, { language: newLanguage.trim(), proficiency: newLanguageProficiency }]);
      setNewLanguage('');
      setNewLanguageProficiency('Conversational');
      toast({
        title: "Success",
        description: "Language added"
      });
    }
  };

  const removeLanguage = async (languageToRemove: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_languages')
      .delete()
      .eq('user_id', user.id)
      .eq('language', languageToRemove);

    if (!error) {
      setLanguages(languages.filter(lang => lang.language !== languageToRemove));
      toast({
        title: "Success",
        description: "Language removed"
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

      {/* Skills Management */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} flex-1`}
            />
            <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="pr-1 bg-blue-600 text-white">
                {skill}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent text-white hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Languages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Language"
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
            />
            <Select value={newLanguageProficiency} onValueChange={(value) => setNewLanguageProficiency(value as Language['proficiency'])}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Native">Native</SelectItem>
                <SelectItem value="Fluent">Fluent</SelectItem>
                <SelectItem value="Conversational">Conversational</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addLanguage} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <span className="font-medium">{lang.language}</span>
                  <span className="text-sm text-gray-500 ml-2">({lang.proficiency})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLanguage(lang.language)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSettingsSection;
