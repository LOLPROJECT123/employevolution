
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, Users, Globe, Info } from 'lucide-react';
import { useProfileAutoSave } from '@/hooks/useProfileAutoSave';

interface EqualEmploymentData {
  ethnicity?: string;
  gender?: string;
  lgbtq_status?: string;
  disability_status?: string;
  veteran_status?: string;
  work_authorization: Record<string, boolean>;
  voluntary_participation: boolean;
}

interface EnhancedEqualEmploymentSectionProps {
  onDataChange?: (data: EqualEmploymentData) => void;
}

const EnhancedEqualEmploymentSection = ({ onDataChange }: EnhancedEqualEmploymentSectionProps) => {
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

  // Auto-save hook
  const equalEmploymentAutoSave = useProfileAutoSave(data, { section: 'equalEmployment' });

  useEffect(() => {
    if (user) {
      loadEqualEmploymentData();
    }
  }, [user]);

  // Notify parent component when data changes
  useEffect(() => {
    onDataChange?.(data);
  }, [data, onDataChange]);

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

  const handleWorkAuthorizationChange = (country: string, authorized: boolean) => {
    setData(prev => ({
      ...prev,
      work_authorization: {
        ...prev.work_authorization,
        [country]: authorized
      }
    }));
  };

  const handleFieldChange = (field: keyof EqualEmploymentData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
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
                  onCheckedChange={(checked) => handleFieldChange('voluntary_participation', checked as boolean)}
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
          <Select value={data.ethnicity} onValueChange={(value) => handleFieldChange('ethnicity', value)}>
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
            <Select value={data.gender} onValueChange={(value) => handleFieldChange('gender', value)}>
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
            <Select value={data.lgbtq_status} onValueChange={(value) => handleFieldChange('lgbtq_status', value)}>
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
            <Select value={data.disability_status} onValueChange={(value) => handleFieldChange('disability_status', value)}>
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
            <Select value={data.veteran_status} onValueChange={(value) => handleFieldChange('veteran_status', value)}>
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

      {/* Auto-save status indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className={`w-2 h-2 rounded-full ${
          equalEmploymentAutoSave.saveStatus === 'saved' ? 'bg-green-500' :
          equalEmploymentAutoSave.saveStatus === 'saving' ? 'bg-yellow-500' :
          equalEmploymentAutoSave.saveStatus === 'error' ? 'bg-red-500' :
          'bg-gray-400'
        }`} />
        Equal Employment: {equalEmploymentAutoSave.saveStatus === 'saved' ? 'Saved' :
                           equalEmploymentAutoSave.saveStatus === 'saving' ? 'Saving...' :
                           equalEmploymentAutoSave.saveStatus === 'error' ? 'Error' : 'Ready'}
      </div>
    </div>
  );
};

export default EnhancedEqualEmploymentSection;
