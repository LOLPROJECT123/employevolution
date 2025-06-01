
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Social Links & Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn Profile</Label>
          <Input
            id="linkedin"
            value={data.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="github">GitHub Profile</Label>
          <Input
            id="github"
            value={data.github}
            onChange={(e) => handleChange('github', e.target.value)}
            placeholder="https://github.com/yourusername"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio Website</Label>
          <Input
            id="portfolio"
            value={data.portfolio}
            onChange={(e) => handleChange('portfolio', e.target.value)}
            placeholder="https://yourportfolio.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="other">Other Website</Label>
          <Input
            id="other"
            value={data.other}
            onChange={(e) => handleChange('other', e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialLinksSection;
