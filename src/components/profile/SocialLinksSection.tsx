
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Github, Linkedin, Globe, Edit } from 'lucide-react';

interface SocialLinksSectionProps {
  data: {
    linkedin: string;
    github: string;
    portfolio: string;
    other: string;
  };
  onChange: (data: any) => void;
}

const SocialLinksSection = ({ data, onChange }: SocialLinksSectionProps) => {
  const { theme } = useTheme();

  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-400" />
          Social Links & Portfolio
        </CardTitle>
        <Button variant="ghost" size="sm" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin" className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <Linkedin className="h-4 w-4 text-blue-400" />
            LinkedIn Profile
          </Label>
          <Input
            id="linkedin"
            value={data.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="github" className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <Github className="h-4 w-4 text-blue-400" />
            GitHub Profile
          </Label>
          <Input
            id="github"
            value={data.github}
            onChange={(e) => handleChange('github', e.target.value)}
            placeholder="https://github.com/yourusername"
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="portfolio" className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <Globe className="h-4 w-4 text-blue-400" />
            Portfolio Website
          </Label>
          <Input
            id="portfolio"
            value={data.portfolio}
            onChange={(e) => handleChange('portfolio', e.target.value)}
            placeholder="https://yourportfolio.com"
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="other" className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <Globe className="h-4 w-4 text-blue-400" />
            Other Website
          </Label>
          <Input
            id="other"
            value={data.other}
            onChange={(e) => handleChange('other', e.target.value)}
            placeholder="https://yourwebsite.com"
            className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialLinksSection;
