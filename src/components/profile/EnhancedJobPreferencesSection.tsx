import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useProfileAutoSave } from '@/hooks/useProfileAutoSave';
import { toast } from '@/hooks/use-toast';
import { 
  Target, Briefcase, Building, DollarSign, MapPin, 
  Clock, CheckSquare, Zap, Globe, Plus, X 
} from 'lucide-react';

interface JobPreferences {
  desired_roles: string[];
  experience_level: string;
  industries: string[];
  company_sizes: string[];
  salary_min?: number;
  salary_max?: number;
  benefits: string[];
  preferred_locations: string[];
  work_models: string[];
  job_types: string[];
  skills_qualifications: string[];
  work_authorization_countries: string[];
}

interface ProfileStrength {
  overall_score: number;
  contact_score: number;
  experience_score: number;
  education_score: number;
  skills_score: number;
  preferences_score: number;
}

const EnhancedJobPreferencesSection = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<JobPreferences>({
    desired_roles: [],
    experience_level: '',
    industries: [],
    company_sizes: [],
    benefits: [],
    preferred_locations: [],
    work_models: [],
    job_types: [],
    skills_qualifications: [],
    work_authorization_countries: []
  });
  const [profileStrength, setProfileStrength] = useState<ProfileStrength>({
    overall_score: 0,
    contact_score: 0,
    experience_score: 0,
    education_score: 0,
    skills_score: 0,
    preferences_score: 0
  });
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState<[number, number]>([50000, 150000]);

  // Auto-save hook for job preferences
  const jobPreferencesAutoSave = useProfileAutoSave(preferences, { 
    section: 'jobPreferences',
    interval: 2000
  });

  const experienceLevels = [
    'Internship',
    'Entry Level (0-2 years)',
    'Mid Level (3-5 years)',
    'Senior Level (6-10 years)',
    'Lead/Principal (10+ years)',
    'Executive/C-Level'
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
    'Manufacturing', 'Media', 'Real Estate', 'Transportation', 'Government'
  ];

  const companySizes = [
    'Startup (1-10 employees)',
    'Small (11-50 employees)', 
    'Medium (51-200 employees)',
    'Large (201-1000 employees)',
    'Enterprise (1000+ employees)'
  ];

  const benefits = [
    'Health Insurance', 'Dental Insurance', 'Vision Insurance',
    '401(k) Matching', 'Flexible PTO', 'Remote Work Options',
    'Professional Development', 'Stock Options', 'Gym Membership',
    'Commuter Benefits', 'Free Meals', 'Childcare Support'
  ];

  const workModels = ['On-site', 'Remote', 'Hybrid', 'Flexible'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

  useEffect(() => {
    if (user) {
      loadJobPreferences();
      loadProfileStrength();
    }
  }, [user]);

  const loadJobPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('enhanced_job_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      // Type-safe parsing of JSONB arrays
      const parseJsonbArray = (value: any): string[] => {
        if (Array.isArray(value)) return value as string[];
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      const loadedPreferences = {
        desired_roles: parseJsonbArray(data.desired_roles),
        experience_level: data.experience_level || '',
        industries: parseJsonbArray(data.industries),
        company_sizes: parseJsonbArray(data.company_sizes),
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        benefits: parseJsonbArray(data.benefits),
        preferred_locations: parseJsonbArray(data.preferred_locations),
        work_models: parseJsonbArray(data.work_models),
        job_types: parseJsonbArray(data.job_types),
        skills_qualifications: parseJsonbArray(data.skills_qualifications),
        work_authorization_countries: parseJsonbArray(data.work_authorization_countries)
      };

      setPreferences(loadedPreferences);

      // Set salary range from preferences
      setSalaryRange([
        data.salary_min || 50000,
        data.salary_max || 150000
      ]);
    }
  };

  const loadProfileStrength = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profile_strength')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfileStrength(data);
    }
  };

  const handleSalaryRangeChange = (values: number[]) => {
    setSalaryRange([values[0], values[1]]);
    setPreferences({
      ...preferences,
      salary_min: values[0],
      salary_max: values[1]
    });
  };

  const formatSalary = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const addRole = () => {
    if (newRole.trim() && !preferences.desired_roles.includes(newRole.trim())) {
      setPreferences({
        ...preferences,
        desired_roles: [...preferences.desired_roles, newRole.trim()]
      });
      setNewRole('');
    }
  };

  const removeRole = (role: string) => {
    setPreferences({
      ...preferences,
      desired_roles: preferences.desired_roles.filter(r => r !== role)
    });
  };

  const addLocation = () => {
    if (newLocation.trim() && !preferences.preferred_locations.includes(newLocation.trim())) {
      setPreferences({
        ...preferences,
        preferred_locations: [...preferences.preferred_locations, newLocation.trim()]
      });
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setPreferences({
      ...preferences,
      preferred_locations: preferences.preferred_locations.filter(l => l !== location)
    });
  };

  const toggleArrayItem = (array: string[], item: string, field: keyof JobPreferences) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    
    setPreferences({
      ...preferences,
      [field]: newArray
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Strength */}
      <Card className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Profile Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Overall Score</span>
              <span className="text-2xl font-bold text-blue-600">{profileStrength.overall_score}%</span>
            </div>
            <Progress value={profileStrength.overall_score} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Contact</div>
                <div className="font-semibold">{profileStrength.contact_score}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Experience</div>
                <div className="font-semibold">{profileStrength.experience_score}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Education</div>
                <div className="font-semibold">{profileStrength.education_score}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Skills</div>
                <div className="font-semibold">{profileStrength.skills_score}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Preferences</div>
                <div className="font-semibold">{profileStrength.preferences_score}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role & Experience */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" />
            Role & Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Desired Roles</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Add desired role"
                onKeyPress={(e) => e.key === 'Enter' && addRole()}
                className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} flex-1`}
              />
              <button
                onClick={addRole}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {preferences.desired_roles.map((role, index) => (
                <Badge key={index} variant="secondary" className="pr-1 bg-blue-600 text-white">
                  {role}
                  <button
                    onClick={() => removeRole(role)}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent text-white hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Experience Level</Label>
            <Select value={preferences.experience_level} onValueChange={(value) => setPreferences({ ...preferences, experience_level: value })}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Industries & Companies */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            Industries & Companies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Industries</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {industries.map((industry) => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${industry}`}
                    checked={preferences.industries.includes(industry)}
                    onCheckedChange={() => toggleArrayItem(preferences.industries, industry, 'industries')}
                  />
                  <Label htmlFor={`industry-${industry}`} className="text-sm">
                    {industry}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Company Size</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {companySizes.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={preferences.company_sizes.includes(size)}
                    onCheckedChange={() => toggleArrayItem(preferences.company_sizes, size, 'company_sizes')}
                  />
                  <Label htmlFor={`size-${size}`} className="text-sm">
                    {size}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            Compensation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-4 block">Salary Range</Label>
            <div className="space-y-4">
              <div className="px-4">
                <Slider
                  value={salaryRange}
                  onValueChange={handleSalaryRangeChange}
                  max={300000}
                  min={20000}
                  step={5000}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col items-start">
                  <span className="text-gray-500 dark:text-gray-400">Minimum</span>
                  <span className="font-semibold text-lg">{formatSalary(salaryRange[0])}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-500 dark:text-gray-400">Maximum</span>
                  <span className="font-semibold text-lg">{formatSalary(salaryRange[1])}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label>Desired Benefits</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center space-x-2">
                  <Checkbox
                    id={`benefit-${benefit}`}
                    checked={preferences.benefits.includes(benefit)}
                    onCheckedChange={() => toggleArrayItem(preferences.benefits, benefit, 'benefits')}
                  />
                  <Label htmlFor={`benefit-${benefit}`} className="text-sm">
                    {benefit}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Work Model */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Location & Work Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Locations</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add location"
                onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} flex-1`}
              />
              <button
                onClick={addLocation}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {preferences.preferred_locations.map((location, index) => (
                <Badge key={index} variant="secondary" className="pr-1 bg-green-600 text-white">
                  {location}
                  <button
                    onClick={() => removeLocation(location)}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent text-white hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Work Models</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {workModels.map((model) => (
                <div key={model} className="flex items-center space-x-2">
                  <Checkbox
                    id={`work-model-${model}`}
                    checked={preferences.work_models.includes(model)}
                    onCheckedChange={() => toggleArrayItem(preferences.work_models, model, 'work_models')}
                  />
                  <Label htmlFor={`work-model-${model}`} className="text-sm">
                    {model}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Types */}
      <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Job Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`job-type-${type}`}
                  checked={preferences.job_types.includes(type)}
                  onCheckedChange={() => toggleArrayItem(preferences.job_types, type, 'job_types')}
                />
                <Label htmlFor={`job-type-${type}`} className="text-sm">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedJobPreferencesSection;
