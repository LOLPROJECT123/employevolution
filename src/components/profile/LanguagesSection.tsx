
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface LanguagesSectionProps {
  languages: string[];
  onAddLanguage: (language: string) => void;
  onRemoveLanguage: (language: string) => void;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages,
  onAddLanguage,
  onRemoveLanguage,
}) => {
  const [newLanguage, setNewLanguage] = useState("");

  const handleAddLanguage = () => {
    if (newLanguage.trim() !== "" && !languages.includes(newLanguage.trim())) {
      onAddLanguage(newLanguage.trim());
      setNewLanguage("");
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Languages</h2>
          <p className="text-sm text-muted-foreground">
            Add or remove languages you speak
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {languages.map((language) => (
            <Badge key={language} variant="secondary" className="px-2 py-1.5 text-sm">
              {language}
              <button
                onClick={() => onRemoveLanguage(language)}
                className="ml-1.5 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add a new language"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddLanguage();
              }
            }}
          />
          <Button onClick={handleAddLanguage} disabled={!newLanguage.trim()}>
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LanguagesSection;
