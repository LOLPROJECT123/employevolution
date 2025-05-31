
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Globe } from 'lucide-react';

interface Language {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Conversational' | 'Basic';
}

interface MultiLanguageSelectorProps {
  languages: Language[];
  onLanguagesChange: (languages: Language[]) => void;
  primaryLanguage?: string;
  onPrimaryLanguageChange: (language: string) => void;
}

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Conversational', 'Basic'] as const;

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Dutch',
  'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Turkish', 'Greek'
];

const MultiLanguageSelector: React.FC<MultiLanguageSelectorProps> = ({
  languages,
  onLanguagesChange,
  primaryLanguage = 'English',
  onPrimaryLanguageChange
}) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState<Language['proficiency']>('Conversational');

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.some(lang => lang.language.toLowerCase() === newLanguage.toLowerCase())) {
      const updatedLanguages = [...languages, { language: newLanguage.trim(), proficiency: newProficiency }];
      onLanguagesChange(updatedLanguages);
      setNewLanguage('');
      setNewProficiency('Conversational');
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    const updatedLanguages = languages.filter(lang => lang.language !== languageToRemove);
    onLanguagesChange(updatedLanguages);
  };

  const updateProficiency = (language: string, proficiency: Language['proficiency']) => {
    const updatedLanguages = languages.map(lang =>
      lang.language === language ? { ...lang, proficiency } : lang
    );
    onLanguagesChange(updatedLanguages);
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'Native': return 'bg-green-100 text-green-800';
      case 'Fluent': return 'bg-blue-100 text-blue-800';
      case 'Conversational': return 'bg-yellow-100 text-yellow-800';
      case 'Basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
        {/* Primary Language Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Primary Language</label>
          <Select value={primaryLanguage} onValueChange={onPrimaryLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select primary language" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Languages */}
        <div>
          <label className="text-sm font-medium mb-2 block">Additional Languages</label>
          
          {/* Current Languages */}
          <div className="space-y-2 mb-4">
            {languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{lang.language}</span>
                  <Badge className={getProficiencyColor(lang.proficiency)}>
                    {lang.proficiency}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={lang.proficiency}
                    onValueChange={(value) => updateProficiency(lang.language, value as Language['proficiency'])}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFICIENCY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(lang.language)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Language */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Add a language"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                list="common-languages"
              />
              <datalist id="common-languages">
                {COMMON_LANGUAGES
                  .filter(lang => !languages.some(l => l.language === lang) && lang !== primaryLanguage)
                  .map((lang) => (
                    <option key={lang} value={lang} />
                  ))}
              </datalist>
            </div>
            <Select value={newProficiency} onValueChange={(value) => setNewProficiency(value as Language['proficiency'])}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addLanguage} disabled={!newLanguage.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {languages.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No additional languages added yet</p>
            <p className="text-xs">Add languages to showcase your multilingual abilities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiLanguageSelector;
