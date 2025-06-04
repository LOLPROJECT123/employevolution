
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, X } from 'lucide-react';

interface SkillsSectionProps {
  data: string[];
  onChange: (data: string[]) => void;
}

const SkillsSection = ({ data, onChange }: SkillsSectionProps) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      onChange([...data, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(data.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-400" />
          Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newSkill" className="text-gray-300">Add Skills</Label>
            <Input
              id="newSkill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a skill (e.g., JavaScript, Project Management)"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <Button onClick={addSkill} className="mt-6 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {data.length > 0 && (
          <div className="space-y-2">
            <Label className="text-gray-300">Your Skills</Label>
            <div className="flex flex-wrap gap-2">
              {data.map((skill, index) => (
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
          </div>
        )}
        
        {data.length === 0 && (
          <p className="text-sm text-gray-400">No skills added yet. Add your technical and soft skills above.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsSection;
