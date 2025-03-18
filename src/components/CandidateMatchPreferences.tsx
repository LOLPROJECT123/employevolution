
import { CheckCircle } from "lucide-react";

interface CandidateMatchPreferencesProps {
  preferences: {
    degree?: boolean;
    experience?: boolean;
    skills?: boolean;
    location?: boolean;
  };
  className?: string;
}

export function CandidateMatchPreferences({ preferences, className = "" }: CandidateMatchPreferencesProps) {
  const hasPreferences = preferences && Object.values(preferences).some(value => value);
  
  if (!hasPreferences) return null;
  
  return (
    <div className={`rounded-lg border bg-card p-4 ${className}`}>
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-base">You match the following candidate preferences</h3>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="text-yellow-500">⭐</span> Employers are more likely to interview you if you match these preferences:
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          {preferences.degree && (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
              <CheckCircle className="text-green-500 h-5 w-5" />
              <span>Degree</span>
            </div>
          )}
          
          {preferences.experience && (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
              <CheckCircle className="text-green-500 h-5 w-5" />
              <span>Experience</span>
            </div>
          )}
          
          {preferences.skills && (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
              <CheckCircle className="text-green-500 h-5 w-5" />
              <span>Skills</span>
            </div>
          )}
          
          {preferences.location && (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
              <CheckCircle className="text-green-500 h-5 w-5" />
              <span>Location</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
