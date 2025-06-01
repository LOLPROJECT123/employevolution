
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, X } from 'lucide-react';

interface LanguagesSectionProps {
  data: string[];
  onChange: (data: string[]) => void;
}

const LanguagesSection = ({ data, onChange }: LanguagesSectionProps) => {
  const [newLanguage, setNewLanguage] = useState('');

  const addLanguage = () => {
    if (newLanguage.trim() && !data.includes(newLanguage.trim())) {
      onChange([...data, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    onChange(data.filter(language => language !== languageToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLanguage();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Languages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newLanguage">Add Languages</Label>
            <Input
              id="newLanguage"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a language (e.g., English, Spanish, Mandarin)"
            />
          </div>
          <Button onClick={addLanguage} className="mt-6">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {data.length > 0 && (
          <div className="space-y-2">
            <Label>Your Languages</Label>
            <div className="flex flex-wrap gap-2">
              {data.map((language, index) => (
                <Badge key={index} variant="secondary" className="pr-1">
                  {language}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(language)}
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {data.length === 0 && (
          <p className="text-sm text-gray-500">No languages added yet. Add the languages you speak above.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default LanguagesSection;
