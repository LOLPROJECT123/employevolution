
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-400" />
          Social Links & Portfolio
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="flex items-center gap-2 text-gray-300">
            <Linkedin className="h-4 w-4 text-blue-400" />
            LinkedIn Profile
          </Label>
          <Input
            id="linkedin"
            value={data.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="github" className="flex items-center gap-2 text-gray-300">
            <Github className="h-4 w-4 text-blue-400" />
            GitHub Profile
          </Label>
          <Input
            id="github"
            value={data.github}
            onChange={(e) => handleChange('github', e.target.value)}
            placeholder="https://github.com/yourusername"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="portfolio" className="flex items-center gap-2 text-gray-300">
            <Globe className="h-4 w-4 text-blue-400" />
            Portfolio Website
          </Label>
          <Input
            id="portfolio"
            value={data.portfolio}
            onChange={(e) => handleChange('portfolio', e.target.value)}
            placeholder="https://yourportfolio.com"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="other" className="flex items-center gap-2 text-gray-300">
            <Globe className="h-4 w-4 text-blue-400" />
            Other Website
          </Label>
          <Input
            id="other"
            value={data.other}
            onChange={(e) => handleChange('other', e.target.value)}
            placeholder="https://yourwebsite.com"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialLinksSection;
