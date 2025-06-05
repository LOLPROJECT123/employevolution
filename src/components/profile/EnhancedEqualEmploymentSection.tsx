
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, Users, Globe, Info, Save } from 'lucide-react';

interface EqualEmploymentData {
  ethnicity?: string;
  gender?: string;
  lgbtq_status?: string;
  disability_status?: string;
  veteran_status?: string;
  work_authorization: Record<string, boolean>;
  voluntary_participation: boolean;
}

const EnhancedEqualEmploymentSection = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState<EqualEmploymentData>({
    ethnicity: '',
    gender: '',
    lgbtq_status: '',
    disability_status: '',
    veteran_status: '',
    work_authorization: {},
    voluntary_participation: true
  });

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
    'Australia', 'Japan', 'Singapore', 'Netherlands', 'Sweden'
  ];

  const ethnicities = [
    'American Indian or Alaska Native',
    'Asian',
    'Black or African American',
    'Hispanic or Latino',
    'Native Hawaiian or Other Pacific Islander',
    'White',
    'Two or More Races',
    'Prefer not to answer'
  ];

  useEffect(() => {
    if (user) {
      loadEqualEmploymentData();
    }
  }, [user]);

  const loadEqualEmploymentData = async () => {
    if (!user) return;

    const { data: existingData, error } = await supabase
      .from('equal_employment_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingData) {
      // Type-safe parsing of JSONB data
      const workAuth = existingData.work_authorization;
      const parsedWorkAuth: Record<string, boolean> = 
        typeof workAuth === 'object' && workAuth !== null && !Array.isArray(workAuth) 
          ? workAuth as Record<string, boolean>
          : {};

      setData({
        ethnicity: existingData.ethnicity || '',
        gender: existingData.gender || '',
        lgbtq_status: existingData.lgbtq_status || '',
        disability_status: existingData.disability_status || '',
        veteran_status: existingData.veteran_status || '',
        work_authorization: parsedWorkAuth,
        voluntary_participation: existingData.voluntary_participation ?? true
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('equal_employment_data')
      .upsert({
        user_id: user.id,
        ...data
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save equal employment data",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Equal employment data saved successfully"
      });
    }
  };

  const handleWorkAuthorizationChange = (country: string, authorized: boolean) => {
    setData({
      ...data,
      work_authorization: {
        ...data.work_authorization,
        [country]: authorized
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Voluntary Participation Notice */}
      <Card className={`${theme === 'dark' ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Voluntary Self-Identification
              </p>
              <p className="text-blue-700 dark:text-blue-300 mb-3">
                The information you provide is voluntary and will be kept confidential. It is used only for 
                compliance with federal reporting requirements and to help employers meet equal opportunity goals.
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="voluntary"
                  checked={data.voluntary_participation}
                  onCheckedChange={(checked) => setData({ ...data, voluntary_participation: checked as boolean })}
                />
                <Label htmlFor="voluntary" className="text-blue-700 dark:text-blue-300">
                  I understand this information is voluntary
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ethnicity */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Ethnicity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={data.ethnicity} onValueChange={(value) => setData({ ...data, ethnicity: value })}>
            <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
              <SelectValue placeholder="Select your ethnicity" />
            </SelectTrigger>
            <SelectContent>
              {ethnicities.map((ethnicity) => (
                <SelectItem key={ethnicity} value={ethnicity}>
                  {ethnicity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Work Authorization */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Work Authorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select the countries where you are authorized to work:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {countries.map((country) => (
                <div key={country} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium">{country}</span>
                  <Switch
                    checked={data.work_authorization[country] || false}
                    onCheckedChange={(checked) => handleWorkAuthorizationChange(country, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographic Information */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Demographic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={data.gender} onValueChange={(value) => setData({ ...data, gender: value })}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
                <SelectItem value="self-describe">Self-describe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lgbtq">LGBTQ+ Status</Label>
            <Select value={data.lgbtq_status} onValueChange={(value) => setData({ ...data, lgbtq_status: value })}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder="Select LGBTQ+ status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, I identify as LGBTQ+</SelectItem>
                <SelectItem value="no">No, I do not identify as LGBTQ+</SelectItem>
                <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="disability">Disability Status</Label>
            <Select value={data.disability_status} onValueChange={(value) => setData({ ...data, disability_status: value })}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder="Select disability status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, I have a disability</SelectItem>
                <SelectItem value="no">No, I do not have a disability</SelectItem>
                <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="veteran">Veteran Status</Label>
            <Select value={data.veteran_status} onValueChange={(value) => setData({ ...data, veteran_status: value })}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder="Select veteran status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veteran">I am a veteran</SelectItem>
                <SelectItem value="not-veteran">I am not a veteran</SelectItem>
                <SelectItem value="prefer-not-to-answer">Prefer not to answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EnhancedEqualEmploymentSection;
