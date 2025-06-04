
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { Scale, Save } from 'lucide-react';

const EqualEmploymentSection = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    gender: '',
    ethnicity: '',
    veteranStatus: '',
    disabilityStatus: '',
    voluntary: true
  });

  const handleSave = () => {
    console.log('Saving equal employment data:', formData);
    // Implementation for saving data
  };

  return (
    <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-blue-400" />
          Equal Employment Opportunity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <h3 className="font-semibold mb-2">Voluntary Self-Identification</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            This information is voluntary and will be used only for compliance with federal and state equal opportunity laws.
            It will not be used in hiring decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Race/Ethnicity</Label>
            <Select value={formData.ethnicity} onValueChange={(value) => setFormData(prev => ({ ...prev, ethnicity: value }))}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder="Select race/ethnicity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                <SelectItem value="american-indian">American Indian or Alaska Native</SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="black">Black or African American</SelectItem>
                <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                <SelectItem value="native-hawaiian">Native Hawaiian or Other Pacific Islander</SelectItem>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="two-or-more">Two or more races</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Veteran Status</Label>
            <Select value={formData.veteranStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, veteranStatus: value }))}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder="Select veteran status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                <SelectItem value="not-veteran">I am not a protected veteran</SelectItem>
                <SelectItem value="disabled-veteran">Disabled veteran</SelectItem>
                <SelectItem value="recently-separated">Recently separated veteran</SelectItem>
                <SelectItem value="active-duty">Active duty wartime or campaign badge veteran</SelectItem>
                <SelectItem value="armed-forces">Armed forces service medal veteran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Disability Status</Label>
            <Select value={formData.disabilityStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, disabilityStatus: value }))}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder="Select disability status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                <SelectItem value="no-disability">No, I do not have a disability</SelectItem>
                <SelectItem value="yes-disability">Yes, I have a disability</SelectItem>
                <SelectItem value="history-disability">I have a history/record of having a disability</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className="font-medium mb-2">Why do we collect this information?</h4>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            We are a federal contractor or subcontractor required by law to provide equal employment opportunity to qualified people with disabilities. 
            We are also required to measure our progress toward having at least 7% of our workforce be individuals with disabilities.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EqualEmploymentSection;
